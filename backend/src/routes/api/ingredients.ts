/**
 * Recipe API routes
 * Demonstrates usage of recipe schemas for validation and documentation
 */

import type { FastifyPluginAsync } from 'fastify';

const ingredientsRoute: FastifyPluginAsync = async (fastify) => {
  const { ingredientService } = fastify;

  // GET /api/ingredients - List all ingredients
  fastify.get('/', {
    schema: {
      response: {
        200: {
          description: 'Successful response',
          type: 'array',
          items: { $ref: 'recipe#' }
        }
      }
    } as const
  }, async (request, reply) => {
    const ingredients = await ingredientService.getAllIngredients();
    reply.code(200)
    return ingredients;
  });

  // GET /api/ingredient/:id - Get a specific ingredient
  fastify.get<{ Params: { id: string } }>('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          description: 'Successful response',
          $ref: 'ingredient#'
        },
        404: {
          description: 'Ingredient not found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const dbId = parseInt(request.params.id)
    const ingredient = await ingredientService.getIngredient(dbId)
    
    if (!ingredient) {
        reply.code(404)
        return undefined
    }
    reply.code(200)
    return ingredient
  });

  // GET /api/ingredient/:id/recipes - Get recipes that use a specific ingredient
  fastify.get<{ Params: { id: string } }>('/:id/recipes', {schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          description: 'Successful response',
          $ref: 'ingredientWithRecipes#'
        },
        404: {
          description: 'Ingredient not found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const dbId = parseInt(request.params.id)
    const ingredient = await ingredientService.getRecipesForIngredient(dbId)
    
    if (!ingredient) {
        reply.code(404)
        return undefined
    }
    reply.code(200)
    return ingredient
  });
};



export default ingredientsRoute;
