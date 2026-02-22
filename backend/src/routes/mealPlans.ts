import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  getAllMealPlans,
  getMealPlanById,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  generateMealPlan,
} from "../services/mealPlanService.js";

const daySchema = z.object({
  dayDate: z.string().min(1),
  recipeId: z.number().int().positive(),
  mealType: z.string().optional(),
});

const createMealPlanSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  days: z.array(daySchema).optional(),
});

const updateMealPlanSchema = createMealPlanSchema.partial();

const generateMealPlanSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export async function mealPlanRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/meal-plans", {
    schema: {
      tags: ["Meal Plans"],
      summary: "List all meal plans",
    },
    handler: async (request, reply) => {
      const plans = getAllMealPlans(request.server.db);
      return reply.send(plans);
    },
  });

  app.get<{ Params: { id: string } }>("/api/meal-plans/:id", {
    schema: {
      tags: ["Meal Plans"],
      summary: "Get a meal plan by ID",
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const plan = getMealPlanById(request.server.db, Number(request.params.id));
      if (!plan) {
        return reply.status(404).send({ error: "Meal plan not found" });
      }
      return reply.send(plan);
    },
  });

  app.post("/api/meal-plans", {
    schema: {
      tags: ["Meal Plans"],
      summary: "Create a meal plan",
    },
    handler: async (request, reply) => {
      const parsed = createMealPlanSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }
      const plan = createMealPlan(request.server.db, parsed.data);
      return reply.status(201).send(plan);
    },
  });

  app.put<{ Params: { id: string } }>("/api/meal-plans/:id", {
    schema: {
      tags: ["Meal Plans"],
      summary: "Update a meal plan",
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const parsed = updateMealPlanSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }
      const plan = updateMealPlan(request.server.db, Number(request.params.id), parsed.data);
      if (!plan) {
        return reply.status(404).send({ error: "Meal plan not found" });
      }
      return reply.send(plan);
    },
  });

  app.delete<{ Params: { id: string } }>("/api/meal-plans/:id", {
    schema: {
      tags: ["Meal Plans"],
      summary: "Delete a meal plan",
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const deleted = deleteMealPlan(request.server.db, Number(request.params.id));
      if (!deleted) {
        return reply.status(404).send({ error: "Meal plan not found" });
      }
      return reply.status(204).send();
    },
  });

  app.post("/api/meal-plans/generate", {
    schema: {
      tags: ["Meal Plans"],
      summary: "Auto-generate a meal plan from available recipes",
    },
    handler: async (request, reply) => {
      const parsed = generateMealPlanSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }
      try {
        const plan = generateMealPlan(request.server.db, parsed.data);
        return reply.status(201).send(plan);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed";
        return reply.status(400).send({ error: message });
      }
    },
  });
}
