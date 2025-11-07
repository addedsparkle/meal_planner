export type Ingredient = {
  id: string;
  name: string;
};

export type Protein = "Chicken" | "Beef" | "Pork" | "Bean" | "Egg"

export type Unit = "g" | "ml" | "pieces" | "cup" | "tbsp" | "tsp";

export type RecipeIngredient = Ingredient & {
  amount: number;
  unit: Unit | null;
};

export type IngredientIn = Omit<Ingredient, "id">

export type RecipeIngredientIn = Omit<RecipeIngredient, "id">
