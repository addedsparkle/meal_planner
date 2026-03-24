import { z } from "zod/v4";
import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
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

const ingredientResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string().nullable(),
  units: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const idParamsSchema = z.object({ id: z.string() });
const errorSchema = z.object({ error: z.unknown() });

export const ingredientRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/ingredients",
    {
      schema: {
        tags: ["Ingredients"],
        summary: "List all ingredients",
        querystring: z.object({ search: z.string().optional() }),
        response: { 200: z.array(ingredientResponseSchema) },
      },
    },
    async (request, reply) => {
      const results = getAllIngredients(request.server.db, request.query.search);
      return reply.send(results);
    },
  );

  app.get(
    "/api/ingredients/:id",
    {
      schema: {
        tags: ["Ingredients"],
        summary: "Get an ingredient by ID",
        params: idParamsSchema,
        response: { 200: ingredientResponseSchema, 404: errorSchema },
      },
    },
    async (request, reply) => {
      const ingredient = getIngredientById(request.server.db, Number(request.params.id));
      if (!ingredient) {
        return reply.status(404).send({ error: "Ingredient not found" });
      }
      return reply.send(ingredient);
    },
  );

  app.post(
    "/api/ingredients",
    {
      schema: {
        tags: ["Ingredients"],
        summary: "Create a new ingredient",
        body: createIngredientSchema,
        response: { 201: ingredientResponseSchema, 409: errorSchema },
      },
    },
    async (request, reply) => {
      try {
        const ingredient = createIngredient(
          request.server.db,
          request.body.name,
          request.body.category,
        );
        return reply.status(201).send(ingredient);
      } catch {
        return reply
          .status(409)
          .send({ error: "Ingredient with this name already exists" });
      }
    },
  );

  app.put(
    "/api/ingredients/:id",
    {
      schema: {
        tags: ["Ingredients"],
        summary: "Update an ingredient",
        params: idParamsSchema,
        body: updateIngredientSchema,
        response: { 200: ingredientResponseSchema, 404: errorSchema },
      },
    },
    async (request, reply) => {
      const ingredient = updateIngredient(
        request.server.db,
        Number(request.params.id),
        request.body,
      );
      if (!ingredient) {
        return reply.status(404).send({ error: "Ingredient not found" });
      }
      return reply.send(ingredient);
    },
  );

  app.delete(
    "/api/ingredients/:id",
    {
      schema: {
        tags: ["Ingredients"],
        summary: "Delete an ingredient",
        params: idParamsSchema,
        response: { 204: z.null(), 404: errorSchema, 409: errorSchema },
      },
    },
    async (request, reply) => {
      const result = deleteIngredient(request.server.db, Number(request.params.id));
      if (!result.success) {
        const status = result.error === "Ingredient not found" ? 404 : 409;
        return reply.status(status).send({ error: result.error });
      }
      return reply.status(204).send(null);
    },
  );
};
