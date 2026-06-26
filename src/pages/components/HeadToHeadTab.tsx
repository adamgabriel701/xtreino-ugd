// ============================================================
// HeadToHeadTab.tsx
// ============================================================

import { useState, useMemo } from "react";
import {
  Swords,
  Target,
  UserCircle,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  calcPlayerAccumulatedStats,
  type XtreinoPlayerStat,
} from "../../hooks/useXtreinoCalculations.js";
import {
  FilterBar,
  SearchInput,
  LoadingSpinner,
  EmptyState,
  Sparkline,
  BadgeIcon,
} from "./xtreino";

interface PlayerFullStats {
  playerName: string;
  teamName: string | null;
  totalKills: number;
  totalQ1Kills: number;
  totalQ2Kills: number;
  totalQ3Kills: number;
  participations: number;
  avgKills: number;
  bestPerformance: number;
  badges: string[];
  avgPerQuarter: { q1: number; q2: number; q3: number };
  sparkline: number[];
}

export default function HeadToHeadTab() {
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [playerAName, setPlayerAName] = useState("");
  const [playerBName, setPlayerBName] = useState("");

  const { data: rawStatsData } = trpc.players.rankingStats.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();

  const rawStats = (rawStatsData ?? []) as XtreinoPlayerStat[];
  const isLoading = !rawStatsData;

  // Nomes únicos para os selects
  const playerNames = useMemo(() => {
    return [...new Set(rawStats.map((s) => s.playerName))].sort();
  }, [rawStats]);

  // Filtrar listas suspensas
  const filteredA = useMemo(() => playerNames.filter((n) => n.toLowerCase().includes(searchA.toLowerCase())), [playerNames, searchA]);
  const filteredB = useMemo(() => playerNames.filter((n) => n.toLowerCase().includes(searchB.toLowerCase()) && n !== playerAName), [playerNames, searchB, playerAName]);

  // Calcular stats completas dos jogadores
  const accumulated = useMemo(() => calcPlayerAccumulatedStats(rawStats), [rawStats]);

  const getPlayerStats = (name: string): PlayerFullStats | null => {
    if (!name) return null;
    const base = accumulated.find((p) => p.playerName === name);
    if (!base) return null;

    const playerRawStats = rawStats.filter((s) => s.playerName === name);
    const sparkline = playerRawStats
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((s) => s.totalKills);

    const badges: string[] = [];
    if (base.totalKills >= 100) badges.push("100 Kills");
    if (base.totalKills >= 300) badges.push("300 Kills");
    if (base.participations >= 10) badges.push("10 XTs");
    if (base.avgKills >= 8) badges.push("Sniper");
    if (base.avgKills >= 12) badges.push("Elite");

    return {
      playerName: base.playerName,
      teamName: base.teamName,
      totalKills: base.totalKills,
      totalQ1Kills: base.totalQ1Kills,
      totalQ2Kills: base.totalQ2Kills,
      totalQ3Kills: base.totalQ3Kills,
      participations: base.participations,
      avgKills: base.avgKills,
      bestPerformance: Math.max(...playerRawStats.map((s) => s.totalKills), 0),
      badges,
      avgPerQuarter: {
        q1: base.participations > 0 ? Math.round((base.totalQ1Kills / base.participations) * 10) / 10 : 0,
        q2: base.participations > 0 ? Math.round((base.totalQ2Kills / base.participations) * 10) / 10 : 0,
        q3: base.participations > 0 ? Math.round((base.totalQ3Kills / base.participations) * 10) / 10 : 0,
      },
      sparkline,
    };
  };

  const playerA = getPlayerStats(playerAName);
  const playerB = getPlayerStats(playerBName);

  const handleClear = () => {
    setSearchA("");
    setSearchB("");
    setPlayerAName("");
    setPlayerBName("");
  };

  const hasFilters = playerAName !== "" || playerBName !== "";

  return (
    <div className="space-y-6">
      {/* Seleção de Jogadores */}
      <FilterBar hasFilters={hasFilters} onClear={handleClear}>
        <div className="flex-1 max-w-[300px]">
          <p className="text-xs text-yellow-400 font-bold mb-1">JOGADOR A</p>
          <SearchInput
            value={searchA}
            onChange={(v) => {
              setSearchA(v);
              if (v === "") setPlayerAName("");
            }}
            placeholder="Buscar jogador..."
            minWidth="100%"
          />
          {searchA && !playerAName && (
            <div className="absolute mt-1 w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg max-h-40 overflow-y-auto z-20 shadow-xl">
              {filteredA.slice(0, 5).map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setPlayerAName(name);
                    setSearchA(name);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[#f0f0f5] hover:bg-[#2a2a3a] flex items-center gap-2"
                >
                  <Target className="w-4 h-4 text-yellow-400" />
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        <Swords className="w-6 h-6 text-[#5a5a6e] mt-4" />

        <div className="flex-1 max-w-[300px]">
          <p className="text-xs text-gray-300 font-bold mb-1">JOGADOR B</p>
          <SearchInput
            value={searchB}
            onChange={(v) => {
              setSearchB(v);
              if (v === "") setPlayerBName("");
            }}
            placeholder="Buscar jogador..."
            minWidth="100%"
          />
          {searchB && !playerBName && (
            <div className="absolute mt-1 w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg max-h-40 overflow-y-auto z-20 shadow-xl">
              {filteredB.slice(0, 5).map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setPlayerBName(name);
                    setSearchB(name);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[#f0f0f5] hover:bg-[#2a2a3a] flex items-center gap-2"
                >
                  <Target className="w-4 h-4 text-gray-300" />
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </FilterBar>

      {isLoading && <LoadingSpinner text="Carregando stats..." />}

      {/* Área do Confronto */}
      {!isLoading && playerA && playerB && (
        <div className="relative bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#0a0a0f] border-2 border-[#2a2a3a] rounded-full w-14 h-14 flex items-center justify-center shadow-2xl">
            <span className="text-xl font-black text-[#5a5a6e]">VS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <PlayerH2HCard data={playerA} opponentTotal={playerB.totalKills} colorClass="text-yellow-400" />
            <PlayerH2HCard data={playerB} opponentTotal={playerA.totalKills} colorClass="text-gray-300" />
          </div>

          {/* Comparativo Visual Q1 Q2 Q3 */}
          <div className="mt-8 pt-6 border-t border-[#2a2a3a]">
             <H2HBarComparison label="Q1 Média" a={playerA.avgPerQuarter.q1} b={playerB.avgPerQuarter.q1} color="bg-red-500" />
             <H2HBarComparison label="Q2 Média" a={playerA.avgPerQuarter.q2} b={playerB.avgPerQuarter.q2} color="bg-orange-500" />
             <H2HBarComparison label="Q3 Média" a={playerA.avgPerQuarter.q3} b={playerB.avgPerQuarter.q3} color="bg-purple-500" />
             <H2HBarComparison label="Total Geral" a={playerA.totalKills} b={playerB.totalKills} color="bg-green-500" />
          </div>
        </div>
      )}

      {!isLoading && (!playerA || !playerB) && (
        <EmptyState
          icon={<UserCircle className="w-12 h-12" />}
          title="Selecione dois jogadores"
          subtitle="Busque e clique nos nomes acima para iniciar o confronto."
        />
      )}
    </div>
  );
}

// Componentes Auxiliares

function PlayerH2HCard({ data, opponentTotal, colorClass }: { data: PlayerFullStats; opponentTotal: number; colorClass: string }) {
  const isWinner = data.totalKills > opponentTotal;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-2xl font-black ${colorClass}`}>{data.playerName}</h3>
          <p className="text-sm text-[#5a5a6e]">{data.teamName ?? "Sem time"}</p>
          {isWinner && <span className="text-xs font-bold text-yellow-400 mt-1 block">🏆 VENCEDOR</span>}
        </div>
        <p className="text-4xl font-black text-green-400">{data.totalKills}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Participações" value={data.participations} />
        <StatBox label="Média/Kill" value={data.avgKills} />
        <StatBox label="Recorde" value={data.bestPerformance} color="text-yellow-400" />
      </div>

      {data.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.badges.map((b) => (
            <span key={b} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a24] border border-[#2a2a3a] text-xs text-[#8a8a9e]">
              <BadgeIcon badge={b} /> {b}
            </span>
          ))}
        </div>
      )}

      {data.sparkline.length > 1 && (
        <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3">
          <p className="text-xs text-[#5a5a6e] mb-1">Evolução nos XTs</p>
          <Sparkline data={data.sparkline} width={300} height={50} />
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2a2a3a]">
      <p className="text-xs text-[#5a5a6e]">{label}</p>
      <p className={`text-xl font-bold ${color || "text-[#f0f0f5]"}`}>{value}</p>
    </div>
  );
}

function H2HBarComparison({ label, a, b, color }: { label: string; a: number; b: number; color: string }) {
  const max = Math.max(a, b, 1);
  return (
    <div className="flex items-center gap-4 mb-3">
      <span className="text-sm font-bold text-[#f0f0f5] w-16 text-right">{a}</span>
      <div className="flex-1 flex items-center h-6 rounded-full overflow-hidden bg-[#0a0a0f] border border-[#2a2a3a]">
        <div className={`${color} h-full transition-all duration-700`} style={{ width: `${(a / max) * 50}%` }} />
        <div className="w-20 flex items-center justify-center text-xs font-bold text-[#5a5a6e] bg-[#12121a] h-full border-x border-[#2a2a3a]">
          {label}
        </div>
        <div className={`${color} opacity-70 h-full transition-all duration-700`} style={{ width: `${(b / max) * 50}%` }} />
      </div>
      <span className="text-sm font-bold text-[#f0f0f5] w-16">{b}</span>
    </div>
  );
}