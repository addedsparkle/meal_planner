export type Recipe = {
  id: string;
  name: string;
  instructions: string | null;
  mainProtein: "Chicken" | "Beef" | "Pork" | "Bean" | "Egg" | null;
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snack" | null;
  canBatch: boolean | null;
  lastUsed: string;
};

export type RecipeIn = Omit<Recipe, "id" | "lastUsed">;
