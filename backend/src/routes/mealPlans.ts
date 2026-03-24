import { z } from "zod/v4";
import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  getAllMealPlans,
  getMealPlanById,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  generateMealPlan,
} from "../services/mealPlanService.js";

const dayInputSchema = z.object({
  dayDate: z.string().min(1),
  recipeId: z.number().int().positive(),
  mealType: z.string().optional(),
});

const createMealPlanSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  days: z.array(dayInputSchema).optional(),
});

const updateMealPlanSchema = createMealPlanSchema.partial();

const generateMealPlanSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

const mealPlanDayRecipeSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  protein: z.string().nullable(),
  freezable: z.boolean(),
});

const mealPlanDaySchema = z.object({
  id: z.number(),
  dayDate: z.string(),
  mealType: z.string().nullable(),
  recipe: mealPlanDayRecipeSchema,
});

const mealPlanResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  createdAt: z.string().nullable(),
  days: z.array(mealPlanDaySchema),
});

type MealPlanResponse = z.infer<typeof mealPlanResponseSchema>;

const idParamsSchema = z.object({ id: z.string() });
const errorSchema = z.object({ error: z.unknown() });

export const mealPlanRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/meal-plans",
    {
      schema: {
        tags: ["Meal Plans"],
        summary: "List all meal plans",
        response: { 200: z.array(mealPlanResponseSchema) },
      },
    },
    async (request, reply) => {
      const plans = getAllMealPlans(request.server.db);
      return reply.send(plans as MealPlanResponse[]);
    },
  );

  app.get(
    "/api/meal-plans/:id",
    {
      schema: {
        tags: ["Meal Plans"],
        summary: "Get a meal plan by ID",
        params: idParamsSchema,
        response: { 200: mealPlanResponseSchema, 404: errorSchema },
      },
    },
    async (request, reply) => {
      const plan = getMealPlanById(request.server.db, Number(request.params.id));
      if (!plan) {
        return reply.status(404).send({ error: "Meal plan not found" });
      }
      return reply.send(plan as MealPlanResponse);
    },
  );

  app.post(
    "/api/meal-plans",
    {
      schema: {
        tags: ["Meal Plans"],
        summary: "Create a meal plan",
        body: createMealPlanSchema,
        response: { 201: mealPlanResponseSchema },
      },
    },
    async (request, reply) => {
      const plan = createMealPlan(request.server.db, request.body);
      return reply.status(201).send(plan as MealPlanResponse);
    },
  );

  app.put(
    "/api/meal-plans/:id",
    {
      schema: {
        tags: ["Meal Plans"],
        summary: "Update a meal plan",
        params: idParamsSchema,
        body: updateMealPlanSchema,
        response: { 200: mealPlanResponseSchema, 404: errorSchema },
      },
    },
    async (request, reply) => {
      const plan = updateMealPlan(request.server.db, Number(request.params.id), request.body);
      if (!plan) {
        return reply.status(404).send({ error: "Meal plan not found" });
      }
      return reply.send(plan as MealPlanResponse);
    },
  );

  app.delete(
    "/api/meal-plans/:id",
    {
      schema: {
        tags: ["Meal Plans"],
        summary: "Delete a meal plan",
        params: idParamsSchema,
        response: { 204: z.null(), 404: errorSchema },
      },
    },
    async (request, reply) => {
      const deleted = deleteMealPlan(request.server.db, Number(request.params.id));
      if (!deleted) {
        return reply.status(404).send({ error: "Meal plan not found" });
      }
      return reply.status(204).send(null);
    },
  );

  app.post(
    "/api/meal-plans/generate",
    {
      schema: {
        tags: ["Meal Plans"],
        summary: "Auto-generate a meal plan from available recipes",
        body: generateMealPlanSchema,
        response: { 201: mealPlanResponseSchema, 400: errorSchema },
      },
    },
    async (request, reply) => {
      try {
        const plan = generateMealPlan(request.server.db, request.body);
        return reply.status(201).send(plan as MealPlanResponse);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed";
        return reply.status(400).send({ error: message });
      }
    },
  );
};
