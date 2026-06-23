"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Hero 3D focal object — an elegant, slow, monochrome distorted sphere.
 *
 * Aesthetic: a single high-resolution icosphere with a gentle, organic surface
 * displacement (layered value-noise in the vertex shader), shaded with a soft
 * matte/brushed greyscale material — calm wrap-lighting plus a faint cool rim so
 * the silhouette reads against pure white. It rotates very slowly and reacts
 * subtly to the pointer (a few degrees of parallax) — serene, premium, never
 * busy. No particles, no drei dependency, fully self-contained.
 *
 * Performance contract (mirrors deconstruct-scene):
 *   - DPR capped at [1, 2];
 *   - `frameloop="demand"` — the scene only redraws when `invalidate()` is
 *     called. We `invalidate()` once per `useFrame` tick (R3F advances the clock
 *     on demand-loops only while invalidations are pending), giving a smooth but
 *     fully controlled slow loop; pointer moves also invalidate;
 *   - geometry + material disposed on unmount, renderer disposed on teardown.
 */

// ── Tunables ─────────────────────────────────────────────────────────────────
const SPHERE_RADIUS = 1.35;
const SPHERE_DETAIL = 64; // icosphere subdivisions — smooth silhouette
const ROT_SPEED = 0.06; // radians / sec — very slow
const NOISE_AMP = 0.16; // displacement amplitude (world units)
const NOISE_FREQ = 1.35; // spatial frequency of the surface ripple
const POINTER_PARALLAX = 0.18; // max extra tilt (radians) from pointer

// Classic GLSL simplex/value noise helpers (Ashima-style), trimmed to what we
// need: a smooth 3D noise used both to displace the surface and to vary shading.
const NOISE_GLSL = /* glsl */ `
  vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // Two octaves — enough body without high-frequency noise that would read busy.
  float fbm(vec3 p){
    return snoise(p) * 0.65 + snoise(p * 2.03) * 0.35;
  }
`;

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  uniform float uFreq;

  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying float vDisp;

  ${NOISE_GLSL}

  void main() {
    // Slowly evolving displacement field; the small time term makes the surface
    // breathe almost imperceptibly rather than being frozen.
    float n = fbm(normal * uFreq + vec3(0.0, 0.0, uTime * 0.12));
    vDisp = n;

    vec3 displaced = position + normal * n * uAmp;

    // Approximate the perturbed normal by sampling the field along the normal;
    // cheap and smooth enough for a soft matte look (no exact analytic normal).
    float eps = 0.08;
    float nA = fbm((normal + vec3(eps, 0.0, 0.0)) * uFreq + vec3(0.0, 0.0, uTime * 0.12));
    float nB = fbm((normal + vec3(0.0, eps, 0.0)) * uFreq + vec3(0.0, 0.0, uTime * 0.12));
    vec3 perturbed = normalize(normal + vec3(n - nA, n - nB, 0.0) * 1.4);

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * perturbed);
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform vec3 uLightDir;

  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying float vDisp;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 L = normalize(uLightDir);
    vec3 V = normalize(vViewDir);

    // Soft wrap diffuse (half-Lambert) → matte, no harsh terminator.
    float diff = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
    diff = pow(diff, 1.3);

    // Greyscale base: light porcelain highs, soft graphite lows.
    vec3 lo = vec3(0.62);
    vec3 hi = vec3(0.96);
    vec3 base = mix(lo, hi, diff);

    // Faint cool rim so the white-on-white silhouette stays legible.
    float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);
    vec3 rimCol = vec3(0.80, 0.82, 0.90); // barely-there cool tint
    base += rimCol * rim * 0.35;

    // Whisper of the displacement into shading for a brushed feel.
    base += (vDisp * 0.05);

    base = clamp(base, 0.0, 1.0);
    gl_FragColor = vec4(base, 1.0);
  }
`;

/**
 * The displaced sphere mesh. Lives inside <Canvas>. Owns geometry + material and
 * disposes both on unmount. Drives a slow auto-rotation + subtle pointer tilt
 * via a demand-loop `useFrame` that re-`invalidate()`s itself each tick.
 */
function DistortedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const invalidate = useThree((s) => s.invalidate);
  // Smoothed pointer, in [-1, 1] per axis. Lives in a ref so pointer moves don't
  // trigger React re-renders — only WebGL invalidations.
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  // The time uniform, held in a ref so the frame loop mutates *this* object
  // rather than the memoised `material` (satisfies react-hooks immutability).
  const uTimeRef = useRef<{ value: number } | null>(null);

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(SPHERE_RADIUS, SPHERE_DETAIL);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAmp: { value: NOISE_AMP },
        uFreq: { value: NOISE_FREQ },
        uLightDir: { value: new THREE.Vector3(0.4, 0.7, 0.6).normalize() },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    });
    return { geometry: geo, material: mat };
  }, []);

  // Capture the live uniform reference once; the frame loop writes through it.
  useEffect(() => {
    uTimeRef.current = material.uniforms.uTime as { value: number };
  }, [material]);

  // Pointer parallax — listen on window, smooth toward target in the frame loop.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onMove = (e: PointerEvent) => {
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
      invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [invalidate]);

  // Demand-loop animation: advance time + rotation, ease pointer, re-arm.
  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const uTime = uTimeRef.current;
    if (uTime) uTime.value = state.clock.elapsedTime;

    // Continuous slow yaw.
    mesh.rotation.y += ROT_SPEED * delta;

    // Ease the smoothed pointer toward its target, map to a few degrees of tilt.
    const p = pointer.current;
    p.x += (p.tx - p.x) * Math.min(1, delta * 3);
    p.y += (p.ty - p.y) * Math.min(1, delta * 3);
    mesh.rotation.x = p.y * POINTER_PARALLAX;
    mesh.rotation.z = -p.x * POINTER_PARALLAX * 0.4;

    // Keep the demand-loop alive: request the next frame.
    invalidate();
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

/** Releases the WebGL renderer when the canvas tears down. */
function RendererDisposer() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    return () => {
      gl.dispose();
    };
  }, [gl]);
  return null;
}

/**
 * Default export — the lazy chunk entry. R3F <Canvas> hosting the distorted
 * sphere. `dpr` capped, `frameloop="demand"`, transparent so it floats on the
 * white hero. The wrapper is `aria-hidden` decorative; the hero's real content
 * (headline, CTAs) lives outside this component.
 */
export default function HeroObjectScene() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none h-full w-full"
    >
      <Canvas
        dpr={[1, 2]}
        frameloop="demand"
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <DistortedSphere />
        <RendererDisposer />
      </Canvas>
    </div>
  );
}
