/**
 * JSON Schema for WeekPlan types
 * Represents a meal plan for a week
 */

export const dayPlanSchema = {
  $id: 'dayPlan',
  type: 'object',
  required: ['day', 'recipe'],
  properties: {
    day: {
      $ref: 'day#'
    },
    breakfast: {
      $ref: 'recipe#'
    },
    lunch: {
      $ref: 'recipe#'
    },
    dinner: {
      $ref: 'recipe#'
    }
  },
  additionalProperties: false
} as const;

export const mealPlanSchema = {
  $id: 'mealPlan',
  type: 'object',
  properties:{
    id: {
      type: 'string',
      description: 'Unique identifier for the meal plan'
    },
    name: {
      type: 'string',
      description: 'Name of the meal plan'
    },
    startDate: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp for the start of the meal plan'
    },
    endDate: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp for the end of the meal plan'
    },
    snack: {
      type: 'integer',
      description: 'Recipe ID for the snack'
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp of when the meal plan was created'
    },
    dayPlans: {
        type: 'array',
        items: {
          $ref: 'dayPlan#'
        },
    }
  },
  description: 'Array of meal plans for each day of the week'
} as const;

export const mealPlanInSchema = {
  $id: 'mealPlanIn',
  type: 'object',
  items: {
    $ref: 'dayPlan#'
  },
  properties:{
    id: {
      type: 'string',
      description: 'Unique identifier for the meal plan'
    },
    name: {
      type: 'string',
      description: 'Name of the meal plan'
    },
    startDate: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp for the start of the meal plan'
    },
    endDate: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp for the end of the meal plan'
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp of when the meal plan was created'
    }, 
  },
  description: 'Array of meal plans for each day of the week'
} as const;