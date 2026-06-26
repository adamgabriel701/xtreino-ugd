import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";
import { useXtreinoCalculations } from "@/hooks/useXtreinoCalculations";
import HeroSection from "./components/HeroSection";
import StatsBar from "./components/StatsBar";
import DetailedStats from "./components/DetailedStats";
import ActiveEvents from "./components/ActiveEvents";
import Highlights from "./components/Highlights";
import RankingsPreview from "./components/RankingsPreview";
import CallToAction from "./components/CallToAction";

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
  
  // CORRIGIDO 1: Passando objeto vazio {} em vez de undefined
  // CORRIGIDO 2: Usando teamResultsAllTimeBR que já retorna os dados totalizados
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

  // CORRIGIDO 3: Usando os dados da query correta que possui totalKills, totalPoints e matches
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

  const upcomingEvents = useMemo(() => {
    return [
      ...(allXtreinos?.map((x) => ({ id: x.id, name: x.name, date: x.date || "Data não definida", type: "xtreino" as const, modality: x.modality || "", status: x.status || "aberto" })) || []),
      ...(allChampionships?.map((c) => ({ id: c.id + 10000, name: c.name, date: c.startDate || "Data não definida", type: "championship" as const, modality: c.modality || "", status: c.status || "ativo" })) || []),
      ...(allScrims?.map((s) => ({ id: s.id + 20000, name: s.name, date: s.date || "Data não definida", type: "scrim" as const, modality: s.modality || "", status: s.status || "agendado" })) || []),
    ]
      .filter((e) => e.status !== "encerrado" && e.status !== "fechado" && e.status !== "finalizado")
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
      Array.from(recentXtreinos.values())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .forEach((xt) => {
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
    return Array.from(playerMap.values())
      .sort((a, b) => b.totalKills - a.totalKills)
      .slice(0, 3)
      .map((p) => ({ name: p.playerName, entityName: p.playerName, points: p.totalKills, kills: p.totalKills, wins: p.participations }));
  }, [teamPlayersGrouped]);

  return (
    <MainLayout>
      <style>{`
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

      <section className="w-full bg-[#0a0a0f] relative">
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
      
      {/* CORRIGIDO 4: Removida a prop fallbackPlayers que o componente não aceita mais */}
      <Highlights 
        topPlayers={topXtreinoPlayers} 
        upcomingEvents={upcomingEvents} 
        recentActivities={recentActivities} 
      />
      
      <RankingsPreview 
        onRecalculate={() => recalculateMutation.mutate()} 
        isRecalculating={recalculateMutation.isPending} 
      />
      
      <CallToAction />
    </MainLayout>
  );
}