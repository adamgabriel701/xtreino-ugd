import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { useXtreinoCalculations } from "@/hooks/useXtreinoCalculations";
import type { UpcomingEvent } from "./components/UpcomingEvents"; // Importando a tipagem nova

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
  id: number;         // ID REAL do Jogador no banco
  clanId?: number;    // ID REAL do Clã
  teamId?: number;    // ID REAL da Line/Time
  name: string;
  teamName: string | null;
  kills: number;
  avgKills: number;
  participations: number;
  streak: number;
  rank: number;
  badges: string[];
  sparkline: number[];
  trend: "up" | "down" | "same";
}

export interface TopTeam {
  id: number;         // ID REAL do Time (Line) no banco
  clanId?: number;    // ID REAL do Clã
  name: string;
  wins: number;
  top3Count: number;
  kills: number;
  points: number;
  avgPoints: number;
  rank: number;
  badges: string[];
  sparkline: number[];
  trend: "up" | "down" | "same";
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
  upcomingEvents: UpcomingEvent[]; // NOVO CAMPO
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
// FUNÇÕES DE CÁLCULO AUXILIARES
// ============================================================================

function calcPlayerSparkline(rawStats: Array<{ playerName: string; date: string; totalKills: number }>, playerName: string): number[] {
  const playerStats = rawStats.filter((s) => s.playerName === playerName).sort((a, b) => a.date.localeCompare(b.date));
  const dateMap = new Map<string, number>();
  playerStats.forEach((s) => { dateMap.set(s.date, (dateMap.get(s.date) || 0) + s.totalKills); });
  return Array.from(dateMap.keys()).sort().map((d) => dateMap.get(d) || 0);
}

function calcPlayerStreak(rawStats: Array<{ playerName: string; date: string }>, playerName: string): number {
  const allDates = [...new Set(rawStats.map((s) => s.date))].sort();
  const playerDates = new Set(rawStats.filter((s) => s.playerName === playerName).map((s) => s.date));
  let streak = 0;
  for (let i = allDates.length - 1; i >= 0; i--) {
    if (playerDates.has(allDates[i])) streak++;
    else break;
  }
  return streak;
}

function calcPlayerBadges(totalKills: number, participations: number, avgKills: number): string[] {
  const badges: string[] = [];
  if (totalKills >= 100) badges.push("100 Kills");
  if (totalKills >= 300) badges.push("300 Kills");
  if (totalKills >= 500) badges.push("500 Kills");
  if (participations >= 5) badges.push("5 XTs");
  if (participations >= 10) badges.push("10 XTs");
  if (participations >= 20) badges.push("20 XTs");
  if (avgKills >= 8) badges.push("Sniper");
  if (avgKills >= 12) badges.push("Elite");
  return badges;
}

function calcTeamSparkline(teamXtreinos: Array<{ date: string; totalPoints: number }>): number[] {
  return [...teamXtreinos].sort((a, b) => a.date.localeCompare(b.date)).map((x) => x.totalPoints);
}

function calcTeamTrend(sparkline: number[]): "up" | "down" | "same" {
  if (sparkline.length < 2) return "same";
  const last = sparkline[sparkline.length - 1];
  const prev = sparkline[sparkline.length - 2];
  if (last > prev) return "up";
  if (last < prev) return "down";
  return "same";
}

function calcTeamBadges(team: { totalKills: number; totalPoints: number; xtreinosPlayed: number; top1Count: number; top3Count: number }): string[] {
  const badges: string[] = [];
  if (team.top1Count >= 1) badges.push("Campeão");
  if (team.top1Count >= 5) badges.push("Dinastia");
  if (team.top3Count >= 10) badges.push("Consistente");
  if (team.totalKills >= 500) badges.push("500+ Kills");
  if (team.xtreinosPlayed >= 20) badges.push("Veterano");
  if (team.totalPoints >= 500) badges.push("500+ Pts");
  return badges;
}

// ============================================================================
// FUNÇÃO AUXILIAR PARA TRATAR DATAS NO FORMATO TEXT DO SQLITE
// ============================================================================
function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Tenta YYYY-MM-DD
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  // Tenta DD/MM/YYYY
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      if (!isNaN(d.getTime())) return d;
    }
  }
  
  return null;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useExperienceData(): ExperienceData {
  const { data: allXtreinos } = trpc.xtreinos.list.useQuery(undefined);
  const { data: allChampionships } = trpc.championships.list.useQuery(undefined);
  const { data: allScrims } = trpc.scrims.list.useQuery(undefined);
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: rawPlayerRanking } = trpc.players.rankingStats.useQuery();
  const { data: scrimTeamAllTime } = trpc.scrims.teamResultsAllTimeBR.useQuery();
  const { data: clansList } = trpc.clans.list.useQuery();
  
  // NOVAS QUERIES PARA OS PRÓXIMOS EVENTOS
  const { data: openXtreinos } = trpc.xtreinos.list.useQuery(undefined);
  const { data: upcomingChamps } = trpc.championships.list.useQuery({ status: "em_breve" });
  const { data: openSalinhas } = trpc.salinhas.list.useQuery({ status: "aberta" });
  
  const { data: settings } = trpc.settings.get.useQuery();

  const calculations = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

  const { teamRanking, teamPlayersGrouped, playerAccumulated, periodSummary } = calculations;

  const isLoading = !allResults || !allPlayerStats || !rawPlayerRanking;

  // ========================================================================
  // MAPAS DE RESOLUÇÃO DE IDs
  // ========================================================================
  
  const teamMap = useMemo(() => {
    const map = new Map<string, { id: number; clanId: number | null }>();
    if (!teamsList) return map;
    for (const team of teamsList) {
      map.set(team.name.trim().toLowerCase(), { id: team.id, clanId: team.clanId ?? null });
    }
    return map;
  }, [teamsList]);

  const playerMap = useMemo(() => {
    const map = new Map<string, { id: number; teamId: number | null }>();
    if (!playersList) return map;
    for (const player of playersList) {
      map.set(player.nickname.trim().toLowerCase(), { id: player.id, teamId: player.teamId ?? null });
    }
    return map;
  }, [playersList]);

  const stats = useMemo<ExperienceStats>(() => {
    const totalXtreinos = allXtreinos?.length ?? 0;
    const totalChampionships = allChampionships?.length ?? 0;
    const totalScrims = allScrims?.length ?? 0;
    const totalTeams = teamsList?.length ?? 0;
    const totalPlayers = playersList?.length ?? 0;
    const totalKills = teamRanking?.reduce((acc, t) => acc + t.totalKills, 0) ?? 0;
    const totalPoints = teamRanking?.reduce((acc, t) => acc + t.totalPoints, 0) ?? 0;
    const totalMatches = totalXtreinos + totalScrims + totalChampionships;
    const avgKillsPerMatch = totalMatches > 0 ? Math.round((totalKills / totalMatches) * 10) / 10 : 0;
    const avgPointsPerTeam = totalTeams > 0 ? Math.round((totalPoints / totalTeams) * 10) / 10 : 0;

    return { totalXtreinos, totalChampionships, totalScrims, totalTeams, totalPlayers, totalKills, totalPoints, totalMatches, avgKillsPerMatch, avgPointsPerTeam };
  }, [allXtreinos, allChampionships, allScrims, teamsList, playersList, teamRanking]);

  // ========================================================================
  // TOP PLAYERS
  // ========================================================================
  const topPlayers = useMemo<TopPlayer[]>(() => {
    if (!rawPlayerRanking || rawPlayerRanking.length === 0) return [];
    const playerStatsMap = new Map<string, any>();

    for (const stat of rawPlayerRanking) {
      const key = stat.playerName.trim().toLowerCase();
      const existing = playerStatsMap.get(key);
      if (existing) {
        existing.totalKills += stat.totalKills || 0;
        existing.participations += 1;
        if (!existing.dates.includes(stat.date)) existing.dates.push(stat.date);
      } else {
        playerStatsMap.set(key, { playerName: stat.playerName, teamName: stat.teamName, totalKills: stat.totalKills || 0, participations: 1, dates: [stat.date] });
      }
    }

    return Array.from(playerStatsMap.values())
      .map((p) => {
        const dbPlayer = playerMap.get(p.playerName.trim().toLowerCase());
        return {
          id: dbPlayer?.id ?? 0,
          clanId: undefined,
          teamId: dbPlayer?.teamId ?? undefined,
          name: p.playerName, 
          teamName: p.teamName, 
          kills: p.totalKills,
          participations: p.participations, 
          avgKills: p.participations > 0 ? Math.round((p.totalKills / p.participations) * 10) / 10 : 0,
          streak: calcPlayerStreak(rawPlayerRanking, p.playerName),
          badges: calcPlayerBadges(p.totalKills, p.participations, p.participations > 0 ? p.totalKills / p.participations : 0),
          rank: 0, 
          trend: "same" as const, 
          sparkline: calcPlayerSparkline(rawPlayerRanking, p.playerName),
        };
      })
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 8)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }, [rawPlayerRanking, playerMap]);

  // ========================================================================
  // TOP TEAMS
  // ========================================================================
  const topTeams = useMemo<TopTeam[]>(() => {
    if (!teamRanking || teamRanking.length === 0) return [];
    return teamRanking
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 8)
      .map((team) => {
        const sparkline = calcTeamSparkline(team.xtreinos);
        const dbTeam = teamMap.get(team.teamName.trim().toLowerCase());
        
        return {
          id: dbTeam?.id ?? 0,
          clanId: dbTeam?.clanId ?? undefined,
          name: team.teamName, 
          points: team.totalPoints, 
          kills: team.totalKills,
          wins: team.top1Count, 
          top3Count: team.top3Count, 
          avgPoints: team.xtreinosPlayed > 0 ? Math.round((team.totalPoints / team.xtreinosPlayed) * 10) / 10 : 0,
          rank: 0,
          sparkline, 
          trend: calcTeamTrend(sparkline), 
          badges: calcTeamBadges(team),
        };
      })
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }, [teamRanking, teamMap]);

  // ========================================================================
  // RECENT ACTIVITIES
  // ========================================================================
  const recentActivities = useMemo<RecentActivity[]>(() => {
    const activities: RecentActivity[] = [];
    let idCounter = 1;

    if (allXtreinos && allXtreinos.length > 0) {
      const recentXtreinos = allXtreinos.filter((x) => x.status === "fechado").sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 3);
      for (const xt of recentXtreinos) {
        const winner = teamRanking?.filter((t) => t.xtreinos.some((x) => x.xtreinoId === xt.id)).sort((a, b) => b.totalPoints - a.totalPoints)[0];
        activities.push({
          id: idCounter++, type: "xtreino", title: `XTreino #${xt.id} — ${xt.name}`,
          description: winner ? `Vitória de "${winner.teamName}" com ${winner.totalPoints} pts` : "Resultado computado",
          date: xt.date || "Data não definida", highlight: winner?.teamName,
        });
      }
    }

    if (allChampionships && allChampionships.length > 0) {
      allChampionships.slice(-2).reverse().forEach((champ) => {
        activities.push({
          id: idCounter++, type: "championship", title: `Campeonato "${champ.name}"`,
          description: champ.status === "ativo" ? "Em andamento" : champ.status === "inscricoes" ? "Inscrições abertas" : "Encerrado",
          date: champ.startDate || "Data não definida",
        });
      });
    }

    if (allScrims && allScrims.length > 0) {
      allScrims.filter((s) => s.status === "finalizado").slice(-2).reverse().forEach((scrim) => {
        activities.push({ id: idCounter++, type: "scrim", title: `Scrim "${scrim.name}"`, description: "Scrim finalizado", date: scrim.date || "Data não definida" });
      });
    }

    if (teamRanking && teamRanking.length > 0) {
      const topTeam = teamRanking[0];
      activities.push({ id: idCounter++, type: "ranking", title: "Ranking Atualizado", description: `"${topTeam.teamName}" lidera com ${topTeam.totalPoints} pts`, date: new Date().toISOString().split("T")[0], highlight: topTeam.teamName });
    }

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [allXtreinos, allChampionships, allScrims, teamRanking]);

  // ========================================================================
  // UPCOMING EVENTS (PRÓXIMOS EVENTOS)
  // ========================================================================
  const upcomingEvents = useMemo<UpcomingEvent[]>(() => {
    const events: UpcomingEvent[] = [];

    // 1. XTreinos Abertos
    if (openXtreinos && openXtreinos.length > 0) {
      const filtered = openXtreinos.filter(x => x.status === "aberto");
      for (const xt of filtered) {
        events.push({
          id: xt.id,
          type: 'xtreino',
          title: xt.name,
          date: xt.date,
          timeBr: xt.timeBr,
          maxTeams: xt.maxTeams,
          status: xt.status,
        });
      }
    }

    // 2. Campeonatos em Breve / Inscrições
    if (upcomingChamps && upcomingChamps.length > 0) {
      for (const champ of upcomingChamps) {
        events.push({
          id: champ.id,
          type: 'championship',
          title: champ.name,
          date: champ.startDate || '',
          maxTeams: champ.maxTeams,
          registeredTeams: champ.registeredTeams,
          status: champ.status,
          location: champ.modality, // Usando modalidade como local/info extra
        });
      }
    }

    // 3. Salinhas Abertas
    if (openSalinhas && openSalinhas.length > 0) {
      for (const salinha of openSalinhas) {
        events.push({
          id: salinha.id,
          type: 'salinha',
          title: salinha.name,
          date: salinha.date,
          timeBr: salinha.timeBr,
          maxParticipants: salinha.maxParticipants,
          status: salinha.status,
          location: salinha.modality, // Ex: "solo", "duo"
        });
      }
    }

    // Ordena os eventos pela data mais próxima (tratando strings de datas variadas)
    return events
      .sort((a, b) => {
        const dateA = parseDateString(a.date);
        const dateB = parseDateString(b.date);
        
        // Se não conseguir parsear, joga pro final da lista
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 4); // Limita a 4 próximos eventos na tela
  }, [openXtreinos, upcomingChamps, openSalinhas]);

  return { 
    orgName: settings?.orgName ?? "Underground", 
    isLoading, 
    stats, 
    topPlayers, 
    topTeams, 
    recentActivities, 
    upcomingEvents, // RETORNANDO AQUI
    periodSummary 
  };
}