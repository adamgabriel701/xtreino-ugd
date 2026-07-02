// ============================================================
// PredicoesTab.tsx
// ============================================================

import { useState, useMemo } from "react";
import {
  Brain,
  Target,
  TrendingUp,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  FilterBar,
  SearchInput,
  LoadingSpinner,
  EmptyState,
} from "./xtreino";
import { useXtreinoCalculations } from "@/hooks/useXtreinoCalculations";

interface TeamPowerStats {
  teamName: string;
  rating: number;
  avgPoints: number;
  avgKills: number;
  avgPosition: number;
  consistency: number;
  xtreinosPlayed: number;
}

export default function PredicoesTab() {
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [teamA, setTeamA] = useState<string>("");
  const [teamB, setTeamB] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const isLoading = !allResults || !allPlayerStats;

  const { teamAccumulated } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

  // 1. Calcula o "Power Rating" de cada time
  const teamPowers = useMemo((): TeamPowerStats[] => {
    if (teamAccumulated.length === 0) return [];

    return teamAccumulated
      .map((t) => {
        const avgPoints = t.participations > 0 ? t.totalPoints / t.participations : 0;
        const avgKills = t.participations > 0 ? t.totalKills / t.participations : 0;
        
        // Calcula posição média invertida (1º lugar = 1, 10º = 10)
        // Usamos os pontos de posição totais dividido pelo número de quartos jogados
        const quartersPlayed = t.participations * 3;
        const avgPosPoints = quartersPlayed > 0 ? t.totalPosPoints / quartersPlayed : 0;
        
        // Consistência: Variância baseada em quantas vezes ficou no Top 3
        const top3Rate = quartersPlayed > 0 ? (t.top3Count || 0) / quartersPlayed : 0;

        // FÓRMULA DO POWER RATING (Peso: 50% Pontos, 30% Kills, 20% Consistência)
        const maxAvgPoints = 60; // Baseado em 1º lugar em todas as quedas + kills
        const normalizedPoints = (avgPoints / maxAvgPoints) * 100;
        const normalizedKills = Math.min((avgKills / 30) * 100, 100); // Capa de 30 kills por XT
        const consistencyScore = top3Rate * 100;

        const rating = (normalizedPoints * 0.5) + (normalizedKills * 0.3) + (consistencyScore * 0.2);

        return {
          teamName: t.teamName,
          rating: Math.round(rating * 10) / 10,
          avgPoints: Math.round(avgPoints * 10) / 10,
          avgKills: Math.round(avgKills * 10) / 10,
          avgPosition: avgPosPoints,
          consistency: Math.round(top3Rate * 100),
          xtreinosPlayed: t.participations,
        };
      })
      .sort((a, b) => b.rating - a.rating);
  }, [teamAccumulated]);

  const teamNames = useMemo(() => teamPowers.map((t) => t.teamName), [teamPowers]);
  const filteredA = useMemo(() => teamNames.filter((n) => n.toLowerCase().includes(searchA.toLowerCase())), [teamNames, searchA]);
  const filteredB = useMemo(() => teamNames.filter((n) => n.toLowerCase().includes(searchB.toLowerCase()) && n !== teamA), [teamNames, searchB, teamA]);

  const powerA = useMemo(() => teamPowers.find((t) => t.teamName === teamA), [teamPowers, teamA]);
  const powerB = useMemo(() => teamPowers.find((t) => t.teamName === teamB), [teamPowers, teamB]);

  // 2. Lógica de Predição
  const prediction = useMemo(() => {
    if (!powerA || !powerB) return null;

    const diff = powerA.rating - powerB.rating;
    // Transforma a diferença de rating em porcentagem usando uma curva sigmoide suave
    const probabilityA = 50 + (diff * 1.5); // 1 ponto de diferença = 1.5% de vantagem
    const probA = Math.max(10, Math.min(90, probabilityA)); // Limita entre 10% e 90%
    const probB = 100 - probA;

    // Gera os "Motivos"
    const reasons: { text: string; winner: "A" | "B" | "Tie"; icon: React.ReactNode }[] = [];
    
    if (powerA.avgPoints > powerB.avgPoints) {
      reasons.push({ text: `Maior média de pontos (${powerA.avgPoints} vs ${powerB.avgPoints})`, winner: "A", icon: <TrendingUp className="w-4 h-4 text-green-400" /> });
    } else if (powerB.avgPoints > powerA.avgPoints) {
      reasons.push({ text: `Maior média de pontos (${powerB.avgPoints} vs ${powerA.avgPoints})`, winner: "B", icon: <TrendingUp className="w-4 h-4 text-green-400" /> });
    }

    if (powerA.avgKills > powerB.avgKills) {
      reasons.push({ text: `Maior poder de eliminação (${powerA.avgKills} vs ${powerB.avgKills} kills/XT)`, winner: "A", icon: <Target className="w-4 h-4 text-red-400" /> });
    } else if (powerB.avgKills > powerA.avgKills) {
      reasons.push({ text: `Maior poder de eliminação (${powerB.avgKills} vs ${powerA.avgKills} kills/XT)`, winner: "B", icon: <Target className="w-4 h-4 text-red-400" /> });
    }

    if (powerA.consistency > powerB.consistency + 10) {
      reasons.push({ text: `Muito mais consistente no Top 3 (${powerA.consistency}% vs ${powerB.consistency}%)`, winner: "A", icon: <Shield className="w-4 h-4 text-blue-400" /> });
    } else if (powerB.consistency > powerA.consistency + 10) {
      reasons.push({ text: `Muito mais consistente no Top 3 (${powerB.consistency}% vs ${powerA.consistency}%)`, winner: "B", icon: <Shield className="w-4 h-4 text-blue-400" /> });
    }

    if (Math.abs(powerA.xtreinosPlayed - powerB.xtreinosPlayed) > 5) {
      reasons.push({ text: "Disparidade no número de XTs jogados (Dado pouco conclusivo)", winner: "Tie", icon: <AlertTriangle className="w-4 h-4 text-yellow-400" /> });
    }

    return { probA: Math.round(probA), probB: Math.round(probB), reasons, winner: probA > probB ? "A" : "B" as "A" | "B" };
  }, [powerA, powerB]);

  const handleClear = () => {
    setSearchA(""); setSearchB(""); setTeamA(""); setTeamB(""); setShowDetails(false);
  };

  return (
    <div className="space-y-6">
      <FilterBar hasFilters={!!teamA || !!teamB} onClear={handleClear}>
        <div className="flex-1 max-w-[300px]">
          <p className="text-xs text-yellow-400 font-bold mb-1">TIME A</p>
          <SearchInput value={searchA} onChange={(v) => { setSearchA(v); if (v === "") setTeamA(""); }} placeholder="Buscar time..." minWidth="100%" />
          {searchA && !teamA && (
            <div className="absolute mt-1 w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg max-h-40 overflow-y-auto z-20 shadow-xl">
              {filteredA.slice(0, 5).map((name) => (
                <button key={name} onClick={() => { setTeamA(name); setSearchA(name); }} className="w-full text-left px-3 py-2 text-sm text-[#f0f0f5] hover:bg-[#2a2a3a] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-400" />{name}
                </button>
              ))}
            </div>
          )}
        </div>

        <Brain className="w-6 h-6 text-purple-400 mt-4" />

        <div className="flex-1 max-w-[300px]">
          <p className="text-xs text-gray-300 font-bold mb-1">TIME B</p>
          <SearchInput value={searchB} onChange={(v) => { setSearchB(v); if (v === "") setTeamB(""); }} placeholder="Buscar time..." minWidth="100%" />
          {searchB && !teamB && (
            <div className="absolute mt-1 w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg max-h-40 overflow-y-auto z-20 shadow-xl">
              {filteredB.slice(0, 5).map((name) => (
                <button key={name} onClick={() => { setTeamB(name); setSearchB(name); }} className="w-full text-left px-3 py-2 text-sm text-[#f0f0f5] hover:bg-[#2a2a3a] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-300" />{name}
                </button>
              ))}
            </div>
          )}
        </div>
      </FilterBar>

      {isLoading && <LoadingSpinner text="Calculando Power Ratings..." />}

      {!isLoading && prediction && powerA && powerB && (
        <div className="space-y-6">
          {/* Card de Predição Principal */}
          <div className="bg-[#12121a] rounded-2xl border border-purple-500/20 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
            <h2 className="text-lg font-bold text-[#8a8a9e] mb-6 relative z-10">PROBABILIDADE DE VITÓRIA</h2>
            
            <div className="flex items-center justify-center gap-6 relative z-10">
              <div className="text-center">
                <p className="text-5xl font-black text-yellow-400">{prediction.probA}%</p>
                <p className="text-sm text-[#f0f0f5] mt-2 font-medium">{teamA}</p>
              </div>
              <div className="text-2xl font-black text-[#2a2a3a]">VS</div>
              <div className="text-center">
                <p className="text-5xl font-black text-gray-300">{prediction.probB}%</p>
                <p className="text-sm text-[#f0f0f5] mt-2 font-medium">{teamB}</p>
              </div>
            </div>

            {/* Barra de Probabilidade Visual */}
            <div className="max-w-lg mx-auto mt-8 h-4 rounded-full overflow-hidden bg-[#0a0a0f] border border-[#2a2a3a] flex relative z-10">
              <div className="bg-yellow-400 h-full transition-all duration-1000" style={{ width: `${prediction.probA}%` }} />
              <div className="bg-gray-400 h-full transition-all duration-1000" style={{ width: `${prediction.probB}%` }} />
            </div>
            
            <p className="text-xs text-purple-400 mt-4 relative z-10">
              *Baseado no algoritmo de Power Rating (Pontuação, Kills e Consistência)
            </p>
          </div>

          {/* Fatores Análisados */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-between text-[#f0f0f5] font-bold">
              <span className="flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" /> Fatores da Análise</span>
              <span className="text-[#5a5a6e]">{showDetails ? '▲' : '▼'}</span>
            </button>
            
            {showDetails && (
              <div className="mt-4 space-y-3 border-t border-[#2a2a3a] pt-4">
                {prediction.reasons.map((r, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${
                    r.winner === "A" ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-400" : 
                    r.winner === "B" ? "bg-gray-300/5 border-gray-300/20 text-gray-300" : 
                    "bg-yellow-500/5 border-yellow-500/10 text-[#8a8a9e]"
                  }`}>
                    {r.icon}
                    <span className="text-sm font-medium">{r.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats Comparativas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCompCard label="Power Rating" a={powerA.rating} b={powerB.rating} isHigherBetter />
            <StatCompCard label="Média de Pontos/XT" a={powerA.avgPoints} b={powerB.avgPoints} isHigherBetter />
            <StatCompCard label="Média de Kills/XT" a={powerA.avgKills} b={powerB.avgKills} isHigherBetter />
            <StatCompCard label="Consistência Top 3 (%)" a={powerA.consistency} b={powerB.consistency} isHigherBetter suffix="%" />
          </div>
        </div>
      )}

      {!isLoading && (!teamA || !teamB) && (
        <EmptyState icon={<Brain className="w-12 h-12" />} title="Simulador de Confrontos" subtitle="Selecione dois times para gerar uma predição matemática baseada nos dados reais." />
      )}
    </div>
  );
}

function StatCompCard({ label, a, b, isHigherBetter, suffix = "" }: { label: string; a: number; b: number; isHigherBetter: boolean; suffix?: string }) {
  const aWins = isHigherBetter ? a > b : a < b;
  const bWins = isHigherBetter ? b > a : b < a;
  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4 flex items-center justify-between">
      <span className={`text-lg font-bold ${aWins ? 'text-yellow-400' : 'text-[#5a5a6e]'}`}>{a}{suffix}</span>
      <span className="text-xs text-[#5a5a6e] text-center flex-1 px-2">{label}</span>
      <span className={`text-lg font-bold ${bWins ? 'text-gray-300' : 'text-[#5a5a6e]'}`}>{b}{suffix}</span>
    </div>
  );
}