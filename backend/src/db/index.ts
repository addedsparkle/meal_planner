import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

export type AppDatabase = BetterSQLite3Database<typeof schema>;

export function createDb(url: string): { db: AppDatabase; close: () => void } {
  const sqlite = new Database(url);
  sqlite.pragma("journal_mode = WAL");
  const db = drizzle(sqlite, { schema });
  return { db, close: () => sqlite.close() };
}

const DATABASE_URL = process.env["DATABASE_URL"] ?? "./data/meal_planner.db";
const instance = createDb(DATABASE_URL);

export const db = instance.db;

export function closeDb(): void {
  instance.close();
}
