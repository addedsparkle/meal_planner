/**
 * JSON Schema for Ingredient type
 * Represents an ingredient with categorization and units
 */

export const ingredientSchema = {
  $id: 'ingredient',
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: {
      type: 'number',
      description: 'Unique identifier for the ingredient'
    },
    name: {
      type: 'string',
      description: 'Name of the ingredient'
    },
  },
  additionalProperties: false
} as const;

export const ingredientInSchema = {
  $id: 'ingredientIn',
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      description: 'Name of the ingredient'
    },
  },
  additionalProperties: false
} as const;


export const ingredientWithRecipesSchema = {
  $id: 'ingredientWithRecipes',
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: {
      type: 'number',
      description: 'Unique identifier for the ingredient'
    },
    name: {
      type: 'string',
      description: 'Name of the ingredient'
    },
    recipes: {
      type: 'array',
      description: 'List of recipes that use this ingredient',
      items: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: {
            type: 'number',
            description: 'Recipe ID'
          },
          name: {
            type: 'string',
            description: 'Recipe name'
          },
        }
      }
    }
  },
  additionalProperties: false
} as const;