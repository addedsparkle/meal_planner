import { beforeEach, afterAll } from "vitest";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { sql } from "drizzle-orm";
import { createDb, type AppDatabase } from "../db/index.js";
import { buildApp } from "../app.js";
import type { FastifyInstance } from "fastify";

const instance = createDb(":memory:");
export const db: AppDatabase = instance.db;

migrate(db, { migrationsFolder: "./drizzle" });

let _app: FastifyInstance | null = null;

export async function getApp(): Promise<FastifyInstance> {
  if (!_app) {
    _app = await buildApp(db, { logger: false });
    await _app.ready();
  }
  return _app;
}

beforeEach(() => {
  db.run(sql`DELETE FROM recipe_ingredients`);
  db.run(sql`DELETE FROM meal_plan_days`);
  db.run(sql`DELETE FROM meal_plans`);
  db.run(sql`DELETE FROM recipes`);
  db.run(sql`DELETE FROM ingredients`);
});

afterAll(async () => {
  if (_app) {
    await _app.close();
  }
  instance.close();
});
