/**
 * Meal Plan API routes
 * Full CRUD operations for meal plans and their recipes
 */

import type { FastifyPluginAsync } from 'fastify';

const mealPlansRoute: FastifyPluginAsync = async (fastify, opts) => {
  const { mealPlanService } = fastify;

  // GET /api/meal-plans - Get all meal plans
  fastify.get('/', {
    schema: {
      response: {
        200: {
          description: 'Successful response',
          type: 'array',
          items: { $ref: 'mealPlan#' }
        }
      }
    } as const
  }, async (request, reply) => {
    const allPlans = await mealPlanService.getAllMealPlans();
    return allPlans;
  });

  // POST /api/meal-plans - Create a new meal plan
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'startDate'],
        properties: {
          name: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          snack: { type: 'integer' }
        }
      },
      response: {
        201: {
          description: 'Meal plan created successfully',
          $ref: 'mealPlan#'
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
    const { name, startDate, endDate, snack } = request.body as {
      name: string;
      startDate: string;
      endDate?: string;
      snack?: number;
    };

    const mealPlan = await mealPlanService.createMealPlan({
      name,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      snack: snack || undefined,
    });

    reply.code(201);
    return mealPlan;
  });

  // GET /api/meal-plans/current - Get current week plan
  fastify.get('/current', {
    schema: {
      response: {
        200: {
          description: 'Successful response',
          $ref: 'mealPlan#'
        },
        404: {
          description: 'No meal plan found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const allPlans = await mealPlanService.getAllMealPlans();

    if (allPlans.length === 0) {
      reply.code(404);
      return { error: 'No meal plans found' };
    }

    // Find the meal plan that includes today's date
    const today = new Date();
    const currentPlan = allPlans.find(plan => {
      const start = new Date(plan.startDate);
      const end = plan.endDate ? new Date(plan.endDate) : null;
      return start <= today && (!end || end >= today);
    });

    if (!currentPlan) {
      // If no plan includes today, return the most recent one
      const sortedPlans = allPlans.sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      return sortedPlans[0];
    }

    return currentPlan;
  });

  // GET /api/meal-plans/:id - Get a specific meal plan with all recipes
  fastify.get<{
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
        200: {
          description: 'Meal plan with recipes',
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            snack: { type: 'integer' },
            createdAt: { type: 'string' },
            recipes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  planId: { type: 'integer' },
                  recipeId: { type: 'integer' },
                  day: { type: 'string' },
                  mealType: { type: 'string' }
                }
              }
            }
          }
        },
        404: {
          description: 'Meal plan not found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const planId = parseInt(request.params.id);
    const plan = await mealPlanService.getMealPlan(planId);

    if (!plan) {
      reply.code(404);
      return { error: 'Meal plan not found' };
    }

    return plan;
  });

  // PUT /api/meal-plans/:id - Update a meal plan
  fastify.put<{
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
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          snack: { type: 'integer' }
        }
      },
      response: {
        200: {
          description: 'Meal plan updated successfully',
          $ref: 'mealPlan#'
        },
        404: {
          description: 'Meal plan not found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const planId = parseInt(request.params.id);
    const { name, startDate, endDate, snack } = request.body as {
      name?: string;
      startDate?: string;
      endDate?: string;
      snack?: number;
    };

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (startDate !== undefined) updates.startDate = new Date(startDate);
    if (endDate !== undefined) updates.endDate = new Date(endDate);
    if (snack !== undefined) updates.snack = snack;

    const updatedPlan = await mealPlanService.updateMealPlan(planId, updates);

    if (!updatedPlan) {
      reply.code(404);
      return { error: 'Meal plan not found' };
    }

    return updatedPlan;
  });

  // DELETE /api/meal-plans/:id - Delete a meal plan
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
          description: 'Meal plan deleted successfully',
          type: 'null'
        }
      }
    } as const
  }, async (request, reply) => {
    const planId = parseInt(request.params.id);
    await mealPlanService.deleteMealPlan(planId);
    reply.code(204);
  });

  // POST /api/meal-plans/:id/recipes - Add a recipe to a meal plan
  fastify.post<{
    Params: { id: string }
  }>('/:id/recipes', {
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
        required: ['recipeId', 'day'],
        properties: {
          recipeId: { type: 'integer' },
          day: {
            type: 'string',
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          },
          mealType: {
            type: 'string',
            enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
          }
        }
      },
      response: {
        201: {
          description: 'Recipe added to meal plan',
          type: 'object',
          properties: {
            planId: { type: 'integer' },
            recipeId: { type: 'integer' },
            day: { type: 'string' },
            mealType: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const planId = parseInt(request.params.id);
    const { recipeId, day, mealType } = request.body as {
      recipeId: number;
      day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
      mealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    };

    const result = await mealPlanService.addRecipeToPlan(planId, recipeId, day, mealType);
    reply.code(201);
    return result;
  });

  // DELETE /api/meal-plans/:id/recipes - Remove a recipe from a meal plan
  fastify.delete<{
    Params: { id: string }
    Querystring: { recipeId: string; day: string }
  }>('/:id/recipes', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      querystring: {
        type: 'object',
        required: ['recipeId', 'day'],
        properties: {
          recipeId: { type: 'string' },
          day: {
            type: 'string',
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          }
        }
      },
      response: {
        204: {
          description: 'Recipe removed from meal plan',
          type: 'null'
        }
      }
    } as const
  }, async (request, reply) => {
    const planId = parseInt(request.params.id);
    const recipeId = parseInt(request.query.recipeId);
    const day = request.query.day as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

    await mealPlanService.removeRecipeFromPlan(planId, recipeId, day);
    reply.code(204);
  });

  // PUT /api/meal-plans/:id/recipes - Update a recipe in a meal plan
  fastify.put<{
    Params: { id: string }
  }>('/:id/recipes', {
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
        required: ['oldRecipeId', 'day'],
        properties: {
          oldRecipeId: { type: 'integer' },
          day: {
            type: 'string',
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          },
          newRecipeId: { type: 'integer' },
          mealType: {
            type: 'string',
            enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
          }
        }
      },
      response: {
        200: {
          description: 'Recipe updated in meal plan',
          type: 'object',
          properties: {
            planId: { type: 'integer' },
            recipeId: { type: 'integer' },
            day: { type: 'string' },
            mealType: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const planId = parseInt(request.params.id);
    const { oldRecipeId, day, newRecipeId, mealType } = request.body as {
      oldRecipeId: number;
      day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
      newRecipeId?: number;
      mealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    };

    const result = await mealPlanService.updateRecipeInPlan(
      planId,
      oldRecipeId,
      day,
      newRecipeId,
      mealType
    );

    return result;
  });

  // GET /api/meal-plans/:id/days/:day - Get all recipes for a specific day
  fastify.get<{
    Params: { id: string; day: string }
  }>('/:id/days/:day', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          day: {
            type: 'string',
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          }
        },
        required: ['id', 'day']
      },
      response: {
        200: {
          description: 'Recipes for the specified day',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              planId: { type: 'integer' },
              recipeId: { type: 'integer' },
              day: { type: 'string' },
              mealType: { type: 'string' }
            }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const planId = parseInt(request.params.id);
    const day = request.params.day as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

    const recipes = await mealPlanService.getRecipesForDay(planId, day);
    return recipes;
  });

  // PUT /api/meal-plans/:id/days/:day - Update all recipes for a specific day
  fastify.put<{
    Params: { id: string; day: string }
  }>('/:id/days/:day', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          day: {
            type: 'string',
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          }
        },
        required: ['id', 'day']
      },
      body: {
        type: 'object',
        required: ['recipes'],
        properties: {
          recipes: {
            type: 'array',
            items: {
              type: 'object',
              required: ['recipeId'],
              properties: {
                recipeId: { type: 'integer' },
                mealType: {
                  type: 'string',
                  enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
                }
              }
            }
          }
        }
      },
      response: {
        200: {
          description: 'Day recipes updated',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              planId: { type: 'integer' },
              recipeId: { type: 'integer' },
              day: { type: 'string' },
              mealType: { type: 'string' }
            }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    const planId = parseInt(request.params.id);
    const day = request.params.day as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    const { recipes } = request.body as {
      recipes: Array<{ recipeId: number; mealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' }>;
    };

    const results = await mealPlanService.updateDay(planId, day, recipes);
    return results;
  });
};

export default mealPlansRoute;
