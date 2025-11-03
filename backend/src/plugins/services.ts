import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import RecipeService from '../services/recipes.js';
import '../types/fastify.js';
import IngredientService from '../services/ingredients.js';

/**
 * This plugin instantiates and decorates Fastify with service instances
 */
const servicesPlugin: FastifyPluginAsync = async (fastify) => {
  const recipeService = new RecipeService(fastify.db);
  const ingredientService = new IngredientService(fastify.db)
  fastify.decorate('recipeService', recipeService);
  fastify.decorate('ingredientService', ingredientService)
};

export default fp(servicesPlugin);
