/**
 * Central export for all Fastify JSON schemas
 * These schemas are based on the TypeScript types from the frontend
 */

import type { FastifyInstance } from 'fastify';
import { daySchema } from './day.ts';
import { recipeSchema, recipeInSchema, recipeWithIngredientsSchema } from './recipe.ts';
import { ingredientSchema } from './ingredient.ts';
import { dayPlanSchema, mealPlanSchema } from './mealPlan.ts';

/**
 * Register all schemas with a Fastify instance
 * @param fastify - Fastify instance
 */
export function registerSchemas(fastify: FastifyInstance) {
  // Register base schemas first
  fastify.addSchema(daySchema);
  fastify.addSchema(recipeSchema);
  fastify.addSchema(recipeInSchema);
  fastify.addSchema(recipeWithIngredientsSchema);
  fastify.addSchema(ingredientSchema);

  // Register schemas that reference other schemas
  fastify.addSchema(dayPlanSchema);
  fastify.addSchema(mealPlanSchema);
}

export {
  daySchema,
  recipeSchema,
  recipeInSchema,
  recipeWithIngredientsSchema,
  ingredientSchema,
  dayPlanSchema,
  mealPlanSchema,
};
