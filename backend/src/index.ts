import { db, closeDb } from "./db/index.js";
import { buildApp } from "./app.js";

const HOST = process.env["HOST"] ?? "0.0.0.0";
const PORT = Number(process.env["PORT"] ?? 3000);

const app = await buildApp(db);

const shutdown = async (): Promise<void> => {
  app.log.info("Shutting down...");
  await app.close();
  closeDb();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

try {
  await app.listen({ host: HOST, port: PORT });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
