import type { Protein, RecipeIngredient, RecipeIngredientIn } from "./Ingredient";

export type Recipe = {
  id: string;
  name: string;
  instructions: string | null;
  mainProtein?: Protein | null;
  meal?: "Breakfast" | "Lunch" | "Dinner" | "Snack" | null;
  canBatch: boolean;
  lastUsed: string;
  ingredients: RecipeIngredient[]
};

export type RecipeIn = Omit<Recipe, "id" | "lastUsed" | "ingredients"> & {ingredients?: RecipeIngredientIn[]};
