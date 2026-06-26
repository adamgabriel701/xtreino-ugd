import MainLayout from "@/layout/MainLayout";
import { Suspense, lazy } from "react";
import { HeroText, FeaturesGrid, MantraSection } from './AnimatedSections';

// No Vite usamos React.lazy ao invés de next/dynamic
const HolographicSphere = lazy(() => import('./HolographicSphere'));

export default function ExperiencePage() {
  return (
    <MainLayout>
      <div className="relative bg-[#0a0a0f] min-h-screen overflow-hidden">
        
        {/* HERO SECTION 3D */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Fundo 3D com Suspense nativo do React */}
          <Suspense fallback={
            <div className="absolute inset-0 bg-[#0a0a0f] flex items-center justify-center z-0">
              <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          }>
            <HolographicSphere />
          </Suspense>
          
          {/* Vignette escura nas bordas para focar no centro */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0a0a0f_80%)] z-[1] pointer-events-none" />
          
          {/* Texto por cima do 3D */}
          <HeroText />
        </section>

        {/* SEÇÃO DE FEATURES */}
        <section className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8 py-24 border-t border-white/5">
          <div className="mb-16">
            <h3 className="text-sm font-bold tracking-widest uppercase text-emerald-400 mb-3">Arquitetura</h3>
            <h2 className="text-4xl md:text-5xl font-bold text-[#f0f0f5]">
              Construída para <br />dominar.
            </h2>
          </div>
          <FeaturesGrid />
        </section>

        {/* MANTRA / CITAÇÃO GRANDE */}
        <section className="relative z-10 max-w-[1400px] mx-auto px-4 border-t border-white/5">
          <MantraSection />
        </section>

        {/* FOOTER MINIMALISTA DA EXPERIÊNCIA */}
        <footer className="relative z-10 border-t border-white/5 py-12 mt-12">
          <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#3a3a4e] text-sm">© 2026 Underground. Todos os direitos reservados.</p>
            <p className="text-[#3a3a4e] text-xs flex items-center gap-2">
              Desenvolvido com <span className="text-red-500">♥</span> e muito código
            </p>
          </div>
        </footer>

      </div>
    </MainLayout>
  );
}