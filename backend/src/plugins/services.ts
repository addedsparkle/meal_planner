import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import RecipeService from '../services/recipes.js';
import '../types/fastify.js';

/**
 * This plugin instantiates and decorates Fastify with service instances
 */
const servicesPlugin: FastifyPluginAsync = async (fastify) => {
  const recipeService = new RecipeService(fastify.db);
  fastify.decorate('recipeService', recipeService);
};

export default fp(servicesPlugin);
