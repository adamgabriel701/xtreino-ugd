// db/seeds/seed-scrim-4v4-mme-underground-vs-dinasty.ts
// Seed da scrim 4v4 MME: Underground vs Dinasty Kingdom — 03/05/2026

import { getDb } from "../../api/queries/connection.js";
import { scrims, scrimResults, scrimResultRounds, scrimPlayerStats, scrimPlayerStatRounds, seedRuns } from "../schema.js";
import { eq, inArray } from "drizzle-orm";

// ============================================================
// DADOS DA SCRIM
// ============================================================

const SCRIM_ID = 2; // Próximo ID disponível
const SCRIM_DATE = "2026-05-03";
const SCRIM_NAME = "Scrim 4v4 MME — Underground vs Dinasty Kingdom";
const SCRIM_TIME = "21:00";
const SCRIM_MODALITY = "4v4";
const SCRIM_MODE = "mme"; 
const SCRIM_STATUS = "concluido";
const SCRIM_RESULT = "Underground 2-0 Dinasty Kingdom (Ilha do Medo, Ilha do Medo)";

// --- RESULTADOS DOS TIMES ---
const TEAM_RESULTS = [
  {
    teamName: "Underground",
    rounds: [
      { roundNumber: 1, value: 7 }, // Q1
      { roundNumber: 2, value: 7 }, // Q2
      { roundNumber: 3, value: 0 }, // Q3 (não jogada)
    ],
  },
  {
    teamName: "Dinasty Kingdom",
    rounds: [
      { roundNumber: 1, value: 0 }, // Q1
      { roundNumber: 2, value: 0 }, // Q2
      { roundNumber: 3, value: 0 }, // Q3 (não jogada)
    ],
  },
];

// --- ESTATISTICAS DOS JOGADORES ---
const PLAYER_STATS: [string, string,
  number, number, number, number, boolean, number,
  number, number, number, number, boolean, number,
  number, number, number, number, boolean, number,
  number, number, number, number, number][] = [
  // Underground
  ["OFfzrᴿʸᴸ", "Underground",
    10, 9, 0, 4503, true, 7,   // Q1: Ilha do Medo (7-0)
     5, 13, 1, 3282, false, 7,   // Q2: Ilha do Medo (7-0)
     0, 0, 0, 0, false, 7,   // Q3: Não jogada
    15, 22, 1, 7785, 1],       // Totais
  ["UGD⚡ Ares", "Underground",
     7, 5, 2, 2145, false, 7,   // Q1: Ilha do Medo (7-0)
     8, 4, 1, 3283, false, 7,   // Q2: Ilha do Medo (7-0)
     0, 0, 0, 0, false, 7,   // Q3: Não jogada
    15, 9, 3, 5428, 0],       // Totais
  ["Mayazᴿʸᴸ✨", "Underground",
     7, 4, 0, 2228, false, 7,   // Q1: Ilha do Medo (7-0)
     9, 4, 1, 3639, true, 7,   // Q2: Ilha do Medo (7-0)
     0, 0, 0, 0, false, 7,   // Q3: Não jogada
    16, 8, 1, 5867, 1],       // Totais
  ["GD⚡ A R I", "Underground",
     4, 7, 0, 1972, false, 7,   // Q1: Ilha do Medo (7-0)
     0, 0, 0, 0, false, 7,   // Q2: Não jogou
     0, 0, 0, 0, false, 7,   // Q3: Não jogada
     4, 7, 0, 1972, 0],       // Totais
  ["⚡ R I S E 愛", "Underground",
     0, 0, 0, 0, false, 7,   // Q1: Não jogou
     6, 3, 1, 1741, false, 7,   // Q2: Ilha do Medo (7-0)
     0, 0, 0, 0, false, 7,   // Q3: Não jogada
     6, 3, 1, 1741, 0],       // Totais
  // Dinasty Kingdom
  ["⚡DK⚡STAN", "Dinasty Kingdom",
     1, 0, 7, 1695, true, 0,   // Q1: Ilha do Medo (0-7)
     0, 0, 0, 0, false, 0,   // Q2: Não jogou
     0, 0, 0, 0, false, 0,   // Q3: Não jogada
     1, 0, 7, 1695, 1],       // Totais
  ["⚡DK⚡ DOUG", "Dinasty Kingdom",
     1, 0, 7, 1692, false, 0,   // Q1: Ilha do Medo (0-7)
     0, 0, 0, 0, false, 0,   // Q2: Não jogou
     0, 0, 0, 0, false, 0,   // Q3: Não jogada
     1, 0, 7, 1692, 0],       // Totais
  ["⚡DK⚡ FROST愛", "Dinasty Kingdom",
     0, 1, 7, 969, false, 0,   // Q1: Ilha do Medo (0-7)
     0, 1, 7, 885, false, 0,   // Q2: Ilha do Medo (0-7)
     0, 0, 0, 0, false, 0,   // Q3: Não jogada
     0, 2, 14, 1854, 0],       // Totais
  ["⚡DK⚡mask몭", "Dinasty Kingdom",
     0, 1, 7, 691, false, 0,   // Q1: Ilha do Medo (0-7)
     0, 2, 7, 1190, false, 0,   // Q2: Ilha do Medo (0-7)
     0, 0, 0, 0, false, 0,   // Q3: Não jogada
     0, 3, 14, 1881, 0],       // Totais
  ["TANLEY👹", "Dinasty Kingdom",
     0, 0, 0, 0, false, 0,   // Q1: Não jogou
     2, 1, 7, 2179, true, 0,   // Q2: Ilha do Medo (0-7)
     0, 0, 0, 0, false, 0,   // Q3: Não jogada
     2, 1, 7, 2179, 1],       // Totais
  ["⚡DK⚡ Aras", "Dinasty Kingdom",
     0, 0, 0, 0, false, 0,   // Q1: Não jogou
     2, 0, 7, 888, false, 0,   // Q2: Ilha do Medo (0-7)
     0, 0, 0, 0, false, 0,   // Q3: Não jogada
     2, 0, 7, 888, 0],       // Totais
];

// ============================================================
// LÓGICA DO SEED
// ============================================================

export function seed() {
  const db = getDb();
  console.log("[SEED] Starting scrim 4v4 MME seed (Underground vs Dinasty Kingdom)...");

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
  console.log(`[SEED] ${PLAYER_STATS.length} player stats com rounds criados.`);

  // 4. Registrar seed run
  const seedName = "scrim-4v4-mme-underground-vs-dinasty-2026-05-03";
  const existingSeed = db.select().from(seedRuns).where(eq(seedRuns.seedName, seedName)).get();
  if (!existingSeed) {
    db.insert(seedRuns).values({ seedName }).run();
  }

  console.log("[SEED] Seed concluído com sucesso! Acesse /scrims/match/" + SCRIM_ID);
}