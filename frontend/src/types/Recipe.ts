import type { Protein, RecipeIngredient, RecipeIngredientIn } from "./Ingredient";
import type { MealType } from "./MealPlan";

export type Recipe = {
  id: string;
  name: string;
  instructions: string | null;
  mainProtein?: Protein | null;
  meal?: MealType[] | null;
  canBatch: boolean;
  lastUsed: string;
  ingredients: RecipeIngredient[]
};

export type RecipeIn = Omit<Recipe, "id" | "lastUsed" | "ingredients"> & {ingredients?: RecipeIngredientIn[]};
