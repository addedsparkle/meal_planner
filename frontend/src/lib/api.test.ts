import { describe, it, expect, vi, afterEach } from "vitest";
import {
  fetchRecipes,
  fetchRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  fetchIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  fetchMealPlans,
  fetchMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  generateMealPlan,
  fetchShoppingList,
} from "./api";
import type {
  Recipe,
  RecipeInput,
  Ingredient,
  IngredientInput,
  MealPlan,
  MealPlanInput,
  GenerateMealPlanInput,
  ShoppingListResponse,
} from "./types";

// ── Helpers ───────────────────────────────────────────────────────────

function mockOk(data: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status,
    json: vi.fn().mockResolvedValue(data),
  });
}

function mockError(status: number, errorBody: unknown = null) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: vi.fn().mockResolvedValue(errorBody),
  });
}

function mockNoContent() {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 204,
    json: vi.fn().mockResolvedValue(null),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── Fixtures ──────────────────────────────────────────────────────────

const recipe: Recipe = {
  id: 1,
  name: "Pasta",
  description: null,
  protein: null,
  mealTypes: ["dinner"],
  suitableDays: "any",
  freezable: false,
  lastUsedAt: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ingredients: [],
};

const recipeInput: RecipeInput = {
  name: "Pasta",
  mealTypes: ["dinner"],
};

const ingredient: Ingredient = {
  id: 1,
  name: "Tomato",
  category: "Vegetable",
  createdAt: "2024-01-01T00:00:00Z",
};

const ingredientInput: IngredientInput = { name: "Tomato", category: "Vegetable" };

const mealPlan: MealPlan = {
  id: 1,
  name: "Week 1",
  startDate: "2024-01-01",
  endDate: "2024-01-07",
  createdAt: "2024-01-01T00:00:00Z",
  days: [],
};

const mealPlanInput: MealPlanInput = {
  name: "Week 1",
  startDate: "2024-01-01",
  endDate: "2024-01-07",
};

const generateInput: GenerateMealPlanInput = {
  name: "Auto Week",
  startDate: "2024-01-01",
  endDate: "2024-01-07",
};

const shoppingListResponse: ShoppingListResponse = {
  mealPlanIds: [1],
  items: [],
};

// ── Recipes ───────────────────────────────────────────────────────────

describe("fetchRecipes", () => {
  it("calls GET /api/recipes and returns recipes", async () => {
    const fetch = mockOk([recipe]);
    vi.stubGlobal("fetch", fetch);

    const result = await fetchRecipes();

    expect(fetch).toHaveBeenCalledWith(
      "/api/recipes",
      expect.objectContaining({}),
    );
    expect(fetch.mock.calls[0][1]).not.toHaveProperty("method");
    expect(result).toEqual([recipe]);
  });

  it("throws when the server returns an error", async () => {
    vi.stubGlobal("fetch", mockError(500, { error: "Internal server error" }));
    await expect(fetchRecipes()).rejects.toThrow("Internal server error");
  });
});

describe("fetchRecipe", () => {
  it("calls GET /api/recipes/:id and returns the recipe", async () => {
    const fetch = mockOk(recipe);
    vi.stubGlobal("fetch", fetch);

    const result = await fetchRecipe(1);

    expect(fetch).toHaveBeenCalledWith("/api/recipes/1", expect.anything());
    expect(result).toEqual(recipe);
  });

  it("throws with 404 error message when recipe not found", async () => {
    vi.stubGlobal("fetch", mockError(404, { error: "Recipe not found" }));
    await expect(fetchRecipe(99)).rejects.toThrow("Recipe not found");
  });
});

describe("createRecipe", () => {
  it("calls POST /api/recipes with JSON body and returns created recipe", async () => {
    const fetch = mockOk(recipe, 201);
    vi.stubGlobal("fetch", fetch);

    const result = await createRecipe(recipeInput);

    expect(fetch).toHaveBeenCalledWith(
      "/api/recipes",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(recipeInput),
      }),
    );
    expect(result).toEqual(recipe);
  });

  it("throws when validation fails (400)", async () => {
    vi.stubGlobal("fetch", mockError(400, { error: "Validation error" }));
    await expect(createRecipe({} as RecipeInput)).rejects.toThrow(
      "Validation error",
    );
  });
});

describe("updateRecipe", () => {
  it("calls PUT /api/recipes/:id with JSON body and returns updated recipe", async () => {
    const fetch = mockOk(recipe);
    vi.stubGlobal("fetch", fetch);

    const result = await updateRecipe(1, recipeInput);

    expect(fetch).toHaveBeenCalledWith(
      "/api/recipes/1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(recipeInput),
      }),
    );
    expect(result).toEqual(recipe);
  });

  it("throws with 404 error message when recipe not found", async () => {
    vi.stubGlobal("fetch", mockError(404, { error: "Recipe not found" }));
    await expect(updateRecipe(99, recipeInput)).rejects.toThrow(
      "Recipe not found",
    );
  });
});

describe("deleteRecipe", () => {
  it("calls DELETE /api/recipes/:id and returns undefined on 204", async () => {
    const fetch = mockNoContent();
    vi.stubGlobal("fetch", fetch);

    const result = await deleteRecipe(1);

    expect(fetch).toHaveBeenCalledWith(
      "/api/recipes/1",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(result).toBeUndefined();
  });

  it("throws with 404 error message when recipe not found", async () => {
    vi.stubGlobal("fetch", mockError(404, { error: "Recipe not found" }));
    await expect(deleteRecipe(99)).rejects.toThrow("Recipe not found");
  });
});

// ── Ingredients ───────────────────────────────────────────────────────

describe("fetchIngredients", () => {
  it("calls GET /api/ingredients without search param", async () => {
    const fetch = mockOk([ingredient]);
    vi.stubGlobal("fetch", fetch);

    const result = await fetchIngredients();

    expect(fetch).toHaveBeenCalledWith("/api/ingredients", expect.anything());
    expect(result).toEqual([ingredient]);
  });

  it("calls GET /api/ingredients?search=... when search is provided", async () => {
    const fetch = mockOk([ingredient]);
    vi.stubGlobal("fetch", fetch);

    await fetchIngredients("tomato");

    expect(fetch).toHaveBeenCalledWith(
      "/api/ingredients?search=tomato",
      expect.anything(),
    );
  });

  it("URL-encodes the search parameter", async () => {
    const fetch = mockOk([]);
    vi.stubGlobal("fetch", fetch);

    await fetchIngredients("bell pepper");

    expect(fetch).toHaveBeenCalledWith(
      "/api/ingredients?search=bell%20pepper",
      expect.anything(),
    );
  });
});

describe("createIngredient", () => {
  it("calls POST /api/ingredients with JSON body and returns created ingredient", async () => {
    const fetch = mockOk(ingredient, 201);
    vi.stubGlobal("fetch", fetch);

    const result = await createIngredient(ingredientInput);

    expect(fetch).toHaveBeenCalledWith(
      "/api/ingredients",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(ingredientInput),
      }),
    );
    expect(result).toEqual(ingredient);
  });

  it("throws with 409 error when ingredient name already exists", async () => {
    vi.stubGlobal(
      "fetch",
      mockError(409, { error: "Ingredient with this name already exists" }),
    );
    await expect(createIngredient(ingredientInput)).rejects.toThrow(
      "Ingredient with this name already exists",
    );
  });
});

describe("updateIngredient", () => {
  it("calls PUT /api/ingredients/:id with JSON body and returns updated ingredient", async () => {
    const fetch = mockOk(ingredient);
    vi.stubGlobal("fetch", fetch);

    const result = await updateIngredient(1, ingredientInput);

    expect(fetch).toHaveBeenCalledWith(
      "/api/ingredients/1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(ingredientInput),
      }),
    );
    expect(result).toEqual(ingredient);
  });

  it("throws with 404 error when ingredient not found", async () => {
    vi.stubGlobal("fetch", mockError(404, { error: "Ingredient not found" }));
    await expect(updateIngredient(99, ingredientInput)).rejects.toThrow(
      "Ingredient not found",
    );
  });
});

describe("deleteIngredient", () => {
  it("calls DELETE /api/ingredients/:id and returns undefined on 204", async () => {
    const fetch = mockNoContent();
    vi.stubGlobal("fetch", fetch);

    const result = await deleteIngredient(1);

    expect(fetch).toHaveBeenCalledWith(
      "/api/ingredients/1",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(result).toBeUndefined();
  });

  it("throws with 404 error when ingredient not found", async () => {
    vi.stubGlobal("fetch", mockError(404, { error: "Ingredient not found" }));
    await expect(deleteIngredient(99)).rejects.toThrow("Ingredient not found");
  });

  it("throws with 409 error when ingredient is in use", async () => {
    vi.stubGlobal(
      "fetch",
      mockError(409, { error: "Ingredient is used by recipes" }),
    );
    await expect(deleteIngredient(1)).rejects.toThrow(
      "Ingredient is used by recipes",
    );
  });
});

// ── Meal Plans ────────────────────────────────────────────────────────

describe("fetchMealPlans", () => {
  it("calls GET /api/meal-plans and returns meal plans", async () => {
    const fetch = mockOk([mealPlan]);
    vi.stubGlobal("fetch", fetch);

    const result = await fetchMealPlans();

    expect(fetch).toHaveBeenCalledWith("/api/meal-plans", expect.anything());
    expect(result).toEqual([mealPlan]);
  });
});

describe("fetchMealPlan", () => {
  it("calls GET /api/meal-plans/:id and returns the meal plan", async () => {
    const fetch = mockOk(mealPlan);
    vi.stubGlobal("fetch", fetch);

    const result = await fetchMealPlan(1);

    expect(fetch).toHaveBeenCalledWith("/api/meal-plans/1", expect.anything());
    expect(result).toEqual(mealPlan);
  });

  it("throws with 404 error when meal plan not found", async () => {
    vi.stubGlobal("fetch", mockError(404, { error: "Meal plan not found" }));
    await expect(fetchMealPlan(99)).rejects.toThrow("Meal plan not found");
  });
});

describe("createMealPlan", () => {
  it("calls POST /api/meal-plans with JSON body and returns created meal plan", async () => {
    const fetch = mockOk(mealPlan, 201);
    vi.stubGlobal("fetch", fetch);

    const result = await createMealPlan(mealPlanInput);

    expect(fetch).toHaveBeenCalledWith(
      "/api/meal-plans",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(mealPlanInput),
      }),
    );
    expect(result).toEqual(mealPlan);
  });

  it("throws when validation fails (400)", async () => {
    vi.stubGlobal("fetch", mockError(400, { error: "Validation error" }));
    await expect(createMealPlan({} as MealPlanInput)).rejects.toThrow(
      "Validation error",
    );
  });
});

describe("updateMealPlan", () => {
  it("calls PUT /api/meal-plans/:id with JSON body and returns updated meal plan", async () => {
    const fetch = mockOk(mealPlan);
    vi.stubGlobal("fetch", fetch);

    const result = await updateMealPlan(1, mealPlanInput);

    expect(fetch).toHaveBeenCalledWith(
      "/api/meal-plans/1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(mealPlanInput),
      }),
    );
    expect(result).toEqual(mealPlan);
  });

  it("throws with 404 error when meal plan not found", async () => {
    vi.stubGlobal("fetch", mockError(404, { error: "Meal plan not found" }));
    await expect(updateMealPlan(99, mealPlanInput)).rejects.toThrow(
      "Meal plan not found",
    );
  });
});

describe("deleteMealPlan", () => {
  it("calls DELETE /api/meal-plans/:id and returns undefined on 204", async () => {
    const fetch = mockNoContent();
    vi.stubGlobal("fetch", fetch);

    const result = await deleteMealPlan(1);

    expect(fetch).toHaveBeenCalledWith(
      "/api/meal-plans/1",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(result).toBeUndefined();
  });

  it("throws with 404 error when meal plan not found", async () => {
    vi.stubGlobal("fetch", mockError(404, { error: "Meal plan not found" }));
    await expect(deleteMealPlan(99)).rejects.toThrow("Meal plan not found");
  });
});

describe("generateMealPlan", () => {
  it("calls POST /api/meal-plans/generate with JSON body and returns generated meal plan", async () => {
    const fetch = mockOk(mealPlan, 201);
    vi.stubGlobal("fetch", fetch);

    const result = await generateMealPlan(generateInput);

    expect(fetch).toHaveBeenCalledWith(
      "/api/meal-plans/generate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(generateInput),
      }),
    );
    expect(result).toEqual(mealPlan);
  });

  it("throws when generation fails (400)", async () => {
    vi.stubGlobal(
      "fetch",
      mockError(400, { error: "Not enough recipes available" }),
    );
    await expect(generateMealPlan(generateInput)).rejects.toThrow(
      "Not enough recipes available",
    );
  });
});

// ── Shopping List ─────────────────────────────────────────────────────

describe("fetchShoppingList", () => {
  it("calls GET /api/shopping-list?mealPlanId=:id and returns shopping list", async () => {
    const fetch = mockOk(shoppingListResponse);
    vi.stubGlobal("fetch", fetch);

    const result = await fetchShoppingList(1);

    expect(fetch).toHaveBeenCalledWith(
      "/api/shopping-list?mealPlanId=1",
      expect.anything(),
    );
    expect(result).toEqual(shoppingListResponse);
  });
});

// ── apiFetch error handling ───────────────────────────────────────────

describe("error handling", () => {
  it("throws with status-based message when error body has no error field", async () => {
    vi.stubGlobal("fetch", mockError(503, {}));
    await expect(fetchRecipes()).rejects.toThrow("Request failed: 503");
  });

  it("throws with status-based message when error body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: vi.fn().mockRejectedValue(new Error("not json")),
      }),
    );
    await expect(fetchRecipes()).rejects.toThrow("Request failed: 502");
  });
});
