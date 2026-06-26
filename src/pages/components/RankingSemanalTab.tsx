// ============================================================
// RankingSemanalTab.tsx
// ============================================================

import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  BarChart2,
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
  type EnrichedTeam,
  type MergedPlayer,
  type SortField,
  getWeekLabel,
  getWeekKey,
  getWeekDates,
  enrichTeam,
  buildTeamRanking,
  groupPlayersByTeam,
  mergePlayersById,
  usePlayersByName,
  useSortState,
  useCompareState,
  useRankingSort,
} from "./xtreino-shared";
import { buildSummaryCards } from "./xtreino-shared-components";
import { RankingTable } from "./RankingTable";
import { RankingLegend } from "./RankingLegend";

export default function RankingSemanalTab() {
  const { sortBy, sortDir, handleSort } = useSortState();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState("");
  const {
    compareMode,
    setCompareMode,
    selected: selectedForCompare,
    toggle: toggleCompare,
    clear: clearCompare,
  } = useCompareState();
  const [search, setSearch] = useState("");

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();

  const isLoading = !allResults || !allPlayerStats;
  const playersByName = usePlayersByName(playersList);

  // Semanas disponíveis
  const availableWeeks = useMemo(() => {
    if (!allResults) return [];
    const weeks = new Set<string>();
    allResults.forEach((r) => {
      if (r.date) weeks.add(getWeekKey(r.date));
    });
    return Array.from(weeks).sort().reverse();
  }, [allResults]);

  // Seleciona a semana mais recente por padrão
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeek) {
      setSelectedWeek(availableWeeks[0]);
    }
  }, [availableWeeks, selectedWeek]);

  // Filtra dados pela semana
  const filteredResults = useMemo(() => {
    if (!selectedWeek || !allResults) return [];
    return allResults.filter((r) => getWeekKey(r.date) === selectedWeek);
  }, [allResults, selectedWeek]);

  const filteredPlayerStats = useMemo(() => {
    if (!selectedWeek || !allPlayerStats) return [];
    return allPlayerStats.filter((s) => getWeekKey(s.date) === selectedWeek);
  }, [allPlayerStats, selectedWeek]);

  // Calcula ranking da semana
  const weekTeamRanking = useMemo(
    () => buildTeamRanking(filteredResults, filteredPlayerStats as any),
    [filteredResults, filteredPlayerStats]
  );

  // Enriquece
  const enrichedRanking = useMemo(
    () => weekTeamRanking.map((t) => enrichTeam(t, "semanal")),
    [weekTeamRanking]
  );

  // Ordena
  const sorted = useRankingSort(enrichedRanking, sortBy, sortDir);

  // Filtra por busca
  const finalRanking = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((t) => t.teamName.toLowerCase().includes(q));
  }, [sorted, search]);

  // Jogadores por time
  const weekTeamPlayers = useMemo(
    () => groupPlayersByTeam(filteredPlayerStats as any),
    [filteredPlayerStats]
  );

  const getTeamPlayers = (teamName: string): MergedPlayer[] => {
    const rawPlayers = weekTeamPlayers.get(teamName.trim().toLowerCase()) ?? [];
    return mergePlayersById(rawPlayers, playersByName);
  };

  // Top 3
  const top3 = useMemo(
    () => (finalRanking.length >= 3 ? finalRanking.slice(0, 3) : []),
    [finalRanking]
  );

  // Comparação
  const comparisonTeams = useMemo(
    () => sorted.filter((t) => selectedForCompare.has(t.teamName)),
    [sorted, selectedForCompare]
  );

  // X-Treinos únicos da semana
  const totalXtreinosUnicos = useMemo(() => {
    const ids = new Set<number>();
    filteredResults.forEach((r) => ids.add(r.xtreinoId));
    return ids.size;
  }, [filteredResults]);

  const weekDates = selectedWeek ? getWeekDates(selectedWeek) : null;

  const clearFilters = () => {
    setSearch("");
    setSelectedWeek(availableWeeks[0] ?? "");
    clearCompare();
  };

  const hasFilters = search.trim().length > 0 || sortBy !== "total" || compareMode;
  const summaryCards = buildSummaryCards(weekTeamRanking, totalXtreinosUnicos);

  return (
    <div className={`space-y-6 ${comparisonTeams.length >= 2 ? "pb-48" : ""}`}>
      {/* Seletor de Semana */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <label className="text-sm font-medium text-[#f0f0f5]">Selecionar Semana:</label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-emerald-500/50 min-w-[220px]"
          >
            {availableWeeks.map((week) => (
              <option key={week} value={week}>{getWeekLabel(week)}</option>
            ))}
          </select>
          {selectedWeek && weekDates && (
            <span className="text-xs text-[#5a5a6e]">
              {weekDates.start} — {weekDates.end} · {filteredResults.length} resultados
            </span>
          )}
        </div>
      </div>

      {/* Filtros */}
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

      {isLoading && <LoadingSpinner text="Carregando ranking semanal..." />}
      {!isLoading && selectedWeek && <SummaryCards cards={summaryCards} columns={5} />}

      {/* Podio */}
      {!isLoading && selectedWeek && top3.length === 3 && (
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
                streak={t.streak >= 2 ? t.streak : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabela */}
      {!isLoading && selectedWeek && (
        <RankingTable
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
          title={`Ranking Semanal — ${getWeekLabel(selectedWeek)}`}
          subtitle={weekDates ? `${weekDates.start} — ${weekDates.end}` : undefined}
          flameThreshold={3}
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