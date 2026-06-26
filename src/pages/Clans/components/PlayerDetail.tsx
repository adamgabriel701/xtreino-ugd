import { Target, Swords, Award, Calendar, BarChart3 } from "lucide-react";
import type { XtreinoStats } from "../types/clans";
import { formatDateBR, formatMonthBR } from "../utils/date";
import PageHeader from "./PageHeader";

interface PlayerDetailProps {
  nickname: string;
  player: { id: number; nickname: string; kills: number; deaths: number; totalXtreinoKills?: number; xtreinoParticipations?: number; } | null;
  clanName: string;
  teamName: string;
  xtreinoHistory: XtreinoStats[];
  selectedMonth: string;
  onBack: () => void;
}

export default function PlayerDetail({ player, clanName, teamName, xtreinoHistory, selectedMonth, onBack }: PlayerDetailProps) {
  if (!player) return null;

  const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <PageHeader
        title={player.nickname}
        subtitle={`${clanName} / ${teamName}`}
        onBack={onBack}
        icon={<Target className="w-8 h-8 text-emerald-400/50" />}
      />

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-emerald-400" /><span className="text-xs text-[#5a5a6e] uppercase">K/D Geral</span></div>
            <p className="text-xl font-bold text-[#f0f0f5]">{kd}</p>
          </div>
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2"><Swords className="w-4 h-4 text-emerald-400" /><span className="text-xs text-[#5a5a6e] uppercase">Kills Geral</span></div>
            <p className="text-xl font-bold text-[#f0f0f5]">{player.kills}</p>
          </div>
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2"><Award className="w-4 h-4 text-emerald-400" /><span className="text-xs text-[#5a5a6e] uppercase">XT Kills</span></div>
            <p className="text-xl font-bold text-emerald-400">{player.totalXtreinoKills ?? 0}</p>
          </div>
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2"><Calendar className="w-4 h-4 text-emerald-400" /><span className="text-xs text-[#5a5a6e] uppercase">XT Partic.</span></div>
            <p className="text-xl font-bold text-[#f0f0f5]">{player.xtreinoParticipations ?? 0}</p>
          </div>
        </div>

        {xtreinoHistory.length > 0 && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a]">
              <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Histórico de XTreinos
                {selectedMonth && <span className="text-sm font-normal text-[#5a5a6e]">— {formatMonthBR(selectedMonth)}</span>}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3a]">
                  {xtreinoHistory.map((stat) => (
                    <tr key={`${stat.date}-${stat.xtreinoId}`} className="hover:bg-[#1a1a24]">
                      <td className="px-4 py-3 text-sm text-[#f0f0f5]">{formatDateBR(stat.date)}</td>
                      <td className="px-4 py-3 text-sm text-[#8a8a9e]">{stat.teamName}</td>
                      <td className="px-4 py-3 text-sm text-center text-[#8a8a9e]">{stat.q1Kills}</td>
                      <td className="px-4 py-3 text-sm text-center text-[#8a8a9e]">{stat.q2Kills}</td>
                      <td className="px-4 py-3 text-sm text-center text-[#8a8a9e]">{stat.q3Kills}</td>
                      <td className="px-4 py-3 text-sm text-center text-emerald-400 font-bold">{stat.totalKills}</td>
                      <td className="px-4 py-3 text-sm text-center text-emerald-400">{stat.killPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}