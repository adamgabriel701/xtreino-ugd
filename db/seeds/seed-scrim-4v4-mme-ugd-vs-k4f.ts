// db/seeds/seed-scrim-4v4-ugd-vs-k4f.ts
// Seed da scrim 4v4 MME: UGD Threat vs K4F — 13/06/2026
// FORÇA O ID 1 PARA GARANTIR A URL /scrims/match/1

import { getDb } from "../../api/queries/connection.js";
import { scrims, scrimResults, scrimResultRounds, scrimPlayerStats, scrimPlayerStatRounds, seedRuns } from "../schema.js";
import { eq, and, sql, inArray } from "drizzle-orm"; // <-- ADICIONADO o inArray AQUI

// ============================================================
// DADOS DA SCRIM
// ============================================================

const SCRIM_ID = 1; // ID FORÇADO
const SCRIM_DATE = "2026-06-13";
const SCRIM_NAME = "Scrim 4v4 MME — UGD Threat vs K4F";
const SCRIM_TIME = "21:00";
const SCRIM_MODALITY = "4v4";
const SCRIM_MODE = "mme"; 
const SCRIM_STATUS = "concluido";
const SCRIM_RESULT = "UGD Threat 3-0 K4F (Vale Deserto, Ilha do Medo, Ilha do Medo)";

// --- RESULTADOS DOS TIMES (Agora usando formato de Rodadas) ---
const TEAM_RESULTS = [
  {
    teamName: "UGD Threat",
    rounds: [
      { roundNumber: 1, value: 7 }, // Q1
      { roundNumber: 2, value: 7 }, // Q2
      { roundNumber: 3, value: 7 }, // Q3
    ],
  },
  {
    teamName: "K4F",
    rounds: [
      { roundNumber: 1, value: 1 }, // Q1
      { roundNumber: 2, value: 1 }, // Q2
      { roundNumber: 3, value: 0 }, // Q3
    ],
  },
];

// --- ESTATISTICAS DOS JOGADORES (Mantido no seu formato original) ---
const PLAYER_STATS: [string, string,
  number, number, number, number, boolean, number,
  number, number, number, number, boolean, number,
  number, number, number, number, boolean, number,
  number, number, number, number, number][] = [
  // UGD Threat
  ["IGD⚡ Ares",    "UGD Threat",
    11, 5,  1, 3100, true,  7,   // Q1: Vale Deserto (7-1)
     9, 14, 2, 3308, false, 7,   // Q2: Ilha do Medo (7-1)
    11, 4,  0, 4442, true,  7,   // Q3: Ilha do Medo (7-0)
    31, 23, 3, 10850, 2],       // Totais
  ["UGD⚡ Ohara",   "UGD Threat",
     8, 10, 1, 3604, false, 7,   // Q1: Vale Deserto (7-1)
    12, 7,  1, 2732, true,  7,   // Q2: Ilha do Medo (7-1)
     7, 6,  1, 2900, false, 7,   // Q3: Ilha do Medo (7-0)
    27, 23, 3, 9236, 1],        // Totais
  ["Dexz⁷RYL",     "UGD Threat",
     7, 7,  1, 2866, false, 7,   // Q1: Vale Deserto (7-1)
     4, 9,  1, 1595, false, 7,   // Q2: Ilha do Medo (7-1)
     7, 4,  1, 2522, false, 7,   // Q3: Ilha do Medo (7-0)
    18, 20, 3, 6983, 0],        // Totais
  ["GD⚡ A R",      "UGD Threat",
     3, 5,  2, 2277, false, 7,   // Q1: Vale Deserto (7-1)
     4, 3,  1, 1042, false, 7,   // Q2: Ilha do Medo (7-1)
     3, 8,  2, 1678, false, 7,   // Q3: Ilha do Medo (7-0)
    10, 16, 5, 4997, 0],        // Totais
  // K4F
  ["K4F Zaza",     "K4F",
     2, 2,  7, 1687, true,  1,   // Q1: Vale Deserto (1-7)
     2, 1,  7, 895,  false, 1,   // Q2: Ilha do Medo (1-7)
     1, 1,  7, 1451, false, 0,   // Q3: Ilha do Medo (0-7)
     5, 4,  21, 4033, 1],       // Totais
  ["K4F NINE",     "K4F",
     2, 1,  7, 1822, false, 1,   // Q1: Vale Deserto (1-7)
     1, 0,  8, 528,  false, 1,   // Q2: Ilha do Medo (1-7)
     1, 0,  7, 1416, false, 0,   // Q3: Ilha do Medo (0-7)
     4, 1,  22, 3766, 0],       // Totais
  ["K4F Guilok07", "K4F",
     1, 1,  7, 957,  false, 1,   // Q1: Vale Deserto (1-7)
     2, 2,  7, 1938, true,  1,   // Q2: Ilha do Medo (1-7)
     2, 2,  7, 2156, true,  0,   // Q3: Ilha do Medo (0-7)
     5, 5,  21, 5051, 2],       // Totais
  ["ÉouUrSo",       "K4F",
     0, 0,  8, 525,  false, 1,   // Q1: Vale Deserto (1-7)
     0, 1,  7, 1245, false, 1,   // Q2: Ilha do Medo (1-7)
     0, 0,  7, 880,  false, 0,   // Q3: Ilha do Medo (0-7)
     0, 1,  22, 2650, 0],       // Totais
];

// ============================================================
// LÓGICA DO SEED
// ============================================================

export function seed() {
  const db = getDb();
  console.log("[SEED] Starting scrim 4v4 MME seed (Forçando ID 1)...");

  // 0. Limpa dados antigos do ID 1 para poder re-rodar o seed sem erro de chave duplicada
  // CORREÇÃO AQUI: Uso do inArray com subquery em vez do eq com sql bruto
  db.delete(scrimPlayerStatRounds).where(
    inArray(
      scrimPlayerStatRounds.scrimPlayerStatId, 
      db.select({ id: scrimPlayerStats.id }).from(scrimPlayerStats).where(eq(scrimPlayerStats.scrimId, SCRIM_ID))
    )
  ).run();

  db.delete(scrimPlayerStats).where(eq(scrimPlayerStats.scrimId, SCRIM_ID)).run();

  // CORREÇÃO AQUI: Uso do inArray com subquery em vez do eq com sql bruto
  db.delete(scrimResultRounds).where(
    inArray(
      scrimResultRounds.scrimResultId, 
      db.select({ id: scrimResults.id }).from(scrimResults).where(eq(scrimResults.scrimId, SCRIM_ID))
    )
  ).run();

  db.delete(scrimResults).where(eq(scrimResults.scrimId, SCRIM_ID)).run();
  db.delete(scrims).where(eq(scrims.id, SCRIM_ID)).run();
  console.log("[SEED] Limpei dados antigos do ID 1.");

  // 1. Inserir o scrim na tabela scrims com o ID 1
  db.insert(scrims).values({
    id: SCRIM_ID, // ID FORÇADO
    name: SCRIM_NAME,
    date: SCRIM_DATE,
    time: SCRIM_TIME,
    modality: SCRIM_MODALITY,
    mode: SCRIM_MODE,
    status: SCRIM_STATUS,
    result: SCRIM_RESULT,
  }).run();
  console.log(`[SEED] Scrim criado com ID fixo: ${SCRIM_ID}`);

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
    ];

    db.insert(scrimPlayerStatRounds).values(dynamicRounds).run();
  }
  console.log(`[SEED] 8 player stats com rounds criados.`);

  // 4. Registrar seed run
  const seedName = "scrim-4v4-mme-ugd-vs-k4f-v3";
  const existingSeed = db.select().from(seedRuns).where(eq(seedRuns.seedName, seedName)).get();
  if (!existingSeed) {
    db.insert(seedRuns).values({ seedName }).run();
  }

  console.log("[SEED] Seed concluído com sucesso! Acesse /scrims/match/1");
}