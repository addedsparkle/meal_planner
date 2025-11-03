/**
 * Recipe API routes
 * Demonstrates usage of recipe schemas for validation and documentation
 */

import type { FastifyPluginAsync } from 'fastify';

const recipesRoute: FastifyPluginAsync = async (fastify) => {
  const { recipeService } = fastify;

  // GET /api/recipes - List all recipes
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
    // TODO: Implement database query
    const recipes = await recipeService.getAllRecipes();
    reply.code(200)
    return recipes;
  });

  // GET /api/recipes/:id - Get a specific recipe
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
          $ref: 'recipeWithIngredients#'
        },
        404: {
          description: 'Recipe not found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const dbId = parseInt(request.params.id)
    const recipe = await recipeService.getRecipe(dbId)
    reply.code(200)
    return recipe
  });

  // POST /api/recipes - Create a new recipe
  fastify.post('/', {
    schema: {
      body: { $ref: 'recipeIn#' },
      response: {
        201: {
          description: 'Recipe created successfully',
          $ref: 'recipe#'
        },
        400: {
          description: 'Invalid request body',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const recipeData = request.body as any;
    const newRecipe = await recipeService.addRecipe(recipeData);
    reply.code(201);
    return newRecipe;
  });

  // PUT /api/recipes/:id - Update a recipe
  fastify.put<{ Params: { id: string } }>('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: { $ref: 'recipeIn#' },
      response: {
        200: {
          description: 'Recipe updated successfully',
          $ref: 'recipe#'
        },
        404: {
          description: 'Recipe not found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    // TODO: Implement database update using request.params.id and request.body
    return reply.code(404).send({ error: 'Recipe not found' });
  });

  // DELETE /api/recipes/:id - Delete a recipe
  fastify.delete<{ Params: { id: string } }>('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        204: {
          description: 'Recipe deleted successfully',
          type: 'null'
        },
        404: {
          description: 'Recipe not found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const dbId = parseInt(request.params.id)
    request.log.info(`Deleting recipe with id ${dbId}`)
    await recipeService.deleteRecipe(dbId)
    reply.code(204);
  });
};



export default recipesRoute;
