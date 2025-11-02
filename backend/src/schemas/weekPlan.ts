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
    recipe: {
      $ref: 'recipe#'
    }
  },
  additionalProperties: false
} as const;

export const weekPlanSchema = {
  $id: 'weekPlan',
  type: 'array',
  items: {
    $ref: 'dayPlan#'
  },
  description: 'Array of meal plans for each day of the week'
} as const;
