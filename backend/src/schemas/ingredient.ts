/**
 * JSON Schema for Ingredient type
 * Represents an ingredient with categorization and units
 */

export const ingredientSchema = {
  $id: 'ingredient',
  type: 'object',
  required: ['id', 'name', 'created_at'],
  properties: {
    id: {
      type: 'string',
      description: 'Unique identifier for the ingredient'
    },
    name: {
      type: 'string',
      description: 'Name of the ingredient'
    },
    default_unit: {
      type: ['string', 'null'],
      description: 'Default unit of measurement for the ingredient',
      nullable: true
    },
  },
  additionalProperties: false
} as const;
