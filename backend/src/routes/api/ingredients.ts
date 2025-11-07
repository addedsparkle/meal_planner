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

  // POST /api/ingredients - Create a new ingredient
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' }
        },
        required: ['name']
      },
      response: {
        201: {
          description: 'Ingredient created successfully',
          $ref: 'ingredient#'
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
    const ingredientData = request.body as any;
    const newIngredient = await ingredientService.addIngredient(ingredientData);
    reply.code(201);
    return newIngredient;
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

  // PUT /api/ingredients/:id - Update an ingredient
  fastify.put<{ Params: { id: string } }>('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Ingredient updated successfully',
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
    const dbId = parseInt(request.params.id);
    const updateData = request.body as any;
    const updatedIngredient = await ingredientService.updateIngredient(dbId, updateData);

    if (!updatedIngredient) {
      reply.code(404);
      return { error: 'Ingredient not found' };
    }

    reply.code(200);
    return updatedIngredient;
  });

  // DELETE /api/ingredients/:id - Delete an ingredient
  fastify.delete<{
    Params: { id: string }
  }>('/:id', {
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
          description: 'Ingredient deleted successfully',
          type: 'null'
        }
      }
    } as const
  }, async (request, reply) => {
    const ingredientId = parseInt(request.params.id);
    await ingredientService.deleteIngredient(ingredientId);
    reply.code(204);
  });
};



export default ingredientsRoute;
