import { Suspense, lazy, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import {
  Shield, Crosshair, Globe, Cpu, Trophy, Users, Swords, Zap,
  Target, Crown, Calendar, Flame, TrendingUp
} from 'lucide-react';
import { trpc } from "@/providers/trpc";
import { useXtreinoCalculations } from "@/hooks/useXtreinoCalculations";
import MainLayout from "@/layout/MainLayout";
import { MouseTrailGlow, ScrambleText, MorphingNumber } from './Effects';
import ActivitiesTimeline from './ActivitiesTimeline';

const HolographicSphere = lazy(() => import('./HolographicSphere'));

// ============================================================================
// TIPOS
// ============================================================================

interface TopPlayer {
  id: string;
  name: string;
  teamName: string | null;
  kills: number;
  participations: number;
  avgKills: number;
  bestPerformance: number;
  streak: number;
  badges: string[];
  rank: number;
  trend: "up" | "down" | "same";
  sparkline: number[];
}

interface TopTeam {
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
  sparkline: number[];
  trend: "up" | "down" | "same";
  badges: string[];
}

interface RecentActivity {
  id: number;
  type: "xtreino" | "championship" | "scrim" | "ranking";
  title: string;
  description: string;
  date: string;
  highlight?: string;
}

// ============================================================================
// FUNÇÕES DE CÁLCULO
// ============================================================================

function calcPlayerSparkline(rawStats: Array<{ playerName: string; date: string; totalKills: number }>, playerName: string): number[] {
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
  const sorted = [...teamXtreinos].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((x) => x.totalPoints);
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
// HOOK INTERNO (useExperienceData local)
// ============================================================================

function useExperienceData() {
  const { data: allXtreinos } = trpc.xtreinos.list.useQuery(undefined);
  const { data: allChampionships } = trpc.championships.list.useQuery(undefined);
  const { data: allScrims } = trpc.scrims.list.useQuery(undefined);
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: rawPlayerRanking } = trpc.players.rankingStats.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  const { teamRanking } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

  const isLoading = !allResults || !allPlayerStats || !rawPlayerRanking;

  const stats = useMemo(() => {
    const totalXtreinos = allXtreinos?.length ?? 0;
    const totalChampionships = allChampionships?.length ?? 0;
    const totalScrims = allScrims?.length ?? 0;
    const totalTeams = teamsList?.length ?? 0;
    const totalPlayers = playersList?.length ?? 0;
    const totalKills = teamRanking?.reduce((acc: number, t: any) => acc + t.totalKills, 0) ?? 0;
    const totalPoints = teamRanking?.reduce((acc: number, t: any) => acc + t.totalPoints, 0) ?? 0;
    const totalMatches = totalXtreinos + totalScrims + totalChampionships;
    const avgKillsPerMatch = totalMatches > 0 ? Math.round((totalKills / totalMatches) * 10) / 10 : 0;
    const avgPointsPerTeam = totalTeams > 0 ? Math.round((totalPoints / totalTeams) * 10) / 10 : 0;

    return {
      totalXtreinos, totalChampionships, totalScrims,
      totalTeams, totalPlayers, totalKills, totalPoints,
      totalMatches, avgKillsPerMatch, avgPointsPerTeam,
    };
  }, [allXtreinos, allChampionships, allScrims, teamsList, playersList, teamRanking]);

  const topPlayers = useMemo<TopPlayer[]>(() => {
    if (!rawPlayerRanking || rawPlayerRanking.length === 0) return [];

    const playerMap = new Map<string, {
      playerName: string;
      teamName: string | null;
      totalKills: number;
      totalQ1Kills: number;
      totalQ2Kills: number;
      totalQ3Kills: number;
      participations: number;
      dates: string[];
    }>();

    for (const stat of rawPlayerRanking) {
      const key = stat.playerName.trim().toLowerCase();
      const existing = playerMap.get(key);
      if (existing) {
        existing.totalKills += stat.totalKills || 0;
        existing.totalQ1Kills += stat.q1Kills || 0;
        existing.totalQ2Kills += stat.q2Kills || 0;
        existing.totalQ3Kills += stat.q3Kills || 0;
        existing.participations += 1;
        if (!existing.dates.includes(stat.date)) existing.dates.push(stat.date);
      } else {
        playerMap.set(key, {
          playerName: stat.playerName,
          teamName: stat.teamName,
          totalKills: stat.totalKills || 0,
          totalQ1Kills: stat.q1Kills || 0,
          totalQ2Kills: stat.q2Kills || 0,
          totalQ3Kills: stat.q3Kills || 0,
          participations: 1,
          dates: [stat.date],
        });
      }
    }

    return Array.from(playerMap.values())
      .map((p) => ({
        id: `player-${p.playerName}`,
        name: p.playerName,
        teamName: p.teamName,
        kills: p.totalKills,
        participations: p.participations,
        avgKills: p.participations > 0 ? Math.round((p.totalKills / p.participations) * 10) / 10 : 0,
        bestPerformance: 0,
        streak: calcPlayerStreak(rawPlayerRanking, p.playerName),
        badges: calcPlayerBadges(p.totalKills, p.participations, p.participations > 0 ? p.totalKills / p.participations : 0),
        rank: 0,
        trend: "same" as const,
        sparkline: calcPlayerSparkline(rawPlayerRanking, p.playerName),
      }))
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 8)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }, [rawPlayerRanking]);

  const topTeams = useMemo<TopTeam[]>(() => {
    if (!teamRanking || teamRanking.length === 0) return [];

    return teamRanking
      .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
      .slice(0, 8)
      .map((team: any, i: number) => {
        const sparkline = calcTeamSparkline(team.xtreinos);
        return {
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
          rank: i + 1,
          sparkline,
          trend: calcTeamTrend(sparkline),
          badges: calcTeamBadges(team),
        };
      });
  }, [teamRanking]);

  const recentActivities = useMemo<RecentActivity[]>(() => {
    const activities: RecentActivity[] = [];
    let idCounter = 1;

    if (allXtreinos && allXtreinos.length > 0) {
      const recent = allXtreinos
        .filter((x: any) => x.status === "fechado")
        .sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
        .slice(0, 3);

      for (const xt of recent) {
        const winner = teamRanking
          ?.filter((t: any) => t.xtreinos.some((x: any) => x.xtreinoId === xt.id))
          .sort((a: any, b: any) => b.totalPoints - a.totalPoints)[0];

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

    if (allChampionships && allChampionships.length > 0) {
      allChampionships.slice(-2).reverse().forEach((champ: any) => {
        activities.push({
          id: idCounter++,
          type: "championship",
          title: `Campeonato "${champ.name}"`,
          description: champ.status === "ativo" ? "Em andamento" : champ.status === "inscricoes" ? "Inscrições abertas" : "Encerrado",
          date: champ.startDate || "Data não definida",
        });
      });
    }

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

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [allXtreinos, allChampionships, teamRanking]);

  return {
    orgName: settings?.orgName ?? "Underground",
    isLoading,
    stats,
    topPlayers,
    topTeams,
    recentActivities,
  };
}

// ============================================================================
// FEATURES
// ============================================================================
const features = [
  { icon: Crosshair, title: "Precisão Cirúrgica", desc: "Estatísticas milimétricas que revelam o verdadeiro potencial de cada jogador e equipe no cenário competitivo." },
  { icon: Shield, title: "Infraestrutura Sólida", desc: "Tecnologia de ponta garantindo estabilidade, velocidade e segurança absoluta dos dados." },
  { icon: Globe, title: "Cenário Conectado", desc: "Uma rede unindo jogadores, times e organizações em um ecossistema vivo e integrado." },
  { icon: Cpu, title: "Inteligência Aplicada", desc: "Algoritmos próprios para pontuação, ranking e análise de desempenho evolutiva." },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

// ============================================================================
// COMPONENTES AUXILIARES (Sparkline, Trends, etc)
// ============================================================================

function SparklineSVG({ data, width = 120, height = 30, color = "#10b981" }: { data: number[]; width?: number; height?: number; color?: string }) {
  if (data.length < 2) return <div className="text-xs text-[#5a5a6e]">—</div>;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * height} r="3" fill={color} />
    </svg>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "same" }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-400" />;
  if (trend === "down") return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
  return <div className="w-4 h-4 text-[#5a5a6e]">—</div>;
}

// ============================================================================
// COMPONENTES DE SEÇÃO (Players e Teams)
// ============================================================================

function TopPlayersSection({ players, orgName }: { players: TopPlayer[]; orgName: string }) {
  if (players.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">{orgName} Elite</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Top <span className="text-emerald-400">Players</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {players.map((player, i) => (
            <motion.div key={player.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="group relative bg-[#12121a]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden">
              <div className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${player.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : player.rank === 2 ? 'bg-gray-400/20 text-gray-300' : player.rank === 3 ? 'bg-amber-600/20 text-amber-500' : 'bg-[#1a1a2e] text-[#5a5a6e]'}`}>{player.rank}</div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center"><Target className="w-5 h-5 text-emerald-400" /></div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-sm truncate group-hover:text-emerald-400 transition-colors">{player.name}</h3>
                  <p className="text-[#5a5a6e] text-xs">{player.teamName || "Sem time"}</p>
                </div>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-black text-emerald-400">{player.kills}</span>
                <span className="text-[#5a5a6e] text-xs mb-1">kills</span>
              </div>
              <div className="flex gap-3 text-xs text-[#5a5a6e] mb-3">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-cyan-400" /> {player.avgKills} avg</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-violet-400" /> {player.participations} xtrs</span>
                {player.streak >= 3 && (<span className="flex items-center gap-1 text-orange-400"><Flame className="w-3 h-3" /> {player.streak}</span>)}
              </div>
              {player.badges.length > 0 && (<div className="flex flex-wrap gap-1 mb-3">{player.badges.slice(0, 3).map((badge) => (<span key={badge} className="px-2 py-0.5 rounded-full bg-[#1a1a24] border border-[#2a2a3a] text-[10px] text-[#8a8a9e]">{badge}</span>))}</div>)}
              <div className="flex items-center justify-between">
                <SparklineSVG data={player.sparkline} width={100} height={24} />
                <TrendIcon trend={player.trend} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TopTeamsSection({ teams, orgName }: { teams: TopTeam[]; orgName: string }) {
  if (teams.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">{orgName} Rankings</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Top <span className="text-emerald-400">Equipes</span></h2>
        </div>
        <div className="space-y-3">
          {teams.map((team, i) => (
            <motion.div key={team.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} whileHover={{ x: 4, transition: { duration: 0.2 } }} className="group flex items-center gap-4 bg-[#12121a]/60 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:border-emerald-500/30 transition-all duration-300">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${team.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : team.rank === 2 ? 'bg-gray-400/20 text-gray-300' : team.rank === 3 ? 'bg-amber-600/20 text-amber-500' : 'bg-[#1a1a2e] text-[#5a5a6e]'}`}>{team.rank}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm sm:text-base truncate group-hover:text-emerald-400 transition-colors">{team.name}</h3>
                <div className="flex gap-3 text-xs text-[#5a5a6e] mt-0.5">
                  <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> {team.wins} wins</span>
                  <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-violet-400" /> {team.top3Count} podiums</span>
                  {team.badges.slice(0, 2).map((badge) => (<span key={badge} className="px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[10px]">{badge}</span>))}
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="text-center hidden sm:block">
                  <div className="text-emerald-400 font-black text-lg">{team.kills}</div>
                  <div className="text-[#5a5a6e] text-[10px] uppercase">kills</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-black text-xl">{team.points.toLocaleString('pt-BR')}</div>
                  <div className="text-[#5a5a6e] text-[10px] uppercase">pts</div>
                </div>
                <div className="text-center hidden md:block">
                  <div className="text-cyan-400 font-bold">{team.avgPoints}</div>
                  <div className="text-[#5a5a6e] text-[10px] uppercase">avg</div>
                </div>
                <div className="hidden lg:flex items-center gap-2">
                  <SparklineSVG data={team.sparkline} width={80} height={24} color="#8b5cf6" />
                  <TrendIcon trend={team.trend} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================

export default function ExperiencePage() {
  const { scrollYProgress } = useScroll();
  const { orgName, isLoading, stats, topPlayers, topTeams, recentActivities } = useExperienceData();

  const sphereScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.4]);
  const sphereOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -120]);

  const [scrambleTriggers, setScrambleTriggers] = useState<boolean[]>(new Array(features.length).fill(false));
  const [statsTrigger, setStatsTrigger] = useState(false);

  const displayStats = [
    { value: stats.totalXtreinos, label: "XTreinos", icon: Swords, suffix: "" },
    { value: stats.totalKills, label: "Kills Totais", icon: Crosshair, suffix: "" },
    { value: stats.totalTeams, label: "Equipes", icon: Users, suffix: "" },
    { value: stats.totalPlayers, label: "Players", icon: Trophy, suffix: "" },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="relative bg-[#0a0a0f] overflow-x-hidden -mx-4 lg:-mx-8">
        <MouseTrailGlow />

        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <motion.div className="absolute inset-0 z-0" style={{ scale: sphereScale, opacity: sphereOpacity }}>
            <Suspense fallback={<div className="w-full h-full bg-[#0a0a0f]" />}>
              <HolographicSphere />
            </Suspense>
          </motion.div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0a0a0f_80%)] z-[1] pointer-events-none" />

          <motion.div style={{ y: heroY }} className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" as const }} className="mb-6 sm:mb-8">
              <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {orgName} — A Nova Era do E-sports Mobile
              </span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" as const }} className="text-[15vw] sm:text-[12vw] md:text-[8vw] lg:text-8xl font-black text-white leading-[0.85] sm:leading-[0.9] tracking-tighter mb-6 sm:mb-8" style={{ textShadow: "0 0 80px rgba(16, 185, 129, 0.5)" }}>
              MAIS QUE <br className="sm:hidden" />UM <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-400">JOGO.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" as const }} className="text-base sm:text-lg md:text-xl text-[#6a6a7e] max-w-2xl mx-auto leading-relaxed px-2">
              Uma experiência imersiva onde dados, competição e tecnologia se encontram para redefinir o cenário competitivo.
            </motion.p>
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <span className="text-[#3a3a4e] text-[10px] tracking-[0.3em] uppercase">Explore</span>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }} className="w-5 h-8 border-2 border-[#3a3a4e] rounded-full flex justify-center pt-1.5">
                <div className="w-1 h-2 bg-emerald-500 rounded-full" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        <section className="relative z-20 bg-[#0a0a0f] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">Construída para dominar</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Tecnologia de <span className="text-emerald-400">ponta</span></h2>
            </motion.div>
            
            <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} onViewportEnter={() => features.forEach((_, i) => setTimeout(() => setScrambleTriggers(prev => { const n = [...prev]; n[i] = true; return n; }), i * 150))} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {features.map((f, i) => (
                <motion.div key={f.title} variants={itemVariants} whileHover={{ y: -5 }} className="group relative rounded-2xl p-[1px] overflow-hidden h-full">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-spin-slow bg-conic-gradient from-emerald-500 via-transparent to-transparent" />
                  <div className="relative z-10 bg-[#12121a]/95 backdrop-blur-sm rounded-2xl p-5 sm:p-6 h-full">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                      <f.icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-[#f0f0f5] font-bold text-base sm:text-lg mb-2 group-hover:text-emerald-400 transition-colors font-mono">
                      <ScrambleText text={f.title} trigger={scrambleTriggers[i]} />
                    </h3>
                    <p className="text-[#5a5a6e] text-xs sm:text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <motion.div className="max-w-7xl mx-auto py-16 sm:py-24" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} onViewportEnter={() => setStatsTrigger(true)}>
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">Números que falam</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Resultados <span className="text-emerald-400">reais</span></h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
              {displayStats.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }} className="text-center group">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 mb-4 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                    <stat.icon className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-2" style={{ textShadow: "0 0 30px rgba(16, 185, 129, 0.3)" }}>
                    <MorphingNumber value={stat.value} trigger={statsTrigger} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm sm:text-base text-[#5a5a6e] font-medium uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <TopPlayersSection players={topPlayers} orgName={orgName} />
        <TopTeamsSection teams={topTeams} orgName={orgName} />
        <ActivitiesTimeline activities={recentActivities} />

        <section className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-16 sm:py-24 relative overflow-hidden text-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <h2 className="text-[20vw] sm:text-[14vw] md:text-[8vw] font-black text-[#12121a]" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.05)' }}>EVOLUÇÃO</h2>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" as const }} viewport={{ once: true }} className="relative z-10">
              <p className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#f0f0f5] leading-tight max-w-4xl mx-auto tracking-tight">
                Não acompanhamos tendências. <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white">Nós criamos o futuro.</span>
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}