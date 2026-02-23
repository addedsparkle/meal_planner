export interface RecipeIngredient {
  id: number;
  name: string;
  category: string | null;
  quantity: string | null;
  notes: string | null;
}

export type SuitableDays = "any" | "weekday" | "weekend";

export interface Recipe {
  id: number;
  name: string;
  description: string | null;
  protein: string | null;
  mealTypes: string[];
  suitableDays: SuitableDays;
  freezable: boolean;
  createdAt: string;
  updatedAt: string;
  ingredients: RecipeIngredient[];
}

export interface RecipeInput {
  name: string;
  description?: string;
  protein?: string;
  mealTypes?: string[];
  suitableDays?: SuitableDays;
  freezable?: boolean;
  ingredients?: {
    name: string;
    quantity?: string;
    notes?: string;
    category?: string;
  }[];
}

export interface Ingredient {
  id: number;
  name: string;
  category: string | null;
  createdAt: string;
}

export interface IngredientInput {
  name: string;
  category?: string;
}


export interface MealPlanDayRecipe {
  id: number;
  name: string;
  description: string | null;
  protein: string | null;
  freezable: boolean;
}

export interface MealPlanDay {
  id: number;
  dayDate: string;
  mealType: string;
  recipe: MealPlanDayRecipe;
}

export interface MealPlan {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  days: MealPlanDay[];
}

export interface MealPlanInput {
  name: string;
  startDate: string;
  endDate: string;
  days?: {
    dayDate: string;
    recipeId: number;
    mealType?: string;
  }[];
}

export interface GenerateMealPlanInput {
  name: string;
  startDate: string;
  endDate: string;
}

export interface ShoppingListQuantity {
  quantity: string | null;
  recipeName: string;
  dayDate: string;
}

export interface ShoppingListItem {
  ingredientId: number;
  name: string;
  category: string | null;
  quantities: ShoppingListQuantity[];
}

export interface ShoppingListResponse {
  mealPlanIds: number[];
  items: ShoppingListItem[];
}

export interface CsvImportError {
  row: number;
  name: string;
  error: string;
}

export interface CsvImportResult {
  created: number;
  skipped: number;
  errors: CsvImportError[];
}
