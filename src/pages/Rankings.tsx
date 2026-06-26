import { useState } from "react";
import {
  Dumbbell,
  Trophy,
  BarChart3,
  Users,
  CalendarDays,
  Calendar,
  Swords,
  Zap,
  TrendingUp,
  Crosshair,
  Target,
} from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import XTreinosTab from "./components/XTreinosTab";
import JogadoresTab from "./Jogadores/JogadoresTab";
import RankingGeralTab from "./components/RankingGeralTab";
import RankingMensalTab from "./components/RankingMensalTab";
import RankingSemanalTab from "./components/RankingSemanalTab";
import DueloTab from "./components/DueloTab";
import HeadToHeadTab from "./components/HeadToHeadTab";
import EvolucaoTab from "./components/EvolucaoTab";
import {
  PredicoesTab,
  MomentosCarousel,
  CrossfireTab,
} from "./components/xtreino-ousado";

// ============================================================
// TIPOS
// ============================================================
type TabKey = 
  | "xtreinos" 
  | "geral" 
  | "mensal" 
  | "semanal" 
  | "jogadores" 
  | "duelo"
  | "h2h"
  | "evolucao"
  | "predicoes"
  | "crossfire";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
  group?: "principal" | "avancado" | "ousado";
}

// ============================================================
// CONFIGURACAO DAS ABAS
// ============================================================
const TABS: TabConfig[] = [
  // Grupo Principal
  { key: "xtreinos", label: "X-Treinos", icon: <Dumbbell className="w-4 h-4" />, description: "Classificacao completa dos x-treinos", group: "principal" },
  { key: "geral", label: "Ranking Geral", icon: <Trophy className="w-4 h-4" />, description: "Ranking acumulado de todas as edicoes", group: "principal" },
  { key: "mensal", label: "Ranking Mensal", icon: <CalendarDays className="w-4 h-4" />, description: "Ranking consolidado por mes com variacao", group: "principal" },
  { key: "semanal", label: "Ranking Semanal", icon: <Calendar className="w-4 h-4" />, description: "Ranking consolidado por semana", group: "principal" },
  { key: "jogadores", label: "Jogadores", icon: <Users className="w-4 h-4" />, description: "Estatisticas individuais detalhadas", group: "principal" },
  
  // Grupo Avançado
  { key: "duelo", label: "Duelo de Times", icon: <Swords className="w-4 h-4" />, description: "Comparacao direta lado a lado entre dois times em um XT", group: "avancado" },
  { key: "h2h", label: "Head-to-Head", icon: <Target className="w-4 h-4" />, description: "Confronto direto entre dois jogadores", group: "avancado" },
  { key: "evolucao", label: "Evolucao Temporal", icon: <TrendingUp className="w-4 h-4" />, description: "Grafico de linhas comparando times ao longo dos meses", group: "avancado" },
  
  // Grupo Ousado
  { key: "predicoes", label: "Predicoes", icon: <Zap className="w-4 h-4" />, description: "Projecoes baseadas em media movel e tendencias", group: "ousado" },
  { key: "crossfire", label: "Crossfire", icon: <Crosshair className="w-4 h-4" />, description: "Historico de confrontos diretos e rivalidades entre times", group: "ousado" },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function Rankings() {
  const [activeTab, setActiveTab] = useState<TabKey>("geral"); // Mudado para abrir direto no Geral

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;

  // Separar abas em grupos para organizar a UI
  const principalTabs = TABS.filter((t) => t.group === "principal");
  const avancadoTabs = TABS.filter((t) => t.group === "avancado");
  const ousadoTabs = TABS.filter((t) => t.group === "ousado");

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="bg-[#12121a] border-b border-[#2a2a3a] -mx-4 lg:-mx-8 px-4 lg:px-8 py-12 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
              Rankings & Análises
            </h1>
          </div>
          <p className="text-[#8a8a9e]">
            {activeTabConfig.description}
          </p>
        </div>

        {/* Momentos Históricos (Global no topo) */}
        <div className="mb-6">
          <MomentosCarousel />
        </div>

        {/* Tabs Navigation Agrupada */}
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-2 mb-6 space-y-2">
          
          {/* Grupo Principal */}
          <div className="flex flex-wrap gap-1">
            {principalTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${
                    activeTab === tab.key
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5"
                      : "text-[#5a5a6e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Separador e Grupo Avançado */}
          <div className="border-t border-[#2a2a3a] pt-2 flex flex-wrap gap-1">
            <span className="flex items-center px-2 text-[10px] uppercase text-[#5a5a6e] font-bold tracking-widest">Avançado</span>
            {avancadoTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                  ${
                    activeTab === tab.key
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "text-[#5a5a6e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Separador e Grupo Ousado */}
          <div className="border-t border-[#2a2a3a] pt-2 flex flex-wrap gap-1">
            <span className="flex items-center px-2 text-[10px] uppercase text-purple-400 font-bold tracking-widest">Ousado</span>
            {ousadoTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                  ${
                    activeTab === tab.key
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      : "text-[#5a5a6e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-12">
          {activeTab === "xtreinos" && <XTreinosTab />}
          {activeTab === "geral" && <RankingGeralTab />}
          {activeTab === "mensal" && <RankingMensalTab />}
          {activeTab === "semanal" && <RankingSemanalTab />}
          {activeTab === "jogadores" && <JogadoresTab />}
          {activeTab === "duelo" && <DueloTab />}
          {activeTab === "h2h" && <HeadToHeadTab />}
          {activeTab === "evolucao" && <EvolucaoTab />}
          {activeTab === "predicoes" && <PredicoesTab />}
          {activeTab === "crossfire" && <CrossfireTab />}
        </div>
      </div>
    </MainLayout>
  );
}