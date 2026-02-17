import type { FastifyInstance } from "fastify";
import { createRecipeSchema, updateRecipeSchema } from "../types/recipe.js";
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "../services/recipeService.js";
import { importRecipesFromCsv } from "../services/csvImportService.js";

export async function recipeRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/recipes", {
    schema: {
      tags: ["Recipes"],
      summary: "List all recipes",
    },
    handler: async (request, reply) => {
      const recipes = getAllRecipes(request.server.db);
      return reply.send(recipes);
    },
  });

  app.post("/api/recipes/import", {
    schema: {
      tags: ["Recipes"],
      summary: "Import recipes from CSV file",
      consumes: ["multipart/form-data"],
    },
    handler: async (request, reply) => {
      const file = await request.file();
      if (!file) {
        return reply.status(400).send({ error: "No file uploaded" });
      }
      const buffer = await file.toBuffer();
      const csvContent = buffer.toString("utf-8");
      const result = await importRecipesFromCsv(request.server.db, csvContent);
      return reply.send(result);
    },
  });

  app.get<{ Params: { id: string } }>("/api/recipes/:id", {
    schema: {
      tags: ["Recipes"],
      summary: "Get a recipe by ID",
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number(request.params.id);
      const recipe = getRecipeById(request.server.db, id);
      if (!recipe) {
        return reply.status(404).send({ error: "Recipe not found" });
      }
      return reply.send(recipe);
    },
  });

  app.post("/api/recipes", {
    schema: {
      tags: ["Recipes"],
      summary: "Create a new recipe",
    },
    handler: async (request, reply) => {
      const parsed = createRecipeSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }
      const recipe = await createRecipe(request.server.db, parsed.data);
      return reply.status(201).send(recipe);
    },
  });

  app.put<{ Params: { id: string } }>("/api/recipes/:id", {
    schema: {
      tags: ["Recipes"],
      summary: "Update a recipe",
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number(request.params.id);
      const parsed = updateRecipeSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }
      const recipe = await updateRecipe(request.server.db, id, parsed.data);
      if (!recipe) {
        return reply.status(404).send({ error: "Recipe not found" });
      }
      return reply.send(recipe);
    },
  });

  app.delete<{ Params: { id: string } }>("/api/recipes/:id", {
    schema: {
      tags: ["Recipes"],
      summary: "Delete a recipe",
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number(request.params.id);
      const deleted = deleteRecipe(request.server.db, id);
      if (!deleted) {
        return reply.status(404).send({ error: "Recipe not found" });
      }
      return reply.status(204).send();
    },
  });
}
