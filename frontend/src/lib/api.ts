import axios from "axios";
import type {
  Recipe,
  RecipeInput,
  Ingredient,
  IngredientInput,
  MealPlan,
  MealPlanInput,
  GenerateMealPlanInput,
  ShoppingListResponse,
} from "./types.js";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const body = error.response.data as { error?: string };
      throw new Error(body.error ?? `Request failed: ${error.response.status}`);
    }
    throw error;
  },
);

// ── Recipes ──────────────────────────────────────────────────────────

export async function fetchRecipes(): Promise<Recipe[]> {
  const { data } = await api.get<Recipe[]>("/recipes");
  return data;
}

export async function fetchRecipe(id: number): Promise<Recipe> {
  const { data } = await api.get<Recipe>(`/recipes/${id}`);
  return data;
}

export async function createRecipe(body: RecipeInput): Promise<Recipe> {
  const { data } = await api.post<Recipe>("/recipes", body);
  return data;
}

export async function updateRecipe(id: number, body: RecipeInput): Promise<Recipe> {
  const { data } = await api.put<Recipe>(`/recipes/${id}`, body);
  return data;
}

export async function deleteRecipe(id: number): Promise<void> {
  await api.delete(`/recipes/${id}`);
}

// ── Ingredients ──────────────────────────────────────────────────────

export async function fetchIngredients(search?: string): Promise<Ingredient[]> {
  const params = search ? { search } : {};
  const { data } = await api.get<Ingredient[]>("/ingredients", { params });
  return data;
}

export async function createIngredient(body: IngredientInput): Promise<Ingredient> {
  const { data } = await api.post<Ingredient>("/ingredients", body);
  return data;
}

export async function updateIngredient(id: number, body: IngredientInput): Promise<Ingredient> {
  const { data } = await api.put<Ingredient>(`/ingredients/${id}`, body);
  return data;
}

export async function deleteIngredient(id: number): Promise<void> {
  await api.delete(`/ingredients/${id}`);
}

// ── Meal Plans ───────────────────────────────────────────────────────

export async function fetchMealPlans(): Promise<MealPlan[]> {
  const { data } = await api.get<MealPlan[]>("/meal-plans");
  return data;
}

export async function fetchMealPlan(id: number): Promise<MealPlan> {
  const { data } = await api.get<MealPlan>(`/meal-plans/${id}`);
  return data;
}

export async function createMealPlan(body: MealPlanInput): Promise<MealPlan> {
  const { data } = await api.post<MealPlan>("/meal-plans", body);
  return data;
}

export async function updateMealPlan(id: number, body: MealPlanInput): Promise<MealPlan> {
  const { data } = await api.put<MealPlan>(`/meal-plans/${id}`, body);
  return data;
}

export async function deleteMealPlan(id: number): Promise<void> {
  await api.delete(`/meal-plans/${id}`);
}

export async function generateMealPlan(body: GenerateMealPlanInput): Promise<MealPlan> {
  const { data } = await api.post<MealPlan>("/meal-plans/generate", body);
  return data;
}

// ── Shopping List ────────────────────────────────────────────────────

export async function fetchShoppingList(mealPlanId: number): Promise<ShoppingListResponse> {
  const { data } = await api.get<ShoppingListResponse>("/shopping-list", {
    params: { mealPlanId },
  });
  return data;
}
