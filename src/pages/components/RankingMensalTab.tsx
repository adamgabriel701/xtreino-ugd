// ============================================================
// RankingMensalTab.tsx
// ============================================================

import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  BarChart2,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

import {
  SummaryCards,
  FilterBar,
  SearchInput,
  LoadingSpinner,
  ComparisonBar,
  PodiumCard,
} from "./xtreino";
import {
  type MergedPlayer,
  type SortField,
  getMonthName,
  enrichTeam,
  buildTeamRanking,
  groupPlayersByTeam,
  mergePlayersById,
  calcPointsVsPrevMonth,
  usePlayersByName,
  useSortState,
  useCompareState,
  useRankingSort,
} from "./xtreino-shared";
import { buildSummaryCards } from "./xtreino-shared-components";
import { RankingTable } from "./RankingTable";
import { RankingLegend } from "./RankingLegend";
import { useCompactMode } from "./xtreino-ousado";

export default function RankingMensalTab() {
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
  
  // Ideia #14: Modo Compacto
  const { isCompact, toggle: toggleCompact } = useCompactMode();

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();

  const isLoading = !allResults || !allPlayerStats;
  const playersByName = usePlayersByName(playersList);

  const availableMonths = useMemo(() => {
    if (!allResults) return [];
    const months = new Set<string>();
    allResults.forEach((r) => {
      if (r.date) months.add(r.date.substring(0, 7));
    });
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

  const monthTeamRanking = useMemo(
    () => buildTeamRanking(filteredResults, filteredPlayerStats as any),
    [filteredResults, filteredPlayerStats]
  );

  // --- IDEIA #9: VARIAÇÃO VS MÊS ANTERIOR ---
  const previousMonthStr = useMemo(() => {
    if (!selectedMonth || selectedMonth.length < 7) return "";
    const [year, month] = selectedMonth.split("-").map(Number);
    const d = new Date(year, month - 2, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, [selectedMonth]);

  const prevMonthResults = useMemo(() => {
    if (!previousMonthStr || !allResults) return [];
    return allResults.filter((r) => r.date?.startsWith(previousMonthStr));
  }, [allResults, previousMonthStr]);

  const prevMonthPlayerStats = useMemo(() => {
    if (!previousMonthStr || !allPlayerStats) return [];
    return allPlayerStats.filter((s) => s.date?.startsWith(previousMonthStr));
  }, [allPlayerStats, previousMonthStr]);

  const prevMonthTeamRanking = useMemo(
    () => buildTeamRanking(prevMonthResults, prevMonthPlayerStats as any),
    [prevMonthResults, prevMonthPlayerStats]
  );

  const pointsDeltaMap = useMemo(
    () => calcPointsVsPrevMonth(monthTeamRanking, prevMonthTeamRanking),
    [monthTeamRanking, prevMonthTeamRanking]
  );
  // -----------------------------------------

  const enrichedRanking = useMemo(
    () =>
      monthTeamRanking.map((t) => {
        const delta = pointsDeltaMap.get(t.teamName.trim().toLowerCase()) ?? null;
        return enrichTeam(t, "mensal", delta);
      }),
    [monthTeamRanking, pointsDeltaMap]
  );

  const sorted = useRankingSort(enrichedRanking, sortBy, sortDir);

  const finalRanking = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((t) => t.teamName.toLowerCase().includes(q));
  }, [sorted, search]);

  const monthTeamPlayers = useMemo(
    () => groupPlayersByTeam(filteredPlayerStats as any),
    [filteredPlayerStats]
  );

  const getTeamPlayers = (teamName: string): MergedPlayer[] => {
    const rawPlayers = monthTeamPlayers.get(teamName.trim().toLowerCase()) ?? [];
    return mergePlayersById(rawPlayers, playersByName);
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
    filteredResults.forEach((r) => ids.add(r.xtreinoId));
    return ids.size;
  }, [filteredResults]);

  const clearFilters = () => {
    setSearch("");
    setSelectedMonth(availableMonths[0] ?? "");
    clearCompare();
  };

  const hasFilters = search.trim().length > 0 || sortBy !== "total" || compareMode || isCompact;
  const summaryCards = buildSummaryCards(monthTeamRanking, totalXtreinosUnicos);

  // NOVO: Buscar lista de times para poder gerar os links
  const { data: teamsList } = trpc.teams.list.useQuery();

  // NOVO: Mapa Nome do Time -> ID do Time e ID do Clã
  const teamNameToIdMap = useMemo(() => {
    const map = new Map<string, { teamId: number; clanId: number | null }>();
    if (!teamsList) return map;
    for (const team of teamsList) {
      map.set(team.name.trim().toLowerCase(), { teamId: team.id, clanId: team.clanId ?? null });
    }
    return map;
  }, [teamsList]);

  return (
    <div className={`space-y-6 ${comparisonTeams.length >= 2 ? "pb-48" : ""}`}>
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <label className="text-sm font-medium text-[#f0f0f5]">Selecionar Mes:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-emerald-500/50 min-w-[200px]"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>
          {selectedMonth && (
            <span className="text-xs text-[#5a5a6e]">{filteredResults.length} resultados</span>
          )}
        </div>
      </div>

      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar equipe..."
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

      {isLoading && <LoadingSpinner text="Carregando ranking mensal..." />}
      {!isLoading && selectedMonth && <SummaryCards cards={summaryCards} columns={5} />}

      {!isLoading && selectedMonth && top3.length === 3 && (
        <div>
          <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">🏆 Podio</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((t, i) => (
              <PodiumCard
                key={t.teamName}
                name={t.teamName}
                rank={i}
                stats={[
                  { label: "Kills", value: t.totalKills, color: "text-green-400" },
                  { label: "XTs", value: t.xtreinosPlayed },
                  { label: "Media", value: t.avgPosition },
                ]}
                streak={t.streak >= 5 ? t.streak : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && selectedMonth && (
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
          title={`Ranking Mensal — ${getMonthName(selectedMonth)}`}
          flameThreshold={5}
          teamNameToIdMap={new Map(Array.from(teamNameToIdMap.entries()).map(([k, v]) => [k, v.teamId]))}
          clanNameToIdMap={undefined} // Não precisa de mapa de clãs aqui
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