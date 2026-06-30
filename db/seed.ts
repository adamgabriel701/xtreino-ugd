// db/seed.ts
// Ponto único de exportação de todos os seeds

import { seed } from "./seeds/seed-initial.js";
import { seedMinimal } from "./seeds/seed-minimal.js";
import { seedLogos, seedLogosAuto } from "./seeds/seed-logos.js";
import { seedAllXtreinos } from "./seeds/seed-xtreinos.js";
import { seedAllScrims } from "./seeds/seed-scrims.js"; // 🆕 NOVO: Seed genérico de scrims
import { seedPlayerUnified } from "./seeds/seed-player.js";
import { seed as seedScrimPlayers } from "./seeds/seed-scrim-players-4v4";

export {
  seed,           // seed inicial (admins, settings, clans, teams, players)
  seedMinimal,    // fallback minimal
  seedLogos,      // seed manual de logos
  seedLogosAuto,  // seed automático de logos (escaneia pasta)
  seedAllXtreinos,// seed genérico de TODOS os xtreinos
  seedAllScrims,  // 🆕 seed genérico de TODAS as scrims
  seedPlayerUnified,
  seedScrimPlayers,
};