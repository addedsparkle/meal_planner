/**
 * JSON Schema for Day type
 * Represents a day of the week
 */

export const daySchema = {
  $id: 'day',
  type: 'string',
  enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
} as const;