import type { Day } from "./Day";

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  snack?: number;
  createdAt: string;
  dayPlans?: DayPlan[];
}

export interface MealPlanWithRecipes extends MealPlan {
  recipes: MealPlanRecipe[];
}

export interface MealPlanRecipe {
  planId: number;
  recipeId: number;
  day: Day;
  mealType?: MealType;
}

export interface MealPlanCreate {
  name: string;
  startDate: string;
  endDate?: string;
  snack?: number;
}

export interface MealPlanUpdate {
  name?: string;
  startDate?: string;
  endDate?: string;
  snack?: number;
}

export interface AddRecipeToPlan {
  recipeId: number;
  day: Day;
  mealType?: MealType;
}

export interface UpdateRecipeInPlan {
  oldRecipeId: number;
  day: Day;
  newRecipeId?: number;
  mealType?: MealType;
}

export interface UpdateDayRecipes {
  recipes: Array<{
    recipeId: number;
    mealType?: MealType;
  }>;
}

export interface DayPlan {
  day: Day;
  breakfast?: any;
  lunch?: any;
  dinner?: any;
}
