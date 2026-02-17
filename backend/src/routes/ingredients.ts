import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../services/ingredientService.js";

const createIngredientSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
});

const updateIngredientSchema = createIngredientSchema.partial();

export async function ingredientRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: { search?: string } }>("/api/ingredients", {
    schema: {
      tags: ["Ingredients"],
      summary: "List all ingredients",
      querystring: {
        type: "object",
        properties: { search: { type: "string" } },
      },
    },
    handler: async (request, reply) => {
      const results = getAllIngredients(request.server.db, request.query.search);
      return reply.send(results);
    },
  });

  app.get<{ Params: { id: string } }>("/api/ingredients/:id", {
    schema: {
      tags: ["Ingredients"],
      summary: "Get an ingredient by ID",
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const ingredient = getIngredientById(request.server.db, Number(request.params.id));
      if (!ingredient) {
        return reply.status(404).send({ error: "Ingredient not found" });
      }
      return reply.send(ingredient);
    },
  });

  app.post("/api/ingredients", {
    schema: {
      tags: ["Ingredients"],
      summary: "Create a new ingredient",
    },
    handler: async (request, reply) => {
      const parsed = createIngredientSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }
      try {
        const ingredient = createIngredient(
          request.server.db,
          parsed.data.name,
          parsed.data.category,
        );
        return reply.status(201).send(ingredient);
      } catch {
        return reply
          .status(409)
          .send({ error: "Ingredient with this name already exists" });
      }
    },
  });

  app.put<{ Params: { id: string } }>("/api/ingredients/:id", {
    schema: {
      tags: ["Ingredients"],
      summary: "Update an ingredient",
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const parsed = updateIngredientSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }
      const ingredient = updateIngredient(
        request.server.db,
        Number(request.params.id),
        parsed.data,
      );
      if (!ingredient) {
        return reply.status(404).send({ error: "Ingredient not found" });
      }
      return reply.send(ingredient);
    },
  });

  app.delete<{ Params: { id: string } }>("/api/ingredients/:id", {
    schema: {
      tags: ["Ingredients"],
      summary: "Delete an ingredient",
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const result = deleteIngredient(request.server.db, Number(request.params.id));
      if (!result.success) {
        const status = result.error === "Ingredient not found" ? 404 : 409;
        return reply.status(status).send({ error: result.error });
      }
      return reply.status(204).send();
    },
  });
}
