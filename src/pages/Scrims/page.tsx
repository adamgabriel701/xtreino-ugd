"use client";

import { useState } from "react";
import { Swords, Calendar, Trophy, Target, BarChart3, Users, Plus } from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import { trpc } from "@/providers/trpc";
import type { TabType, ScrimItem, ScrimMode, TeamResult, PlayerStat } from "./types"; // <-- Importei os tipos
import { useScrimData } from "./hooks/useScrimData";
import { AgendadosTab } from "./components/tabs/AgendadosTab";
import { HistoricoTimesTab } from "./components/tabs/HistoricoTimesTab";
import { HistoricoJogadoresTab } from "./components/tabs/HistoricoJogadoresTab";
import { ScrimDetailModal } from "./components/modals/ScrimDetailModal";
import { TeamStatsModal } from "./components/modals/TeamStatsModal";
import { PlayerStatsModal } from "./components/modals/PlayerStatsModal";
import { ScrimFormModal } from "./components/modals/ScrimFormModal";

const TAB_CONFIG = [
  { id: "agendados" as TabType, label: "Agendados", icon: Calendar },
  { id: "historico-times" as TabType, label: "Histórico — Times", icon: Trophy },
  { id: "historico-jogadores" as TabType, label: "Histórico — Jogadores", icon: Target },
];

const MODE_CONFIG = [
  { id: "all" as const, label: "Todos", icon: BarChart3 },
  { id: "br" as const, label: "BR", icon: Target },
  { id: "mme" as const, label: "MME", icon: Users },
];

export default function ScrimsPage() {
  const [tab, setTab] = useState<TabType>("agendados");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<ScrimMode | "all">("all");
  const [selectedScrim, setSelectedScrim] = useState<ScrimItem | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<{ name: string; team: string } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { refetch: refetchScrims } = trpc.scrims.list.useQuery();

  const {
    scrimsList,
    availableDates,
    scrimTeamResults,
    scrimPlayerStats,
    scrimPlayerAllTime,
    scrimTeamAllTimeBR,
    scrimTeamAllTimeMME,
  } = useScrimData(selectedDate, selectedMode);

  // FORÇA A TIPAGEM CORRETA AQUI, RESOLVENDO O ERRO DO "createdAt | null"
  const typedTeamResults = scrimTeamResults as TeamResult[] | undefined;
  const typedPlayerStats = scrimPlayerStats as PlayerStat[] | undefined;

  const normalizedScrimsList = (scrimsList as ScrimItem[] | undefined)?.filter((scrim) => {
    if (selectedMode === "all") return true;
    return scrim.mode?.toLowerCase() === selectedMode;
  });

  const titleMap: Record<TabType, string> = {
    "agendados": "Scrims Agendados",
    "historico-times": "Histórico — Times",
    "historico-jogadores": "Histórico — Jogadores",
  };

  const subtitleMap: Record<ScrimMode | "all", string> = {
    all: "Todos os modos",
    br: "Battle Royale",
    mme: "Mata-Mata em Equipe",
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Swords className="w-8 h-8 text-emerald-400" aria-hidden="true" />
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Scrims</h1>
              </div>
              <p className="text-[#8a8a9e]">{titleMap[tab]}</p>
              <p className="text-xs text-[#5a5a6e] mt-1">{subtitleMap[selectedMode]}</p>
            </div>

            <div className="flex items-center gap-3">
              {tab === "agendados" && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Novo Scrim
                </button>
              )}

              <div role="group" aria-label="Filtrar por modo de jogo" className="flex items-center gap-2 bg-[#1a1a24] rounded-xl p-1.5 border border-[#2a2a3a]">
                {MODE_CONFIG.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setSelectedMode(id); setSelectedDate("all"); }}
                    aria-pressed={selectedMode === id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                      selectedMode === id ? "bg-emerald-500 text-white" : "text-[#8a8a9e] hover:text-[#f0f0f5]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {/* Tabs */}
        <div role="tablist" className="flex flex-wrap gap-2 mb-6">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => { setTab(id); setSelectedDate("all"); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                tab === id ? "bg-emerald-500 text-white" : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        {/* Info Banner */}
        {selectedMode !== "all" && (
          <div className="mb-6 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedMode === "br" ? "bg-blue-500/10" : "bg-orange-500/10"}`}>
                {selectedMode === "br" ? <Target className="w-4 h-4 text-blue-400" /> : <Users className="w-4 h-4 text-orange-400" />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#f0f0f5]">{selectedMode === "br" ? "Battle Royale (BR)" : "Mata-Mata em Equipe (MME)"}</h2>
                <p className="text-xs text-[#5a5a6e] mt-1">
                  {selectedMode === "br" ? "Sistema de pontuação por posição nas quedas. 1º lugar = 15pts, 2º = 12pts, 3º = 10pts..." : "Sistema baseado em rounds ganhos. Melhor de 3, 5, 7... O tempo que fizer mais rounds vence a série."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {tab === "agendados" && (
          <AgendadosTab scrimsList={normalizedScrimsList} onScrimClick={setSelectedScrim} />
        )}

        {tab === "historico-times" && (
          <HistoricoTimesTab
            selectedDate={selectedDate}
            availableDates={availableDates}
            onDateChange={setSelectedDate}
            selectedMode={selectedMode}
            scrimTeamResults={typedTeamResults} // <-- USE A VARIÁVEL TIPADA
            scrimPlayerStats={typedPlayerStats} // <-- USE A VARIÁVEL TIPADA
            scrimTeamAllTimeBR={scrimTeamAllTimeBR}
            scrimTeamAllTimeMME={scrimTeamAllTimeMME}
            onTeamClick={(team) => setSelectedTeam(team)}
          />
        )}

        {tab === "historico-jogadores" && (
          <HistoricoJogadoresTab
            selectedDate={selectedDate}
            availableDates={availableDates}
            onDateChange={setSelectedDate}
            scrimPlayerStats={typedPlayerStats} // <-- USE A VARIÁVEL TIPADA
            scrimPlayerAllTime={scrimPlayerAllTime}
            onPlayerClick={(name, team) => setSelectedPlayer({ name, team })}
          />
        )}
      </main>

      {/* Modals de Visualização */}
      <ScrimDetailModal scrim={selectedScrim} isOpen={!!selectedScrim} onClose={() => setSelectedScrim(null)} />
      
      {selectedTeam && (
        <TeamStatsModal teamName={selectedTeam} isOpen={!!selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}
      
      {selectedPlayer && (
        <PlayerStatsModal playerName={selectedPlayer.name} teamName={selectedPlayer.team} isOpen={!!selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}

      {/* NOVO Modal de Criação */}
      <ScrimFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        defaultMode={selectedMode === "all" ? "br" : selectedMode} 
        onSuccess={() => {
          refetchScrims();
          setIsFormOpen(false);
        }} 
      />
    </MainLayout>
  );
}