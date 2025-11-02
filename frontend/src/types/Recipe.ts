export type Recipe = {
  id: string;
  name: string;
  ingredients?: string;
  main_ingredient?: string;
  meal?: string;
  can_batch?: boolean;
  created_at: string;
};

export type RecipeIn = Omit<Recipe, "id">;
