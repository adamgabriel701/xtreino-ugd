import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Target,
  Calendar,
  TrendingUp,
  BarChart3,
  Award,
  ArrowLeft,
  History,
  Tag,
  Flame,
  Users,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Sparkline, BadgeIcon } from "../components/xtreino";

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playerId = Number(id);

  const { data: player, isLoading, isError } = trpc.players.getById.useQuery(
    { id: playerId },
    { enabled: !isNaN(playerId) }
  );

  if (isNaN(playerId)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#8a8a9e]">ID inválido.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3">
        <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-[#8a8a9e]">Carregando perfil do jogador...</span>
      </div>
    );
  }

  if (isError || !player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Target className="w-12 h-12 text-[#5a5a6e]" />
        <p className="text-[#8a8a9e] text-lg">Jogador não encontrado</p>
        <Link
          to="/jogadores"
          className="text-sm text-green-400 hover:text-green-300 transition-colors"
        >
          Voltar para o ranking
        </Link>
      </div>
    );
  }

  const sparklineData = player.xtreinoStats
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => s.totalKills ?? 0);

  // CORREÇÃO: Usado xtreinoParticipations em vez de participations
  const p = player.xtreinoParticipations || 1;
  const totalQ1 = player.xtreinoStats.reduce((sum, s) => sum + (s.q1Kills ?? 0), 0);
  const totalQ2 = player.xtreinoStats.reduce((sum, s) => sum + (s.q2Kills ?? 0), 0);
  const totalQ3 = player.xtreinoStats.reduce((sum, s) => sum + (s.q3Kills ?? 0), 0);
  const avgQ1 = Math.round((totalQ1 / p) * 10) / 10;
  const avgQ2 = Math.round((totalQ2 / p) * 10) / 10;
  const avgQ3 = Math.round((totalQ3 / p) * 10) / 10;

  const badges: string[] = [];
  if (player.totalXtreinoKills >= 100) badges.push("100 Kills");
  if (player.totalXtreinoKills >= 300) badges.push("300 Kills");
  if (player.totalXtreinoKills >= 500) badges.push("500 Kills");
  if (player.xtreinoParticipations >= 5) badges.push("5 XTs");
  if (player.xtreinoParticipations >= 10) badges.push("10 XTs");
  if (player.xtreinoParticipations >= 20) badges.push("20 XTs");
  if (totalQ1 >= 50) badges.push("Q1 Master");
  if (totalQ2 >= 50) badges.push("Q2 Master");
  if (totalQ3 >= 50) badges.push("Q3 Master");
  const avg = player.xtreinoParticipations > 0 ? player.totalXtreinoKills / player.xtreinoParticipations : 0;
  if (avg >= 8) badges.push("Sniper");
  if (avg >= 12) badges.push("Elite");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0f5] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            {player.nickname}
          </h1>
          <p className="text-sm text-[#5a5a6e] mt-1">
            Perfil do jogador • ID: {player.id}
          </p>
        </div>
      </div>

      {player.previousNicks && player.previousNicks.length > 0 && (
        <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-[#5a5a6e]" />
            <h3 className="text-sm font-medium text-[#8a8a9e]">Nicks anteriores</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {player.previousNicks.map((nick) => (
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#12121a] rounded-xl p-5 border border-[#2a2a3a]">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-green-400" />
            <p className="text-xs text-[#5a5a6e] uppercase">Total Kills</p>
          </div>
          <p className="text-3xl font-bold text-green-400">{player.totalXtreinoKills}</p>
        </div>
        <div className="bg-[#12121a] rounded-xl p-5 border border-[#2a2a3a]">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-400" />
            <p className="text-xs text-[#5a5a6e] uppercase">Participações</p>
          </div>
          <p className="text-3xl font-bold text-[#f0f0f5]">{player.xtreinoParticipations}</p>
        </div>
        <div className="bg-[#12121a] rounded-xl p-5 border border-[#2a2a3a]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <p className="text-xs text-[#5a5a6e] uppercase">Média</p>
          </div>
          <p className="text-3xl font-bold text-[#f0f0f5]">{avg.toFixed(1)}</p>
        </div>
        <div className="bg-[#12121a] rounded-xl p-5 border border-[#2a2a3a]">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-[#5a5a6e] uppercase">Recorde</p>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{player.bestXtreinoKills}</p>
          {player.bestXtreinoDate && (
            <p className="text-xs text-[#5a5a6e] mt-1">{player.bestXtreinoDate}</p>
          )}
        </div>
      </div>

      {badges.length > 0 && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5">
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

      {sparklineData.length > 0 && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5">
          <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Evolução nos XTreinos
          </h3>
          <Sparkline data={sparklineData} width={800} height={100} color="#4ade80" />
          <div className="flex justify-between mt-2 text-xs text-[#5a5a6e]">
            <span>Primeiro XT</span>
            <span>Último XT</span>
          </div>
        </div>
      )}

      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5">
        <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Média por Quarto
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#2a2a3a] text-center">
            <p className="text-xs text-[#5a5a6e] mb-1">Q1</p>
            <p className="text-2xl font-bold text-red-400">{avgQ1}</p>
          </div>
          <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#2a2a3a] text-center">
            <p className="text-xs text-[#5a5a6e] mb-1">Q2</p>
            <p className="text-2xl font-bold text-orange-400">{avgQ2}</p>
          </div>
          <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#2a2a3a] text-center">
            <p className="text-xs text-[#5a5a6e] mb-1">Q3</p>
            <p className="text-2xl font-bold text-purple-400">{avgQ3}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a]">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
            <History className="w-5 h-5 text-green-400" />
            Histórico de Participações ({player.xtreinoStats.length})
          </h3>
        </div>
        <div className="divide-y divide-[#2a2a3a]">
          {player.xtreinoStats
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((stat) => (
              <div
                key={`${stat.date}-${stat.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-[#1a1a24] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a24] flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[#5a5a6e]" />
                  </div>
                  <span className="text-sm font-medium text-[#f0f0f5]">{stat.date}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-[#5a5a6e]">
                    Q1: <span className="text-red-400 font-medium">{stat.q1Kills}</span>
                  </span>
                  <span className="text-xs text-[#5a5a6e]">
                    Q2: <span className="text-orange-400 font-medium">{stat.q2Kills}</span>
                  </span>
                  <span className="text-xs text-[#5a5a6e]">
                    Q3: <span className="text-purple-400 font-medium">{stat.q3Kills}</span>
                  </span>
                  <span className="text-sm font-bold text-green-400 min-w-[60px] text-right">
                    {stat.totalKills} kills
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}