// utils/xtreino.ts
import type { TeamDuelData } from "@/types/xtreinos";

export const POSITION_POINTS: Record<number, number> = { 1: 10, 2: 7, 3: 5, 4: 3, 5: 2, 6: 1 };
export const KILL_POINTS = 0.5;

export function buildDuelData(
  teamName: string,
  results: Array<{ teamName: string; q1Pos: number | null; q2Pos: number | null; q3Pos: number | null }>,
  playerStats: Array<{ teamName: string; playerName: string; q1Kills: number; q2Kills: number; q3Kills: number; totalKills: number }>
): TeamDuelData {
  const result = results.find((r) => r.teamName === teamName);
  const players = playerStats
    .filter((p) => p.teamName === teamName)
    .sort((a, b) => b.totalKills - a.totalKills);

  const totalKills = players.reduce((sum, p) => sum + p.totalKills, 0);
  const q1Pos = result?.q1Pos ?? null;
  const q2Pos = result?.q2Pos ?? null;
  const q3Pos = result?.q3Pos ?? null;
  
  const totalPosPoints = (POSITION_POINTS[q1Pos ?? 0] ?? 0) + (POSITION_POINTS[q2Pos ?? 0] ?? 0) + (POSITION_POINTS[q3Pos ?? 0] ?? 0);
  const totalKillPoints = totalKills * KILL_POINTS;
  const totalPoints = totalPosPoints + totalKillPoints;

  return {
    teamName,
    q1Pos,
    q2Pos,
    q3Pos,
    totalPosPoints: Math.round(totalPosPoints),
    totalKills,
    totalKillPoints: Math.round(totalKillPoints),
    totalPoints: Math.round(totalPoints),
    players,
  };
}

export const TEAM_COLORS = [
  "#4ade80", "#f87171", "#60a5fa", "#facc15", "#c084fc",
];