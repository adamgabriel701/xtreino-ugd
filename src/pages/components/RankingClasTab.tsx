// ============================================================
// RankingClasTab.tsx
// ============================================================

import { useState, useMemo, useEffect } from "react";
import {
  Shield,
  TrendingUp,
  BarChart2,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useXtreinoCalculations } from "@/hooks/useXtreinoCalculations";

import {
  SummaryCards,
  FilterBar,
  SearchInput,
  LoadingSpinner,
  ComparisonBar,
  PodiumCard,
} from "./xtreino";
import {
  type EnrichedTeam,
  type MergedPlayer,
  type SortField,
  getMonthName,
  buildTeamRanking,
  mergePlayersById,
  usePlayersByName,
  useSortState,
  useCompareState,
  useRankingSort,
} from "./xtreino-shared";
import { buildSummaryCards } from "./xtreino-shared-components";
import { RankingTable } from "./RankingTable";
import { RankingLegend } from "./RankingLegend";
import { useCompactMode } from "./xtreino-ousado";

// ============================================================
// FUNÇÃO AUXILIAR: Adapta a soma do Clã para o formato da RankingTable
// ============================================================
function adaptClanToEnrichedTeam(clanSum: any): EnrichedTeam {
  return {
    teamName: clanSum.teamName,
    xtreinosPlayed: clanSum.xtreinosPlayed || 0,
    totalPoints: clanSum.totalPoints || 0,
    totalPosPoints: clanSum.totalPosPoints || 0,
    totalKillPoints: clanSum.totalKillPoints || 0,
    totalKills: clanSum.totalKills || 0,
    
    badges: [],
    top1Count: clanSum.top1Count || 0,
    top2Count: clanSum.top2Count || 0,
    top3Count: clanSum.top3Count || 0,
    bestPosition: clanSum.bestPosition || null,
    
    avgPosition: 0, 
    consistency: 0,
    streak: 0,
    trend: "same" as const,
    sparkline: clanSum.xtreinosPlayed > 0 ? [clanSum.totalPoints] : [],
    xtreinos: [], 
    
    // PROPRIEDADES QUE ESTAVAM FALTANDO:
    bestPerformance: clanSum.totalPoints || 0,
    worstPerformance: clanSum.totalPoints || 0,
    
    pointsVsPrevMonth: null,
  };
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function RankingClasTab() {
  const { sortBy, sortDir, handleSort } = useSortState();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const {
    compareMode,
    setCompareMode,
    selected: selectedForCompare,
    toggle: toggleCompare,
    clear: clearCompare,
  } = useCompareState();
  const [search, setSearch] = useState("");
  
  const { isCompact, toggle: toggleCompact } = useCompactMode();

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: clansList } = trpc.clans.list.useQuery();

  const isLoading = !allResults || !allPlayerStats || !clansList;
  const playersByName = usePlayersByName(playersList);

  const lineToClanMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!clansList) return map;
    clansList.forEach((clan) => {
      clan.teams?.forEach((team) => {
        map.set(team.name.trim().toLowerCase(), clan.name);
      });
    });
    return map;
  }, [clansList]);

  const { teamRanking, teamPlayersGrouped } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

  const availableMonths = useMemo(() => {
    if (!allResults) return [];
    const months = new Set<string>();
    allResults.forEach((r) => { if (r.date) months.add(r.date.substring(0, 7)); });
    return Array.from(months).sort().reverse();
  }, [allResults]);

  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const filteredResults = useMemo(() => {
    if (!selectedMonth || !allResults) return [];
    return allResults.filter((r) => r.date?.startsWith(selectedMonth));
  }, [allResults, selectedMonth]);

  const filteredPlayerStats = useMemo(() => {
    if (!selectedMonth || !allPlayerStats) return [];
    return allPlayerStats.filter((s) => s.date?.startsWith(selectedMonth));
  }, [allPlayerStats, selectedMonth]);

  const clanRankingRaw = useMemo(() => {
    const sourceRanking = selectedMonth 
      ? buildTeamRanking(filteredResults, filteredPlayerStats as any)
      : teamRanking;

    const clanMap = new Map<string, any>();

    sourceRanking.forEach((teamStat: any) => {
      const teamKey = teamStat.teamName.trim().toLowerCase();
      const clanName = lineToClanMap.get(teamKey) || "Lines Solos/Desconhecidas";

      if (clanMap.has(clanName)) {
        const existing = clanMap.get(clanName);
        existing.totalPoints += teamStat.totalPoints;
        existing.totalPosPoints += teamStat.totalPosPoints;
        existing.totalKillPoints += teamStat.totalKillPoints;
        existing.totalKills += teamStat.totalKills;
        existing.xtreinosPlayed += teamStat.xtreinosPlayed;
        existing.xtreinos = [...existing.xtreinos, ...teamStat.xtreinos];
        existing.lines.push(teamStat.teamName);
        
        existing.top1Count += teamStat.top1Count || 0;
        existing.top2Count += teamStat.top2Count || 0;
        existing.top3Count += teamStat.top3Count || 0;
        
        if (teamStat.bestPosition !== null && teamStat.bestPosition !== undefined) {
           if (existing.bestPosition === null || teamStat.bestPosition < existing.bestPosition) {
             existing.bestPosition = teamStat.bestPosition;
           }
        }
      } else {
        clanMap.set(clanName, {
          teamName: clanName,
          totalPoints: teamStat.totalPoints,
          totalPosPoints: teamStat.totalPosPoints,
          totalKillPoints: teamStat.totalKillPoints,
          totalKills: teamStat.totalKills,
          xtreinosPlayed: teamStat.xtreinosPlayed,
          xtreinos: teamStat.xtreinos || [],
          lines: [teamStat.teamName],
          top1Count: teamStat.top1Count || 0,
          top2Count: teamStat.top2Count || 0,
          top3Count: teamStat.top3Count || 0,
          bestPosition: teamStat.bestPosition !== null && teamStat.bestPosition !== undefined ? teamStat.bestPosition : null,
        });
      }
    });

    return Array.from(clanMap.values());
  }, [teamRanking, filteredResults, filteredPlayerStats, selectedMonth, lineToClanMap]);

  const enrichedRanking: EnrichedTeam[] = useMemo(() => {
    return clanRankingRaw.map(adaptClanToEnrichedTeam);
  }, [clanRankingRaw]);

  const sorted = useRankingSort(enrichedRanking, sortBy, sortDir);

  const finalRanking = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((t) => t.teamName.toLowerCase().includes(q));
  }, [sorted, search]);

  const getTeamPlayers = (clanName: string): MergedPlayer[] => {
    const clanData = clanRankingRaw.find(c => c.teamName === clanName);
    if (!clanData) return [];
    
    let allPlayers: any[] = [];
    clanData.lines.forEach((lineName: string) => {
      const lineKey = lineName.trim().toLowerCase();
      const players = teamPlayersGrouped.get(lineKey) ?? [];
      allPlayers = [...allPlayers, ...players];
    });
    
    return mergePlayersById(allPlayers, playersByName);
  };

  const top3 = useMemo(
    () => (finalRanking.length >= 3 ? finalRanking.slice(0, 3) : []),
    [finalRanking]
  );

  const comparisonTeams = useMemo(
    () => sorted.filter((t) => selectedForCompare.has(t.teamName)),
    [sorted, selectedForCompare]
  );

  const totalXtreinosUnicos = useMemo(() => {
    const ids = new Set<number>();
    const dataSource = selectedMonth ? filteredResults : (allResults ?? []);
    dataSource.forEach((r) => ids.add(r.xtreinoId));
    return ids.size;
  }, [allResults, filteredResults, selectedMonth]);

  const clearFilters = () => {
    setSearch("");
    setSelectedMonth("");
    clearCompare();
  };

  const hasFilters = search.trim().length > 0 || sortBy !== "total" || compareMode || isCompact || selectedMonth !== "";
  const summaryCards = buildSummaryCards(clanRankingRaw, totalXtreinosUnicos);

  return (
    <div className={`space-y-6 ${comparisonTeams.length >= 2 ? "pb-48" : ""}`}>
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Shield className="w-5 h-5 text-emerald-400" />
          <label className="text-sm font-medium text-[#f0f0f5]">Filtrar por Mês:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-emerald-500/50 min-w-[200px]"
          >
            <option value="">Acumulado Geral</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>
          {selectedMonth ? (
            <span className="text-xs text-[#5a5a6e]">{filteredResults.length} resultados no mês</span>
          ) : (
            <span className="text-xs text-[#5a5a6e]">Mostrando dados históricos de todos os meses</span>
          )}
        </div>
      </div>

      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar clã..."
          minWidth="200px"
        />
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#5a5a6e]" />
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value as SortField)}
            className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50 min-w-[160px]"
          >
            <option value="total">Ordenar: Total Geral</option>
            <option value="kills">Ordenar: Kills Totais</option>
            <option value="pos">Ordenar: Pts Posicao</option>
            <option value="xtreinos">Ordenar: X-Treinos Jogados</option>
            <option value="avgPos">Ordenar: Media Pos</option>
            <option value="consistency">Ordenar: Consistencia</option>
            <option value="streak">Ordenar: Streak</option>
          </select>
        </div>
        
        <button
          onClick={toggleCompact}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
            isCompact
              ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
              : "bg-[#1a1a24] border-[#2a2a3a] text-[#5a5a6e] hover:text-[#f0f0f5]"
          }`}
        >
          {isCompact ? <Maximize2 className="w-4 h-4 inline mr-1.5" /> : <Minimize2 className="w-4 h-4 inline mr-1.5" />}
          {isCompact ? "Detalhado" : "Compacto"}
        </button>

        <button
          onClick={() => {
            setCompareMode((m) => !m);
            clearCompare();
          }}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
            compareMode
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-[#1a1a24] border-[#2a2a3a] text-[#5a5a6e] hover:text-[#f0f0f5]"
          }`}
        >
          <BarChart2 className="w-4 h-4 inline mr-1.5" /> Comparar
        </button>
      </FilterBar>

      {isLoading && <LoadingSpinner text="Agrupando estatísticas por Clã..." />}
      {!isLoading && <SummaryCards cards={summaryCards} columns={5} />}

      {!isLoading && top3.length === 3 && (
        <div>
          <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
            🏆 Pódio de Clãs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((t, i) => (
              <PodiumCard
                key={t.teamName}
                name={t.teamName}
                rank={i}
                stats={[
                  { label: "Kills", value: t.totalKills, color: "text-green-400" },
                  { label: "XTs", value: t.xtreinosPlayed },
                  { label: "Total Pts", value: t.totalPoints },
                ]}
                streak={t.xtreinosPlayed >= 10 ? t.xtreinosPlayed : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && (
        <RankingTable
          isCompact={isCompact}
          teams={finalRanking}
          compareMode={compareMode}
          selectedForCompare={selectedForCompare}
          onToggleCompare={toggleCompare}
          expandedTeam={expandedTeam}
          onToggleExpand={setExpandedTeam}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          getTeamPlayers={getTeamPlayers}
          title={selectedMonth ? `Ranking de Clãs — ${getMonthName(selectedMonth)}` : "Ranking de Clãs — Acumulado Geral"}
          flameThreshold={10}
        />
      )}

      <RankingLegend />

      <ComparisonBar
        players={comparisonTeams.map((t) => ({
          name: t.teamName,
          stats: [
            { label: "Kills", value: t.totalKills, color: "text-green-400" },
            { label: "Total", value: t.totalPoints, color: "text-green-400" },
            { label: "Pos", value: t.totalPosPoints, color: "text-yellow-400" },
          ],
        }))}
        onRemove={toggleCompare}
        onClear={() => clearCompare()}
      />
    </div>
  );
}