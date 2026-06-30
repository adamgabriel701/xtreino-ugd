// src/pages/JogadorDetalhe.tsx
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Target,
  Calendar,
  TrendingUp,
  BarChart3,
  Award,
  ArrowLeft,
  History,
  Tag,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  calcPlayerAccumulatedStats,
  type XtreinoPlayerStat,
} from "../../hooks/useXtreinoCalculations";
import { Sparkline, BadgeIcon, LoadingSpinner, EmptyState } from "../components/xtreino";
import { useMemo } from "react";

// Reaproveita os mesmos tipos do arquivo original
interface PlayerRankingRawStat {
  id: number;
  xtreinoId: number;
  date: string;
  teamName: string;
  playerName: string;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
}

// Funções auxiliares (mesmas do arquivo original, pode extrair para um utils depois)
function calcPlayerSparkline(rawStats: PlayerRankingRawStat[], playerName: string): number[] {
  const playerStats = rawStats
    .filter((s) => s.playerName === playerName)
    .sort((a, b) => a.date.localeCompare(b.date));
  const dateMap = new Map<string, number>();
  playerStats.forEach((s) => {
    dateMap.set(s.date, (dateMap.get(s.date) || 0) + s.totalKills);
  });
  const dates = Array.from(dateMap.keys()).sort();
  return dates.map((d) => dateMap.get(d) || 0);
}

function calcPlayerBadges(totalKills: number, participations: number, totalQ1: number, totalQ2: number, totalQ3: number, avgKills: number): string[] {
  const badges: string[] = [];
  if (totalKills >= 100) badges.push("100 Kills");
  if (totalKills >= 300) badges.push("300 Kills");
  if (totalKills >= 500) badges.push("500 Kills");
  if (participations >= 5) badges.push("5 XTs");
  if (participations >= 10) badges.push("10 XTs");
  if (participations >= 20) badges.push("20 XTs");
  if (totalQ1 >= 50) badges.push("Q1 Master");
  if (totalQ2 >= 50) badges.push("Q2 Master");
  if (totalQ3 >= 50) badges.push("Q3 Master");
  if (avgKills >= 8) badges.push("Sniper");
  if (avgKills >= 12) badges.push("Elite");
  return badges;
}

export default function JogadorDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // tRPC queries
  const { data: rawStatsData, isLoading: isLoadingStats } = trpc.players.rankingStats.useQuery();
  const { data: playersList, isLoading: isLoadingPlayers } = trpc.players.list.useQuery();

  const rawStats = (rawStatsData ?? []) as PlayerRankingRawStat[];
  const accumulated = useMemo(
    () => calcPlayerAccumulatedStats(rawStats as XtreinoPlayerStat[]),
    [rawStats]
  );

  // Encontrar o jogador pelo id (que pode ser o nome ou um ID numérico)
  const player = useMemo(() => {
    if (!id || !accumulated.length) return null;
    // Se o id for numérico, busca por ID; se for texto, busca por nome
    const decodedName = decodeURIComponent(id);
    return accumulated.find((p) => p.playerName === decodedName) ?? null;
  }, [id, accumulated]);

  // Encontrar nicks anteriores
  const previousNicks = useMemo(() => {
    if (!player || !playersList) return [];
    const found = playersList.find(
      (pl) => pl.nickname.trim().toLowerCase() === player.playerName.trim().toLowerCase()
    );
    return found?.previousNicks ?? [];
  }, [player, playersList]);

  // Dados calculados
  const sparkline = useMemo(
    () => (player ? calcPlayerSparkline(rawStats, player.playerName) : []),
    [player, rawStats]
  );

  const badges = useMemo(
    () =>
      player
        ? calcPlayerBadges(
            player.totalKills,
            player.participations,
            player.totalQ1Kills,
            player.totalQ2Kills,
            player.totalQ3Kills,
            player.avgKills
          )
        : [],
    [player]
  );

  const avgPerQuarter = useMemo(() => {
    if (!player || player.participations === 0) return { q1: 0, q2: 0, q3: 0 };
    return {
      q1: Math.round((player.totalQ1Kills / player.participations) * 10) / 10,
      q2: Math.round((player.totalQ2Kills / player.participations) * 10) / 10,
      q3: Math.round((player.totalQ3Kills / player.participations) * 10) / 10,
    };
  }, [player]);

  const bestPerformance = useMemo(() => {
    if (!player) return 0;
    const stats = rawStats.filter((s) => s.playerName === player.playerName);
    return stats.length ? Math.max(...stats.map((s) => s.totalKills)) : 0;
  }, [player, rawStats]);

  const history = useMemo(
    () => (player ? rawStats.filter((s) => s.playerName === player.playerName) : []),
    [player, rawStats]
  );

  const isLoading = isLoadingStats || isLoadingPlayers;

  // --- RENDER ---
  if (isLoading) return <LoadingSpinner text="Carregando perfil do jogador..." />;

  if (!player) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={<Target className="w-12 h-12" />}
          title="Jogador nao encontrado"
          subtitle={`Nenhum jogador com o identificador "${id}" foi encontrado.`}
        />
        <div className="mt-6 text-center">
          <Link
            to="/jogadores"
            className="text-green-400 hover:text-green-300 text-sm underline"
          >
            Voltar para o ranking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header com botão de voltar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] hover:bg-[#2a2a3a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#8a8a9e]" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#f0f0f5]">{player.playerName}</h1>
          <p className="text-sm text-[#5a5a6e]">
            Perfil e estatisticas detalhadas
          </p>
        </div>
      </div>

      {/* Card principal do jogador */}
      <div className="bg-[#12121a] rounded-2xl border border-[#2a2a3a] overflow-hidden">
        {/* Banner/Header do card */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent px-6 py-6 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <Target className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#f0f0f5]">{player.playerName}</h2>
              <p className="text-sm text-[#5a5a6e]">{player.teamName ?? "Sem time"}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Nicks anteriores */}
          {previousNicks.length > 0 && (
            <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-[#5a5a6e]" />
                <h3 className="text-sm font-medium text-[#8a8a9e]">Nicks anteriores</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {previousNicks.map((nick) => (
                  <span
                    key={nick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a0a0f] border border-[#2a2a3a] text-xs text-[#8a8a9e]"
                  >
                    <History className="w-3 h-3 text-[#5a5a6e]" />
                    {nick}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#2a2a3a]">
              <p className="text-xs text-[#5a5a6e] uppercase mb-1">Total Kills</p>
              <p className="text-2xl font-bold text-green-400">{player.totalKills}</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#2a2a3a]">
              <p className="text-xs text-[#5a5a6e] uppercase mb-1">XTs</p>
              <p className="text-2xl font-bold text-[#f0f0f5]">{player.participations}</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#2a2a3a]">
              <p className="text-xs text-[#5a5a6e] uppercase mb-1">Media</p>
              <p className="text-2xl font-bold text-[#f0f0f5]">{player.avgKills}</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#2a2a3a]">
              <p className="text-xs text-[#5a5a6e] uppercase mb-1">Recorde</p>
              <p className="text-2xl font-bold text-yellow-400">{bestPerformance}</p>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" /> Conquistas
              </h3>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a24] border border-[#2a2a3a] text-xs font-medium text-[#f0f0f5]"
                  >
                    <BadgeIcon badge={badge} />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Média por Quarto */}
          <div>
            <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Media por Quarto
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
                <p className="text-xs text-[#5a5a6e] mb-1">Q1</p>
                <p className="text-lg font-bold text-red-400">{avgPerQuarter.q1}</p>
              </div>
              <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
                <p className="text-xs text-[#5a5a6e] mb-1">Q2</p>
                <p className="text-lg font-bold text-orange-400">{avgPerQuarter.q2}</p>
              </div>
              <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
                <p className="text-xs text-[#5a5a6e] mb-1">Q3</p>
                <p className="text-lg font-bold text-purple-400">{avgPerQuarter.q3}</p>
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div>
            <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Evolucao
            </h3>
            <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
              <Sparkline data={sparkline} width={600} height={80} color="#4ade80" />
              <div className="flex justify-between mt-2 text-xs text-[#5a5a6e]">
                <span>Inicio</span>
                <span>Atual</span>
              </div>
            </div>
          </div>

          {/* Histórico */}
          <div>
            <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
              <History className="w-4 h-4" /> Historico de Participacoes
            </h3>
            <div className="space-y-2">
              {history
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((h) => (
                  <div
                    key={`${h.date}-${h.id}`}
                    className="flex items-center justify-between bg-[#1a1a24] rounded-lg border border-[#2a2a3a] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[#5a5a6e]" />
                      <span className="text-sm text-[#f0f0f5]">{h.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#5a5a6e]">
                        Q1: <span className="text-red-400">{h.q1Kills}</span>
                        {" / "}
                        Q2: <span className="text-orange-400">{h.q2Kills}</span>
                        {" / "}
                        Q3: <span className="text-purple-400">{h.q3Kills}</span>
                      </span>
                      <span className="text-sm font-bold text-green-400">
                        {h.totalKills} kills
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}