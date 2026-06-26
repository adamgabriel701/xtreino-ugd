import { Link } from "react-router";
import { useState } from "react";
import { TrendingUp, UserCircle, Eye, RefreshCw, Loader2, Dumbbell, Trophy, Swords } from "lucide-react";
import RankTab from "./RankTab";
import RankList from "./RankList";
import type { LucideIcon, RankCategory } from "../types";

interface RankingsPreviewProps {
  allTeamRankings: Array<{ id: number; entityName: string; points: number; kills?: number; wins?: number }> | undefined;
  allPlayerRankings: Array<{ id: number; entityName: string; points: number; kills?: number; wins?: number }> | undefined;
  isLoadingTeamRankings: boolean;
  isErrorTeamRankings: boolean;
  isLoadingPlayerRankings: boolean;
  isErrorPlayerRankings: boolean;
  onRecalculate: () => void;
  isRecalculating: boolean;
}

export default function RankingsPreview({
  allTeamRankings, allPlayerRankings, isLoadingTeamRankings, isErrorTeamRankings,
  isLoadingPlayerRankings, isErrorPlayerRankings, onRecalculate, isRecalculating,
}: RankingsPreviewProps) {
  const [teamRankType, setTeamRankType] = useState<RankCategory>("xtreino");
  const [playerRankType, setPlayerRankType] = useState<RankCategory>("xtreino");

  const rankTabs: { key: RankCategory; label: string; icon: LucideIcon }[] = [
    { key: "xtreino", label: "XTreinos", icon: Dumbbell },
    { key: "campeonato", label: "Campeonatos", icon: Trophy },
    { key: "scrim", label: "Scrims", icon: Swords },
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-14">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Rankings</h2>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/rankings" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:border-emerald-500/30 hover:text-emerald-400 transition-all"><Eye className="w-3.5 h-3.5" />Ver Completo</Link>
          <button onClick={onRecalculate} disabled={isRecalculating} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50">
            {isRecalculating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {isRecalculating ? "Recalculando..." : "Recalcular"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-emerald-400" /></div>
              <h3 className="font-bold text-[#f0f0f5]">Top Equipes</h3>
            </div>
            <div className="flex gap-2">
              {rankTabs.map((tab) => <RankTab key={tab.key} active={teamRankType === tab.key} onClick={() => setTeamRankType(tab.key)} label={tab.label} icon={tab.icon} />)}
            </div>
          </div>
          <RankList rankings={allTeamRankings} type="team" isLoading={isLoadingTeamRankings} isError={isErrorTeamRankings} />
        </div>

        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><UserCircle className="w-4 h-4 text-emerald-400" /></div>
              <h3 className="font-bold text-[#f0f0f5]">Top Jogadores</h3>
            </div>
            <div className="flex gap-2">
              {rankTabs.map((tab) => <RankTab key={tab.key} active={playerRankType === tab.key} onClick={() => setPlayerRankType(tab.key)} label={tab.label} icon={tab.icon} />)}
            </div>
          </div>
          <RankList rankings={allPlayerRankings} type="player" isLoading={isLoadingPlayerRankings} isError={isErrorPlayerRankings} />
        </div>
      </div>
    </section>
  );
}