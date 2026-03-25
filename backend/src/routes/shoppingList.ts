import { z } from "zod/v4";
import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getShoppingList } from "../services/shoppingListService.js";

const shoppingListQuantitySchema = z.object({
  quantity: z.string().nullable(),
  recipeName: z.string(),
  dayDate: z.string(),
});

const shoppingListItemSchema = z.object({
  ingredientId: z.number(),
  name: z.string(),
  category: z.string().nullable(),
  units: z.string().nullable(),
  quantities: z.array(shoppingListQuantitySchema),
});

const shoppingListResponseSchema = z.object({
  mealPlanIds: z.array(z.number()),
  items: z.array(shoppingListItemSchema),
});

const errorSchema = z.object({ error: z.unknown() });

export const shoppingListRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/shopping-list",
    {
      schema: {
        tags: ["Shopping List"],
        summary: "Generate shopping list from meal plan(s)",
        querystring: z.object({
          mealPlanId: z.string().describe("Comma-separated meal plan IDs"),
        }),
        response: { 200: shoppingListResponseSchema, 400: errorSchema },
      },
    },
    async (request, reply) => {
      const ids = request.query.mealPlanId
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n) && n > 0);

      if (ids.length === 0) {
        return reply
          .status(400)
          .send({ error: "At least one valid mealPlanId is required" });
      }

      const items = getShoppingList(request.server.db, ids);
      return reply.send({ mealPlanIds: ids, items });
    },
  );
};
