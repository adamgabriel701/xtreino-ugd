import { useState, useMemo } from "react";
import { Target, TrendingUp, Users, Crown, Swords } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { RankBadge, SortHeader, FilterBar, SearchInput, SelectFilter, EmptyState, LoadingSpinner, PreviousNicksTooltip, PodiumCard } from "../components/xtreino";
import { Link } from "react-router-dom";

// CORREÇÃO: Removido "scrimKdRatio" pois o backend (router) não aceita esse valor no sortBy
type SortField = "totalKills" | "xtreinoKills" | "scrimKills" | "scrimMvps" | "totalMatches";

export default function JogadoresTab() {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("totalKills");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: playersList, isLoading } = trpc.unified.listPlayers.useQuery({
    search: search || undefined,
    sortBy: sortField,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const clearFilters = () => { setSearch(""); setSelectedTeam(null); };
  const hasFilters = !!search || !!selectedTeam;

  const filteredPlayers = useMemo(() => {
    if (!playersList) return [];
    if (!selectedTeam) return playersList;
    return playersList.filter(p => p.teamName === selectedTeam);
  }, [playersList, selectedTeam]);

  const allTeams = useMemo(() => {
    if (!playersList) return [];
    return [...new Set(playersList.map(p => p.teamName).filter(Boolean))].sort();
  }, [playersList]);

  const top3 = useMemo(() => (filteredPlayers?.slice(0, 3) ?? []), [filteredPlayers]);

  const summaryCards = filteredPlayers ? [
    { icon: <Users className="w-4 h-4 text-green-400" />, label: "Jogadores", value: filteredPlayers.length },
    { icon: <Target className="w-4 h-4 text-green-400" />, label: "Total Kills", value: filteredPlayers.reduce((s, p) => s + (p.totalKills || 0), 0), valueColor: "text-green-400" },
    { icon: <Target className="w-4 h-4 text-blue-400" />, label: "Kills XT", value: filteredPlayers.reduce((s, p) => s + (p.xtreinoKills || 0), 0) },
    { icon: <Swords className="w-4 h-4 text-red-400" />, label: "Kills Scrim", value: filteredPlayers.reduce((s, p) => s + (p.scrimKills || 0), 0) },
  ] : [];

  if (isLoading) return <LoadingSpinner text="Carregando ranking unificado..." />;

  return (
    <div className="space-y-6">
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar jogador ou nick antigo..." minWidth="260px" />
        <SelectFilter
          icon={<Users className="w-4 h-4 text-[#5a5a6e]" />}
          value={selectedTeam ?? ""}
          onChange={(v) => setSelectedTeam(v || null)}
          placeholder="Todos os times"
          options={allTeams.map(t => ({ value: t, label: t }))}
          minWidth="160px"
        />
      </FilterBar>

      {summaryCards.length > 0 && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{summaryCards.map((c, i) => (
        <div key={i} className="bg-[#12121a] rounded-xl p-5 border border-[#2a2a3a]">
          <div className="flex items-center gap-2 mb-2 text-[#5a5a6e]">{c.icon}<p className="text-xs uppercase">{c.label}</p></div>
          <p className={`text-3xl font-bold ${c.valueColor || "text-[#f0f0f5]"}`}>{c.value}</p>
        </div>
      ))}</div>}

      {top3.length === 3 && (
        <div>
          <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-400" /> Podio Geral</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((p, i) => (
              <Link key={p.id} to={`/jogador/${p.id}`} className="block">
                <PodiumCard
                  name={p.nickname}
                  subtitle={p.teamName}
                  rank={i}
                  stats={[
                    { label: "Kills", value: p.totalKills, color: "text-green-400" },
                    { label: "XTs", value: p.xtreinoMatches },
                    { label: "MVPs", value: p.scrimMvps },
                  ]}
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" /> Ranking Unificado de Jogadores
          </h3>
          <span className="text-xs text-[#5a5a6e]">{filteredPlayers.length} jogadores</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                <th className="px-4 py-3 text-center w-12"><span className="text-xs font-medium text-[#5a5a6e] uppercase">#</span></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Jogador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                <th className="px-4 py-3 text-center"><SortHeader field="xtreinoKills" label="Kills XT" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-center"><SortHeader field="scrimKills" label="Kills Scrim" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-center"><SortHeader field="scrimMvps" label="MVPs" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">K/D Scrim</th>
                <th className="px-6 py-3 text-center bg-green-500/5"><SortHeader field="totalKills" label="Total Geral" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {filteredPlayers?.map((p, index) => {
                const isTop3 = index < 3;
                return (
                  <tr key={p.id} className={`hover:bg-[#1a1a24] transition-colors group ${isTop3 ? "bg-gradient-to-r from-yellow-500/5 to-transparent border-l-2 border-yellow-400" : ""}`}>
                    <td className="px-4 py-3 text-center"><RankBadge index={index} /></td>
                    <td className="px-6 py-3">
                      <Link to={`/jogador/${p.id}`} className="flex items-center gap-3 text-left w-full group/player">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center group-hover/player:bg-green-500/20 transition-colors">
                          <Target className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-[#f0f0f5] group-hover/player:text-green-400 transition-colors">{p.nickname}</span>
                          {/* CORREÇÃO: O backend retorna aliases como string[], então usamos direto sem '.alias' */}
                          {p.aliases.length > 0 && <PreviousNicksTooltip nicks={p.aliases} />}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.teamName}</td>
                    <td className="px-4 py-3 text-center text-sm text-blue-400/80">{p.xtreinoKills}</td>
                    <td className="px-4 py-3 text-center text-sm text-red-400/80">{p.scrimKills}</td>
                    <td className="px-4 py-3 text-center text-sm text-yellow-400/80">{p.scrimMvps > 0 ? p.scrimMvps : "—"}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">{p.scrimKdRatio > 0 ? p.scrimKdRatio : "—"}</td>
                    <td className="px-6 py-3 text-center bg-green-500/5">
                      <span className="text-sm font-bold text-green-400">{p.totalKills}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredPlayers?.length === 0 && <EmptyState icon={<Target className="w-12 h-12" />} title="Nenhum jogador encontrado" subtitle="Tente ajustar os filtros" />}
      </div>
    </div>
  );
}