// constants/gameRules.ts

/**
 * Pontuação por posição no Xtreino (Q1, Q2, Q3)
 */
export const XTREINO_POSITION_POINTS: Record<number, number> = {
  1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5,
  9: 4, 10: 3, 11: 2, 12: 1, 13: 1, 14: 0, 15: 0,
};

/**
 * Pontuação por kill no Xtreino
 */
export const XTREINO_KILL_POINTS = 1;

/**
 * Pontuação por posição no Scrim (Modo BR)
 */
export const SCRIM_BR_POSITION_POINTS: Record<number, number> = {
  1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5, 
  9: 4, 10: 3, 11: 2, 12: 1, 13: 1, 14: 0, 15: 0,
};

/**
 * Regras de Badges dos Jogadores
 */
export const PLAYER_BADGE_RULES = [
  { label: "100 Kills", type: 'kills' as const, threshold: 100 },
  { label: "300 Kills", type: 'kills' as const, threshold: 300 },
  { label: "500 Kills", type: 'kills' as const, threshold: 500 },
  { label: "5 XTs", type: 'participations' as const, threshold: 5 },
  { label: "10 XTs", type: 'participations' as const, threshold: 10 },
  { label: "20 XTs", type: 'participations' as const, threshold: 20 },
  { label: "Sniper", type: 'avg' as const, threshold: 8 },
  { label: "Elite", type: 'avg' as const, threshold: 12 },
];

export function calculatePlayerBadges(totalKills: number, participations: number, avgKills: number): string[] {
  return PLAYER_BADGE_RULES
    .filter((rule) => {
      if (rule.type === 'kills') return totalKills >= rule.threshold;
      if (rule.type === 'participations') return participations >= rule.threshold;
      if (rule.type === 'avg') return avgKills >= rule.threshold;
      return false;
    })
    .map((rule) => rule.label);
}