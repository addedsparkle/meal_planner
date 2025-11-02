import axios from "axios";
import type { Recipe } from "../types/Recipe";
import type { Ingredient } from "../types/Ingredient";

const API_BASE_URL = "/api";

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const recipesApi = {
  getAll: async (): Promise<Recipe[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Recipe[]>>("/recipes");
      const result = response.data;

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || [];
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return [];
    }
  },

  create: async (recipe: unknown): Promise<Recipe> => {
    try {
      console.log(recipe);
      const response = await apiClient.post<ApiResponse<Recipe[]>>(
        "/recipes",
        recipe,
      );
      const result = response.data;

      if (result.error) {
        console.error(result.error);
        throw new Error(result.error);
      }

      if (!result.data || result.data.length === 0) {
        throw new Error("Failed to create recipe");
      }

      return result.data[0];
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
      const response =
        await apiClient.get<ApiResponse<Ingredient[]>>("/ingredients");
      const result = response.data;

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || [];
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      return [];
    }
  },

  create: async (recipe: Omit<Ingredient, "id">): Promise<Ingredient> => {
    try {
      const response = await apiClient.post<ApiResponse<Ingredient[]>>(
        "/ingredients",
        recipe,
      );
      const result = response.data;

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.data || result.data.length === 0) {
        throw new Error("Failed to create ingredient");
      }

      return result.data[0];
    } catch (error) {
      console.error("Error creating ingredient:", error);
      throw error;
    }
  },
};
