// hooks/useXtreinoTabs.ts
import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { calcPlayerAccumulatedStats, type XtreinoPlayerStat } from "./useXtreinoCalculations";
import { buildDuelData, TEAM_COLORS } from "@/utils/xtreino";
import { getMonthName, enrichTeam, buildTeamRanking } from "@/hooks/xtreino-shared";
import type { PlayerFullStats, ChartDataPoint, H2HMode } from "@/types/xtreinos";
import type { EnrichedTeam } from "@/hooks/xtreino-shared"; // <-- Importa do lugar certo

// --- HOOK DO DUOLO ---
export function useDueloTab() {
  const [selectedXtId, setSelectedXtId] = useState<string>("");
  const [teamAName, setTeamAName] = useState<string>("");
  const [teamBName, setTeamBName] = useState<string>("");

  const { data: xtreinosList } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();

  const isLoading = !xtreinosList || !allPlayerStats;

  const xtOptions = useMemo(() => {
    if (!xtreinosList) return [];
    const uniqueXts = new Map<string, string>();
    xtreinosList.forEach((xt) => {
      if (!uniqueXts.has(xt.xtreinoId.toString())) {
        uniqueXts.set(xt.xtreinoId.toString(), xt.date);
      }
    });
    return Array.from(uniqueXts.entries())
      .map(([id, date]) => ({
        value: id,
        label: `XT #${id} — ${date.split("-")[2]}/${date.split("-")[1]}`,
      }))
      .sort((a, b) => b.value.localeCompare(a.value));
  }, [xtreinosList]);

  const xtResults = useMemo(() => {
    if (!selectedXtId || !xtreinosList) return [];
    return xtreinosList.filter((r) => r.xtreinoId === parseInt(selectedXtId));
  }, [xtreinosList, selectedXtId]);

  const xtPlayerStats = useMemo(() => {
    if (!selectedXtId || !allPlayerStats) return [];
    const xtDates = new Set(xtResults.map((r) => r.date));
    return allPlayerStats.filter((s) => xtDates.has(s.date));
  }, [allPlayerStats, xtResults, selectedXtId]);

  const availableTeams = useMemo(() => {
    return [...new Set(xtResults.map((r) => r.teamName))].sort();
  }, [xtResults]);

  const teamAData = useMemo(() => {
    if (!teamAName || xtResults.length === 0) return null;
    return buildDuelData(teamAName, xtResults, xtPlayerStats);
  }, [teamAName, xtResults, xtPlayerStats]);

  const teamBData = useMemo(() => {
    if (!teamBName || xtResults.length === 0) return null;
    return buildDuelData(teamBName, xtResults, xtPlayerStats);
  }, [teamBName, xtResults, xtPlayerStats]);

  const handleClear = () => {
    setSelectedXtId("");
    setTeamAName("");
    setTeamBName("");
  };

  const handleXtChange = (v: string) => {
    setSelectedXtId(v);
    setTeamAName("");
    setTeamBName("");
  };

  return {
    isLoading,
    selectedXtId,
    teamAName,
    teamBName,
    xtOptions,
    availableTeams,
    teamAData,
    teamBData,
    setTeamAName,
    setTeamBName,
    handleXtChange,
    handleClear,
    hasFilters: selectedXtId !== "" || teamAName !== "" || teamBName !== "",
  };
}

// --- HOOK DA EVOLUÇÃO ---
export function useEvolucaoTab() {
  const [search, setSearch] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [hiddenTeams, setHiddenTeams] = useState<Set<string>>(new Set());

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();

  const isLoading = !allResults || !allPlayerStats;

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

  const allTeams = useMemo(() => {
    const teamsSet = new Set<string>();
    rankingByMonth.forEach((ranking) => ranking.forEach((t) => teamsSet.add(t.teamName)));
    return Array.from(teamsSet).sort();
  }, [rankingByMonth]);

  const filteredTeams = useMemo(() => {
    if (!search.trim()) return allTeams;
    return allTeams.filter((t) => t.toLowerCase().includes(search.toLowerCase()));
  }, [allTeams, search]);

  const chartData = useMemo((): { points: ChartDataPoint[]; labels: string[] } => {
    if (selectedTeams.size === 0 || months.length === 0) return { points: [], labels: [] };
    const labels = months.map((m) => getMonthName(m));
    const points: ChartDataPoint[] = [];
    selectedTeams.forEach((teamName) => {
      months.forEach((month) => {
        const monthRanking = rankingByMonth.get(month) ?? [];
        const teamData = monthRanking.find((t) => t.teamName === teamName);
        points.push({ month, label: teamName, value: teamData?.totalPoints ?? 0 });
      });
    });
    return { points, labels };
  }, [selectedTeams, months, rankingByMonth]);

  const toggleTeam = (team: string) => {
    setSelectedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(team)) {
        next.delete(team);
        setHiddenTeams((h) => { const nh = new Set(h); nh.delete(team); return nh; });
      } else if (next.size < 5) {
        next.add(team);
      }
      return next;
    });
  };

  const handleToggleVisibility = (team: string) => {
    setHiddenTeams((prev) => {
      const next = new Set(prev);
      if (next.has(team)) next.delete(team); else next.add(team);
      return next;
    });
  };

  const clearFilters = () => { setSearch(""); setSelectedTeams(new Set()); setHiddenTeams(new Set()); };

  return {
    isLoading, search, setSearch, selectedTeams, hiddenTeams, filteredTeams, chartData, allTeams,
    toggleTeam, handleToggleVisibility, clearFilters,
    hasFilters: search.trim().length > 0 || selectedTeams.size > 0,
    teamColors: TEAM_COLORS,
  };
}

// --- HOOK DO HEAD TO HEAD ---
export function useHeadToHeadTab() {
  const [mode, setMode] = useState<H2HMode>("xtreino");
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [playerAName, setPlayerAName] = useState("");
  const [playerBName, setPlayerBName] = useState("");

  const { data: rawStatsData } = trpc.players.rankingStats.useQuery();
  const { data: scrimH2H, isLoading: isLoadingScrim } = trpc.scrims.getHeadToHead.useQuery(
    { team1Name: playerAName, team2Name: playerBName },
    { enabled: mode === "scrim" && !!playerAName && !!playerBName }
  );

  const rawStats = (rawStatsData ?? []) as XtreinoPlayerStat[];
  const isLoadingXT = !rawStatsData;
  const isLoading = mode === "xtreino" ? isLoadingXT : isLoadingScrim;

  const playerNames = useMemo(() => [...new Set(rawStats.map((s) => s.playerName))].sort(), [rawStats]);
  
  const filteredA = useMemo(() => playerNames.filter((n) => n.toLowerCase().includes(searchA.toLowerCase())), [playerNames, searchA]);
  const filteredB = useMemo(() => playerNames.filter((n) => n.toLowerCase().includes(searchB.toLowerCase()) && n !== playerAName), [playerNames, searchB, playerAName]);

  const accumulated = useMemo(() => calcPlayerAccumulatedStats(rawStats), [rawStats]);

  const getPlayerStats = (name: string): PlayerFullStats | null => {
    if (!name) return null;
    const base = accumulated.find((p) => p.playerName === name);
    if (!base) return null;
    const playerRawStats = rawStats.filter((s) => s.playerName === name);
    const sparkline = playerRawStats.sort((a, b) => a.date.localeCompare(b.date)).map((s) => s.totalKills);
    const badges: string[] = [];
    if (base.totalKills >= 100) badges.push("100 Kills");
    if (base.totalKills >= 300) badges.push("300 Kills");
    if (base.participations >= 10) badges.push("10 XTs");
    if (base.avgKills >= 8) badges.push("Sniper");
    if (base.avgKills >= 12) badges.push("Elite");

    return {
      playerName: base.playerName, teamName: base.teamName, totalKills: base.totalKills,
      totalQ1Kills: base.totalQ1Kills, totalQ2Kills: base.totalQ2Kills, totalQ3Kills: base.totalQ3Kills,
      participations: base.participations, avgKills: base.avgKills, bestPerformance: Math.max(...playerRawStats.map((s) => s.totalKills), 0),
      badges, sparkline,
      avgPerQuarter: {
        q1: base.participations > 0 ? Math.round((base.totalQ1Kills / base.participations) * 10) / 10 : 0,
        q2: base.participations > 0 ? Math.round((base.totalQ2Kills / base.participations) * 10) / 10 : 0,
        q3: base.participations > 0 ? Math.round((base.totalQ3Kills / base.participations) * 10) / 10 : 0,
      },
    };
  };

  const scrimStats = useMemo(() => {
    if (!scrimH2H || scrimH2H.length === 0) return null;
    let winsA = 0, winsB = 0, totalRoundsA = 0, totalRoundsB = 0;
    scrimH2H.forEach((match: any) => {
      const resA = match.results?.find((r: any) => r.teamName === playerAName);
      const resB = match.results?.find((r: any) => r.teamName === playerBName);
      const scoreA = resA?.rounds?.reduce((sum: number, r: any) => sum + (r.value || 0), 0) || 0;
      const scoreB = resB?.rounds?.reduce((sum: number, r: any) => sum + (r.value || 0), 0) || 0;
      if (scoreA > scoreB) winsA++; else if (scoreB > scoreA) winsB++;
      totalRoundsA += scoreA; totalRoundsB += scoreB;
    });
    return { winsA, winsB, totalRoundsA, totalRoundsB, matches: scrimH2H.length };
  }, [scrimH2H, playerAName, playerBName]);

  const handleClear = () => { setSearchA(""); setSearchB(""); setPlayerAName(""); setPlayerBName(""); };
  
  const selectPlayerA = (name: string) => { setPlayerAName(name); setSearchA(name); };
  const selectPlayerB = (name: string) => { setPlayerBName(name); setSearchB(name); };

  return {
    isLoading, mode, setMode, searchA, setSearchA, searchB, setSearchB,
    playerAName, playerBName, filteredA, filteredB,
    playerA: getPlayerStats(playerAName), playerB: getPlayerStats(playerBName),
    scrimStats, selectPlayerA, selectPlayerB, handleClear,
    hasFilters: playerAName !== "" || playerBName !== "",
  };
}