// ==================== HOME PAGE ====================
import { Link } from "react-router";
import {
  Trophy,
  Dumbbell,
  Users,
  UserCircle,
  TrendingUp,
  Calendar,
  ChevronRight,
  Swords,
  Loader2,
  RefreshCw,
  Zap,
  Target,
  Shield,
  Activity,
  Clock,
  Flame,
  Medal,
  BarChart3,
  ArrowUpRight,
  Eye,
  Crown,
  Star,
  Timer,
  Radio,
  AlertCircle,
  Sparkles,
  type LucideProps,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";
import { useState, useMemo, useEffect, useRef } from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { useXtreinoCalculations } from "@/hooks/useXtreinoCalculations";

type RankCategory = "xtreino" | "campeonato" | "scrim";

type ChampionshipItem = {
  id: number;
  name: string;
  modality: string;
  format: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  rules: string | null;
  prizePool: string | null;
  maxTeams: number;
  registeredTeams: number;
  bracketData: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ScrimItem = {
  id: number;
  name: string;
  team1Id: number | null;
  team2Id: number | null;
  team1Name: string | null;
  team2Name: string | null;
  team1Tag: string | null;
  team2Tag: string | null;
  date: string | null;
  time: string | null;
  modality: string | null;
  status: string | null;
  result: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

interface StatusConfig {
  bg: string;
  text: string;
  border: string;
  label: string;
  icon: LucideIcon;
}

// ==================== HOOK: Contagem Animada ====================
function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ==================== COMPONENTES DE UI ====================

const StatusBadge = ({ status, type }: { status: string; type: "champ" | "xtreino" | "scrim" }) => {
  const champConfigs: Record<string, StatusConfig> = {
    ativo: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "Ativo", icon: Radio },
    inscricoes: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Inscrições", icon: AlertCircle },
    encerrado: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Encerrado", icon: Clock },
  };

  const xtreinoConfigs: Record<string, StatusConfig> = {
    aberto: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "Aberto", icon: Radio },
    em_andamento: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Em Andamento", icon: Timer },
    fechado: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Fechado", icon: Clock },
  };

  const scrimConfigs: Record<string, StatusConfig> = {
    agendado: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", label: "Agendado", icon: Calendar },
    em_andamento: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Em Andamento", icon: Timer },
    finalizado: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Finalizado", icon: Clock },
  };

  let config: StatusConfig;
  if (type === "champ") config = champConfigs[status] || champConfigs.ativo;
  else if (type === "xtreino") config = xtreinoConfigs[status] || xtreinoConfigs.aberto;
  else config = scrimConfigs[status] || scrimConfigs.agendado;

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const StatCard = ({ label, value, icon: Icon, trend }: { label: string; value: number; icon: LucideIcon; trend?: number }) => {
  const { count, ref } = useAnimatedCounter(value);
  return (
    <div ref={ref} className="bg-[#12121a] rounded-xl p-5 border border-[#2a2a3a] hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-500" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
            <Icon className="w-5 h-5 text-emerald-400" />
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
              trend >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
            }`}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3 rotate-180" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-[#f0f0f5] mb-1 tabular-nums">{count}</p>
        <p className="text-[#8a8a9e] text-sm">{label}</p>
      </div>
    </div>
  );
};

const FeaturedPlayerCard = ({ player, rank }: { player: { name?: string; entityName?: string; points: number; kills?: number; wins?: number }; rank: number }) => {
  const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
  const rankBgs = ["from-yellow-500/20 to-yellow-600/5", "from-gray-400/15 to-gray-500/5", "from-amber-500/15 to-amber-600/5"];
  const rankIcons = [Crown, Medal, Star];
  const RankIcon = rankIcons[rank - 1] || Medal;

  return (
    <div className={`bg-gradient-to-br ${rankBgs[rank - 1] || "from-transparent to-transparent"} rounded-xl border border-[#2a2a3a] p-4 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 group`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border-2 border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-400/50 transition-colors">
            <UserCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#0a0a0f] border border-[#2a2a3a] flex items-center justify-center ${rankColors[rank - 1] || "text-[#5a5a6e]"}`}>
            <RankIcon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[#f0f0f5] font-bold text-sm truncate group-hover:text-emerald-400 transition-colors">{player.name || player.entityName}</h4>
          <p className="text-emerald-400 text-xs font-semibold">{player.points} pts</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[#5a5a6e] text-xs flex items-center gap-1">
              <Target className="w-3 h-3" />{player.kills ?? 0}K
            </span>
            <span className="text-[#5a5a6e] text-xs flex items-center gap-1">
              <Trophy className="w-3 h-3" />{player.wins ?? 0}V
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== PARTÍCULAS DECORATIVAS ANIMADAS ====================
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[
      { top: "15%", left: "10%", size: 3, delay: 0, duration: 4 },
      { top: "25%", right: "15%", size: 2, delay: 0.8, duration: 5 },
      { top: "60%", left: "20%", size: 2.5, delay: 1.5, duration: 4.5 },
      { top: "40%", right: "25%", size: 1.5, delay: 2, duration: 6 },
      { top: "75%", left: "40%", size: 2, delay: 0.5, duration: 3.5 },
      { top: "20%", left: "60%", size: 1.5, delay: 1.2, duration: 5.5 },
      { top: "55%", right: "10%", size: 3, delay: 2.5, duration: 4 },
      { top: "80%", right: "35%", size: 2, delay: 0.3, duration: 5 },
    ].map((p, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-emerald-400/20"
        style={{
          top: p.top,
          left: p.left,
          right: p.right,
          width: p.size,
          height: p.size,
          animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
        }}
      />
    ))}
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
        50% { transform: translateY(-15px) scale(1.3); opacity: 0.7; }
      }
    `}</style>
  </div>
);

// ==================== PÁGINA PRINCIPAL ====================

export default function Home() {
  const [teamRankType, setTeamRankType] = useState<RankCategory>("xtreino");
  const [playerRankType, setPlayerRankType] = useState<RankCategory>("xtreino");

  const { data: championships } = trpc.championships.list.useQuery({ status: "ativo" });
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery({ status: "aberto" });
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  const { data: allXtreinos } = trpc.xtreinos.list.useQuery({});
  const { data: allChampionships } = trpc.championships.list.useQuery({});
  const { data: allScrims } = trpc.scrims.list.useQuery();

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();

  const { teamRanking, teamPlayersGrouped } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

  const {
    data: allTeamRankings,
    isLoading: isLoadingTeamRankings,
    isError: isErrorTeamRankings,
  } = trpc.rankings.teams.useQuery({ limit: 50, rankType: teamRankType });

  const {
    data: allPlayerRankings,
    isLoading: isLoadingPlayerRankings,
    isError: isErrorPlayerRankings,
  } = trpc.rankings.players.useQuery({ limit: 50, rankType: playerRankType });

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
    if (!teamRanking || teamRanking.length === 0) {
      return { totalTeams: 0, totalKills: 0, totalPosPoints: 0, totalPoints: 0, totalXtreinos: 0, topTeams: [] as typeof teamRanking };
    }
    return {
      totalTeams: teamRanking.length,
      totalKills: teamRanking.reduce((acc, t) => acc + t.totalKills, 0),
      totalPosPoints: teamRanking.reduce((acc, t) => acc + t.totalPosPoints, 0),
      totalPoints: teamRanking.reduce((acc, t) => acc + t.totalPoints, 0),
      totalXtreinos: teamRanking.reduce((acc, t) => acc + t.xtreinosPlayed, 0),
      topTeams: teamRanking.slice(0, 3),
    };
  }, [teamRanking]);

  const upcomingEvents = [
    ...(allXtreinos?.map((x) => ({
      id: x.id, name: x.name, date: x.date || "Data não definida",
      type: "xtreino" as const, modality: x.modality, status: x.status || "aberto",
    })) || []),
    ...(allChampionships?.map((c) => ({
      id: c.id + 10000, name: c.name, date: c.startDate || "Data não definida",
      type: "championship" as const, modality: c.modality, status: c.status || "ativo",
    })) || []),
    ...(allScrims?.map((s) => ({
      id: s.id + 20000, name: s.name, date: s.date || "Data não definida",
      type: "scrim" as const, modality: s.modality, status: s.status || "agendado",
    })) || []),
  ]
    .filter((e) => e.status !== "encerrado" && e.status !== "fechado" && e.status !== "finalizado")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

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
          activities.push({
            id: activities.length + 1,
            text: `"${xt.teamName}" marcou ${xt.totalPoints} pts`,
            time: xt.date,
            type: "result",
          });
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

  const stats = [
    { label: "Equipes", value: teamsList?.length ?? 0, icon: Users, trend: 12 },
    { label: "Jogadores", value: playersList?.length ?? 0, icon: UserCircle, trend: 8 },
    { label: "XTreinos", value: xtreinoStats.total, icon: Dumbbell, trend: xtreinoStats.abertos > 0 ? 25 : 0 },
    { label: "Campeonatos", value: championshipStats.total, icon: Trophy, trend: championshipStats.ativos > 0 ? 15 : 0 },
  ];

  const rankTabs: { key: RankCategory; label: string; icon: LucideIcon }[] = [
    { key: "xtreino", label: "XTreinos", icon: Dumbbell },
    { key: "campeonato", label: "Campeonatos", icon: Trophy },
    { key: "scrim", label: "Scrims", icon: Swords },
  ];

  const RankTab = ({ active, onClick, label, icon: Icon }: { active: boolean; onClick: () => void; label: string; icon: LucideIcon }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10" : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );

  const RankList = ({
    rankings, type, isLoading, isError,
  }: {
    rankings: Array<{ id: number; entityName: string; points: number; kills?: number; wins?: number }> | undefined;
    type: "team" | "player"; isLoading: boolean; isError: boolean;
  }) => {
    if (isLoading) return (
      <div className="px-6 py-8 flex items-center justify-center gap-2 text-[#5a5a6e] text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />Carregando ranking...
      </div>
    );
    if (isError) return (
      <div className="px-6 py-8 text-center text-red-400 text-sm">Erro ao carregar ranking.</div>
    );
    if (!rankings || rankings.length === 0) return (
      <div className="px-6 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#1a1a24] flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-[#3a3a4e]" />
        </div>
        <p className="text-[#5a5a6e] text-sm mb-2">Sem dados para este modo</p>
        <p className="text-[#5a5a6e] text-xs">Adicione resultados para gerar o ranking.</p>
      </div>
    );

    return (
      <div className="divide-y divide-[#2a2a3a] max-h-[380px] overflow-y-auto custom-scrollbar">
        {rankings.map((r, i) => (
          <div key={r.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#1a1a24]/80 transition-colors group">
            <span className={`w-8 text-center font-bold flex items-center justify-center ${
              i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-[#5a5a6e]"
            }`}>
              {i < 3 ? <Crown className="w-4 h-4" /> : <span className="text-sm">{i + 1}</span>}
            </span>
            <span className="flex-1 text-[#f0f0f5] font-medium text-sm group-hover:text-emerald-400 transition-colors truncate">{r.entityName}</span>
            <span className="text-emerald-400 text-sm font-semibold tabular-nums">{r.points} pts</span>
            {type === "team" && <span className="text-[#5a5a6e] text-xs tabular-nums">{r.wins ?? 0}V</span>}
            {type === "player" && <span className="text-[#5a5a6e] text-xs tabular-nums">{r.kills ?? 0}K</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      {/* Scrollbar customizada global */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3a3a4e; }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.1); }
          50% { box-shadow: 0 0 40px rgba(16,185,129,0.2); }
        }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      {/* Banner Section com overlay */}
      <section className="w-full bg-[#0a0a0f] relative">
        <div className="w-full max-w-[1920px] mx-auto relative">
          <img src="/banner.jpg" alt="Underground Banner" className="w-full h-auto object-cover" style={{ aspectRatio: "2 / 1" }} loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-transparent" />
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden -mt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/50 via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.1)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.06)_0%,_transparent_50%)]" />
        <FloatingParticles />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            Temporada 2026 em andamento
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
              {settings?.orgName ?? "Underground"}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-[#8a8a9e] mb-10 max-w-2xl mx-auto leading-relaxed">
            Sistema completo de <span className="text-emerald-400 font-medium">XTreinos</span>,{" "}
            <span className="text-emerald-400 font-medium">Scrims</span> e{" "}
            <span className="text-emerald-400 font-medium">Campeonatos</span> Mobile.
            Gerencie equipes, acompanhe rankings e organize competições.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/campeonatos"
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-200 hover:scale-[1.03] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Ver Campeonatos
            </Link>
            <Link
              to="/xtreinos"
              className="px-8 py-3.5 rounded-xl bg-[#12121a] border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-[#1a1a24] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Dumbbell className="w-4 h-4" />
              Ver XTreinos
            </Link>
            <Link
              to="/rankings"
              className="px-8 py-3.5 rounded-xl bg-[#12121a] border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-[#1a1a24] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Rankings
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-[#2a2a3a] bg-[#12121a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} trend={stat.trend} />
            ))}
          </div>
        </div>
      </section>

      {/* Estatísticas Detalhadas */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Estatísticas Detalhadas</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* XTreinos */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden hover:border-emerald-500/20 transition-colors">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-[#f0f0f5]">XTreinos</h3>
                <p className="text-[#5a5a6e] text-xs">{xtreinoStats.total} eventos · {xtreinoRealStats.totalXtreinos} resultados</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { value: xtreinoStats.abertos, label: "Abertos", color: "text-emerald-400" },
                { value: xtreinoStats.emAndamento, label: "Em Andamento", color: "text-amber-400" },
                { value: xtreinoStats.fechados, label: "Fechados", color: "text-red-400" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className={`text-2xl font-bold ${item.color} tabular-nums`}>{item.value}</p>
                  <p className="text-[#5a5a6e] text-xs mt-1">{item.label}</p>
                </div>
              ))}
            </div>
            {xtreinoRealStats.totalTeams > 0 && (
              <div className="px-6 pb-5 border-t border-[#2a2a3a]/50">
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-center p-2 rounded-lg bg-[#1a1a24]/50">
                    <p className="text-lg font-bold text-green-400 tabular-nums">{xtreinoRealStats.totalKills}</p>
                    <p className="text-[#5a5a6e] text-[10px]">Kills Totais</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-[#1a1a24]/50">
                    <p className="text-lg font-bold text-yellow-400 tabular-nums">{xtreinoRealStats.totalPoints}</p>
                    <p className="text-[#5a5a6e] text-[10px]">Pontos Totais</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campeonatos */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden hover:border-emerald-500/20 transition-colors">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-[#f0f0f5]">Campeonatos</h3>
                <p className="text-[#5a5a6e] text-xs">{championshipStats.total} total</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { value: championshipStats.ativos, label: "Ativos", color: "text-emerald-400" },
                { value: championshipStats.inscricoes, label: "Inscrições", color: "text-amber-400" },
                { value: championshipStats.encerrados, label: "Encerrados", color: "text-red-400" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className={`text-2xl font-bold ${item.color} tabular-nums`}>{item.value}</p>
                  <p className="text-[#5a5a6e] text-xs mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scrims */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden hover:border-emerald-500/20 transition-colors">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Swords className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-[#f0f0f5]">Scrims</h3>
                <p className="text-[#5a5a6e] text-xs">{scrimStats.total} total</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { value: scrimStats.agendados, label: "Agendados", color: "text-emerald-400" },
                { value: scrimStats.emAndamento, label: "Em Andamento", color: "text-amber-400" },
                { value: scrimStats.finalizados, label: "Finalizados", color: "text-red-400" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className={`text-2xl font-bold ${item.color} tabular-nums`}>{item.value}</p>
                  <p className="text-[#5a5a6e] text-xs mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Eventos Ativos */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Eventos Ativos</h2>
          <span className="ml-auto text-sm text-[#5a5a6e] bg-[#12121a] px-3 py-1 rounded-full border border-[#2a2a3a]">
            {((championships?.length ?? 0) + (xtreinosList?.length ?? 0))} eventos
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {championships?.slice(0, 2).map((champ) => (
            <div key={champ.id} className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                  <Trophy className="w-6 h-6 text-emerald-400" />
                </div>
                <StatusBadge status={champ.status || "ativo"} type="champ" />
              </div>
              <h3 className="text-lg font-bold text-[#f0f0f5] mb-2 group-hover:text-emerald-400 transition-colors">{champ.name}</h3>
              <div className="flex items-center gap-2 text-sm text-[#8a8a9e] mb-1">
                <Target className="w-4 h-4" />Modo: {champ.modality?.toUpperCase()}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#8a8a9e] mb-4">
                <Users className="w-4 h-4" />{champ.registeredTeams}/{champ.maxTeams} equipes
              </div>
              <div className="w-full bg-[#1a1a24] rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((champ.registeredTeams / champ.maxTeams) * 100, 100)}%` }}
                />
              </div>
              <Link to="/campeonatos" className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-medium group/link">
                Ver detalhes <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}

          {xtreinosList?.slice(0, 1).map((xt) => (
            <div key={xt.id} className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                  <Dumbbell className="w-6 h-6 text-emerald-400" />
                </div>
                <StatusBadge status={xt.status || "aberto"} type="xtreino" />
              </div>
              <h3 className="text-lg font-bold text-[#f0f0f5] mb-2 group-hover:text-emerald-400 transition-colors">{xt.name}</h3>
              <div className="flex items-center gap-2 text-sm text-[#8a8a9e] mb-1">
                <Calendar className="w-4 h-4" />{xt.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#8a8a9e] mb-4">
                <Target className="w-4 h-4" />Modo: {xt.modality?.toUpperCase()}
              </div>
              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                  <Flame className="w-3 h-3 inline mr-1" />Em alta
                </span>
              </div>
              <Link to="/xtreinos" className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-medium group/link">
                Ver detalhes <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}

          {/* Card placeholder se poucos eventos */}
          {(!championships || championships.length < 2) && (!xtreinosList || xtreinosList.length === 0) && (
            <div className="bg-[#12121a] rounded-xl border border-dashed border-[#2a2a3a] p-6 flex flex-col items-center justify-center text-center min-h-[220px]">
              <div className="w-14 h-14 rounded-full bg-[#1a1a24] flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7 text-[#3a3a4e]" />
              </div>
              <p className="text-[#5a5a6e] text-sm mb-3">Nenhum evento ativo no momento</p>
              <Link to="/campeonatos" className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">
                Ver todos os eventos →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Destaques - Layout Assimétrico */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Destaques</h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Top 3 Jogadores - Largura maior */}
          <div className="lg:col-span-5">
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden h-full">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-2">
                <Crown className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-[#f0f0f5]">Top Jogadores — XTreinos</h3>
              </div>
              <div className="p-4 space-y-3">
                {topXtreinoPlayers.length > 0 ? (
                  topXtreinoPlayers.map((player, idx) => (
                    <FeaturedPlayerCard key={player.name} player={player} rank={idx + 1} />
                  ))
                ) : allPlayerRankings && allPlayerRankings.length > 0 ? (
                  allPlayerRankings.slice(0, 3).map((player, idx) => (
                    <FeaturedPlayerCard key={player.id} player={player} rank={idx + 1} />
                  ))
                ) : (
                  <div className="text-center py-10 text-[#5a5a6e] text-sm">
                    <Medal className="w-8 h-8 mx-auto mb-3 text-[#3a3a4e]" />
                    Nenhum jogador no ranking ainda
                  </div>
                )}
              </div>
              <div className="px-6 py-3 border-t border-[#2a2a3a]">
                <Link to="/rankings" className="flex items-center justify-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-medium group/link">
                  Ver ranking completo <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Próximos Eventos + Atividade Recente empilhados */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Próximos Eventos */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-[#f0f0f5]">Próximos Eventos</h3>
              </div>
              {upcomingEvents.length > 0 ? (
                <div className="divide-y divide-[#2a2a3a] max-h-[200px] overflow-y-auto custom-scrollbar">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#1a1a24]/80 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        {event.type === "championship" ? <Trophy className="w-5 h-5 text-amber-400" /> : event.type === "scrim" ? <Swords className="w-5 h-5 text-blue-400" /> : <Dumbbell className="w-5 h-5 text-emerald-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#f0f0f5] text-sm font-medium truncate">{event.name}</p>
                        <p className="text-[#5a5a6e] text-xs">{event.modality?.toUpperCase()}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-emerald-400 text-xs font-semibold">{event.date}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${
                          event.type === "championship" ? "bg-amber-500/10 text-amber-400" : event.type === "scrim" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {event.type === "championship" ? "Camp." : event.type === "scrim" ? "Scrim" : "XTreino"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-[#3a3a4e]" />
                  <p className="text-[#5a5a6e] text-sm">Nenhum evento próximo</p>
                </div>
              )}
            </div>

            {/* Atividade Recente - Timeline */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden flex-1">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-[#f0f0f5]">Atividade Recente</h3>
              </div>
              {recentActivities.length > 0 ? (
                <div className="p-4 space-y-0">
                  {recentActivities.map((activity, idx) => {
                    const typeIcons: Record<string, LucideIcon> = { match: Swords, result: Trophy, registration: Users, ranking: TrendingUp };
                    const Icon = typeIcons[activity.type] || Activity;
                    const isLast = idx === recentActivities.length - 1;
                    return (
                      <div key={activity.id} className="flex gap-3 group">
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                            <Icon className="w-4 h-4 text-emerald-400" />
                          </div>
                          {!isLast && <div className="w-px flex-1 bg-[#2a2a3a] my-1" />}
                        </div>
                        <div className={`flex-1 min-w-0 ${!isLast ? "pb-4" : ""}`}>
                          <p className="text-[#f0f0f5] text-sm leading-relaxed">{activity.text}</p>
                          <p className="text-[#5a5a6e] text-xs mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-[#3a3a4e]" />
                  <p className="text-[#5a5a6e] text-sm">Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Rankings Preview */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-14">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-emerald-500 rounded-full" />
            <h2 className="text-2xl font-bold text-[#f0f0f5]">Rankings</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/rankings" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:border-emerald-500/30 hover:text-emerald-400 transition-all">
              <Eye className="w-3.5 h-3.5" />Ver Completo
            </Link>
            <button
              onClick={() => recalculateMutation.mutate()}
              disabled={recalculateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            >
              {recalculateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {recalculateMutation.isPending ? "Recalculando..." : "Recalcular"}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="font-bold text-[#f0f0f5]">Top Equipes</h3>
              </div>
              <div className="flex gap-2">
                {rankTabs.map((tab) => (
                  <RankTab key={tab.key} active={teamRankType === tab.key} onClick={() => setTeamRankType(tab.key)} label={tab.label} icon={tab.icon} />
                ))}
              </div>
            </div>
            <RankList rankings={allTeamRankings} type="team" isLoading={isLoadingTeamRankings} isError={isErrorTeamRankings} />
          </div>

          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <UserCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="font-bold text-[#f0f0f5]">Top Jogadores</h3>
              </div>
              <div className="flex gap-2">
                {rankTabs.map((tab) => (
                  <RankTab key={tab.key} active={playerRankType === tab.key} onClick={() => setPlayerRankType(tab.key)} label={tab.label} icon={tab.icon} />
                ))}
              </div>
            </div>
            <RankList rankings={allPlayerRankings} type="player" isLoading={isLoadingPlayerRankings} isError={isErrorPlayerRankings} />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-emerald-900/20 via-[#12121a] to-emerald-900/20 rounded-2xl border border-emerald-500/20 p-8 md:p-12 text-center relative overflow-hidden animate-pulse-glow">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.1)_0%,_transparent_70%)]" />
          {/* Decoração de fundo */}
          <div className="absolute top-0 left-1/4 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#f0f0f5] mb-3">Pronto para competir?</h2>
            <p className="text-[#8a8a9e] mb-8 max-w-lg mx-auto">
              Cadastre sua equipe, participe de xtreinos e campeonatos, e suba no ranking da liga.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/equipes" className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-200 hover:scale-[1.03] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />Gerenciar Equipes
              </Link>
              <Link to="/jogadores" className="px-8 py-3.5 rounded-xl bg-[#1a1a24] border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-200 flex items-center justify-center gap-2">
                <UserCircle className="w-4 h-4" />Ver Jogadores
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}