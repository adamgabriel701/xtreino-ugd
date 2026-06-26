import MainLayout from "@/layout/MainLayout";
import HeroSection from "./components/HeroSection";
import StatsSection from "./components/StatsSection";
import HistoryTimeline from "./components/HistoryTimeline";
import ValuesGrid from "./components/ValuesGrid";
import ObjectivesGrid from "./components/ObjectivesGrid";
import TeamSection from "./components/TeamSection";
import PartnersGrid from "./components/PartnersGrid";
import CallToAction from "./components/CallToAction";

export default function Sobre() {
  return (
    <MainLayout>
      <HeroSection />
      
      <StatsSection />

      {/* Nossa História com Timeline */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-emerald-500 rounded-full" />
              <h2 className="text-2xl font-bold text-[#f0f0f5]">Nossa História</h2>
            </div>
            <div className="space-y-5 text-[#8a8a9e] leading-relaxed">
              <p>
                A <span className="text-emerald-400 font-semibold">Underground (UGD)</span> nasceu da paixão de um grupo de jogadores
                que queriam levar o cenário mobile a sério. O que começou como salinhas entre amigos
                evoluiu para uma organização completa de xtreinos e campeonatos.
              </p>
              <p>
                Hoje, somos referência em organização de eventos competitivos mobile,
                oferecendo uma plataforma completa para equipes e jogadores acompanharem
                seus resultados, rankings e evolução no cenário.
              </p>
              <p>
                Nosso compromisso é com a <span className="text-emerald-400 font-semibold">transparência</span>,
                <span className="text-emerald-400 font-semibold"> competitividade</span> e
                <span className="text-emerald-400 font-semibold"> diversão</span>.
                Acreditamos que o cenário mobile tem potencial enorme e trabalhamos todos os dias
                para torná-lo cada vez mais profissional.
              </p>
            </div>
          </div>

          <HistoryTimeline />
        </div>
      </section>

      <ValuesGrid />
      <ObjectivesGrid />
      <TeamSection />
      
      {/* Parceiros fora do TeamSection para manter a quebra de fundo correta */}
      <section className="border-t border-[#2a2a3a] bg-[#0d0d14] pb-16 pt-0">
        <PartnersGrid />
      </section>

      <CallToAction />
    </MainLayout>
  );
}