import type {
  Recipe,
  RecipeInput,
  CsvImportResult,
  Ingredient,
  IngredientInput,
  MealPlan,
  MealPlanInput,
  GenerateMealPlanInput,
  ShoppingListResponse,
} from "./types";

const API_BASE = "/api";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  const headers: HeadersInit = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...options?.headers,
  };

  const fullUrl = `${API_BASE}${url}`;

  if (import.meta.env.DEV) {
    console.log(`[API] ${options?.method ?? "GET"} ${fullUrl}`);
  }

  const response = await fetch(fullUrl, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      (body as { error?: string } | null)?.error ??
      `Request failed: ${response.status}`;
    throw new Error(message);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ── Recipes ──────────────────────────────────────────────────────────

export function fetchRecipes(): Promise<Recipe[]> {
  return apiFetch<Recipe[]>("/recipes");
}

export function fetchRecipe(id: number): Promise<Recipe> {
  return apiFetch<Recipe>(`/recipes/${id}`);
}

export function createRecipe(data: RecipeInput): Promise<Recipe> {
  return apiFetch<Recipe>("/recipes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRecipe(
  id: number,
  data: RecipeInput,
): Promise<Recipe> {
  return apiFetch<Recipe>(`/recipes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRecipe(id: number): Promise<void> {
  return apiFetch<void>(`/recipes/${id}`, { method: "DELETE" });
}

export function importRecipesCsv(file: File): Promise<CsvImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<CsvImportResult>("/recipes/import", {
    method: "POST",
    body: formData,
  });
}

// ── Ingredients ──────────────────────────────────────────────────────

export function fetchIngredients(search?: string): Promise<Ingredient[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<Ingredient[]>(`/ingredients${params}`);
}

export function createIngredient(
  data: IngredientInput,
): Promise<Ingredient> {
  return apiFetch<Ingredient>("/ingredients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateIngredient(
  id: number,
  data: IngredientInput,
): Promise<Ingredient> {
  return apiFetch<Ingredient>(`/ingredients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteIngredient(id: number): Promise<void> {
  return apiFetch<void>(`/ingredients/${id}`, { method: "DELETE" });
}

// ── Meal Plans ───────────────────────────────────────────────────────

export function fetchMealPlans(): Promise<MealPlan[]> {
  return apiFetch<MealPlan[]>("/meal-plans");
}

export function fetchMealPlan(id: number): Promise<MealPlan> {
  return apiFetch<MealPlan>(`/meal-plans/${id}`);
}

export function createMealPlan(data: MealPlanInput): Promise<MealPlan> {
  return apiFetch<MealPlan>("/meal-plans", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateMealPlan(
  id: number,
  data: MealPlanInput,
): Promise<MealPlan> {
  return apiFetch<MealPlan>(`/meal-plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteMealPlan(id: number): Promise<void> {
  return apiFetch<void>(`/meal-plans/${id}`, { method: "DELETE" });
}

export function generateMealPlan(
  data: GenerateMealPlanInput,
): Promise<MealPlan> {
  return apiFetch<MealPlan>("/meal-plans/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Shopping List ────────────────────────────────────────────────────

export function fetchShoppingList(
  mealPlanIds: number[],
): Promise<ShoppingListResponse> {
  const params = mealPlanIds.join(",");
  return apiFetch<ShoppingListResponse>(
    `/shopping-list?mealPlanId=${params}`,
  );
}
