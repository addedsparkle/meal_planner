import { z } from "zod";

const ingredientInput = z.object({
  name: z.string().min(1),
  quantity: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  units: z.string().optional(),
});

export const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const SUITABLE_DAYS = ["any", "weekday", "weekend"] as const;
export type SuitableDays = (typeof SUITABLE_DAYS)[number];

export const createRecipeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  protein: z.string().optional(),
  mealTypes: z.array(z.enum(MEAL_TYPES)).min(1).default(["dinner"]),
  suitableDays: z.enum(SUITABLE_DAYS).default("any"),
  freezable: z.boolean().default(false),
  ingredients: z.array(ingredientInput).optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type IngredientInput = z.infer<typeof ingredientInput>;
