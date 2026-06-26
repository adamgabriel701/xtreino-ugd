// ============================================================
// xtreino-ousado.tsx (CORRIGIDO)
// ============================================================

import { useState, useMemo } from "react";
import {
  Zap,
  Trophy,
  Target,
  Swords,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  EmptyState,
} from "./xtreino";
import {
  type EnrichedTeam,
  enrichTeam,
  buildTeamRanking,
} from "./xtreino-shared";

// ============================================================
// IDEIA #14: MODO COMPACTO VS DETALHADO
// ============================================================
export function useCompactMode() {
  const [isCompact, setIsCompact] = useState(false);
  const toggle = () => setIsCompact((prev) => !prev);
  return { isCompact, toggle };
}

// ============================================================
// IDEIA #11: TAB "PREDIÇÕES"
// ============================================================
export function PredicoesTab() {
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();

  const months = useMemo(() => {
    if (!allResults) return [];
    const m = new Set<string>();
    allResults.forEach((r) => { if (r.date) m.add(r.date.substring(0, 7)); });
    return Array.from(m).sort();
  }, [allResults]);

  const rankingByMonth = useMemo(() => {
    if (!allResults || !allPlayerStats) return new Map<string, EnrichedTeam[]>();
    const map = new Map<string, EnrichedTeam[]>();
    months.forEach((month) => {
      const mResults = allResults.filter((r) => r.date?.startsWith(month));
      const mStats = allPlayerStats.filter((s) => s.date?.startsWith(month));
      const baseRanking = buildTeamRanking(mResults, mStats as any);
      const enriched = baseRanking.map((t) => enrichTeam(t, "mensal"));
      map.set(month, enriched.sort((a, b) => b.totalPoints - a.totalPoints));
    });
    return map;
  }, [allResults, allPlayerStats, months]);

  const predictions = useMemo(() => {
    if (months.length < 3) return [];
    const lastMonth = months[months.length - 1];
    const prevMonth = months[months.length - 2];
    const prevPrevMonth = months[months.length - 3];

    const lastRanking = rankingByMonth.get(lastMonth) ?? [];
    const prevRanking = rankingByMonth.get(prevMonth) ?? [];
    const prevPrevRanking = rankingByMonth.get(prevPrevMonth) ?? [];

    return lastRanking.slice(0, 5).map((team) => {
      const lastPts = team.totalPoints;
      const prevPts = prevRanking.find((t) => t.teamName === team.teamName)?.totalPoints ?? 0;
      const prevPrevPts = prevPrevRanking.find((t) => t.teamName === team.teamName)?.totalPoints ?? 0;

      const movingAvg = (lastPts + prevPts + prevPrevPts) / 3;
      const diff = lastPts - prevPts;
      const projection = Math.round(movingAvg + (diff * 0.5));
      
      const trendLabel = diff > 20 ? "🔥 Em Alta" : diff < -20 ? "📉 Em Queda" : "➡️ Estável";

      return {
        teamName: team.teamName,
        currentPts: lastPts,
        projectionPts: projection,
        minPts: Math.round(movingAvg * 0.9),
        maxPts: Math.round(movingAvg * 1.1),
        trendLabel,
      };
    });
  }, [months, rankingByMonth]);

  if (!allResults) return <EmptyState icon={<Zap className="w-12 h-12" />} title="Carregando predições..." />;

  return (
    <div className="space-y-6">
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
        <h3 className="text-lg font-bold text-[#f0f0f5] mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" /> Projeto para o Próximo Mês (Top 5)
        </h3>
        <p className="text-sm text-[#5a5a6e] mb-6">Baseado na média móvel dos últimos 3 meses e na tendência de crescimento.</p>

        <div className="space-y-4">
          {predictions.length === 0 ? (
            <p className="text-[#5a5a6e] text-sm">Dados insuficientes (mínimo 3 meses de histórico).</p>
          ) : (
            predictions.map((p, i) => (
              <div key={p.teamName} className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-[#5a5a6e] w-8">#{i + 1}</span>
                  <div>
                    <h4 className="font-bold text-[#f0f0f5]">{p.teamName}</h4>
                    <span className="text-xs text-[#5a5a6e]">{p.trendLabel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-[#5a5a6e] text-xs">Mês Atual</p>
                    <p className="font-bold text-[#f0f0f5]">{p.currentPts}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-purple-400 text-xs">Projeção</p>
                    <p className="font-black text-2xl text-purple-400">{p.projectionPts}</p>
                  </div>
                  <div className="text-center text-xs text-[#5a5a6e]">
                    <p>Faixa esperada:</p>
                    <p>{p.minPts} — {p.maxPts}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// IDEIA #12: "MOMENTOS" (Highlights Automáticos)
// ============================================================
export function MomentosCarousel() {
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();

  const moments = useMemo(() => {
    if (!allPlayerStats) return [];
    const highlights: Array<{
      id: string;
      title: string;
      subtitle: string;
      icon: React.ReactNode;
      color: string;
    }> = [];

    let maxKill = { playerName: "", totalKills: 0, date: "" };
    allPlayerStats.forEach((s) => {
      if (s.totalKills > maxKill.totalKills) {
        maxKill = { playerName: s.playerName, totalKills: s.totalKills, date: s.date };
      }
    });
    if (maxKill.totalKills > 0) {
      highlights.push({
        id: "mk",
        title: "Maior Kill Stamp Individual",
        subtitle: `${maxKill.playerName} marcou ${maxKill.totalKills} kills em ${maxKill.date.split("-").reverse().slice(0, 2).join("/")}`,
        icon: <Target className="w-8 h-8" />,
        color: "text-red-400 border-red-500/20 bg-red-500/5",
      });
    }

    let bestComeback = { playerName: "", diff: 0, date: "", total: 0 };
    allPlayerStats.forEach((s) => {
      const firstHalf = s.q1Kills;
      const secondHalf = s.q2Kills + s.q3Kills;
      const diff = secondHalf - firstHalf;
      if (diff > bestComeback.diff) {
        bestComeback = { playerName: s.playerName, diff, date: s.date, total: s.totalKills };
      }
    });
    if (bestComeback.diff > 5) {
      highlights.push({
        id: "cb",
        title: "Maior Virada de Quarto",
        subtitle: `${bestComeback.playerName} fez +${bestComeback.diff} kills na segunda metade (${bestComeback.date.split("-").reverse().slice(0, 2).join("/")})`,
        icon: <Trophy className="w-8 h-8" />,
        color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
      });
    }

    return highlights;
  }, [allPlayerStats]);

  if (!moments.length) return null;

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
      <h3 className="text-sm font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400" /> Momentos Históricos
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {moments.map((m) => (
          <div key={m.id} className={`rounded-lg border p-4 ${m.color}`}>
            <div className="mb-2 opacity-80">{m.icon}</div>
            <h4 className="font-bold text-lg">{m.title}</h4>
            <p className="text-sm opacity-80 mt-1">{m.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// IDEIA #13: TAB "CROSSFIRE" (Histórico de Confrontos Diretos)
// ============================================================
export function CrossfireTab() {
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  
  const matchups = useMemo(() => {
    if (!allResults) return [];
    const map = new Map<string, { teamA: string; teamB: string; winsA: number; winsB: number; draws: number }>();
    
    const xtDates = new Set(allResults.map((r) => r.xtreinoId));
    
    xtDates.forEach((xtId) => {
      const xtResults = allResults.filter((r) => r.xtreinoId === xtId);
      const teams = xtResults.map((r) => r.teamName);
      
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const teamA = teams[i];
          const teamB = teams[j];
          const key = [teamA, teamB].sort().join(" vs ");
          
          const statsA = xtResults.find((r) => r.teamName === teamA);
          const statsB = xtResults.find((r) => r.teamName === teamB);
          
          if (!statsA || !statsB) continue;

          if (!map.has(key)) {
            map.set(key, { teamA: [teamA, teamB].sort()[0], teamB: [teamA, teamB].sort()[1], winsA: 0, winsB: 0, draws: 0 });
          }

          const matchup = map.get(key)!;
          const isATeamA = matchup.teamA === teamA;

          // CORRIGIDO: Garantindo que não seja null com fallback 0
          const pointsA = statsA.totalPoints ?? 0;
          const pointsB = statsB.totalPoints ?? 0;

          if (pointsA > pointsB) {
            isATeamA ? matchup.winsA++ : matchup.winsB++;
          } else if (pointsB > pointsA) {
            isATeamA ? matchup.winsB++ : matchup.winsA++;
          } else {
            matchup.draws++;
          }
        }
      }
    });

    return Array.from(map.values())
      .filter((m) => (m.winsA + m.winsB + m.draws) >= 2)
      .sort((a, b) => (b.winsA + b.winsB) - (a.winsA + a.winsB));
  }, [allResults]);

  if (!allResults) return <EmptyState icon={<Swords className="w-12 h-12" />} title="Calculando rivalidades..." />;

  return (
    <div className="space-y-6">
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a]">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
            <Swords className="w-5 h-5 text-red-400" /> Maiores Rivalidades
          </h3>
          <p className="text-xs text-[#5a5a6e] mt-1">Confrontos diretos que aconteceram 2 ou mais vezes.</p>
        </div>

        <div className="divide-y divide-[#2a2a3a]">
          {matchups.length === 0 && <EmptyState icon={<Swords className="w-12 h-12" />} title="Nenhuma rivalidade encontrada" subtitle="Times precisam se enfrentar pelo menos 2 vezes." />}
          
          {matchups.map((m) => {
            const total = m.winsA + m.winsB + m.draws;
            const pctA = Math.round((m.winsA / total) * 100);
            const pctB = Math.round((m.winsB / total) * 100);

            return (
              <div key={`${m.teamA}-${m.teamB}`} className="px-6 py-4 hover:bg-[#1a1a24]/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 text-right">
                    <span className="font-bold text-[#f0f0f5]">{m.teamA}</span>
                    <span className="ml-2 text-sm text-green-400 font-bold">{m.winsA} vitórias</span>
                  </div>
                  <span className="text-xs text-[#5a5a6e] mx-4">VS</span>
                  <div className="flex-1 text-left">
                    <span className="font-bold text-[#f0f0f5]">{m.teamB}</span>
                    <span className="ml-2 text-sm text-green-400 font-bold">{m.winsB} vitórias</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden bg-[#0a0a0f]">
                  <div className="bg-blue-500 h-full rounded-l-full transition-all" style={{ width: `${pctA}%` }} />
                  {m.draws > 0 && (
                    <div className="bg-[#5a5a6e] h-full" style={{ width: `${Math.round((m.draws / total) * 100)}%` }} />
                  )}
                  <div className="bg-red-500 h-full rounded-r-full transition-all" style={{ width: `${pctB}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-[#5a5a6e] mt-1">
                  <span>{pctA}%</span>
                  {m.draws > 0 && <span>{m.draws} empates</span>}
                  <span>{pctB}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}