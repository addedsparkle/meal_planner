/**
 * JSON Schema for Recipe type
 * Represents a recipe with ingredients and metadata
 */

export const recipeSchema = {
  $id: 'recipe',
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: {
      type: 'string',
      description: 'Unique identifier for the recipe'
    },
    name: {
      type: 'string',
      description: 'Name of the recipe'
    },
    instructions: {
      type: 'string',
      description: 'Instructions',
      nullable: true
    },
    mainProtein: {
      type: 'string',
      description: 'Primary protein of the recipe',
      nullable: true
    },
    meal: {
      type: 'string',
      description: 'Type of meal (e.g., breakfast, lunch, dinner)',
      nullable: true
    },
    canBatch: {
      type: 'boolean',
      description: 'Whether the recipe can be made in batches',
      nullable: true
    },
    lastUsed: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp when the recipe was created'
    }
  },
  additionalProperties: false
} as const;

/**
 * JSON Schema for RecipeIn type (Recipe without id)
 * Used for creating new recipes
 */
export const recipeInSchema = {
  $id: 'recipeIn',
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      description: 'Name of the recipe'
    },
    instructions: {
      type: 'string',
      description: 'Instructions',
      nullable: true
    },
    ingredients: {
      type: 'string',
      description: 'Comma-separated list of ingredients',
      nullable: true
    },
    mainProtein: {
      type: 'string',
      description: 'Primary ingredient of the recipe',
      nullable: true
    },
    meal: {
      type: 'string',
      description: 'Type of meal (e.g., breakfast, lunch, dinner)',
      nullable: true
    },
    canBatch: {
      type: 'boolean',
      description: 'Whether the recipe can be made in batches',
      nullable: true
    },
  },
  additionalProperties: false
} as const;
