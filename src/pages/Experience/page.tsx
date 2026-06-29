import { Suspense, lazy, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { Shield, Crosshair, Globe, Cpu, Trophy, Users, Swords, Zap, Target } from 'lucide-react';
import { trpc } from "@/providers/trpc";
import { useXtreinoCalculations } from "@/hooks/useXtreinoCalculations";
import MainLayout from "@/layout/MainLayout";
import { MouseTrailGlow, ScrambleText, MorphingNumber } from './Effects';

const HolographicSphere = lazy(() => import('./HolographicSphere'));

// ============================================================================
// DADOS REAIS VIA TRPC
// ============================================================================

function useExperienceData() {
  const { data: allXtreinos } = trpc.xtreinos.list.useQuery(undefined);
  const { data: allChampionships } = trpc.championships.list.useQuery(undefined);
  const { data: allScrims } = trpc.scrims.list.useQuery(undefined);
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: scrimTeamAllTime } = trpc.scrims.teamResultsAllTimeBR.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  const { teamRanking, teamPlayersGrouped } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

  const xtreinoRealStats = useMemo(() => {
    if (!teamRanking || teamRanking.length === 0) {
      return { totalTeams: 0, totalKills: 0, totalPoints: 0, totalXtreinos: 0 };
    }
    return {
      totalTeams: teamRanking.length,
      totalKills: teamRanking.reduce((acc, t) => acc + t.totalKills, 0),
      totalPoints: teamRanking.reduce((acc, t) => acc + t.totalPoints, 0),
      totalXtreinos: teamRanking.reduce((acc, t) => acc + t.xtreinosPlayed, 0),
    };
  }, [teamRanking]);

  const scrimRealStats = useMemo(() => {
    if (!scrimTeamAllTime || scrimTeamAllTime.length === 0) {
      return { totalTeams: 0, totalKills: 0, totalPoints: 0, totalScrims: 0 };
    }
    return {
      totalTeams: scrimTeamAllTime.length,
      totalKills: scrimTeamAllTime.reduce((acc, t) => acc + (t.totalKills || 0), 0),
      totalPoints: scrimTeamAllTime.reduce((acc, t) => acc + (t.totalPoints || 0), 0),
      totalScrims: scrimTeamAllTime.reduce((acc, t) => acc + (t.matches || 0), 0),
    };
  }, [scrimTeamAllTime]);

  const topPlayers = useMemo(() => {
    if (!teamPlayersGrouped || teamPlayersGrouped.size === 0) return [];
    const allPlayers: Array<{ playerName: string; totalKills: number; participations: number; avgKills: number; teamName: string }> = [];
    for (const [teamName, players] of teamPlayersGrouped.entries()) {
      for (const player of players) allPlayers.push({ ...player, teamName });
    }
    const playerMap = new Map<string, typeof allPlayers[0]>();
    for (const p of allPlayers) {
      const key = p.playerName.trim().toLowerCase();
      if (playerMap.has(key)) {
        const existing = playerMap.get(key)!;
        existing.totalKills += p.totalKills;
        existing.participations += p.participations;
        existing.avgKills = Number((existing.totalKills / existing.participations).toFixed(1));
      } else {
        playerMap.set(key, { ...p });
      }
    }
    return Array.from(playerMap.values())
      .sort((a, b) => b.totalKills - a.totalKills)
      .slice(0, 5)
      .map((p) => ({
        name: p.playerName,
        team: p.teamName,
        kills: p.totalKills,
        participations: p.participations,
        avgKills: p.avgKills,
      }));
  }, [teamPlayersGrouped]);

  const topTeams = useMemo(() => {
    if (!teamRanking || teamRanking.length === 0) return [];
    return teamRanking
      .slice(0, 5)
      .map((t) => ({
        name: t.teamName,
        points: t.totalPoints,
        kills: t.totalKills,
        wins: t.top1Count,
        xtreinos: t.xtreinosPlayed,
      }));
  }, [teamRanking]);

  return {
    orgName: settings?.orgName ?? "Underground",
    totalTeams: teamsList?.length ?? 0,
    totalPlayers: playersList?.length ?? 0,
    xtreinoStats: xtreinoRealStats,
    scrimStats: scrimRealStats,
    topPlayers,
    topTeams,
    totalXtreinos: allXtreinos?.length ?? 0,
    totalChampionships: allChampionships?.length ?? 0,
    totalScrims: allScrims?.length ?? 0,
  };
}

// ============================================================================
// FEATURES E STATS
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
// COMPONENTE: Top Players List
// ============================================================================

function TopPlayersSection({ players }: { players: Array<{ name: string; team: string; kills: number; participations: number; avgKills: number }> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
            Destaques
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Top <span className="text-emerald-400">Players</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {players.map((player, i) => (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group relative bg-[#12121a]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-500"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                  i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  i === 1 ? 'bg-gray-400/20 text-gray-300' :
                  i === 2 ? 'bg-amber-600/20 text-amber-500' :
                  'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base truncate group-hover:text-emerald-400 transition-colors">
                    {player.name}
                  </h3>
                  <p className="text-[#5a5a6e] text-xs">{player.team}</p>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-black text-lg">{player.kills}</div>
                  <div className="text-[#5a5a6e] text-[10px] uppercase tracking-wider">kills</div>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-[#5a5a6e]">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" /> {player.avgKills} avg
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {player.participations} xtrs
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// COMPONENTE: Top Teams List
// ============================================================================

function TopTeamsSection({ teams }: { teams: Array<{ name: string; points: number; kills: number; wins: number; xtreinos: number }> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
            Rankings
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Top <span className="text-emerald-400">Equipes</span>
          </h2>
        </div>

        <div className="space-y-3">
          {teams.map((team, i) => (
            <motion.div
              key={team.name}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              className="group flex items-center gap-4 bg-[#12121a]/60 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                i === 1 ? 'bg-gray-400/20 text-gray-300' :
                i === 2 ? 'bg-amber-600/20 text-amber-500' :
                'bg-[#1a1a2e] text-[#5a5a6e]'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm sm:text-base truncate group-hover:text-emerald-400 transition-colors">
                  {team.name}
                </h3>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="text-white font-black">{team.points.toLocaleString('pt-BR')}</div>
                  <div className="text-[#5a5a6e] text-[10px] uppercase">pts</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-emerald-400 font-bold">{team.kills}</div>
                  <div className="text-[#5a5a6e] text-[10px] uppercase">kills</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-cyan-400 font-bold">{team.wins}</div>
                  <div className="text-[#5a5a6e] text-[10px] uppercase">wins</div>
                </div>
                <div className="text-center">
                  <div className="text-[#5a5a6e] font-bold">{team.xtreinos}</div>
                  <div className="text-[#5a5a6e] text-[10px] uppercase">xtrs</div>
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
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ExperiencePage() {
  const { scrollYProgress } = useScroll();
  const data = useExperienceData();

  // EFEITO CINEMA: A esfera diminui e fica transparente conforme rola
  const sphereScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.4]);
  const sphereOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -120]);

  const [scrambleTriggers, setScrambleTriggers] = useState<boolean[]>(new Array(features.length).fill(false));
  const [statsTrigger, setStatsTrigger] = useState(false);

  const stats = [
    { value: data.xtreinoStats.totalXtreinos, label: "XTreinos", icon: Swords, suffix: "" },
    { value: data.xtreinoStats.totalKills, label: "Kills Totais", icon: Crosshair, suffix: "" },
    { value: data.totalTeams, label: "Equipes", icon: Users, suffix: "" },
    { value: data.totalPlayers, label: "Players", icon: Trophy, suffix: "" },
  ];

  return (
    <MainLayout>
      <div className="relative bg-[#0a0a0f] overflow-x-hidden -mx-4 lg:-mx-8">
        <MouseTrailGlow />

        {/* HERO COM CINEMA SCROLL */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 z-0"
            style={{ scale: sphereScale, opacity: sphereOpacity }}
          >
            <Suspense fallback={<div className="w-full h-full bg-[#0a0a0f]" />}>
              <HolographicSphere />
            </Suspense>
          </motion.div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0a0a0f_80%)] z-[1] pointer-events-none" />

          <motion.div style={{ y: heroY }} className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" as const }} className="mb-6 sm:mb-8">
              <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {data.orgName} — A Nova Era do E-sports Mobile
              </span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" as const }} className="text-[15vw] sm:text-[12vw] md:text-[8vw] lg:text-8xl font-black text-white leading-[0.85] sm:leading-[0.9] tracking-tighter mb-6 sm:mb-8" style={{ textShadow: "0 0 80px rgba(16, 185, 129, 0.5)" }}>
              MAIS QUE <br className="sm:hidden" />UM <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-400">JOGO.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" as const }} className="text-base sm:text-lg md:text-xl text-[#6a6a7e] max-w-2xl mx-auto leading-relaxed px-2">
              Uma experiência imersiva onde dados, competição e tecnologia se encontram para redefinir o cenário competitivo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute bottom-[-60px] sm:bottom-[-80px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-[#3a3a4e] text-[10px] tracking-[0.3em] uppercase">Explore</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }}
                className="w-5 h-8 border-2 border-[#3a3a4e] rounded-full flex justify-center pt-1.5"
              >
                <div className="w-1 h-2 bg-emerald-500 rounded-full" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* FEATURES COM SCRAMBLE */}
        <section className="relative z-20 bg-[#0a0a0f] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
                Construída para dominar
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                Tecnologia de <span className="text-emerald-400">ponta</span>
              </h2>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              onViewportEnter={() => {
                features.forEach((_, i) => {
                  setTimeout(() => {
                    setScrambleTriggers(prev => {
                      const next = [...prev];
                      next[i] = true;
                      return next;
                    });
                  }, i * 150);
                });
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="group relative bg-[#12121a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] overflow-hidden h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-transparent group-hover:from-emerald-500/5 transition-all duration-500" />
                  <div className="relative z-10">
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

        {/* STATS COM MORPHING */}
        <section className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <motion.div
            className="max-w-7xl mx-auto py-16 sm:py-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            onViewportEnter={() => setStatsTrigger(true)}
          >
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
                Números que falam
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                Resultados <span className="text-emerald-400">reais</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 mb-4 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                    <stat.icon className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-2">
                    <MorphingNumber value={stat.value} trigger={statsTrigger} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm sm:text-base text-[#5a5a6e] font-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* TOP PLAYERS */}
        {data.topPlayers.length > 0 && <TopPlayersSection players={data.topPlayers} />}

        {/* TOP TEAMS */}
        {data.topTeams.length > 0 && <TopTeamsSection teams={data.topTeams} />}

        {/* MANTRA */}
        <section className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-16 sm:py-24 relative overflow-hidden text-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <h2 className="text-[20vw] sm:text-[14vw] md:text-[8vw] font-black text-[#12121a]" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.05)' }}>
                EVOLUÇÃO
              </h2>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" as const }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <p className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#f0f0f5] leading-tight max-w-4xl mx-auto tracking-tight">
                Não acompanhamos tendências. <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white">
                  Nós criamos o futuro.
                </span>
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}