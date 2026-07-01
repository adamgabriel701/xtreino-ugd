import { useParams, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
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
  Shield,
  History, // NOVO
} from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import XTreinosTab from "./components/XTreinosTab";
import JogadoresTab from "./Jogadores/JogadoresTab";
import RankingGeralTab from "./components/RankingGeralTab";
import RankingMensalTab from "./components/RankingMensalTab";
import RankingSemanalTab from "./components/RankingSemanalTab";
import RankingClasTab from "./components/RankingClasTab";
import DueloTab from "./components/DueloTab";
import HeadToHeadTab from "./components/HeadToHeadTab";
import EvolucaoTab from "./components/EvolucaoTab";
import HistoricoGeralTab from "./components/HistoricoGeralTab"; // NOVO
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
  | "clas"       
  | "jogadores" 
  | "historico" // NOVO
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
  group: number; 
}

// ============================================================
// CONFIGURACAO DAS ABAS
// ============================================================
const TABS: TabConfig[] = [
  { key: "xtreinos", label: "X-Treinos", icon: <Dumbbell className="w-4 h-4" />, description: "Classificacao completa dos x-treinos", group: 1 },
  { key: "geral", label: "Ranking Geral", icon: <Trophy className="w-4 h-4" />, description: "Ranking acumulado de todas as edicoes", group: 1 },
  { key: "mensal", label: "Ranking Mensal", icon: <CalendarDays className="w-4 h-4" />, description: "Ranking consolidado por mes com variacao", group: 1 },
  { key: "semanal", label: "Ranking Semanal", icon: <Calendar className="w-4 h-4" />, description: "Ranking consolidado por semana", group: 1 },
  { key: "clas", label: "Ranking Clãs", icon: <Shield className="w-4 h-4" />, description: "Ranking acumulando todas as lines do mesmo clã", group: 1 },
  { key: "jogadores", label: "Jogadores", icon: <Users className="w-4 h-4" />, description: "Estatisticas individuais detalhadas", group: 1 },
  
  { key: "historico", label: "Histórico Geral", icon: <History className="w-4 h-4" />, description: "Linha do tempo unificada de todos os X-Treinos e Scrims", group: 2 }, // NOVO
  { key: "duelo", label: "Duelo de Times", icon: <Swords className="w-4 h-4" />, description: "Comparacao direta lado a lado entre dois times em um XT", group: 2 },
  { key: "h2h", label: "Head-to-Head", icon: <Target className="w-4 h-4" />, description: "Confronto direto entre dois jogadores", group: 2 },
  { key: "evolucao", label: "Evolucao Temporal", icon: <TrendingUp className="w-4 h-4" />, description: "Grafico de linhas comparando times ao longo dos meses", group: 2 },
  
  { key: "predicoes", label: "Predicoes", icon: <Zap className="w-4 h-4" />, description: "Projecoes baseadas em media movel e tendencias", group: 3 },
  { key: "crossfire", label: "Crossfire", icon: <Crosshair className="w-4 h-4" />, description: "Historico de confrontos diretos e rivalidades entre times", group: 3 },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function Rankings() {
  const { tab } = useParams<{ tab?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Define a aba ativa baseada na URL. Padrão é "geral"
  const activeTab: TabKey = (TABS.find(t => t.key === tab)?.key as TabKey) || "geral";

  // Se o usuário acessou apenas /rankings sem nenhuma tab, redireciona para /rankings/geral
  if (!tab) {
    return <Navigate to="/rankings/geral" replace />;
  }

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;
  const group1Tabs = TABS.filter((t) => t.group === 1);
  const group2Tabs = TABS.filter((t) => t.group === 2);
  const group3Tabs = TABS.filter((t) => t.group === 3);

  const renderTabButton = (tabConfig: TabConfig) => {
    const isActive = activeTab === tabConfig.key;
    const baseUrl = "/rankings";
    const fullPath = `${baseUrl}/${tabConfig.key}`;

    // Se a aba já é a atual, não precisa de Link (evita re-render desnecessário)
    if (isActive) {
      return (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5"
        >
          {tabConfig.icon}
          {tabConfig.label}
        </div>
      );
    }

    return (
      <Link
        to={fullPath}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-[#5a5a6e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
      >
        {tabConfig.icon}
        {tabConfig.label}
      </Link>
    );
  };

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

        {/* Tabs Navigation Agrupada (Agora com Links) */}
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-2 mb-6 space-y-2">
          
          <div className="flex flex-wrap gap-1">
            {group1Tabs.map((tabConfig) => renderTabButton(tabConfig))}
          </div>

          <div className="border-t border-[#2a2a3a] pt-2 flex flex-wrap gap-1">
            {group2Tabs.map((tabConfig) => renderTabButton(tabConfig))}
          </div>

          <div className="border-t border-[#2a2a3a] pt-2 flex flex-wrap gap-1">
            {group3Tabs.map((tabConfig) => renderTabButton(tabConfig))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-12">
          {activeTab === "xtreinos" && <XTreinosTab />}
          {activeTab === "geral" && <RankingGeralTab />}
          {activeTab === "mensal" && <RankingMensalTab />}
          {activeTab === "semanal" && <RankingSemanalTab />}
          {activeTab === "clas" && <RankingClasTab />}
          {activeTab === "jogadores" && <JogadoresTab />}
          {activeTab === "historico" && <HistoricoGeralTab />} {/* NOVO */}
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