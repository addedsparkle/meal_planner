export interface RecipeIngredient {
  id: number;
  name: string;
  category: string | null;
  quantity: string | null;
  notes: string | null;
}

export interface Recipe {
  id: number;
  name: string;
  description: string | null;
  servings: number | null;
  prepTime: number | null;
  cookTime: number | null;
  instructions: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  ingredients: RecipeIngredient[];
}

export interface CreateRecipeInput {
  name: string;
  description?: string;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  instructions?: string;
  metadata?: Record<string, unknown>;
  ingredients?: {
    name: string;
    quantity?: string;
    notes?: string;
    category?: string;
  }[];
}

export interface UpdateRecipeInput extends Partial<CreateRecipeInput> {}

export interface Ingredient {
  id: number;
  name: string;
  category: string | null;
  createdAt: string;
}

export interface CreateIngredientInput {
  name: string;
  category?: string;
}

export interface UpdateIngredientInput extends Partial<CreateIngredientInput> {}

export interface MealPlanDay {
  id: number;
  dayDate: string;
  mealType: string;
  recipe: Recipe;
}

export interface MealPlan {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  days: MealPlanDay[];
}

export interface CreateMealPlanInput {
  name: string;
  startDate: string;
  endDate: string;
  days?: {
    dayDate: string;
    recipeId: number;
    mealType?: string;
  }[];
}

export interface UpdateMealPlanInput extends Partial<CreateMealPlanInput> {}

export interface GenerateMealPlanInput {
  name: string;
  startDate: string;
  endDate: string;
  mealType?: string;
}

export interface ShoppingListItem {
  ingredientId: number;
  name: string;
  category: string | null;
  quantities: string[];
}

export interface ShoppingListResponse {
  mealPlanIds: number[];
  items: ShoppingListItem[];
}

export interface CsvImportResult {
  created: number;
  skipped: number;
  errors: string[];
}
