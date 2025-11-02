/**
 * Week Plan API routes
 * Demonstrates usage of weekPlan and dayPlan schemas
 */

import type { FastifyPluginAsync } from 'fastify';

const weekPlansRoute: FastifyPluginAsync = async (fastify, opts) => {
  // GET /api/week-plans - Get all week plans
  fastify.get('/', {
    schema: {
      response: {
        200: {
          description: 'Successful response',
          type: 'array',
          items: { $ref: 'weekPlan#' }
        }
      }
    } as const
  }, async (request, reply) => {
    // TODO: Implement database query
    return [];
  });

  // POST /api/week-plans - Create a new week plan
  fastify.post('/', {
    schema: {
      body: { $ref: 'weekPlan#' },
      response: {
        201: {
          description: 'Week plan created successfully',
          $ref: 'weekPlan#'
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
    // TODO: Implement database insert
    const weekPlanData = request.body;

    reply.code(201);
    return weekPlanData;
  });

  // GET /api/week-plans/current - Get current week plan
  fastify.get('/current', {
    schema: {
      response: {
        200: {
          description: 'Successful response',
          $ref: 'weekPlan#'
        },
        404: {
          description: 'No week plan found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    } as const
  }, async (request, reply) => {
    // TODO: Implement logic to get current week plan
    return [];
  });
};

export default weekPlansRoute;
