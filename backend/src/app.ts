import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { AppDatabase } from "./db/index.js";
import { recipeRoutes } from "./routes/recipes.js";
import { ingredientRoutes } from "./routes/ingredients.js";
import { mealPlanRoutes } from "./routes/mealPlans.js";
import { shoppingListRoutes } from "./routes/shoppingList.js";

declare module "fastify" {
  interface FastifyInstance {
    db: AppDatabase;
  }
}

export async function buildApp(db: AppDatabase, opts?: { logger?: boolean }) {
  const app = Fastify({
    logger: opts?.logger ?? true,
  });

  app.decorate("db", db);

  await app.register(cors, { origin: true });
  await app.register(multipart);

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Meal Planner API",
        description: "API for managing recipes, meal plans, and shopping lists",
        version: "1.0.0",
      },
    },
  });

  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  await app.register(recipeRoutes);
  await app.register(ingredientRoutes);
  await app.register(mealPlanRoutes);
  await app.register(shoppingListRoutes);

  return app;
}
