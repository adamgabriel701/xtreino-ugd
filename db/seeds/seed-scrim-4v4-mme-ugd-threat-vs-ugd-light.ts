// db/seeds/seed-scrim-4v4-mme-ugd-threat-vs-ugd-light.ts
// Seed da scrim 4v4 MME: UGD Threat vs UGD LIGHT — 02/05/2026

import { getDb } from "../../api/queries/connection.js";
import { scrims, scrimResults, scrimResultRounds, scrimPlayerStats, scrimPlayerStatRounds, seedRuns } from "../schema.js";
import { eq, inArray } from "drizzle-orm";

// ============================================================
// DADOS DA SCRIM
// ============================================================

const SCRIM_ID = 3; // Próximo ID disponível
const SCRIM_DATE = "2026-05-02";
const SCRIM_NAME = "Scrim 4v4 MME — UGD Threat vs UGD LIGHT";
const SCRIM_TIME = "21:00";
const SCRIM_MODALITY = "4v4";
const SCRIM_MODE = "mme"; 
const SCRIM_STATUS = "concluido";
const SCRIM_RESULT = "UGD Threat 2-2 UGD LIGHT (Ilha do Medo, Ilha do Medo, Ilha do Medo, Ilha do Medo)";

// --- RESULTADOS DOS TIMES ---
const TEAM_RESULTS = [
  {
    teamName: "UGD Threat",
    rounds: [
      { roundNumber: 1, value: 8 }, // Q1
      { roundNumber: 2, value: 5 }, // Q2
      { roundNumber: 3, value: 1 }, // Q3
      { roundNumber: 4, value: 8 }, // Q4
    ],
  },
  {
    teamName: "UGD LIGHT",
    rounds: [
      { roundNumber: 1, value: 7 }, // Q1
      { roundNumber: 2, value: 8 }, // Q2
      { roundNumber: 3, value: 8 }, // Q3
      { roundNumber: 4, value: 2 }, // Q4
    ],
  },
];

// --- ESTATISTICAS DOS JOGADORES ---
const PLAYER_STATS: [string, string,
  number, number, number, number, boolean, number,
  number, number, number, number, boolean, number,
  number, number, number, number, boolean, number,
  number, number, number, number, boolean, number,
  number, number, number, number, number][] = [
  // UGD Threat
  ["Rivers", "UGD Threat",
    12, 4, 8, 5695, true, 8,   // Q1: Ilha do Medo (8-7)
    14, 5, 8, 5295, true, 5,   // Q2: Ilha do Medo (5-8)
     2, 1, 8, 1791, false, 1,   // Q3: Ilha do Medo (1-8)
     5, 7, 5, 3504, false, 8,   // Q4: Ilha do Medo (8-2)
    33, 17, 29, 16285, 2],       // Totais
  ["GD⚡ Neo⁷", "UGD Threat",
     8, 8, 7, 5684, false, 8,   // Q1: Ilha do Medo (8-7)
    10, 5, 8, 4651, false, 5,   // Q2: Ilha do Medo (5-8)
     2, 3, 8, 2619, false, 1,   // Q3: Ilha do Medo (1-8)
     8, 10, 3, 4158, false, 8,   // Q4: Ilha do Medo (8-2)
    28, 26, 26, 17112, 0],       // Totais
  ["UGD⚡ Kaze", "UGD Threat",
     7, 3, 8, 3142, false, 8,   // Q1: Ilha do Medo (8-7)
     1, 7, 8, 2547, false, 5,   // Q2: Ilha do Medo (5-8)
     1, 1, 8, 1315, false, 1,   // Q3: Ilha do Medo (1-8)
     7, 3, 3, 2727, false, 8,   // Q4: Ilha do Medo (8-2)
    16, 14, 27, 9731, 0],       // Totais
  ["GD⚡ Ween", "UGD Threat",
     6, 5, 8, 3728, false, 8,   // Q1: Ilha do Medo (8-7)
     4, 12, 8, 2976, false, 5,   // Q2: Ilha do Medo (5-8)
     0, 0, 0, 0, false, 1,   // Q3: Não jogou
     0, 0, 0, 0, false, 8,   // Q4: Não jogou
    10, 17, 16, 6704, 0],       // Totais
  ["UGD⚡ Treon", "UGD Threat",
     0, 0, 0, 0, false, 8,   // Q1: Não jogou
     0, 0, 0, 0, false, 5,   // Q2: Não jogou
     4, 1, 8, 2961, true, 1,   // Q3: Ilha do Medo (1-8)
    12, 11, 2, 3573, true, 8,   // Q4: Ilha do Medo (8-2)
    16, 12, 10, 6534, 2],       // Totais
  // UGD LIGHT
  ["UGD⚡ Kyz", "UGD LIGHT",
    10, 6, 8, 4960, true, 7,   // Q1: Ilha do Medo (7-8)
    13, 5, 7, 3353, true, 8,   // Q2: Ilha do Medo (8-5)
     7, 8, 2, 3539, false, 8,   // Q3: Ilha do Medo (8-1)
     3, 2, 8, 1868, false, 2,   // Q4: Ilha do Medo (2-8)
    33, 21, 25, 13720, 2],       // Totais
  ["Not¹ Zen", "UGD LIGHT",
     8, 7, 9, 4561, false, 7,   // Q1: Ilha do Medo (7-8)
     5, 7, 9, 2709, false, 8,   // Q2: Ilha do Medo (8-5)
     4, 4, 3, 1165, false, 8,   // Q3: Ilha do Medo (8-1)
     3, 2, 8, 2141, false, 2,   // Q4: Ilha do Medo (2-8)
    20, 20, 29, 10576, 0],       // Totais
  ["✧Sike", "UGD LIGHT",
     7, 7, 8, 4784, false, 7,   // Q1: Ilha do Medo (7-8)
     9, 10, 6, 3649, false, 8,   // Q2: Ilha do Medo (8-5)
    14, 7, 2, 4796, true, 8,   // Q3: Ilha do Medo (8-1)
     3, 3, 8, 2832, false, 2,   // Q4: Ilha do Medo (2-8)
    33, 27, 24, 16061, 1],       // Totais
  ["GD⚡ Psych", "UGD LIGHT",
     6, 8, 8, 3713, false, 7,   // Q1: Ilha do Medo (7-8)
     5, 11, 7, 3917, false, 8,   // Q2: Ilha do Medo (8-5)
     7, 6, 2, 2147, false, 8,   // Q3: Ilha do Medo (8-1)
     4, 3, 8, 2032, true, 2,   // Q4: Ilha do Medo (2-8)
    22, 28, 25, 11809, 1],       // Totais
];

// ============================================================
// LÓGICA DO SEED
// ============================================================

export function seed() {
  const db = getDb();
  console.log("[SEED] Starting scrim 4v4 MME seed (UGD Threat vs UGD LIGHT)...");

  // 0. Limpa dados antigos do ID para poder re-rodar o seed sem erro de chave duplicada
  db.delete(scrimPlayerStatRounds).where(
    inArray(
      scrimPlayerStatRounds.scrimPlayerStatId, 
      db.select({ id: scrimPlayerStats.id }).from(scrimPlayerStats).where(eq(scrimPlayerStats.scrimId, SCRIM_ID))
    )
  ).run();

  db.delete(scrimPlayerStats).where(eq(scrimPlayerStats.scrimId, SCRIM_ID)).run();

  db.delete(scrimResultRounds).where(
    inArray(
      scrimResultRounds.scrimResultId, 
      db.select({ id: scrimResults.id }).from(scrimResults).where(eq(scrimResults.scrimId, SCRIM_ID))
    )
  ).run();

  db.delete(scrimResults).where(eq(scrimResults.scrimId, SCRIM_ID)).run();
  db.delete(scrims).where(eq(scrims.id, SCRIM_ID)).run();
  console.log("[SEED] Limpei dados antigos do ID " + SCRIM_ID + ".");

  // 1. Inserir o scrim na tabela scrims
  db.insert(scrims).values({
    id: SCRIM_ID,
    name: SCRIM_NAME,
    date: SCRIM_DATE,
    time: SCRIM_TIME,
    modality: SCRIM_MODALITY,
    mode: SCRIM_MODE,
    status: SCRIM_STATUS,
    result: SCRIM_RESULT,
  }).run();
  console.log(`[SEED] Scrim criado com ID: ${SCRIM_ID}`);

  // 2. Inserir resultados dos times e suas rodadas
  for (const tr of TEAM_RESULTS) {
    const res = db.insert(scrimResults).values({
      scrimId: SCRIM_ID,
      date: SCRIM_DATE,
      teamName: tr.teamName,
    }).run();
    const resultId = Number(res.lastInsertRowid);

    db.insert(scrimResultRounds).values(
      tr.rounds.map(r => ({ scrimResultId: resultId, ...r }))
    ).run();
  }
  console.log(`[SEED] 2 team results com rounds criados.`);

  // 3. Inserir estatísticas dos jogadores
  for (const [
    playerName, teamName,
    q1Kills, q1Assists, q1Deaths, q1Damage, q1Mvp, q1Score,
    q2Kills, q2Assists, q2Deaths, q2Damage, q2Mvp, q2Score,
    q3Kills, q3Assists, q3Deaths, q3Damage, q3Mvp, q3Score,
    q4Kills, q4Assists, q4Deaths, q4Damage, q4Mvp, q4Score,
    totalKills, totalAssists, totalDeaths, totalDamage, totalMvp
  ] of PLAYER_STATS) {
    
    const res = db.insert(scrimPlayerStats).values({
      scrimId: SCRIM_ID,
      date: SCRIM_DATE,
      teamName,
      playerName,
      totalKills,
      totalAssists,
      totalDeaths,
      totalDamage,
      totalMvp,
    }).run();
    const statId = Number(res.lastInsertRowid);

    const dynamicRounds = [
      { scrimPlayerStatId: statId, roundNumber: 1, kills: q1Kills, assists: q1Assists, deaths: q1Deaths, damage: q1Damage, mvp: q1Mvp, score: q1Score },
      { scrimPlayerStatId: statId, roundNumber: 2, kills: q2Kills, assists: q2Assists, deaths: q2Deaths, damage: q2Damage, mvp: q2Mvp, score: q2Score },
      { scrimPlayerStatId: statId, roundNumber: 3, kills: q3Kills, assists: q3Assists, deaths: q3Deaths, damage: q3Damage, mvp: q3Mvp, score: q3Score },
      { scrimPlayerStatId: statId, roundNumber: 4, kills: q4Kills, assists: q4Assists, deaths: q4Deaths, damage: q4Damage, mvp: q4Mvp, score: q4Score },
    ];

    db.insert(scrimPlayerStatRounds).values(dynamicRounds).run();
  }
  console.log(`[SEED] ${PLAYER_STATS.length} player stats com rounds criados.`);

  // 4. Registrar seed run
  const seedName = "scrim-4v4-mme-ugd-threat-vs-ugd-light-2026-05-02";
  const existingSeed = db.select().from(seedRuns).where(eq(seedRuns.seedName, seedName)).get();
  if (!existingSeed) {
    db.insert(seedRuns).values({ seedName }).run();
  }

  console.log("[SEED] Seed concluído com sucesso! Acesse /scrims/match/" + SCRIM_ID);
}