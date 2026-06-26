import MainLayout from "@/layout/MainLayout";
import { Suspense, lazy } from "react";
import { HeroText, FeaturesGrid, MantraSection } from './AnimatedSections';

const HolographicSphere = lazy(() => import('./HolographicSphere'));

export default function ExperiencePage() {
  return (
    <MainLayout>
      {/* Reset de margens do layout para essa página ser imersiva */}
      <div className="relative bg-[#0a0a0f] min-h-screen overflow-hidden -mx-4 lg:-mx-8">
        
        {/* HERO SECTION 3D */}
        <section className="relative h-[100svh] flex items-center justify-center overflow-hidden">
          <Suspense fallback={
            <div className="absolute inset-0 bg-[#0a0a0f] flex items-center justify-center z-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          }>
            <HolographicSphere />
          </Suspense>
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0a0a0f_80%)] z-[1] pointer-events-none" />
          <HeroText />
        </section>

        {/* SEÇÃO DE FEATURES */}
        <section className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
          <div className="mb-10 sm:mb-16">
            <h3 className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-emerald-400 mb-2 sm:mb-3">Arquitetura</h3>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#f0f0f5] tracking-tight">
              Construída para <br className="sm:hidden" />dominar.
            </h2>
          </div>
          <FeaturesGrid />
        </section>

        {/* MANTRA */}
        <section className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <MantraSection />
        </section>

      </div>
    </MainLayout>
  );
}