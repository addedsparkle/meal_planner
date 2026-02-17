import type { FastifyInstance } from "fastify";
import { getShoppingList } from "../services/shoppingListService.js";

export async function shoppingListRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: { mealPlanId: string } }>("/api/shopping-list", {
    schema: {
      tags: ["Shopping List"],
      summary: "Generate shopping list from meal plan(s)",
      querystring: {
        type: "object",
        properties: {
          mealPlanId: {
            type: "string",
            description: "Comma-separated meal plan IDs",
          },
        },
        required: ["mealPlanId"],
      },
    },
    handler: async (request, reply) => {
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
  });
}
