import { Link } from "react-router";
import { useState, useMemo } from "react";
import { TrendingUp, UserCircle, Eye, RefreshCw, Loader2, Dumbbell, Trophy, Swords } from "lucide-react";
import { trpc } from "@/providers/trpc";
import RankTab from "./RankTab";
import RankList from "./RankList";
import type { LucideIcon, RankCategory } from "../types";

interface RankingsPreviewProps {
  onRecalculate: () => void;
  isRecalculating: boolean;
  scrimFallback?: Array<{ id: number; entityName: string; points: number; kills?: number; wins?: number }>;
}

export default function RankingsPreview({
  onRecalculate,
  isRecalculating,
  scrimFallback = [],
}: RankingsPreviewProps) {
  const [teamRankType, setTeamRankType] = useState<RankCategory>("xtreino");
  const [playerRankType, setPlayerRankType] = useState<RankCategory>("xtreino");

  const { data: allTeamRankings, isLoading: isLoadingTeamRankings } = trpc.rankings.teams.useQuery({ 
    limit: 50, 
    rankType: teamRankType 
  });
  
  const { data: allPlayerRankings, isLoading: isLoadingPlayerRankings } = trpc.rankings.players.useQuery({ 
    limit: 50, 
    rankType: playerRankType 
  });

  // LÓGICA FALLBACK: Se a query do backend voltar vazia para Scrim, usa o scrimFallback calculado na página
  const finalTeamRankings = useMemo(() => {
    if (teamRankType === "scrim" && (!allTeamRankings || allTeamRankings.length === 0) && scrimFallback.length > 0) {
      return scrimFallback;
    }
    return allTeamRankings;
  }, [allTeamRankings, teamRankType, scrimFallback]);

  const finalPlayerRankings = useMemo(() => {
    // Para jogadores de scrim, por enquanto deixamos vazio ou você pode adicionar lógica similar no futuro
    return allPlayerRankings;
  }, [allPlayerRankings]);

  const rankTabs: { key: RankCategory; label: string; icon: LucideIcon }[] = [
    { key: "xtreino", label: "XTreinos", icon: Dumbbell },
    { key: "campeonato", label: "Campeonatos", icon: Trophy },
    { key: "scrim", label: "Scrims", icon: Swords },
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-14">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Rankings</h2>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/rankings" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-white/5 backdrop-blur text-[#8a8a9e] border border-white/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all">
            <Eye className="w-3.5 h-3.5" />Ver Completo
          </Link>
          <button onClick={onRecalculate} disabled={isRecalculating} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50">
            {isRecalculating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {isRecalculating ? "Recalculando..." : "Recalcular"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Equipes */}
        <div className="animate-fade-up delay-100 group relative bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-emerald-500/20 transition-all duration-500">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-3 relative z-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-emerald-400" /></div>
              <h3 className="font-bold text-[#f0f0f5]">Top Equipes</h3>
            </div>
            <div className="flex gap-2">
              {rankTabs.map((tab) => <RankTab key={tab.key} active={teamRankType === tab.key} onClick={() => setTeamRankType(tab.key)} label={tab.label} icon={tab.icon} />)}
            </div>
          </div>
          <RankList rankings={finalTeamRankings} type="team" isLoading={isLoadingTeamRankings} isError={false} />
        </div>

        {/* Top Jogadores */}
        <div className="animate-fade-up delay-200 group relative bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-emerald-500/20 transition-all duration-500">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-3 relative z-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><UserCircle className="w-4 h-4 text-emerald-400" /></div>
              <h3 className="font-bold text-[#f0f0f5]">Top Jogadores</h3>
            </div>
            <div className="flex gap-2">
              {rankTabs.map((tab) => <RankTab key={tab.key} active={playerRankType === tab.key} onClick={() => setPlayerRankType(tab.key)} label={tab.label} icon={tab.icon} />)}
            </div>
          </div>
          <RankList rankings={finalPlayerRankings} type="player" isLoading={isLoadingPlayerRankings} isError={false} />
        </div>
      </div>
    </section>
  );
}