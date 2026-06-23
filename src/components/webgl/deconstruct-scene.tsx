"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

// ScrollTrigger is already registered (and Lenis-wired) in smooth-scroll.tsx;
// re-registering is idempotent and keeps this lazy chunk self-contained.
gsap.registerPlugin(ScrollTrigger);

// ── Tunables ───────────────────────────────────────────────────────────────
// Particle grid. 130 × 70 = 9 100 points — within the ~6–9k budget and a clean
// fit for the 1024×640 (16:10) placeholder so columns/rows map to pixels.
const GRID_X = 130;
const GRID_Y = 70;
const TEX_W = 1024;
const TEX_H = 640;
const PLANE_W = 6; // world units; height derived from texture aspect.
const PLANE_H = (PLANE_W * TEX_H) / TEX_W;

/**
 * Draws a branded mock "product screenshot" into an offscreen canvas and wraps
 * it in a THREE.CanvasTexture. No real asset tonight — this is a stand-in for a
 * future kheprIA Planning / Dashboard capture.
 *
 * Porcelain background, deep-green kheprIA header band, a sidebar, and a few
 * card/line blocks with a gold accent — enough structure that the
 * deconstruction reads as "a real UI shattering". 1024×640 (texture-friendly).
 *
 * Returns `null` if a 2D context can't be obtained (defensive; the caller then
 * skips texture-dependent work).
 */
function createPlaceholderTexture(): THREE.CanvasTexture | null {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Brand tokens (mirror globals.css palette).
  const PORCELAIN = "#F5F1EA";
  const GREEN = "#1F3D34";
  const SAGE = "#8AA399";
  const GOLD = "#C9A24B";
  const CARD = "#FFFFFF";

  // Background.
  ctx.fillStyle = PORCELAIN;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Top header band (deep green).
  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, TEX_W, 84);
  // Brand dot + wordmark in the header.
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(44, 42, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PORCELAIN;
  ctx.font = "600 30px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("kheprIA", 74, 44);

  // Left sidebar.
  ctx.fillStyle = "#EAE3D7";
  ctx.fillRect(0, 84, 220, TEX_H - 84);
  ctx.fillStyle = SAGE;
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(28, 132 + i * 56, 164, 22);
  }

  // Main content cards.
  const cardX = 260;
  const cardW = TEX_W - cardX - 40;
  const drawCard = (y: number, h: number) => {
    ctx.fillStyle = CARD;
    ctx.fillRect(cardX, y, cardW, h);
    ctx.fillStyle = GREEN;
    ctx.fillRect(cardX + 24, y + 22, 180, 18); // title bar
    ctx.fillStyle = "#D9D2C5";
    for (let l = 0; l < 3; l++) {
      ctx.fillRect(cardX + 24, y + 60 + l * 26, cardW - 80 - l * 60, 12);
    }
    // gold accent ticks
    ctx.fillStyle = GOLD;
    ctx.fillRect(cardX + cardW - 60, y + 22, 36, 18);
  };
  drawCard(132, 150);
  drawCard(310, 150);

  // Bottom stat row.
  const statY = 488;
  for (let s = 0; s < 3; s++) {
    const sx = cardX + s * ((cardW + 16) / 3);
    ctx.fillStyle = CARD;
    ctx.fillRect(sx, statY, (cardW - 32) / 3, 110);
    ctx.fillStyle = GREEN;
    ctx.font = "700 40px sans-serif";
    ctx.fillText(["12+", "40h", "100%"][s], sx + 20, statY + 46);
    ctx.fillStyle = SAGE;
    ctx.fillRect(sx + 20, statY + 76, 100, 12);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uProgress;
  uniform float uPointSize;
  uniform float uPixelRatio;

  attribute vec2 aUv;          // texture coord for this particle
  attribute vec3 aDirection;   // normalized-ish radial-from-center direction
  attribute float aSeed;       // 0..1 per-particle randomness

  varying vec2 vUv;
  varying float vShatter;

  void main() {
    vUv = aUv;

    // 0 -> 1 -> 0 : assembled, fully exploded at mid-scroll, reassembled.
    float shatter = sin(uProgress * 3.14159265);
    // Per-particle delay so the cloud doesn't move as one rigid block.
    float eased = clamp(shatter * (0.55 + aSeed * 0.9), 0.0, 1.4);
    vShatter = shatter;

    vec3 displaced = position + aDirection * eased * 2.2;
    // A little extra outward push on z for depth as it explodes.
    displaced.z += shatter * (aSeed - 0.5) * 1.6;

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);

    // Points grow as they scatter (and attenuate with distance).
    float size = uPointSize * (1.0 + shatter * 1.8) * uPixelRatio;
    gl_PointSize = size * (1.0 / -mvPosition.z);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;

  uniform sampler2D uTexture;

  varying vec2 vUv;
  varying float vShatter;

  void main() {
    // Round, soft-edged points.
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = dot(c, c);
    if (d > 0.25) discard;
    float soft = smoothstep(0.25, 0.04, d);

    vec3 color = texture2D(uTexture, vUv).rgb;

    // Fade slightly while exploded so the recompose reads as a "snap back".
    float alpha = soft * (1.0 - vShatter * 0.35);

    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * The particle field. Lives *inside* the R3F <Canvas> (so `useThree` works).
 * Owns the geometry + material + texture and disposes all three on unmount.
 * Drives `uProgress` from a ScrollTrigger scrub mapped to the section's
 * scroll-through (the DOM node passed via `triggerRef`).
 */
function ParticleField({
  triggerRef,
}: {
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  // `frameloop="demand"` on the Canvas means R3F only renders when something
  // calls `invalidate()`. We pull it from the R3F store and fire it on every
  // scrub update so the points redraw exactly while the scroll progress moves.
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  // Build geometry, the placeholder texture, and the shader material once.
  // Memoised so the per-particle buffers are computed a single time.
  const { geometry, material, texture } = useMemo(() => {
    const count = GRID_X * GRID_Y;
    const positions = new Float32Array(count * 3);
    const uvs = new Float32Array(count * 2);
    const directions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    let i = 0;
    for (let y = 0; y < GRID_Y; y++) {
      for (let x = 0; x < GRID_X; x++) {
        // Cell center in [0,1].
        const u = (x + 0.5) / GRID_X;
        const v = (y + 0.5) / GRID_Y;

        // World position on a plane centred at origin. Flip v so the texture is
        // upright (texture v=0 is bottom in GL, our grid y=0 is top).
        const px = (u - 0.5) * PLANE_W;
        const py = (0.5 - v) * PLANE_H;
        positions[i * 3] = px;
        positions[i * 3 + 1] = py;
        positions[i * 3 + 2] = 0;

        uvs[i * 2] = u;
        uvs[i * 2 + 1] = 1 - v;

        // Radial direction from centre + deterministic jitter.
        const seed = pseudoRandom(x, y);
        const angleJitter = (pseudoRandom(y, x) - 0.5) * 1.2;
        const baseAngle = Math.atan2(py, px) + angleJitter;
        const radial = 0.6 + seed * 0.8;
        directions[i * 3] = Math.cos(baseAngle) * radial;
        directions[i * 3 + 1] = Math.sin(baseAngle) * radial;
        directions[i * 3 + 2] = (seed - 0.5) * 0.8;
        seeds[i] = seed;

        i++;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aUv", new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute("aDirection", new THREE.BufferAttribute(directions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const tex = createPlaceholderTexture();

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uTexture: { value: tex },
        uPointSize: { value: 26 },
        uPixelRatio: {
          value: Math.min(
            typeof window !== "undefined" ? window.devicePixelRatio : 1,
            2,
          ),
        },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    return { geometry: geo, material: mat, texture: tex };
  }, []);

  // Dispose all GPU resources on unmount. Critical: no leak when the section
  // scrolls out of view and the canvas unmounts, and survives React 19
  // Strict-Mode double-mount (each mount makes its own memo, each cleanup
  // disposes its own).
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      texture?.dispose();
    };
  }, [geometry, material, texture]);

  // ScrollTrigger scrub → uProgress. NOT pinned (v1) to avoid fighting Lenis.
  // Mapped over the section's full pass through the viewport: enters bottom →
  // uProgress 0, centred → ~0.5 (fully exploded), exits top → uProgress 1.
  useEffect(() => {
    const trigger = triggerRef.current;
    // No trigger, or the texture couldn't be built (null 2D context) → don't
    // wire a scrub that would only animate a non-rendered / black point cloud.
    if (!trigger || !texture) return;

    const st = ScrollTrigger.create({
      trigger,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.6,
      onUpdate: (self) => {
        material.uniforms.uProgress.value = self.progress;
        // `frameloop="demand"`: request a redraw only while the scrub moves.
        // Without this the scene would freeze at its initial frame.
        invalidate();
      },
    });

    // The canvas may mount after layout settles; make sure start/end are
    // measured against the final geometry.
    ScrollTrigger.refresh();

    // Force one render after setup so the assembled image is visible even
    // before the first scroll (demand loop renders nothing until invalidated).
    invalidate();

    return () => st.kill();
  }, [triggerRef, material, invalidate, texture]);

  // Make sure WebGL resources are also released if the renderer is torn down.
  useEffect(() => {
    return () => {
      gl.dispose();
    };
  }, [gl]);

  // If the placeholder texture couldn't be built (no 2D context), render no
  // points rather than a cloud of faint black dots sampling a null sampler.
  // The surrounding section text still conveys the dogfooding message.
  if (!texture) return null;

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}

/**
 * Deterministic pseudo-random in [0,1) from two integer coords. Avoids
 * `Math.random()` so the particle layout is stable across renders / SSR-free
 * remounts (no hydration concerns since this chunk is `ssr:false` anyway, but
 * stability keeps the effect reproducible).
 */
function pseudoRandom(a: number, b: number): number {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Default export — the lazy chunk's entry. Renders the R3F <Canvas> and the
 * particle field. The wrapping <div> is the ScrollTrigger trigger; it is sized
 * to roughly match the static fallback's footprint so layout is stable whether
 * the scene or the fallback is shown.
 *
 * `dpr` capped at [1,2] for perf; `frameloop="demand"` so the canvas only
 * redraws when `invalidate()` is called (from the ScrollTrigger `onUpdate` and
 * once at setup) — no continuous 60fps loop while the section sits idle.
 */
export default function DeconstructScene() {
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={triggerRef}
      aria-hidden="true"
      className="mt-6 h-[360px] w-full overflow-hidden rounded-lg bg-black/20"
    >
      <Canvas
        dpr={[1, 2]}
        frameloop="demand"
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        // Don't crash the page if WebGL context creation throws here: R3F's own
        // error is caught by the boundary in deconstruct-lazy.tsx.
      >
        <ParticleField triggerRef={triggerRef} />
      </Canvas>
    </div>
  );
}
