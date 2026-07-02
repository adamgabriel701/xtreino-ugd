import { useState, useMemo } from "react";
import {
  Target,
  TrendingUp,
  BarChart3,
  Swords,
  Users,
  Award,
  X,
  Flame,
  History,
  BarChart2,
  CheckSquare,
  Square,
  Crown,
  Shield,
  Tag,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  Sparkline,
  BadgeIcon,
  TrendIcon,
  RankBadge,
  SummaryCards,
  SortHeader,
  FilterBar,
  SearchInput,
  SelectFilter,
  EmptyState,
  LoadingSpinner,
  PreviousNicksTooltip,
  PodiumCard,
  ComparisonBar,
} from "../components/xtreino";
import { Link } from "react-router-dom";

// ============================================================
// TIPOS LOCAIS
// ============================================================

interface XtreinoRawStat {
  id: number;
  xtreinoId: number;
  date: string;
  teamName: string;
  playerName: string;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
}

type SortField =
  | "totalKills"
  | "xtreinoKills"
  | "scrimKills"
  | "scrimMvps"
  | "scrimKdRatio"
  | "totalMatches"
  | "participations"
  | "avgKills"
  | "streak"
  | "bestPerformance"
  | "teamContribution";

interface EnrichedPlayer {
  id: number;
  nickname: string;
  teamName: string;
  xtreinoMatches: number;
  xtreinoKills: number;
  scrimMatches: number;
  scrimKills: number;
  scrimMvps: number;
  scrimKdRatio: number;
  totalMatches: number;
  totalKills: number;
  aliases: string[];
  // Campos de Enriquecimento (XT)
  sparkline: number[];
  streak: number;
  badges: string[];
  avgPerQuarter: { q1: number; q2: number; q3: number };
  bestPerformance: number;
  teamContribution: number;
  trend: "up" | "down" | "same";
  isNewbie: boolean;
}

// ============================================================
// FUNCOES DE CALCULO PURAS (XT Enriquecimento)
// ============================================================

function calcPlayerSparkline(rawStats: XtreinoRawStat[], playerName: string): number[] {
  const playerStats = rawStats
    .filter((s) => s.playerName === playerName)
    .sort((a, b) => a.date.localeCompare(b.date));
  const dateMap = new Map<string, number>();
  playerStats.forEach((s) => {
    dateMap.set(s.date, (dateMap.get(s.date) || 0) + s.totalKills);
  });
  const dates = Array.from(dateMap.keys()).sort();
  return dates.map((d) => dateMap.get(d) || 0);
}

function calcPlayerStreak(rawStats: XtreinoRawStat[], playerName: string): number {
  const allDates = [...new Set(rawStats.map((s) => s.date))].sort();
  const playerDates = new Set(
    rawStats.filter((s) => s.playerName === playerName).map((s) => s.date)
  );
  let streak = 0;
  for (let i = allDates.length - 1; i >= 0; i--) {
    if (playerDates.has(allDates[i])) streak++;
    else break;
  }
  return streak;
}

function calcPlayerBadges(player: EnrichedPlayer): string[] {
  const badges: string[] = [];
  if (player.totalKills >= 100) badges.push("100 Kills");
  if (player.totalKills >= 300) badges.push("300 Kills");
  if (player.totalKills >= 500) badges.push("500 Kills");
  if (player.xtreinoMatches >= 5) badges.push("5 XTs");
  if (player.xtreinoMatches >= 10) badges.push("10 XTs");
  if (player.xtreinoMatches >= 20) badges.push("20 XTs");
  if (player.scrimMatches >= 5) badges.push("5 Scrims");
  if (player.scrimMatches >= 10) badges.push("10 Scrims");
  if (player.scrimMvps >= 5) badges.push("5 MVPs");
  if (player.avgPerQuarter.q1 >= 8) badges.push("Q1 Master");
  if (player.avgPerQuarter.q2 >= 8) badges.push("Q2 Master");
  if (player.avgPerQuarter.q3 >= 8) badges.push("Q3 Master");
  if (player.xtreinoMatches > 0 && (player.xtreinoKills / player.xtreinoMatches) >= 8) badges.push("Sniper");
  if (player.xtreinoMatches > 0 && (player.xtreinoKills / player.xtreinoMatches) >= 12) badges.push("Elite");
  return badges;
}

function calcAvgPerQuarter(rawStats: XtreinoRawStat[], playerName: string, participations: number) {
  const stats = rawStats.filter((s) => s.playerName === playerName);
  const totalQ1 = stats.reduce((sum, s) => sum + s.q1Kills, 0);
  const totalQ2 = stats.reduce((sum, s) => sum + s.q2Kills, 0);
  const totalQ3 = stats.reduce((sum, s) => sum + s.q3Kills, 0);
  return {
    q1: participations > 0 ? Math.round((totalQ1 / participations) * 10) / 10 : 0,
    q2: participations > 0 ? Math.round((totalQ2 / participations) * 10) / 10 : 0,
    q3: participations > 0 ? Math.round((totalQ3 / participations) * 10) / 10 : 0,
  };
}

function calcBestPerformance(rawStats: XtreinoRawStat[], playerName: string): number {
  const stats = rawStats.filter((s) => s.playerName === playerName);
  if (!stats.length) return 0;
  return Math.max(...stats.map((s) => s.totalKills));
}

function calcTeamContribution(
  rawStats: XtreinoRawStat[],
  playerName: string,
  teamName: string
): number {
  if (!teamName || teamName === "Sem Time") return 0;
  const playerStats = rawStats.filter((s) => s.playerName === playerName);
  const playerDates = new Set(playerStats.map((s) => s.date));
  const teamStats = rawStats.filter(
    (s) => s.teamName === teamName && playerDates.has(s.date)
  );
  const playerKills = playerStats.reduce((sum, s) => sum + s.totalKills, 0);
  const teamKills = teamStats.reduce((sum, s) => sum + s.totalKills, 0);
  return teamKills > 0 ? Math.round((playerKills / teamKills) * 1000) / 10 : 0;
}

function calcTrend(rawStats: XtreinoRawStat[], playerName: string): "up" | "down" | "same" {
  const allDates = [...new Set(rawStats.map((s) => s.date))].sort();
  if (allDates.length < 2) return "same";
  const lastDate = allDates[allDates.length - 1];
  const prevDate = allDates[allDates.length - 2];

  const lastStats = rawStats.filter((s) => s.date === lastDate);
  const prevStats = rawStats.filter((s) => s.date === prevDate);

  const lastRank = [...lastStats].sort((a, b) => b.totalKills - a.totalKills).findIndex((s) => s.playerName === playerName);
  const prevRank = [...prevStats].sort((a, b) => b.totalKills - a.totalKills).findIndex((s) => s.playerName === playerName);

  if (lastRank === -1 || prevRank === -1) return "same";
  if (lastRank < prevRank) return "up";
  if (lastRank > prevRank) return "down";
  return "same";
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function JogadoresTab() {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("totalKills");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<number>>(new Set());
  const [modalPlayer, setModalPlayer] = useState<EnrichedPlayer | null>(null);
  
  // NOVO ESTADO: Filtro de X-Treino específico
  const [selectedXtreino, setSelectedXtreino] = useState<number | null>(null);

  // CORREÇÃO: Rota exata baseada no seu router (listagem principal, não a de schedule)
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery();

  // Queries Unificadas
  const { data: playersList, isLoading } = trpc.unified.listPlayers.useQuery({
    search: search || undefined,
  });

  // Query antiga apenas para calcular métricas avançadas do XT
  const { data: rawXtreinoStatsData } = trpc.players.rankingStats.useQuery();
  const rawXtStats = (rawXtreinoStatsData ?? []) as XtreinoRawStat[];

  // NOVO FILTRO: Filtra os dados brutos antes de enriquecer
  const filteredRawXtStats = useMemo(() => {
    if (!rawXtStats) return [];
    if (!selectedXtreino) return rawXtStats;
    return rawXtStats.filter((s) => s.xtreinoId === selectedXtreino);
  }, [rawXtStats, selectedXtreino]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedTeam(null);
    setSelectedXtreino(null); // LIMPA O NOVO FILTRO
    setSelectedForCompare(new Set());
    setCompareMode(false);
  };

  const hasFilters = !!search || !!selectedTeam || !!selectedXtreino || compareMode;

  // Filtra por time no frontend
  const filteredPlayers = useMemo(() => {
    if (!playersList) return [];
    if (!selectedTeam) return playersList;
    return playersList.filter((p) => p.teamName === selectedTeam);
  }, [playersList, selectedTeam]);

  const allTeams = useMemo(() => {
    if (!playersList) return [];
    return [...new Set(playersList.map((p) => p.teamName).filter(Boolean))].sort();
  }, [playersList]);

  // Enriquecimento com dados do XT antigo
  const enrichedPlayers: EnrichedPlayer[] = useMemo(() => {
    return (filteredPlayers ?? []).map((p) => {
      const aliases = Array.isArray(p.aliases) ? p.aliases : [];
      
      const nicksToSearch = [p.nickname, ...aliases];

      const sparkline = calcPlayerSparkline(filteredRawXtStats, p.nickname);
      const streak = calcPlayerStreak(filteredRawXtStats, p.nickname);
      const avgPerQuarter = calcAvgPerQuarter(filteredRawXtStats, p.nickname, p.xtreinoMatches);
      const bestPerformance = calcBestPerformance(filteredRawXtStats, p.nickname);
      const teamContribution = calcTeamContribution(filteredRawXtStats, p.nickname, p.teamName);
      const trend = calcTrend(filteredRawXtStats, p.nickname);

      const basePlayer: EnrichedPlayer = {
        id: p.id,
        nickname: p.nickname,
        teamName: p.teamName,
        xtreinoMatches: p.xtreinoMatches,
        xtreinoKills: p.xtreinoKills,
        scrimMatches: p.scrimMatches,
        scrimKills: p.scrimKills,
        scrimMvps: p.scrimMvps,
        scrimKdRatio: p.scrimKdRatio,
        totalMatches: p.totalMatches,
        totalKills: p.totalKills,
        aliases,
        sparkline,
        streak,
        badges: [],
        avgPerQuarter,
        bestPerformance,
        teamContribution,
        trend,
        isNewbie: p.xtreinoMatches < 3,
      };

      basePlayer.badges = calcPlayerBadges(basePlayer);
      return basePlayer;
    });
  }, [filteredPlayers, filteredRawXtStats]);

  // Ordenação final no frontend
  const sortedPlayers = useMemo(() => {
    return [...enrichedPlayers].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortField] ?? 0;
      const bVal = (b as unknown as Record<string, unknown>)[sortField] ?? 0;
      const aNum = typeof aVal === 'number' ? aVal : 0;
      const bNum = typeof bVal === 'number' ? bVal : 0;
      return sortDir === "desc" ? bNum - aNum : aNum - bNum;
    });
  }, [enrichedPlayers, sortField, sortDir]);

  const top3 = useMemo(() => sortedPlayers.slice(0, 3), [sortedPlayers]);

  const comparisonPlayers = useMemo(() => {
    return sortedPlayers.filter((p) => selectedForCompare.has(p.id));
  }, [sortedPlayers, selectedForCompare]);

  // Cards de resumo
  const summaryCards = [
    { icon: <Users className="w-4 h-4 text-green-400" />, label: "Jogadores", value: sortedPlayers.length },
    { icon: <Swords className="w-4 h-4 text-green-400" />, label: "Total Kills", value: sortedPlayers.reduce((s, p) => s + (p.totalKills || 0), 0), valueColor: "text-green-400" },
    { icon: <Target className="w-4 h-4 text-blue-400" />, label: "Kills XT", value: sortedPlayers.reduce((s, p) => s + (p.xtreinoKills || 0), 0) },
    { icon: <Swords className="w-4 h-4 text-red-400" />, label: "Kills Scrim", value: sortedPlayers.reduce((s, p) => s + (p.scrimKills || 0), 0) },
  ];

  const toggleCompare = (id: number) => {
    setSelectedForCompare((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  };

  const avgXT = (p: EnrichedPlayer) => p.xtreinoMatches > 0 ? Math.round((p.xtreinoKills / p.xtreinoMatches) * 10) / 10 : 0;

  if (isLoading) return <LoadingSpinner text="Carregando ranking unificado..." />;

  return (
    <div className={`space-y-6 ${comparisonPlayers.length >= 2 ? "pb-48" : ""}`}>
      {/* Filtros */}
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar jogador, time ou nick antigo..."
          minWidth="260px"
        />

        <SelectFilter
          icon={<Shield className="w-4 h-4 text-[#5a5a6e]" />}
          value={selectedTeam ?? ""}
          onChange={(v) => setSelectedTeam(v || null)}
          placeholder="Todos os times"
          options={allTeams.map((team) => ({ value: team, label: team }))}
          minWidth="160px"
        />

        {/* NOVO SELECT FILTER: Escolher X-Treino Específico */}
        <SelectFilter
          icon={<History className="w-4 h-4 text-[#5a5a6e]" />}
          value={selectedXtreino?.toString() ?? ""}
          onChange={(v) => setSelectedXtreino(v ? Number(v) : null)}
          placeholder="Todos os X-Treinos"
          options={(xtreinosList ?? []).map((xt) => ({ 
            value: xt.id.toString(), 
            // CORREÇÃO: O campo no seu DB se chama 'date' e possui 'name'
            label: `${xt.name || "XT"} #${xt.id} - ${xt.date || "Sem data"}` 
          }))}
          minWidth="240px"
        />

        <button
          onClick={() => {
            setCompareMode((m) => !m);
            setSelectedForCompare(new Set());
          }}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
            compareMode
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-[#1a1a24] border-[#2a2a3a] text-[#5a5a6e] hover:text-[#f0f0f5]"
          }`}
        >
          <BarChart2 className="w-4 h-4 inline mr-1.5" />
          Comparar
        </button>
      </FilterBar>

      {/* Cards de Resumo */}
      {summaryCards.length > 0 && (
        <SummaryCards cards={summaryCards} columns={4} />
      )}

      {/* Podio Top 3 */}
      {top3.length === 3 && (
        <div>
          <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" /> Podio Geral
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((p, i) => (
              <Link key={p.id} to={`/jogador/${p.id}`} className="block">
                <PodiumCard
                  name={p.nickname}
                  subtitle={p.teamName}
                  rank={i}
                  stats={[
                    { label: "Kills", value: p.totalKills, color: "text-green-400" },
                    { label: "XTs", value: p.xtreinoMatches },
                    { label: "Media", value: avgXT(p) },
                  ]}
                  streak={p.streak >= 3 ? p.streak : undefined}
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tabela Principal */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Ranking Unificado de Jogadores
          </h3>
          <div className="flex items-center gap-3">
            {compareMode && (
              <span className="text-xs text-green-400">
                {selectedForCompare.size}/4 selecionados
              </span>
            )}
            <span className="text-xs text-[#5a5a6e]">
              {sortedPlayers.length} jogadores
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                {compareMode && (
                  <th className="px-3 py-3 text-center w-10">
                    <span className="text-xs font-medium text-[#5a5a6e]">#</span>
                  </th>
                )}
                <th className="px-4 py-3 text-center w-12">
                  <span className="text-xs font-medium text-[#5a5a6e] uppercase">#</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                  Jogador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                  Time
                </th>
                
                {/* Stats XT */}
                <th className="px-4 py-3 text-center">
                  <SortHeader field="xtreinoKills" label="Kills XT" currentField={sortField} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-center">
                  <SortHeader field="participations" label="XTs" currentField={sortField} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-center">
                  <SortHeader field="avgKills" label="Media" currentField={sortField} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-center">
                  <SortHeader field="streak" label="Streak" currentField={sortField} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-center">
                  <span className="text-xs font-medium text-[#5a5a6e] uppercase">Q1</span>
                </th>
                <th className="px-4 py-3 text-center">
                  <span className="text-xs font-medium text-[#5a5a6e] uppercase">Q2</span>
                </th>
                <th className="px-4 py-3 text-center">
                  <span className="text-xs font-medium text-[#5a5a6e] uppercase">Q3</span>
                </th>
                <th className="px-4 py-3 text-center">
                  <SortHeader field="bestPerformance" label="Recorde" currentField={sortField} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-center">
                  <SortHeader field="teamContribution" label="Time %" currentField={sortField} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-center">
                  <span className="text-xs font-medium text-[#5a5a6e] uppercase">Evol.</span>
                </th>

                {/* Stats Scrim */}
                <th className="px-4 py-3 text-center">
                  <SortHeader field="scrimKills" label="Kills Scrim" currentField={sortField} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-center">
                  <SortHeader field="scrimMvps" label="MVPs" currentField={sortField} direction={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-center">
                  <SortHeader field="scrimKdRatio" label="K/D Scrim" currentField={sortField} direction={sortDir} onSort={handleSort} />
                </th>

                {/* Total */}
                <th className="px-6 py-3 text-center bg-green-500/5">
                  <SortHeader field="totalKills" label="Total Geral" currentField={sortField} direction={sortDir} onSort={handleSort} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {sortedPlayers.map((p, index) => {
                const isTop3 = index < 3;
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-[#1a1a24] transition-colors group ${
                      isTop3
                        ? index === 0
                          ? "bg-gradient-to-r from-yellow-500/5 to-transparent border-l-2 border-yellow-400"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-400/5 to-transparent border-l-2 border-gray-300"
                          : "bg-gradient-to-r from-amber-700/5 to-transparent border-l-2 border-amber-600"
                        : ""
                    }`}
                  >
                    {compareMode && (
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => toggleCompare(p.id)}
                          className="text-[#5a5a6e] hover:text-green-400 transition-colors"
                        >
                          {selectedForCompare.has(p.id) ? (
                            <CheckSquare className="w-4 h-4 text-green-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <RankBadge index={index} />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/jogador/${p.id}`} className="flex items-center gap-3 text-left w-full group/player">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center group-hover/player:bg-green-500/20 transition-colors">
                            <Target className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#f0f0f5] group-hover/player:text-green-400 transition-colors">
                                {p.nickname}
                              </span>
                              {p.aliases.length > 0 && <PreviousNicksTooltip nicks={p.aliases} />}
                              {p.isNewbie && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-medium text-blue-400">
                                  NOVATO
                                </span>
                              )}
                            </div>
                            {p.badges.length > 0 && (
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {p.badges.slice(0, 3).map((badge) => (
                                  <span key={badge} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[10px] text-[#8a8a9e]">
                                    <BadgeIcon badge={badge} />
                                    {badge}
                                  </span>
                                ))}
                                {p.badges.length > 3 && (
                                  <span className="text-[10px] text-[#5a5a6e]">+{p.badges.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </Link>
                        <button onClick={() => setModalPlayer(p)} className="p-1.5 rounded-lg hover:bg-[#2a2a3a] text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors" title="Ver detalhes rápidos">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.teamName}</td>
                    
                    {/* XT Stats */}
                    <td className="px-4 py-3 text-center text-sm text-blue-400/80">{p.xtreinoKills}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">{p.xtreinoMatches}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">{avgXT(p)}</td>
                    <td className="px-4 py-3 text-center">
                      {p.streak >= 3 ? (
                        <span className="inline-flex items-center gap-1 text-sm text-orange-400">
                          <Flame className="w-3.5 h-3.5" />
                          {p.streak}
                        </span>
                      ) : (
                        <span className="text-sm text-[#8a8a6e]">{p.streak}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-red-400/80">{p.avgPerQuarter.q1}</td>
                    <td className="px-4 py-3 text-center text-sm text-orange-400/80">{p.avgPerQuarter.q2}</td>
                    <td className="px-4 py-3 text-center text-sm text-purple-400/80">{p.avgPerQuarter.q3}</td>
                    <td className="px-4 py-3 text-center text-sm text-yellow-400/80">{p.bestPerformance || "—"}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">
                      {p.teamContribution > 0 ? `${p.teamContribution}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Sparkline data={p.sparkline} />
                        <TrendIcon trend={p.trend} />
                      </div>
                    </td>

                    {/* Scrim Stats */}
                    <td className="px-4 py-3 text-center text-sm text-red-400/80">{p.scrimKills}</td>
                    <td className="px-4 py-3 text-center text-sm text-yellow-400/80">{p.scrimMvps > 0 ? p.scrimMvps : "—"}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">{p.scrimKdRatio > 0 ? p.scrimKdRatio : "—"}</td>

                    {/* Total */}
                    <td className="px-6 py-3 text-center bg-green-500/5">
                      <span className="text-sm font-bold text-green-400">{p.totalKills}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sortedPlayers.length === 0 && (
          <EmptyState
            icon={<Target className="w-12 h-12" />}
            title="Nenhum jogador encontrado"
            subtitle="Tente ajustar os filtros"
          />
        )}
      </div>

      {/* Modal de Detalhes Rápidos */}
      {modalPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalPlayer(null)} />
          <div className="relative bg-[#12121a] rounded-2xl border border-[#2a2a3a] w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#12121a]/95 backdrop-blur border-b border-[#2a2a3a] px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#f0f0f5]">{modalPlayer.nickname}</h2>
                  <p className="text-sm text-[#5a5a6e]">{modalPlayer.teamName}</p>
                </div>
              </div>
              <button onClick={() => setModalPlayer(null)} className="p-2 rounded-lg hover:bg-[#2a2a3a] transition-colors">
                <X className="w-5 h-5 text-[#5a5a6e]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {modalPlayer.aliases.length > 0 && (
                <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-[#5a5a6e]" />
                    <h3 className="text-sm font-medium text-[#8a8a9e]">Nicks anteriores</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {modalPlayer.aliases.map((nick) => (
                      <span key={nick} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a0a0f] border border-[#2a2a3a] text-xs text-[#8a8a9e]">
                        <History className="w-3 h-3 text-[#5a5a6e]" />{nick}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a]">
                  <p className="text-xs text-[#5a5a6e] uppercase mb-1">Total Kills</p>
                  <p className="text-xl font-bold text-green-400">{modalPlayer.totalKills}</p>
                </div>
                <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a]">
                  <p className="text-xs text-[#5a5a6e] uppercase mb-1">XTs</p>
                  <p className="text-xl font-bold text-[#f0f0f5]">{modalPlayer.xtreinoMatches}</p>
                </div>
                <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a]">
                  <p className="text-xs text-[#5a5a6e] uppercase mb-1">Media XT</p>
                  <p className="text-xl font-bold text-[#f0f0f5]">{avgXT(modalPlayer)}</p>
                </div>
                <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a]">
                  <p className="text-xs text-[#5a5a6e] uppercase mb-1">Recorde</p>
                  <p className="text-xl font-bold text-yellow-400">{modalPlayer.bestPerformance}</p>
                </div>
              </div>

              {modalPlayer.badges.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Conquistas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {modalPlayer.badges.map((badge) => (
                      <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a24] border border-[#2a2a3a] text-xs font-medium text-[#f0f0f5]">
                        <BadgeIcon badge={badge} /> {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Media por Quarto
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
                    <p className="text-xs text-[#5a5a6e] mb-1">Q1</p>
                    <p className="text-lg font-bold text-red-400">{modalPlayer.avgPerQuarter.q1}</p>
                  </div>
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
                    <p className="text-xs text-[#5a5a6e] mb-1">Q2</p>
                    <p className="text-lg font-bold text-orange-400">{modalPlayer.avgPerQuarter.q2}</p>
                  </div>
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
                    <p className="text-xs text-[#5a5a6e] mb-1">Q3</p>
                    <p className="text-lg font-bold text-purple-400">{modalPlayer.avgPerQuarter.q3}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Evolucao
                </h3>
                <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
                  <Sparkline data={modalPlayer.sparkline} width={600} height={80} color="#4ade80" />
                  <div className="flex justify-between mt-2 text-xs text-[#5a5a6e]">
                    <span>Inicio</span><span>Atual</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to={`/jogador/${modalPlayer.id}`}
                  className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/20 transition-colors"
                >
                  Ver Perfil Completo
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Comparacao Fixa */}
      <ComparisonBar
        players={comparisonPlayers.map((p) => ({
          name: p.nickname,
          stats: [
            { label: "Kills", value: p.totalKills, color: "text-green-400" },
            { label: "Media", value: avgXT(p) },
            { label: "XTs", value: p.xtreinoMatches },
            { label: "Recorde", value: p.bestPerformance, color: "text-yellow-400" },
          ],
        }))}
        onRemove={(name) => {
          const player = comparisonPlayers.find((p) => p.nickname === name);
          if (player) toggleCompare(player.id);
        }}
        onClear={() => setSelectedForCompare(new Set())}
      />
    </div>
  );
}