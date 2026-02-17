import { z } from "zod";

const ingredientInput = z.object({
  name: z.string().min(1),
  quantity: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
});

export const createRecipeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  servings: z.number().int().positive().optional(),
  prepTime: z.number().int().nonnegative().optional(),
  cookTime: z.number().int().nonnegative().optional(),
  instructions: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  ingredients: z.array(ingredientInput).optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type IngredientInput = z.infer<typeof ingredientInput>;
