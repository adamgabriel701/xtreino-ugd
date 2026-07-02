import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";
import { useXtreinoCalculations } from "@/hooks/useXtreinoCalculations";
import HeroSection from "../../components/Home/HeroSection";
import StatsBar from "../../components/Home/StatsBar";
import DetailedStats from "../../components/Home/DetailedStats";
import ActiveEvents from "../../components/Home/ActiveEvents";
import Highlights from "../../components/Home/Highlights";
import RankingsPreview from "../../components/Home/RankingsPreview";
import CallToAction from "../../components/Home/CallToAction";

export default function Home() {
  const { data: championships } = trpc.championships.list.useQuery({ status: "ativo" });
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery({ status: "aberto" });
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  const { data: allXtreinos } = trpc.xtreinos.list.useQuery(undefined);
  const { data: allChampionships } = trpc.championships.list.useQuery(undefined);
  const { data: allScrims } = trpc.scrims.list.useQuery(undefined);
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  
  const { data: scrimTeamAllTime } = trpc.scrims.teamResultsAllTimeBR.useQuery();

  const { teamRanking, teamPlayersGrouped } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

  const utils = trpc.useUtils();
  const recalculateMutation = trpc.rankings.recalculate.useMutation({
    onSuccess: () => {
      utils.rankings.teams.invalidate();
      utils.rankings.players.invalidate();
    },
  });

  const xtreinoStats = {
    total: allXtreinos?.length ?? 0,
    abertos: allXtreinos?.filter((x) => x.status === "aberto" || !x.status).length ?? 0,
    emAndamento: allXtreinos?.filter((x) => x.status === "em_andamento").length ?? 0,
    fechados: allXtreinos?.filter((x) => x.status === "fechado").length ?? 0,
  };

  const championshipStats = {
    total: allChampionships?.length ?? 0,
    ativos: allChampionships?.filter((c) => c.status === "ativo" || !c.status).length ?? 0,
    inscricoes: allChampionships?.filter((c) => c.status === "inscricoes").length ?? 0,
    encerrados: allChampionships?.filter((c) => c.status === "encerrado").length ?? 0,
  };

  const scrimStats = {
    total: allScrims?.length ?? 0,
    agendados: allScrims?.filter((s) => s.status === "agendado" || !s.status).length ?? 0,
    emAndamento: allScrims?.filter((s) => s.status === "em_andamento").length ?? 0,
    finalizados: allScrims?.filter((s) => s.status === "finalizado").length ?? 0,
  };

  const xtreinoRealStats = useMemo(() => {
    if (!teamRanking || teamRanking.length === 0) return { totalTeams: 0, totalKills: 0, totalPoints: 0, totalXtreinos: 0 };
    return {
      totalTeams: teamRanking.length,
      totalKills: teamRanking.reduce((acc, t) => acc + t.totalKills, 0),
      totalPoints: teamRanking.reduce((acc, t) => acc + t.totalPoints, 0),
      totalXtreinos: teamRanking.reduce((acc, t) => acc + t.xtreinosPlayed, 0),
    };
  }, [teamRanking]);

  const scrimRealStats = useMemo(() => {
    if (!scrimTeamAllTime || scrimTeamAllTime.length === 0) return { totalTeams: 0, totalKills: 0, totalPoints: 0, totalScrims: 0 };
    return {
      totalTeams: scrimTeamAllTime.length,
      totalKills: scrimTeamAllTime.reduce((acc, t) => acc + (t.totalKills || 0), 0),
      totalPoints: scrimTeamAllTime.reduce((acc, t) => acc + (t.totalPoints || 0), 0),
      totalScrims: scrimTeamAllTime.reduce((acc, t) => acc + (t.matches || 0), 0),
    };
  }, [scrimTeamAllTime]);

  const upcomingEvents = useMemo(() => {
    return [
      ...(allXtreinos?.map((x) => ({ id: x.id, name: x.name, date: x.date || "Data não definida", type: "xtreino" as const, modality: x.modality || "", status: x.status || "aberto" })) || []),
      ...(allChampionships?.map((c) => ({ id: c.id + 10000, name: c.name, date: c.startDate || "Data não definida", type: "championship" as const, modality: c.modality || "", status: c.status || "ativo" })) || []),
      ...(allScrims?.map((s) => ({ id: s.id + 20000, name: s.name, date: s.date || "Data não definida", type: "scrim" as const, modality: s.modality || "", status: s.status || "agendado" })) || []),
    ].filter((e) => e.status !== "encerrado" && e.status !== "fechado" && e.status !== "finalizado")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [allXtreinos, allChampionships, allScrims]);

  const recentActivities = useMemo(() => {
    const activities: Array<{ id: number; text: string; time: string; type: "match" | "result" | "registration" | "ranking" }> = [];
    if (teamRanking && teamRanking.length > 0) {
      const recentXtreinos = new Map<string, { date: string; teamName: string; totalPoints: number }>();
      for (const team of teamRanking.slice(0, 5)) {
        for (const xt of team.xtreinos.slice(-1)) {
          const key = `${xt.date}-${team.teamName}`;
          if (!recentXtreinos.has(key)) recentXtreinos.set(key, { date: xt.date, teamName: team.teamName, totalPoints: xt.totalPoints });
        }
      }
      Array.from(recentXtreinos.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).forEach((xt) => {
        activities.push({ id: activities.length + 1, text: `"${xt.teamName}" marcou ${xt.totalPoints} pts`, time: xt.date, type: "result" });
      });
    }
    if (allChampionships && allChampionships.length > 0) {
      allChampionships.slice(-2).forEach((champ) => {
        activities.push({
          id: activities.length + 1,
          text: `Camp. "${champ.name}" ${champ.status === "ativo" ? "iniciado" : champ.status === "inscricoes" ? "com inscrições abertas" : "encerrado"}`,
          time: champ.startDate || "Recente",
          type: champ.status === "encerrado" ? "result" : "registration",
        });
      });
    }
    return activities.slice(0, 5);
  }, [teamRanking, allChampionships]);

  const topXtreinoPlayers = useMemo(() => {
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
    return Array.from(playerMap.values()).sort((a, b) => b.totalKills - a.totalKills).slice(0, 3).map((p) => ({ name: p.playerName, entityName: p.playerName, points: p.totalKills, kills: p.totalKills, wins: p.participations }));
  }, [teamPlayersGrouped]);

  const xtreinoRankingFallback = useMemo(() => {
    if (!teamRanking || teamRanking.length === 0) return [];
    return teamRanking.map((t, i) => ({ id: i + 1, entityName: t.teamName, points: t.totalPoints, kills: t.totalKills, wins: t.top1Count })).sort((a, b) => b.points - a.points);
  }, [teamRanking]);

  const scrimRankingFallback = useMemo(() => {
    if (!scrimTeamAllTime || scrimTeamAllTime.length === 0) return [];
    return scrimTeamAllTime.map((t, i) => ({ id: i + 1, entityName: t.teamName, points: t.totalPoints || 0, kills: t.totalKills || 0, wins: t.wins || 0 })).sort((a, b) => b.points - a.points);
  }, [scrimTeamAllTime]);

  return (
    <MainLayout>
      <style>{`
        /* Tech Grid de Fundo */
        .tech-grid-bg {
          background-image: linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
        }

        /* Animações de Entrada */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { opacity: 0; animation: fadeUp 0.6s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }

        /* Neon Glow por Categoria */
        @keyframes neon-pulse-emerald {
          0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.1), inset 0 0 5px rgba(16, 185, 129, 0.05); }
          50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 10px rgba(16, 185, 129, 0.1); }
        }
        @keyframes neon-pulse-blue {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.1), inset 0 0 5px rgba(59, 130, 246, 0.05); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2), inset 0 0 10px rgba(59, 130, 246, 0.1); }
        }
        @keyframes neon-pulse-amber {
          0%, 100% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.1), inset 0 0 5px rgba(245, 158, 11, 0.05); }
          50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.2), inset 0 0 10px rgba(245, 158, 11, 0.1); }
        }
        .neon-emerald { animation: neon-pulse-emerald 3s ease-in-out infinite; }
        .neon-blue { animation: neon-pulse-blue 4s ease-in-out infinite; }
        .neon-amber { animation: neon-pulse-amber 3.5s ease-in-out infinite; }

        /* Chromatic Aberration no Header */
        @keyframes chromatic-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        /* Bounce no Contador */
        .counter-bounce { transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

        /* Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3a3a4e; }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.1); }
          50% { box-shadow: 0 0 40px rgba(16,185,129,0.2); }
        }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      {/* MELHORIA 5: FUNDO TECH GRID GLOBAL */}
      <div className="fixed inset-0 -z-10 w-full h-full bg-[#0a0a0f] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 tech-grid-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />
      </div>

      <section className="w-full bg-[#0a0a0f]/80 relative">
        <div className="w-full max-w-[1920px] mx-auto relative">
          <img src="/banner.jpg" alt="Underground Banner" className="w-full h-auto object-cover" style={{ aspectRatio: "2 / 1" }} loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-transparent" />
        </div>
      </section>

      <HeroSection orgName={settings?.orgName ?? "Underground"} />
      <StatsBar teams={teamsList?.length ?? 0} players={playersList?.length ?? 0} xtreinos={xtreinoStats} championships={championshipStats} />
      
      <DetailedStats 
        xtreinoStats={xtreinoStats} 
        championshipStats={championshipStats} 
        scrimStats={scrimStats} 
        xtreinoRealStats={xtreinoRealStats}
        scrimRealStats={scrimRealStats} 
      />

      <ActiveEvents championships={championships} xtreinosList={xtreinosList} />
      
      <Highlights 
        topPlayers={topXtreinoPlayers} 
        upcomingEvents={upcomingEvents} 
        recentActivities={recentActivities} 
      />
      
      <RankingsPreview 
        onRecalculate={() => recalculateMutation.mutate()} 
        isRecalculating={recalculateMutation.isPending}
        xtreinoFallback={xtreinoRankingFallback}
        scrimFallback={scrimRankingFallback}
      />
      
      <CallToAction />
    </MainLayout>
  );
}