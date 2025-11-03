/**
 * Central export for all Fastify JSON schemas
 * These schemas are based on the TypeScript types from the frontend
 */

import type { FastifyInstance } from 'fastify';
import { daySchema } from './day.js';
import { recipeSchema, recipeInSchema, recipeWithIngredientsSchema } from './recipe.js';
import { ingredientSchema } from './ingredient.js';
import { dayPlanSchema, weekPlanSchema } from './weekPlan.js';

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
  fastify.addSchema(weekPlanSchema);
}

export {
  daySchema,
  recipeSchema,
  recipeInSchema,
  recipeWithIngredientsSchema,
  ingredientSchema,
  dayPlanSchema,
  weekPlanSchema,
};
