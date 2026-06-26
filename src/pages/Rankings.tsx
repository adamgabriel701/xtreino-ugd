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
  group: number; // Usado apenas para definir a quebra de linha
}

// ============================================================
// CONFIGURACAO DAS ABAS
// ============================================================
const TABS: TabConfig[] = [
  // Grupo 1
  { key: "xtreinos", label: "X-Treinos", icon: <Dumbbell className="w-4 h-4" />, description: "Classificacao completa dos x-treinos", group: 1 },
  { key: "geral", label: "Ranking Geral", icon: <Trophy className="w-4 h-4" />, description: "Ranking acumulado de todas as edicoes", group: 1 },
  { key: "mensal", label: "Ranking Mensal", icon: <CalendarDays className="w-4 h-4" />, description: "Ranking consolidado por mes com variacao", group: 1 },
  { key: "semanal", label: "Ranking Semanal", icon: <Calendar className="w-4 h-4" />, description: "Ranking consolidado por semana", group: 1 },
  { key: "jogadores", label: "Jogadores", icon: <Users className="w-4 h-4" />, description: "Estatisticas individuais detalhadas", group: 1 },
  
  // Grupo 2
  { key: "duelo", label: "Duelo de Times", icon: <Swords className="w-4 h-4" />, description: "Comparacao direta lado a lado entre dois times em um XT", group: 2 },
  { key: "h2h", label: "Head-to-Head", icon: <Target className="w-4 h-4" />, description: "Confronto direto entre dois jogadores", group: 2 },
  { key: "evolucao", label: "Evolucao Temporal", icon: <TrendingUp className="w-4 h-4" />, description: "Grafico de linhas comparando times ao longo dos meses", group: 2 },
  
  // Grupo 3
  { key: "predicoes", label: "Predicoes", icon: <Zap className="w-4 h-4" />, description: "Projecoes baseadas em media movel e tendencias", group: 3 },
  { key: "crossfire", label: "Crossfire", icon: <Crosshair className="w-4 h-4" />, description: "Historico de confrontos diretos e rivalidades entre times", group: 3 },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function Rankings() {
  const [activeTab, setActiveTab] = useState<TabKey>("geral");

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;

  // Separar abas em grupos usando o número
  const group1Tabs = TABS.filter((t) => t.group === 1);
  const group2Tabs = TABS.filter((t) => t.group === 2);
  const group3Tabs = TABS.filter((t) => t.group === 3);

  // Função auxiliar para renderizar os botões
  const renderTabButton = (tab: TabConfig, isActive: boolean) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
        ${
          isActive
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5"
            : "text-[#5a5a6e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
        }
      `}
    >
      {tab.icon}
      {tab.label}
    </button>
  );

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
          
          {/* Grupo 1 */}
          <div className="flex flex-wrap gap-1">
            {group1Tabs.map((tab) => renderTabButton(tab, activeTab === tab.key))}
          </div>

          {/* Separador e Grupo 2 */}
          <div className="border-t border-[#2a2a3a] pt-2 flex flex-wrap gap-1">
            {group2Tabs.map((tab) => renderTabButton(tab, activeTab === tab.key))}
          </div>

          {/* Separador e Grupo 3 */}
          <div className="border-t border-[#2a2a3a] pt-2 flex flex-wrap gap-1">
            {group3Tabs.map((tab) => renderTabButton(tab, activeTab === tab.key))}
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