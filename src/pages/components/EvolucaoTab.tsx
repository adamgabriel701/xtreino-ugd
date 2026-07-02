// ============================================================
// EvolucaoTab.tsx (COM MÉDIA MÓVEL PROFISSIONAL)
// ============================================================

import { useState, useMemo } from "react";
import { TrendingUp, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  FilterBar,
  SearchInput,
  LoadingSpinner,
  EmptyState,
} from "./xtreino";
import {
  type EnrichedTeam,
  getMonthName,
  enrichTeam,
  buildTeamRanking,
} from "./xtreino-shared";

const TEAM_COLORS = [
  "#4ade80", // green
  "#f87171", // red
  "#60a5fa", // blue
  "#facc15", // yellow
  "#c084fc", // purple
];

interface ChartDataPoint {
  month: string;
  label: string;
  value: number;
}

export default function EvolucaoTab() {
  const [search, setSearch] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [hiddenTeams, setHiddenTeams] = useState<Set<string>>(new Set());

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();

  const isLoading = !allResults || !allPlayerStats;

  const months = useMemo(() => {
    if (!allResults) return [];
    const m = new Set<string>();
    allResults.forEach((r) => {
      if (r.date) m.add(r.date.substring(0, 7));
    });
    return Array.from(m).sort();
  }, [allResults]);

  const rankingByMonth = useMemo(() => {
    if (!allResults || !allPlayerStats) return new Map<string, EnrichedTeam[]>();
    const map = new Map<string, EnrichedTeam[]>();

    months.forEach((month) => {
      const mResults = allResults.filter((r) => r.date?.startsWith(month));
      const mStats = allPlayerStats.filter((s) => s.date?.startsWith(month));
      const baseRanking = buildTeamRanking(mResults, mStats as any);
      const enriched = baseRanking.map((t) => enrichTeam(t, "mensal"));
      map.set(month, enriched.sort((a, b) => b.totalPoints - a.totalPoints));
    });

    return map;
  }, [allResults, allPlayerStats, months]);

  const allTeams = useMemo(() => {
    const teamsSet = new Set<string>();
    rankingByMonth.forEach((ranking) => {
      ranking.forEach((t) => teamsSet.add(t.teamName));
    });
    return Array.from(teamsSet).sort();
  }, [rankingByMonth]);

  const filteredTeams = useMemo(() => {
    if (!search.trim()) return allTeams;
    const q = search.toLowerCase();
    return allTeams.filter((t) => t.toLowerCase().includes(q));
  }, [allTeams, search]);

  const chartData = useMemo((): {
    points: ChartDataPoint[];
    labels: string[];
  } => {
    if (selectedTeams.size === 0 || months.length === 0)
      return { points: [], labels: [] };

    const labels = months.map((m) => getMonthName(m));
    const points: ChartDataPoint[] = [];

    selectedTeams.forEach((teamName) => {
      months.forEach((month) => {
        const monthRanking = rankingByMonth.get(month) ?? [];
        const teamData = monthRanking.find((t) => t.teamName === teamName);
        points.push({
          month,
          label: teamName,
          value: teamData?.totalPoints ?? 0,
        });
      });
    });

    return { points, labels };
  }, [selectedTeams, months, rankingByMonth]);

  const toggleTeam = (team: string) => {
    setSelectedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(team)) {
        next.delete(team);
        setHiddenTeams((h) => {
          const nh = new Set(h);
          nh.delete(team);
          return nh;
        });
      } else if (next.size < 5) {
        next.add(team);
      }
      return next;
    });
  };

  const handleToggleVisibility = (team: string) => {
    setHiddenTeams((prev) => {
      const next = new Set(prev);
      if (next.has(team)) next.delete(team);
      else next.add(team);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedTeams(new Set());
    setHiddenTeams(new Set());
  };

  const hasFilters = search.trim().length > 0 || selectedTeams.size > 0;

  return (
    <div className="space-y-6">
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar time para adicionar..."
          minWidth="260px"
        />
        <span className="text-xs text-[#5a5a6e]">
          Selecione até 5 times para comparar ({selectedTeams.size}/5)
        </span>
      </FilterBar>

      {isLoading && <LoadingSpinner text="Calculando evolução..." />}

      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4 max-h-[600px] overflow-y-auto">
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-3">Times Disponíveis</h3>
            <div className="space-y-1">
              {filteredTeams.map((team) => {
                const isSelected = selectedTeams.has(team);
                const colorIdx = Array.from(selectedTeams).indexOf(team);
                const color = TEAM_COLORS[colorIdx] || "#5a5a6e";

                return (
                  <button
                    key={team}
                    onClick={() => toggleTeam(team)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? "bg-[#1a1a24] border border-[#2a2a3a]"
                        : "hover:bg-[#1a1a24]/50 text-[#8a8a9e]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: isSelected ? color : "transparent", border: isSelected ? "none" : "1px solid #5a5a6e" }}
                      />
                      <span className={`${isSelected ? "text-[#f0f0f5] font-medium" : ""}`}>
                        {team}
                      </span>
                    </div>
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(team);
                        }}
                        className="text-[#5a5a6e] hover:text-[#f0f0f5]"
                      >
                        {hiddenTeams.has(team) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3 bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            {chartData.points.length === 0 ? (
              <EmptyState
                icon={<TrendingUp className="w-12 h-12" />}
                title="Nenhum time selecionado"
                subtitle="Selecione times ao lado para ver a evolução ao longo do tempo."
              />
            ) : (
              <EvolutionChart
                data={chartData.points}
                labels={chartData.labels}
                selectedTeams={Array.from(selectedTeams)}
                hiddenTeams={hiddenTeams}
                onToggleVisibility={handleToggleVisibility}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE DO GRÁFICO SVG PURO COM MÉDIA MÓVEL
// ============================================================

function EvolutionChart({
  data,
  labels,
  selectedTeams,
  hiddenTeams,
  onToggleVisibility,
}: {
  data: ChartDataPoint[];
  labels: string[];
  selectedTeams: string[];
  hiddenTeams: Set<string>;
  onToggleVisibility: (team: string) => void;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const width = 800;
  const height = 400;
  const padding = { top: 20, right: 20, bottom: 50, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const visibleTeams = selectedTeams.filter((t) => !hiddenTeams.has(t));

  const maxVal = useMemo(() => {
    let max = 0;
    data.forEach((p) => {
      if (visibleTeams.includes(p.label) && p.value > max) {
        max = p.value;
      }
    });
    return Math.max(max, 10);
  }, [data, visibleTeams]);

  const xScale = (i: number) => padding.left + (i / (labels.length - 1 || 1)) * chartW;
  const yScale = (v: number) => padding.top + chartH - (v / maxVal) * chartH;

  const gridLines = 5;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) =>
    Math.round((maxVal / gridLines) * i)
  );

  return (
    <div className="w-full overflow-x-auto">
      {/* Legenda atualizada */}
      <div className="flex flex-wrap justify-end gap-4 mb-4">
        <div className="flex items-center gap-2 text-xs text-[#5a5a6e]">
          <div className="w-6 h-0 border-t-2 border-dashed border-[#5a5a6e]" />
          Pontos Exatos
        </div>
        <div className="flex items-center gap-2 text-xs text-[#5a5a6e]">
          <div className="w-6 h-0 border-t-2 border-[#5a5a6e]" />
          Tendência (Média Móvel)
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[600px] h-auto"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              y1={yScale(tick)}
              x2={width - padding.right}
              y2={yScale(tick)}
              stroke="#2a2a3a"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 10}
              y={yScale(tick) + 4}
              textAnchor="end"
              fill="#5a5a6e"
              fontSize="12"
            >
              {tick}
            </text>
          </g>
        ))}

        {labels.map((label, i) => (
          <text
            key={label}
            x={xScale(i)}
            y={height - 10}
            textAnchor="middle"
            fill="#5a5a6e"
            fontSize="11"
          >
            {label.split(" de ")[0].substring(0, 3)}
          </text>
        ))}

        {selectedTeams.map((teamName) => {
          if (hiddenTeams.has(teamName)) return null;
          const colorIdx = selectedTeams.indexOf(teamName);
          const color = TEAM_COLORS[colorIdx];

          const teamPoints = data
            .filter((p) => p.label === teamName)
            .sort((a, b) => a.month.localeCompare(b.month));

          if (teamPoints.length === 0) return null;

          // 1. Calcula a Média Móvel (janela de 3 meses)
          const windowSize = 3;
          const movingAvgPoints = teamPoints.map((p, i, arr) => {
            const start = Math.max(0, i - windowSize + 1);
            const window = arr.slice(start, i + 1);
            const avg = window.reduce((sum, wp) => sum + wp.value, 0) / window.length;
            return { ...p, value: Math.round(avg * 10) / 10 };
          });

          // 2. Path da Linha Original (Pontos exatos - Tracejada e Fina)
          const pathD = teamPoints
            .map((p, i) => {
              const x = xScale(labels.findIndex((l) => l === getMonthName(p.month)));
              const y = yScale(p.value);
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");

          // 3. Path da Linha de Tendência (Média Móvel - Cheia e Grossa)
          const avgPathD = movingAvgPoints
            .map((p, i) => {
              const x = xScale(labels.findIndex((l) => l === getMonthName(p.month)));
              const y = yScale(p.value);
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");

          return (
            <g key={teamName}>
              {/* Linha Original (Tracejada) */}
              <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.4" strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Linha de Tendência (Cheia) */}
              <path d={avgPathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Pontos de Hover (Agora ancorados na Média Móvel para ficar suave) */}
              {movingAvgPoints.map((p) => {
                const x = xScale(labels.findIndex((l) => l === getMonthName(p.month)));
                const y = yScale(p.value);
                const pointId = `${teamName}-${p.month}`;
                const isHovered = hoveredPoint === pointId;

                return (
                  <g
                    key={p.month}
                    onMouseEnter={() => setHoveredPoint(pointId)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    {isHovered && (
                      <circle cx={x} cy={y} r="8" fill={color} opacity="0.2" />
                    )}
                    <circle cx={x} cy={y} r="4" fill="#12121a" stroke={color} strokeWidth="2" />
                    
                    {isHovered && (
                      <g>
                        <rect
                          x={x - 40}
                          y={y - 35}
                          width="80"
                          height="24"
                          rx="6"
                          fill="#1a1a24"
                          stroke="#2a2a3a"
                        />
                        <text
                          x={x}
                          y={y - 19}
                          textAnchor="middle"
                          fill={color}
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {p.value} pts
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap justify-center gap-4 mt-4 border-t border-[#2a2a3a] pt-4">
        {selectedTeams.map((teamName) => {
          const colorIdx = selectedTeams.indexOf(teamName);
          const color = TEAM_COLORS[colorIdx];
          const isHidden = hiddenTeams.has(teamName);

          return (
            <button
              key={teamName}
              onClick={() => onToggleVisibility(teamName)}
              className={`flex items-center gap-2 text-sm transition-opacity ${isHidden ? "opacity-40" : ""}`}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className={isHidden ? "line-through text-[#5a5a6e]" : "text-[#f0f0f5]"}>
                {teamName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}