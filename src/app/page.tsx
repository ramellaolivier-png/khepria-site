import { HeroSection } from "@/components/sections/hero";
import { StatsSection } from "@/components/sections/stats";
import { ServicesListSection } from "@/components/sections/services-list";
import { DogfoodingSection } from "@/components/sections/dogfooding";
import { TeamSection } from "@/components/sections/team";
import { CtaFinalSection } from "@/components/sections/cta-final";

export default function Home() {
  return (
    <div className="space-y-24">
      {/* 1. HERO — minimal white redesign: staggered CSS reveal + lazy 3D object */}
      <HeroSection />

      {/* 2. CHIFFRES — CountUp animated stats */}
      <StatsSection />

      {/* 3. SERVICES — editorial vertical list, staggered reveal (no scroll-hijack) */}
      <ServicesListSection />

      {/* 4. DOGFOODING — Reveal + placeholder captures (Phase 3 WebGL goes here) */}
      <DogfoodingSection />

      {/* 5. ÉQUIPE — subtle parallax on avatars */}
      <TeamSection />

      {/* 6. CTA FINAL — brand-signature reveal */}
      <CtaFinalSection />
    </div>
  );
}
