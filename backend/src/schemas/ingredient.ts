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
    category: {
      type: ['string', 'null'],
      description: 'Category of the ingredient (e.g., vegetable, protein, dairy)',
      nullable: true
    },
    default_unit: {
      type: ['string', 'null'],
      description: 'Default unit of measurement for the ingredient',
      nullable: true
    },
    created_at: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp when the ingredient was created'
    }
  },
  additionalProperties: false
} as const;
