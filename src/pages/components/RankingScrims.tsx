import { useState, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  Swords,
  Trophy,
  BarChart3,
  Users,
  Target,
  Shield,
  TrendingUp,
  Crosshair,
  Medal,
  Award,
} from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import { trpc } from "@/providers/trpc";
import {
  FilterBar,
  SearchInput,
  SelectFilter,
  EmptyState,
  LoadingSpinner,
  RankBadge,
  SummaryCards,
} from "./xtreino";

// ============================================================
// TIPOS
// ============================================================

type ScrimRankTabKey = "jogadores" | "times";

interface TabConfig {
  key: ScrimRankTabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}

// CORREÇÃO: Removido 'playerName' e adicionado 'nickname' para bater com o Backend
interface EnrichedScrimPlayer {
  nickname: string;
  teamName: string;
  scrimKills: number;
  scrimAssists: number;
  scrimDeaths: number;
  scrimDamage: number;
  scrimMvps: number;
  scrimKdRatio: number;
  scrimWins: number;
  scrimLosses: number;
  totalMatches: number;
}

// CORREÇÃO: Tipagem flexível para times, pois o backend retorna 'name' e não 'teamName'
interface EnrichedScrimTeam {
  name: string;
  tag: string;
  scrimKills: number;
  scrimWins: number;
  scrimLosses: number;
  scrimMatches: number;
  winRate: number;
}

// ============================================================
// CONFIGURACAO DAS ABAS
// ============================================================

const TABS: TabConfig[] = [
  { key: "jogadores", label: "Jogadores", icon: <Users className="w-4 h-4" />, description: "Ranking unificado de jogadores em Scrims (MME)" },
  { key: "times", label: "Times", icon: <Shield className="w-4 h-4" />, description: "Ranking unificado de times em Scrims (MME)" },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function RankingScrims() {
  const { tab } = useParams<{ tab?: string }>();
  const activeTab: ScrimRankTabKey = (TABS.find(t => t.key === tab)?.key as ScrimRankTabKey) || "jogadores";

  if (!tab) {
    return <Navigate to="/rankings/scrims/jogadores" replace />;
  }

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;

  const renderTabButton = (tabConfig: TabConfig) => {
    const isActive = activeTab === tabConfig.key;
    const fullPath = `/rankings/scrims/${tabConfig.key}`;

    if (isActive) {
      return (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm shadow-red-500/5">
          {tabConfig.icon}
          {tabConfig.label}
        </div>
      );
    }

    return (
      <Link to={fullPath} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-[#5a5a6e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]">
        {tabConfig.icon}
        {tabConfig.label}
      </Link>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="bg-[#12121a] border-b border-[#2a2a3a] -mx-4 lg:-mx-8 px-4 lg:px-8 py-12 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Swords className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Rankings de Scrims</h1>
          </div>
          <p className="text-[#8a8a9e]">{activeTabConfig.description}</p>
        </div>

        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-2 mb-6">
          <div className="flex flex-wrap gap-1">{TABS.map((tabConfig) => renderTabButton(tabConfig))}</div>
        </div>

        <div className="pb-12">
          {activeTab === "jogadores" && <ScrimPlayersRankingTab />}
          {activeTab === "times" && <ScrimTeamsRankingTab />}
        </div>
      </div>
    </MainLayout>
  );
}

// ============================================================
// TAB: RANKING DE JOGADORES
// ============================================================

function ScrimPlayersRankingTab() {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"scrimKills" | "scrimMvps" | "scrimKdRatio" | "totalMatches">("scrimKills");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: playersList, isLoading } = trpc.unified.listPlayers.useQuery();

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const clearFilters = () => { setSearch(""); setSelectedTeam(null); };
  const hasFilters = !!search || !!selectedTeam;

  // CORREÇÃO: Removido o 'as EnrichedScrimPlayer' e convertido usando 'unknown' para evitar erro 2352
  const filteredPlayers = useMemo(() => {
    if (!playersList) return [];
    let list = playersList as unknown as EnrichedScrimPlayer[];
    if (selectedTeam) list = list.filter((p) => p.teamName === selectedTeam);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.nickname.toLowerCase().includes(q) || (p.teamName?.toLowerCase() ?? "").includes(q));
    }
    return list;
  }, [playersList, selectedTeam, search]);

  const sortedPlayers = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortField] ?? 0;
      const bVal = (b as unknown as Record<string, unknown>)[sortField] ?? 0;
      const aNum = typeof aVal === 'number' ? aVal : 0;
      const bNum = typeof bVal === 'number' ? bVal : 0;
      return sortDir === "desc" ? bNum - aNum : aNum - bNum;
    });
  }, [filteredPlayers, sortField, sortDir]);

  const allTeams = useMemo(() => {
    if (!playersList) return [];
    return [...new Set(playersList.map((p) => p.teamName).filter(Boolean))].sort();
  }, [playersList]);

  const summaryCards = [
    { icon: <Users className="w-4 h-4 text-red-400" />, label: "Jogadores", value: sortedPlayers.length },
    { icon: <Target className="w-4 h-4 text-red-400" />, label: "Total Kills", value: sortedPlayers.reduce((s, p) => s + (p.scrimKills || 0), 0), valueColor: "text-red-400" },
    { icon: <Crosshair className="w-4 h-4 text-orange-400" />, label: "Total Assists", value: sortedPlayers.reduce((s, p) => s + (p.scrimAssists || 0), 0), valueColor: "text-orange-400" },
    { icon: <Award className="w-4 h-4 text-yellow-400" />, label: "Total MVPs", value: sortedPlayers.reduce((s, p) => s + (p.scrimMvps || 0), 0), valueColor: "text-yellow-400" },
  ];

  if (isLoading) return <LoadingSpinner text="Carregando ranking de scrims..." />;

  return (
    <div className="space-y-6">
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar jogador ou time..." minWidth="260px" />
        <SelectFilter icon={<Shield className="w-4 h-4 text-[#5a5a6e]" />} value={selectedTeam ?? ""} onChange={(v) => setSelectedTeam(v || null)} placeholder="Todos os times" options={allTeams.map((t) => ({ value: t, label: t }))} minWidth="160px" />
      </FilterBar>

      {summaryCards.length > 0 && <SummaryCards cards={summaryCards} columns={4} />}

      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2"><TrendingUp className="w-5 h-5 text-red-400" /> Ranking de Jogadores em Scrims</h3>
          <span className="text-xs text-[#5a5a6e]">{sortedPlayers.length} jogadores</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                <th className="px-4 py-3 text-center w-12"><span className="text-xs font-medium text-[#5a5a6e] uppercase">#</span></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Jogador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                <th className="px-4 py-3 text-center"><SortHeader field="scrimKills" label="Kills" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-center"><SortHeader field="scrimMvps" label="MVPs" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-center"><SortHeader field="scrimKdRatio" label="K/D" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Vitórias</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Derrotas</th>
                <th className="px-6 py-3 text-center bg-red-500/5"><SortHeader field="totalMatches" label="Partidas" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {sortedPlayers.map((p, index) => {
                const isTop3 = index < 3;
                return (
                  <tr key={p.nickname} className={`hover:bg-[#1a1a24] transition-colors group ${isTop3 ? "bg-gradient-to-r from-red-500/5 to-transparent border-l-2 border-red-400" : ""}`}>
                    <td className="px-4 py-3 text-center"><RankBadge index={index} /></td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors"><Target className="w-4 h-4 text-red-400" /></div>
                        <span className="text-sm font-bold text-[#f0f0f5] group-hover:text-red-400 transition-colors">{p.nickname}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.teamName ?? "—"}</td>
                    <td className="px-4 py-3 text-center text-sm text-red-400/80 font-medium">{p.scrimKills}</td>
                    <td className="px-4 py-3 text-center text-sm text-yellow-400/80">{p.scrimMvps > 0 ? p.scrimMvps : "—"}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">{p.scrimKdRatio > 0 ? p.scrimKdRatio : "—"}</td>
                    <td className="px-4 py-3 text-center text-sm text-green-400/80">{p.scrimWins}</td>
                    <td className="px-4 py-3 text-center text-sm text-red-400/50">{p.scrimLosses}</td>
                    <td className="px-6 py-3 text-center bg-red-500/5"><span className="text-sm font-bold text-red-400">{p.totalMatches}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sortedPlayers.length === 0 && <EmptyState icon={<Target className="w-12 h-12" />} title="Nenhum jogador encontrado" subtitle="Tente ajustar os filtros" />}
      </div>
    </div>
  );
}

// ============================================================
// TAB: RANKING DE TIMES
// ============================================================

function ScrimTeamsRankingTab() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"scrimKills" | "scrimWins" | "scrimMatches">("scrimWins");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: teamsList, isLoading } = trpc.unified.listTeams.useQuery();

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const clearFilters = () => { setSearch(""); };
  const hasFilters = !!search;

  // CORREÇÃO: Mapeado corretamente usando 'name' e 'tag', e convertido com 'unknown'
  const filteredTeams = useMemo(() => {
    if (!teamsList) return [];
    return (teamsList as unknown as Array<Record<string, any>>)
      .filter(t => (t.scrimMatches ?? 0) > 0)
      .map(t => ({
        name: t.name,
        tag: t.tag,
        scrimKills: t.scrimKills ?? 0,
        scrimWins: t.scrimWins ?? 0,
        scrimLosses: t.scrimLosses ?? 0,
        scrimMatches: t.scrimMatches ?? 0,
        winRate: (t.scrimMatches ?? 0) > 0 ? Math.round(((t.scrimWins ?? 0) / (t.scrimMatches ?? 0)) * 1000) / 10 : 0,
      })) as EnrichedScrimTeam[];
  }, [teamsList]);

  const sortedTeams = useMemo(() => {
    return [...filteredTeams].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortField] ?? 0;
      const bVal = (b as unknown as Record<string, unknown>)[sortField] ?? 0;
      const aNum = typeof aVal === 'number' ? aVal : 0;
      const bNum = typeof bVal === 'number' ? bVal : 0;
      return sortDir === "desc" ? bNum - aNum : aNum - bNum;
    });
  }, [filteredTeams, sortField, sortDir]);

  const summaryCards = [
    { icon: <Shield className="w-4 h-4 text-red-400" />, label: "Times", value: sortedTeams.length },
    { icon: <Target className="w-4 h-4 text-red-400" />, label: "Total Kills", value: sortedTeams.reduce((s, t) => s + (t.scrimKills || 0), 0), valueColor: "text-red-400" },
    { icon: <Trophy className="w-4 h-4 text-yellow-400" />, label: "Vitórias", value: sortedTeams.reduce((s, t) => s + (t.scrimWins || 0), 0), valueColor: "text-yellow-400" },
    { icon: <BarChart3 className="w-4 h-4 text-blue-400" />, label: "Partidas", value: sortedTeams.reduce((s, t) => s + (t.scrimMatches || 0), 0) },
  ];

  if (isLoading) return <LoadingSpinner text="Carregando ranking de times..." />;

  return (
    <div className="space-y-6">
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar time ou tag..." minWidth="260px" />
      </FilterBar>

      {summaryCards.length > 0 && <SummaryCards cards={summaryCards} columns={4} />}

      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2"><Medal className="w-5 h-5 text-yellow-400" /> Ranking de Times em Scrims</h3>
          <span className="text-xs text-[#5a5a6e]">{sortedTeams.length} times</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                <th className="px-4 py-3 text-center w-12"><span className="text-xs font-medium text-[#5a5a6e] uppercase">#</span></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                <th className="px-4 py-3 text-center"><SortHeader field="scrimKills" label="Kills" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-center"><SortHeader field="scrimWins" label="Vitórias" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Derrotas</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Win Rate</th>
                <th className="px-6 py-3 text-center bg-red-500/5"><SortHeader field="scrimMatches" label="Partidas" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {sortedTeams.map((t, index) => {
                const isTop3 = index < 3;
                return (
                  <tr key={t.name} className={`hover:bg-[#1a1a24] transition-colors group ${isTop3 ? "bg-gradient-to-r from-yellow-500/5 to-transparent border-l-2 border-yellow-400" : ""}`}>
                    <td className="px-4 py-3 text-center"><RankBadge index={index} /></td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors"><Shield className="w-4 h-4 text-red-400" /></div>
                        <div>
                          <span className="text-sm font-bold text-[#f0f0f5] group-hover:text-red-400 transition-colors">{t.name}</span>
                          {t.tag && <span className="text-[10px] text-[#5a5a6e] ml-2">[{t.tag}]</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-red-400/80 font-medium">{t.scrimKills}</td>
                    <td className="px-4 py-3 text-center text-sm text-yellow-400/80 font-bold">{t.scrimWins}</td>
                    <td className="px-4 py-3 text-center text-sm text-red-400/50">{t.scrimLosses}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${t.winRate >= 60 ? "text-green-400" : t.winRate >= 40 ? "text-yellow-400" : "text-red-400"}`}>{t.winRate}%</span>
                    </td>
                    <td className="px-6 py-3 text-center bg-red-500/5"><span className="text-sm font-bold text-red-400">{t.scrimMatches}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sortedTeams.length === 0 && <EmptyState icon={<Shield className="w-12 h-12" />} title="Nenhum time encontrado" subtitle="Tente ajustar os filtros" />}
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE AUXILIAR
// ============================================================

function SortHeader({ field, label, currentField, direction, onSort }: {
  field: string;
  label: string;
  currentField: string;
  direction: "asc" | "desc";
  onSort: (field: any) => void;
}) {
  const isActive = currentField === field;
  return (
    <button onClick={() => onSort(field)} className={`flex items-center justify-center gap-1 text-xs font-medium uppercase transition-colors ${isActive ? "text-[#f0f0f5]" : "text-[#5a5a6e] hover:text-[#8a8a9e]"}`}>
      {label}
      {isActive && <span className="text-[10px]">{direction === "desc" ? " ▼" : " ▲"}</span>}
    </button>
  );
}