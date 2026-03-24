import { z } from "zod/v4";
import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  createRecipeSchema,
  updateRecipeSchema,
  recipeResponseSchema,
  type RecipeResponse,
} from "../types/recipe.js";
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "../services/recipeService.js";
import { importRecipesFromCsv } from "../services/csvImportService.js";

const importResultSchema = z.object({
  created: z.number(),
  skipped: z.number(),
  errors: z.array(z.object({ row: z.number(), name: z.string(), error: z.string() })),
});

const idParamsSchema = z.object({ id: z.string() });
const errorSchema = z.object({ error: z.unknown() });

export const recipeRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/recipes",
    {
      schema: {
        tags: ["Recipes"],
        summary: "List all recipes",
        response: { 200: z.array(recipeResponseSchema) },
      },
    },
    async (request, reply) => {
      const recipes = getAllRecipes(request.server.db);
      return reply.send(recipes as RecipeResponse[]);
    },
  );

  app.post(
    "/api/recipes/import",
    {
      schema: {
        tags: ["Recipes"],
        summary: "Import recipes from CSV file",
        consumes: ["multipart/form-data"],
        response: { 200: importResultSchema, 400: errorSchema },
      },
    },
    async (request, reply) => {
      const file = await request.file();
      if (!file) {
        return reply.status(400).send({ error: "No file uploaded" });
      }
      const buffer = await file.toBuffer();
      const csvContent = buffer.toString("utf-8");
      const result = await importRecipesFromCsv(request.server.db, csvContent);
      return reply.send(result);
    },
  );

  app.get(
    "/api/recipes/:id",
    {
      schema: {
        tags: ["Recipes"],
        summary: "Get a recipe by ID",
        params: idParamsSchema,
        response: { 200: recipeResponseSchema, 404: errorSchema },
      },
    },
    async (request, reply) => {
      const id = Number(request.params.id);
      const recipe = getRecipeById(request.server.db, id);
      if (!recipe) {
        return reply.status(404).send({ error: "Recipe not found" });
      }
      return reply.send(recipe as RecipeResponse);
    },
  );

  app.post(
    "/api/recipes",
    {
      schema: {
        tags: ["Recipes"],
        summary: "Create a new recipe",
        body: createRecipeSchema,
        response: { 201: recipeResponseSchema },
      },
    },
    async (request, reply) => {
      const recipe = await createRecipe(request.server.db, request.body);
      return reply.status(201).send(recipe as RecipeResponse);
    },
  );

  app.put(
    "/api/recipes/:id",
    {
      schema: {
        tags: ["Recipes"],
        summary: "Update a recipe",
        params: idParamsSchema,
        body: updateRecipeSchema,
        response: { 200: recipeResponseSchema, 404: errorSchema },
      },
    },
    async (request, reply) => {
      const id = Number(request.params.id);
      const recipe = await updateRecipe(request.server.db, id, request.body);
      if (!recipe) {
        return reply.status(404).send({ error: "Recipe not found" });
      }
      return reply.send(recipe as RecipeResponse);
    },
  );

  app.delete(
    "/api/recipes/:id",
    {
      schema: {
        tags: ["Recipes"],
        summary: "Delete a recipe",
        params: idParamsSchema,
        response: { 204: z.null(), 404: errorSchema },
      },
    },
    async (request, reply) => {
      const id = Number(request.params.id);
      const deleted = deleteRecipe(request.server.db, id);
      if (!deleted) {
        return reply.status(404).send({ error: "Recipe not found" });
      }
      return reply.status(204).send(null);
    },
  );
};
