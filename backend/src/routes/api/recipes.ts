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
    request.log.info(JSON.stringify(recipeData))
    const { meals, ...recipeFields } = recipeData;
    const newRecipe = await recipeService.addRecipe(recipeFields, meals);
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

  // POST /api/recipes/:id/ingredients - Add ingredient to recipe
  fastify.post<{
    Params: { id: string };
    Body: { name: string; amount: number; unit: string };
  }>('/:id/ingredients', {
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
          name: { type: 'string', description: 'Ingredient name' },
          amount: { type: 'number', description: 'Quantity needed' },
          unit: {
            type: 'string',
            enum: ['g', 'ml', 'pieces', 'cup', 'tbsp', 'tsp'],
            description: 'Unit of measurement'
          }
        },
        required: ['name', 'amount', 'unit']
      },
      response: {
        201: {
          description: 'Ingredient added successfully',
          type: 'object',
          properties: {
            recipeId: { type: 'number' },
            ingredientId: { type: 'number' },
            amount: { type: 'number' },
            unit: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const recipeId = parseInt(request.params.id);
    const { name, amount, unit } = request.body;

    const result = await recipeService.addIngredientToRecipe(
      recipeId,
      name,
      unit as any,
      amount
    );

    reply.code(201);
    return result;
  });

  // DELETE /api/recipes/:id/ingredients/:ingredientId - Remove ingredient from recipe
  fastify.delete<{
    Params: { id: string; ingredientId: string };
  }>('/:id/ingredients/:ingredientId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Recipe ID' },
          ingredientId: { type: 'string', description: 'Ingredient ID' }
        },
        required: ['id', 'ingredientId']
      },
      response: {
        204: {
          description: 'Ingredient removed successfully',
          type: 'null'
        }
      }
    } as const
  }, async (request, reply) => {
    const recipeId = parseInt(request.params.id);
    const ingredientId = parseInt(request.params.ingredientId);

    await recipeService.removeIngredientFromRecipe(recipeId, ingredientId);

    reply.code(204);
  });

  // PUT /api/recipes/:id/ingredients/:ingredientId - Update ingredient amount/unit
  fastify.put<{
    Params: { id: string; ingredientId: string };
    Body: { amount: number; unit: string };
  }>('/:id/ingredients/:ingredientId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Recipe ID' },
          ingredientId: { type: 'string', description: 'Ingredient ID' }
        },
        required: ['id', 'ingredientId']
      },
      body: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'New quantity' },
          unit: {
            type: 'string',
            enum: ['g', 'ml', 'pieces', 'cup', 'tbsp', 'tsp'],
            description: 'New unit of measurement'
          }
        },
        required: ['amount', 'unit']
      },
      response: {
        200: {
          description: 'Ingredient updated successfully',
          type: 'object',
          properties: {
            recipeId: { type: 'number' },
            ingredientId: { type: 'number' },
            amount: { type: 'number' },
            unit: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const recipeId = parseInt(request.params.id);
    const ingredientId = parseInt(request.params.ingredientId);
    const { amount, unit } = request.body;

    const result = await recipeService.updateRecipeIngredient(
      recipeId,
      ingredientId,
      amount,
      unit as any
    );

    reply.code(200);
    return result;
  });
};



export default recipesRoute;
