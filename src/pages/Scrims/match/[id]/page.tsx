"use client";

import { useParams, useNavigate } from "react-router-dom"; // MUDANÇA AQUI: React Router ao invés de Next Navigation
import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import type { ScrimItem, PlayerStat } from "../../types"; // MUDANÇA AQUI: Caminho relativo correto
import { ArrowLeft, Star } from "lucide-react";

// Cores do tema
const COLORS = {
  winner: {
    bg: "bg-blue-600/80",
    text: "text-blue-400",
    border: "border-blue-500/50",
    neon: "text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]",
  },
  loser: {
    bg: "bg-red-600/80",
    text: "text-red-400",
    border: "border-red-500/50",
    neon: "text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]",
  },
};

export default function MatchResultPage() {
  const params = useParams();
  const navigate = useNavigate(); // MUDANÇA AQUI
  const scrimId = Number(params.id);

  // Busca dados do agendamento
  const { data: allScrims } = trpc.scrims.list.useQuery(undefined, {
    select: (data) => (data as ScrimItem[]).find((s) => s.id === scrimId),
  });
  const scrim = allScrims;

  // Busca stats dos jogadores usando a rota individual que criamos (busca por time)
  const { data: team1Stats } = trpc.scrims.teamStatsByName.useQuery(
    { teamName: scrim?.team1Name || "" },
    { enabled: !!scrim?.team1Name }
  );
  const { data: team2Stats } = trpc.scrims.teamStatsByName.useQuery(
    { teamName: scrim?.team2Name || "" },
    { enabled: !!scrim?.team2Name }
  );

  const isLoading = !scrim; // Simplificado

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <p className="text-white text-xl animate-pulse">Carregando tela de fim de partida...</p>
      </div>
    );
  }

  if (!scrim) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white text-2xl">Scrim não encontrado.</p>
        <button onClick={() => navigate("/scrims")} className="text-blue-400 hover:underline">Voltar para Scrims</button>
      </div>
    );
  }

  // Lógica para descobrir quem ganhou
  const resultText = scrim.result || "";
  const team1Name = scrim.team1Name || "Time 1";
  const team2Name = scrim.team2Name || "Time 2";
  
  const scoreMatch = resultText.match(/(\d+)-(\d+)/);
  const score1 = scoreMatch ? parseInt(scoreMatch[1]) : 0;
  const score2 = scoreMatch ? parseInt(scoreMatch[2]) : 0;

  const isTeam1Winner = score1 > score2;
  
  const winnerTeam = isTeam1Winner ? team1Name : team2Name;
  const loserTeam = isTeam1Winner ? team2Name : team1Name;
  const winnerScore = isTeam1Winner ? score1 : score2;
  const loserScore = isTeam1Winner ? score2 : score1;

  // Força tipagem e separa jogadores (Corrigindo o erro do createdAt)
  const winnerPlayers = (isTeam1Winner ? team1Stats : team2Stats) as PlayerStat[] | undefined;
  const loserPlayers = (isTeam1Winner ? team2Stats : team1Stats) as PlayerStat[] | undefined;

  // Ordena para que o MVP fique em primeiro
  const sortByMvp = (a: PlayerStat, b: PlayerStat) => (b.totalMvp || 0) - (a.totalMvp || 0);
  const sortedWinners = [...(winnerPlayers || [])].sort(sortByMvp);
  const sortedLosers = [...(loserPlayers || [])].sort(sortByMvp);

  // Função para pegar dados totais
  const getRowData = (p: PlayerStat) => ({
    name: p.playerName.replace(/[⚡⁷]/g, "").trim(),
    kills: p.totalKills,
    assists: p.totalAssists,
    deaths: p.totalDeaths,
    damage: p.totalDamage,
    isMvp: (p.totalMvp || 0) > 0,
  });

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-center font-sans">
      
      {/* Fundo */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-black/80 to-black z-0" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-sm z-0" />
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-0" />

      {/* Conteúdo Principal */}
      <div className="relative z-10 w-full max-w-5xl px-6 py-12 flex flex-col items-center gap-10">
        
        {/* Botão Voltar */}
        <div className="w-full flex justify-start">
          <button 
            onClick={() => navigate("/scrims")} // MUDANÇA AQUI
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>

        {/* Cabeçalho */}
        <div className="text-center space-y-3">
          <h1 className="text-6xl md:text-8xl font-black text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] uppercase tracking-wider">
            Vitória
          </h1>
          <div className="inline-block bg-yellow-500/20 border border-yellow-500/50 px-6 py-1.5 rounded-sm backdrop-blur-sm">
            <p className="text-yellow-300 font-bold tracking-widest text-sm uppercase">
              Batalha em Equipe — {scrim.modality?.toUpperCase() || "4V4"}
            </p>
          </div>
        </div>

        {/* Placar e Tabelas */}
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          
          {/* Placar (Esquerda) */}
          <div className="flex flex-col items-center gap-6 w-40">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-2xl" />
              <span className={`text-8xl font-black ${COLORS.winner.neon}`}>{winnerScore}</span>
            </div>
            <span className="text-gray-500 text-2xl font-bold">VS</span>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-red-500/10 rounded-2xl blur-2xl" />
              <span className={`text-8xl font-black ${COLORS.loser.neon}`}>{loserScore}</span>
            </div>
          </div>

          {/* Tabelas (Direita) */}
          <div className="flex-1 max-w-2xl w-full flex flex-col gap-4 backdrop-blur-md bg-black/40 p-4 rounded-2xl border border-white/10">
            
            {/* Tabela do Vencedor (Azul) */}
            <div className={`rounded-lg overflow-hidden border ${COLORS.winner.border}`}>
              <div className={`${COLORS.winner.bg} px-4 py-2.5 flex items-center justify-between`}>
                <h2 className="text-white font-bold tracking-wide uppercase text-sm">{winnerTeam}</h2>
                <span className="text-xs font-semibold bg-blue-400/20 text-blue-100 px-2 py-0.5 rounded">VENCEDOR</span>
              </div>
              <table className="w-full text-sm bg-black/50">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase border-b border-white/10">
                    <th className="text-left py-2 px-4 font-medium">Jogadores</th>
                    <th className="text-center py-2 px-2 font-medium">Abates</th>
                    <th className="text-center py-2 px-2 font-medium">Assist.</th>
                    <th className="text-center py-2 px-2 font-medium">Mortes</th>
                    <th className="text-right py-2 px-4 font-medium">Dano</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWinners.map((p, idx) => {
                    const data = getRowData(p);
                    const isMvp = idx === 0 && data.isMvp;
                    return (
                      <tr key={p.id} className={`border-b border-white/5 text-gray-200 ${isMvp ? "bg-yellow-500/10 border-l-4 border-l-yellow-500" : ""}`}>
                        <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                          {isMvp && (
                            <span className="flex items-center gap-1 text-[10px] font-black bg-yellow-500 text-black px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                              <Star className="w-2.5 h-2.5" /> MVP
                            </span>
                          )}
                          {data.name}
                        </td>
                        <td className="text-center py-2.5 px-2 text-white font-semibold">{data.kills}</td>
                        <td className="text-center py-2.5 px-2 text-gray-400">{data.assists}</td>
                        <td className="text-center py-2.5 px-2 text-gray-400">{data.deaths}</td>
                        <td className="text-right py-2.5 px-4 text-gray-300 font-mono">{data.damage.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {sortedWinners.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500 text-xs">Sem dados de jogadores</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Tabela do Perdedor (Vermelho) */}
            <div className={`rounded-lg overflow-hidden border ${COLORS.loser.border}`}>
              <div className={`${COLORS.loser.bg} px-4 py-2.5 flex items-center justify-between`}>
                <h2 className="text-white font-bold tracking-wide uppercase text-sm">{loserTeam}</h2>
                <span className="text-xs font-semibold bg-red-400/20 text-red-100 px-2 py-0.5 rounded">DERROTADO</span>
              </div>
              <table className="w-full text-sm bg-black/50">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase border-b border-white/10">
                    <th className="text-left py-2 px-4 font-medium">Jogadores</th>
                    <th className="text-center py-2 px-2 font-medium">Abates</th>
                    <th className="text-center py-2 px-2 font-medium">Assist.</th>
                    <th className="text-center py-2 px-2 font-medium">Mortes</th>
                    <th className="text-right py-2 px-4 font-medium">Dano</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLosers.map((p, idx) => {
                    const data = getRowData(p);
                    const isMvp = idx === 0 && data.isMvp;
                    return (
                      <tr key={p.id} className="border-b border-white/5 text-gray-200">
                        <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                          {isMvp && (
                            <span className="flex items-center gap-1 text-[10px] font-black bg-gray-600 text-gray-200 px-1.5 py-0.5 rounded">
                              <Star className="w-2.5 h-2.5" /> MVP
                            </span>
                          )}
                          {data.name}
                        </td>
                        <td className="text-center py-2.5 px-2 text-white font-semibold">{data.kills}</td>
                        <td className="text-center py-2.5 px-2 text-gray-400">{data.assists}</td>
                        <td className="text-center py-2.5 px-2 text-gray-400">{data.deaths}</td>
                        <td className="text-right py-2.5 px-4 text-gray-300 font-mono">{data.damage.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {sortedLosers.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500 text-xs">Sem dados de jogadores</td></tr>}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 text-center text-gray-500 text-xs space-x-4">
          <span>{scrim.date}</span>
          <span>•</span>
          <span>{scrim.time}</span>
          <span>•</span>
          <span className="text-yellow-500/70">MELHOR DE {winnerScore + loserScore}</span>
        </div>

      </div>
    </div>
  );
}