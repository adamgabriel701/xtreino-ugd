import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { useXtreinoCalculations } from "@/hooks/useXtreinoCalculations";

// ============================================================================
// TIPOS EXPORTADOS
// ============================================================================

export interface ExperienceStats {
  totalXtreinos: number;
  totalChampionships: number;
  totalScrims: number;
  totalTeams: number;
  totalPlayers: number;
  totalKills: number;
  totalPoints: number;
  totalMatches: number;
  avgKillsPerMatch: number;
  avgPointsPerTeam: number;
}

export interface TopPlayer {
  id: string;
  name: string;
  teamName: string | null;
  kills: number;
  participations: number;
  avgKills: number;
  rank: number;
}

export interface TopTeam {
  id: string;
  name: string;
  points: number;
  kills: number;
  wins: number;
  top3Count: number;
  xtreinosPlayed: number;
  bestPosition: number | null;
  avgPoints: number;
  rank: number;
}

export interface RecentActivity {
  id: number;
  type: "xtreino" | "championship" | "scrim" | "ranking";
  title: string;
  description: string;
  date: string;
  highlight?: string;
}

export interface ExperienceData {
  orgName: string;
  isLoading: boolean;
  stats: ExperienceStats;
  topPlayers: TopPlayer[];
  topTeams: TopTeam[];
  recentActivities: RecentActivity[];
  periodSummary: {
    totalKills: number;
    totalPosPoints: number;
    totalKillPoints: number;
    totalPoints: number;
    uniqueTeams: number;
    uniquePlayers: number;
    uniqueDates: number;
  } | null;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useExperienceData(): ExperienceData {
  // Dados brutos via tRPC (mesmos endpoints da Home)
  const { data: allXtreinos } = trpc.xtreinos.list.useQuery(undefined);
  const { data: allChampionships } = trpc.championships.list.useQuery(undefined);
  const { data: allScrims } = trpc.scrims.list.useQuery(undefined);
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: scrimTeamAllTime } = trpc.scrims.teamResultsAllTimeBR.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  // Hook de cálculos existente
  const calculations = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

  const {
    teamRanking,
    teamPlayersGrouped,
    playerAccumulated,
    periodSummary,
  } = calculations;

  // ============================================================================
  // STATS GERAIS
  // ============================================================================

  const stats = useMemo<ExperienceStats>(() => {
    const totalXtreinos = allXtreinos?.length ?? 0;
    const totalChampionships = allChampionships?.length ?? 0;
    const totalScrims = allScrims?.length ?? 0;
    const totalTeams = teamsList?.length ?? 0;
    const totalPlayers = playersList?.length ?? 0;

    // Soma de kills e pontos do ranking de times
    const totalKills = teamRanking?.reduce((acc, t) => acc + t.totalKills, 0) ?? 0;
    const totalPoints = teamRanking?.reduce((acc, t) => acc + t.totalPoints, 0) ?? 0;

    // Total de "partidas" = xtreinos + scrims + campeonatos
    const totalMatches = totalXtreinos + totalScrims + totalChampionships;

    // Médias
    const avgKillsPerMatch = totalMatches > 0 ? Math.round((totalKills / totalMatches) * 10) / 10 : 0;
    const avgPointsPerTeam = totalTeams > 0 ? Math.round((totalPoints / totalTeams) * 10) / 10 : 0;

    return {
      totalXtreinos,
      totalChampionships,
      totalScrims,
      totalTeams,
      totalPlayers,
      totalKills,
      totalPoints,
      totalMatches,
      avgKillsPerMatch,
      avgPointsPerTeam,
    };
  }, [allXtreinos, allChampionships, allScrims, teamsList, playersList, teamRanking]);

  // ============================================================================
  // TOP PLAYERS (Top 8)
  // ============================================================================

  const topPlayers = useMemo<TopPlayer[]>(() => {
    if (!playerAccumulated || playerAccumulated.length === 0) return [];

    return playerAccumulated
      .sort((a, b) => b.totalKills - a.totalKills)
      .slice(0, 8)
      .map((player, index) => ({
        id: `player-${player.playerName}`,
        name: player.playerName,
        teamName: player.teamName,
        kills: player.totalKills,
        participations: player.participations,
        avgKills: player.avgKills,
        rank: index + 1,
      }));
  }, [playerAccumulated]);

  // ============================================================================
  // TOP TEAMS (Top 8)
  // ============================================================================

  const topTeams = useMemo<TopTeam[]>(() => {
    if (!teamRanking || teamRanking.length === 0) return [];

    return teamRanking
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 8)
      .map((team, index) => ({
        id: `team-${team.teamName}`,
        name: team.teamName,
        points: team.totalPoints,
        kills: team.totalKills,
        wins: team.top1Count,
        top3Count: team.top3Count,
        xtreinosPlayed: team.xtreinosPlayed,
        bestPosition: team.bestPosition,
        avgPoints: team.xtreinosPlayed > 0
          ? Math.round((team.totalPoints / team.xtreinosPlayed) * 10) / 10
          : 0,
        rank: index + 1,
      }));
  }, [teamRanking]);

  // ============================================================================
  // ATIVIDADES RECENTES
  // ============================================================================

  const recentActivities = useMemo<RecentActivity[]>(() => {
    const activities: RecentActivity[] = [];
    let idCounter = 1;

    // Últimos XTreinos finalizados
    if (allXtreinos && allXtreinos.length > 0) {
      const recentXtreinos = allXtreinos
        .filter((x) => x.status === "fechado")
        .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
        .slice(0, 3);

      for (const xt of recentXtreinos) {
        // Busca o vencedor desse xtreino no teamRanking
        const winner = teamRanking
          ?.filter((t) => t.xtreinos.some((x) => x.xtreinoId === xt.id))
          .sort((a, b) => b.totalPoints - a.totalPoints)[0];

        activities.push({
          id: idCounter++,
          type: "xtreino",
          title: `XTreino #${xt.id} — ${xt.name}`,
          description: winner
            ? `Vitória de "${winner.teamName}" com ${winner.totalPoints} pts`
            : "Resultado computado",
          date: xt.date || "Data não definida",
          highlight: winner?.teamName,
        });
      }
    }

    // Campeonatos recentes
    if (allChampionships && allChampionships.length > 0) {
      const recentChamps = allChampionships
        .slice(-2)
        .reverse();

      for (const champ of recentChamps) {
        activities.push({
          id: idCounter++,
          type: "championship",
          title: `Campeonato "${champ.name}"`,
          description: champ.status === "ativo"
            ? "Em andamento"
            : champ.status === "inscricoes"
            ? "Inscrições abertas"
            : "Encerrado",
          date: champ.startDate || "Data não definida",
        });
      }
    }

    // Scrims recentes
    if (allScrims && allScrims.length > 0) {
      const recentScrims = allScrims
        .filter((s) => s.status === "finalizado")
        .slice(-2)
        .reverse();

      for (const scrim of recentScrims) {
        activities.push({
          id: idCounter++,
          type: "scrim",
          title: `Scrim "${scrim.name}"`,
          description: "Scrim finalizado",
          date: scrim.date || "Data não definida",
        });
      }
    }

    // Atualizações de ranking (se houver recálculo recente)
    if (teamRanking && teamRanking.length > 0) {
      const topTeam = teamRanking[0];
      activities.push({
        id: idCounter++,
        type: "ranking",
        title: "Ranking Atualizado",
        description: `"${topTeam.teamName}" lidera com ${topTeam.totalPoints} pts`,
        date: new Date().toISOString().split("T")[0],
        highlight: topTeam.teamName,
      });
    }

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [allXtreinos, allChampionships, allScrims, teamRanking]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  const isLoading = !allXtreinos && !allChampionships && !allScrims;

  return {
    orgName: settings?.orgName ?? "Underground",
    isLoading,
    stats,
    topPlayers,
    topTeams,
    recentActivities,
    periodSummary,
  };
}