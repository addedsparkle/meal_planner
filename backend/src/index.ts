import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { closeDb } from "./db/index.js";

const HOST = process.env["HOST"] ?? "0.0.0.0";
const PORT = Number(process.env["PORT"] ?? 3000);

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: true,
});

await app.register(swagger, {
  openapi: {
    info: {
      title: "Meal Planner API",
      description: "API for managing recipes, meal plans, and shopping lists",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
  },
});

await app.register(swaggerUi, {
  routePrefix: "/docs",
});

app.get("/health", async () => {
  return { status: "ok" };
});

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
