import * as yup from "yup";
import type { Protein, RecipeIngredientIn } from "../types/Ingredient";
import type { MealType } from "../types/MealPlan";

export const recipeSchema = yup.object({
  name: yup
    .string()
    .required("Recipe name is required")
    .min(2, "Recipe name must be at least 2 characters")
    .max(100, "Recipe name must be less than 100 characters"),

  instructions: yup
    .string()
    .optional()
    .max(2000, "Instructions must be less than 2000 characters"),
});

export type RecipeFormData = {
  name: string;
  instructions: string | undefined;
  mainProtein: Protein | undefined;
  meals: MealType[] | undefined;
  ingredients: RecipeIngredientIn[];
};
