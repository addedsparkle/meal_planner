import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import RecipeService from '../services/recipes.ts';
import '../types/fastify.ts';
import IngredientService from '../services/ingredients.ts';
import MealPlanService from '../services/mealPlans.ts';
import MealPlanGenerator from '../services/mealPlanGenerator.ts';

/**
 * This plugin instantiates and decorates Fastify with service instances
 */
const servicesPlugin: FastifyPluginAsync = async (fastify) => {
  const recipeService = new RecipeService(fastify.db);
  const ingredientService = new IngredientService(fastify.db);
  const mealPlanService = new MealPlanService(fastify.db);
  const mealPlanGenerator = new MealPlanGenerator(fastify.db);

  fastify.decorate('recipeService', recipeService);
  fastify.decorate('ingredientService', ingredientService);
  fastify.decorate('mealPlanService', mealPlanService);
  fastify.decorate('mealPlanGenerator', mealPlanGenerator);
};

export default fp(servicesPlugin);
