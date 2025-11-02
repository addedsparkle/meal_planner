import axios from "axios";
import type { Recipe, RecipeIn } from "../types/Recipe";
import type { Ingredient } from "../types/Ingredient";

const API_BASE_URL = "/api";

export type RecipeCreateParams = RecipeIn;

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

  create: async (recipe: RecipeCreateParams): Promise<Recipe> => {
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
