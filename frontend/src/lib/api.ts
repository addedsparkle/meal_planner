import axios from "axios";
import type { Recipe, RecipeIn } from "../types/Recipe";
import type { Ingredient } from "../types/Ingredient";
import type {
  MealPlan,
  MealPlanWithRecipes,
  MealPlanCreate,
  MealPlanUpdate,
  AddRecipeToPlan,
  UpdateRecipeInPlan,
  UpdateDayRecipes,
  MealPlanRecipe,
} from "../types/MealPlan";
import type { Day } from "../types/Day";

const API_BASE_URL = "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const recipesApi = {
  getAll: async (): Promise<Recipe[]> => {
    try {
      const response = await apiClient.get<Recipe[]>("/recipes");
      return response.data;
    } catch (error) {
      console.error("Error fetching recipes:", error);
      throw error;
    }
  },

  getById: async (id: string | number): Promise<Recipe> => {
    try {
      const response = await apiClient.get<Recipe>(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching recipe ${id}:`, error);
      throw error;
    }
  },

  create: async (recipe: RecipeIn): Promise<Recipe> => {
    try {
      const response = await apiClient.post<Recipe>("/recipes", recipe);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating recipe:", error.message);
      }
      throw error;
    }
  },

  addIngredient: async (
    recipeId: string | number,
    ingredient: { name: string; amount: number; unit: string }
  ): Promise<{ recipeId: number; ingredientId: number; amount: number; unit: string }> => {
    try {
      const response = await apiClient.post<{ recipeId: number; ingredientId: number; amount: number; unit: string }>(
        `/recipes/${recipeId}/ingredients`,
        ingredient
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding ingredient to recipe ${recipeId}:`, error);
      throw error;
    }
  },
};

export const ingredientsApi = {
  getAll: async (): Promise<Ingredient[]> => {
    try {
      const response = await apiClient.get<Ingredient[]>("/ingredients");
      return response.data;
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      throw error;
    }
  },

  create: async (ingredient: Omit<Ingredient, "id">): Promise<Ingredient> => {
    try {
      const response = await apiClient.post<Ingredient>(
        "/ingredients",
        ingredient,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating ingredient:", error);
      throw error;
    }
  },
};

export const mealPlansApi = {
  /**
   * Get all meal plans
   */
  getAll: async (): Promise<MealPlan[]> => {
    try {
      const response = await apiClient.get<MealPlan[]>("/meal-plans");
      return response.data;
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      throw error;
    }
  },

  /**
   * Get current meal plan (the one containing today's date)
   */
  getCurrent: async (): Promise<MealPlan> => {
    try {
      const response = await apiClient.get<MealPlan>("/meal-plans/current");
      return response.data;
    } catch (error) {
      console.error("Error fetching current meal plan:", error);
      throw error;
    }
  },

  /**
   * Get a specific meal plan by ID with all its recipes
   */
  getById: async (id: string | number): Promise<MealPlanWithRecipes> => {
    try {
      const response = await apiClient.get<MealPlanWithRecipes>(
        `/meal-plans/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching meal plan ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new meal plan
   */
  create: async (mealPlan: MealPlanCreate): Promise<MealPlan> => {
    try {
      const response = await apiClient.post<MealPlan>(
        "/meal-plans",
        mealPlan,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating meal plan:", error);
      throw error;
    }
  },

  /**
   * Update a meal plan
   */
  update: async (
    id: string | number,
    updates: MealPlanUpdate,
  ): Promise<MealPlan> => {
    try {
      const response = await apiClient.put<MealPlan>(
        `/meal-plans/${id}`,
        updates,
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating meal plan ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a meal plan
   */
  delete: async (id: string | number): Promise<void> => {
    try {
      await apiClient.delete(`/meal-plans/${id}`);
    } catch (error) {
      console.error(`Error deleting meal plan ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add a recipe to a meal plan for a specific day
   */
  addRecipe: async (
    planId: string | number,
    recipe: AddRecipeToPlan,
  ): Promise<MealPlanRecipe> => {
    try {
      const response = await apiClient.post<MealPlanRecipe>(
        `/meal-plans/${planId}/recipes`,
        recipe,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error adding recipe to meal plan ${planId}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Remove a recipe from a meal plan
   */
  removeRecipe: async (
    planId: string | number,
    recipeId: number,
    day: Day,
  ): Promise<void> => {
    try {
      await apiClient.delete(`/meal-plans/${planId}/recipes`, {
        params: { recipeId, day },
      });
    } catch (error) {
      console.error(
        `Error removing recipe from meal plan ${planId}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Update a recipe in a meal plan
   */
  updateRecipe: async (
    planId: string | number,
    update: UpdateRecipeInPlan,
  ): Promise<MealPlanRecipe> => {
    try {
      const response = await apiClient.put<MealPlanRecipe>(
        `/meal-plans/${planId}/recipes`,
        update,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating recipe in meal plan ${planId}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Get all recipes for a specific day in a meal plan
   */
  getRecipesForDay: async (
    planId: string | number,
    day: Day,
  ): Promise<MealPlanRecipe[]> => {
    try {
      const response = await apiClient.get<MealPlanRecipe[]>(
        `/meal-plans/${planId}/days/${day}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching recipes for ${day} in meal plan ${planId}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Update all recipes for a specific day (replaces existing recipes)
   */
  updateDay: async (
    planId: string | number,
    day: Day,
    updates: UpdateDayRecipes,
  ): Promise<MealPlanRecipe[]> => {
    try {
      const response = await apiClient.put<MealPlanRecipe[]>(
        `/meal-plans/${planId}/days/${day}`,
        updates,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating ${day} in meal plan ${planId}:`,
        error,
      );
      throw error;
    }
  },
};
