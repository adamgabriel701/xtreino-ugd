// ============================================================
// RankingClasTab.tsx
// ============================================================

import { useState, useMemo } from "react";
import { Link } from "react-router-dom"; // NOVO
import {
  Shield,
  TrendingUp,
  BarChart2,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useXtreinoCalculations, calcKillPoints, calcPosPoints } from "@/hooks/useXtreinoCalculations";

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
  mergePlayersById,
  usePlayersByName,
  useSortState,
  useCompareState,
  useRankingSort,
} from "../../hooks/xtreino-shared";
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
    
    avgPosition: clanSum.avgPosition || 0, 
    consistency: 0,
    streak: 0,
    trend: "same" as const,
    
    sparkline: clanSum.sparklineData || [], 
    xtreinos: [], 
    
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
  const [selectedMonth, setSelectedMonth] = useState<string>(""); 
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

  const { teamPlayersGrouped } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

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

  // NOVO: Mapa para achar o ID real do Clã baseado no nome
  const clanNameToIdMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!clansList) return map;
    clansList.forEach((clan) => {
      map.set(clan.name.trim().toLowerCase(), clan.id);
    });
    return map;
  }, [clansList]);

  const availableMonths = useMemo(() => {
    if (!allResults) return [];
    const months = new Set<string>();
    allResults.forEach((r) => { if (r.date) months.add(r.date.substring(0, 7)); });
    return Array.from(months).sort().reverse();
  }, [allResults]);

  const filteredResults = useMemo(() => {
    if (!selectedMonth || !allResults) return allResults ?? [];
    return allResults.filter((r) => r.date?.startsWith(selectedMonth));
  }, [allResults, selectedMonth]);

  const filteredPlayerStats = useMemo(() => {
    if (!selectedMonth || !allPlayerStats) return allPlayerStats ?? [];
    return allPlayerStats.filter((s) => s.date?.startsWith(selectedMonth));
  }, [allPlayerStats, selectedMonth]);

  // ============================================================
  // LÓGICA DE AGRUPAMENTO POR CLÃ OTIMIZADA (SEM BUG DE SUBSTRING E SEM LENTIDÃO)
  // ============================================================
  const clanRankingRaw = useMemo(() => {
    const resultsToUse = filteredResults;
    const statsToUse = filteredPlayerStats;
    const clanMap = new Map<string, any>();

    // 1. Processa os resultados dos times (Pontos por Posição)
    resultsToUse.forEach((result) => {
      // BUSCA EXATA para evitar duplicidade (ex: "UGD" vs "UGD Threat")
      const teamKey = result.teamName.trim().toLowerCase();
      const clanName = lineToClanMap.get(teamKey) || "Lines Solos/Desconhecidas";

      if (!clanMap.has(clanName)) {
        clanMap.set(clanName, {
          teamName: clanName,
          totalPoints: 0,
          totalPosPoints: 0,
          totalKillPoints: 0,
          totalKills: 0,
          xtreinosPlayed: 0,
          lines: new Set<string>(),
          top1Count: 0,
          top2Count: 0,
          top3Count: 0,
          bestPosition: null,
          sumAllPositions: 0,
          countAllPositions: 0,
          // NOVO: Mapa para gerar o sparkline de forma rápida (O(n))
          pointsByDate: new Map<string, number>(),
        });
      }

      const clan = clanMap.get(clanName);
      
      // Usa a função pura do seu hook para calcular os pontos reais
      const matchPoints = calcPosPoints(result.q1Pos) + calcPosPoints(result.q2Pos) + calcPosPoints(result.q3Pos);
      
      clan.totalPosPoints += matchPoints;
      clan.xtreinosPlayed += 1; 
      clan.lines.add(result.teamName);

      // Acumula pontos por data para o Sparkline
      const dateKey = result.date || "unknown";
      clan.pointsByDate.set(dateKey, (clan.pointsByDate.get(dateKey) || 0) + matchPoints);

      const positions = [result.q1Pos, result.q2Pos, result.q3Pos].filter((p): p is number => p !== null && p !== undefined);
      
      positions.forEach(pos => {
        if (pos === 1) clan.top1Count++;
        if (pos === 2) clan.top2Count++;
        if (pos === 3) clan.top3Count++;
        
        if (clan.bestPosition === null || pos < clan.bestPosition) {
          clan.bestPosition = pos;
        }
        clan.sumAllPositions += pos;
        clan.countAllPositions += 1;
      });
    });

    // 2. Processa as stats dos jogadores (Kills) - BUSCA EXATA
    statsToUse.forEach((stat) => {
      const statTeamKey = stat.teamName.trim().toLowerCase();
      const matchedClanName = lineToClanMap.get(statTeamKey) || "Lines Solos/Desconhecidas";

      // Só soma se o clã já foi inicializado por algum resultado
      if (clanMap.has(matchedClanName)) {
        const clan = clanMap.get(matchedClanName);
        clan.totalKills += stat.totalKills || 0;
      }
    });

    // 3. Finaliza os cálculos (Médias e Sparkline)
    const finalArray = Array.from(clanMap.values());
    finalArray.forEach(c => {
      c.lines = Array.from(c.lines);
      c.totalKillPoints = calcKillPoints(c.totalKills);
      c.totalPoints = c.totalPosPoints + c.totalKillPoints; 
      
      c.avgPosition = c.countAllPositions > 0 
        ? Math.round((c.sumAllPositions / c.countAllPositions) * 10) / 10 
        : 0;

      // GERA O SPARKLINE INSTÂNEO (Sem usar .filter() dentro de um .map())
      // Ordena as datas e pega apenas os valores acumulados
      const dateEntries = Array.from(c.pointsByDate.entries()) as [string, number][];
      c.sparklineData = dateEntries
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, points]) => points);
      
      // Limpa o mapa temporário da memória
      delete c.pointsByDate; 
    });
    
    return finalArray;
  }, [filteredResults, filteredPlayerStats, lineToClanMap]);

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
    filteredResults.forEach((r) => ids.add(r.xtreinoId));
    return ids.size;
  }, [filteredResults]);

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

      {/* PÓDIO ATUALIZADO COM LINKS */}
      {!isLoading && top3.length === 3 && (
        <div>
          <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
            🏆 Pódio de Clãs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((t, i) => {
              const clanId = clanNameToIdMap.get(t.teamName.trim().toLowerCase());
              return (
                <Link 
                  key={t.teamName} 
                  to={clanId ? `/clans/${clanId}` : "#"}
                  className="block"
                >
                  <PodiumCard
                    name={t.teamName}
                    rank={i}
                    stats={[
                      { label: "Kills", value: t.totalKills, color: "text-green-400" },
                      { label: "XTs", value: t.xtreinosPlayed },
                      { label: "Total Pts", value: t.totalPoints },
                    ]}
                    streak={t.xtreinosPlayed >= 10 ? t.xtreinosPlayed : undefined}
                  />
                </Link>
              );
            })}
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
          clanNameToIdMap={clanNameToIdMap} // NOVA PROP PASSADA AQUI
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