import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@db/schema";
import * as relations from "@db/relations";
import { mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    // Se estiver em produção (Railway), força o caminho do Volume permanente
    // Se estiver local, usa o DATABASE_URL do .env (ex: sqlite.db)
    const isRailway = !!process.env.RAILWAY_ENVIRONMENT_ID || process.env.NODE_ENV === "production";
    
    const dbPath = isRailway 
      ? "/app/data/sqlite.db"  // Caminho absoluto do Volume que vamos criar no Railway
      : (process.env.DATABASE_URL || "sqlite.db");

    // Cria a pasta pai se não existir (importante para o Railway)
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    console.log(`[DB] Conectando ao SQLite em: ${dbPath}`);
    const sqlite = new Database(dbPath);
    
    // Performance: habilita WAL mode para não travar o banco durante writes
    sqlite.pragma('journal_mode = WAL');
    
    instance = drizzle(sqlite, { schema: fullSchema });
  }
  return instance;
}