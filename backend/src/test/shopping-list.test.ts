import { describe, it, expect } from "vitest";
import { getApp } from "./setup.js";

describe("Shopping List API", () => {
  it("GET /api/shopping-list returns aggregated ingredients", async () => {
    const app = await getApp();

    // Create recipes with ingredients
    const recipe1 = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: {
        name: "Pasta",
        ingredients: [
          { name: "Pasta", quantity: "500g" },
          { name: "Tomato Sauce", quantity: "200ml" },
        ],
      },
    });

    const recipe2 = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: {
        name: "Pizza",
        ingredients: [
          { name: "Tomato Sauce", quantity: "100ml" },
          { name: "Cheese", quantity: "200g" },
        ],
      },
    });

    // Create a meal plan with both recipes
    const plan = await app.inject({
      method: "POST",
      url: "/api/meal-plans",
      payload: {
        name: "Test Plan",
        startDate: "2026-01-01",
        endDate: "2026-01-02",
        days: [
          { dayDate: "2026-01-01", recipeId: recipe1.json().id },
          { dayDate: "2026-01-02", recipeId: recipe2.json().id },
        ],
      },
    });
    const planId = plan.json().id;

    const res = await app.inject({
      method: "GET",
      url: `/api/shopping-list?mealPlanId=${planId}`,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.mealPlanIds).toEqual([planId]);
    expect(body.items.length).toBeGreaterThanOrEqual(3);

    // Tomato sauce should appear with quantities from both recipes
    const tomatoSauce = body.items.find(
      (i: { name: string }) => i.name === "tomato sauce",
    );
    expect(tomatoSauce).toBeDefined();
    expect(tomatoSauce.quantities).toHaveLength(2);
  });

  it("GET /api/shopping-list returns 400 for missing mealPlanId", async () => {
    const app = await getApp();
    const res = await app.inject({
      method: "GET",
      url: "/api/shopping-list",
    });
    // Fastify schema validation returns 400 for missing required querystring
    expect(res.statusCode).toBe(400);
  });

  it("GET /api/shopping-list returns 400 for invalid mealPlanId", async () => {
    const app = await getApp();
    const res = await app.inject({
      method: "GET",
      url: "/api/shopping-list?mealPlanId=abc",
    });
    expect(res.statusCode).toBe(400);
  });

  it("GET /api/shopping-list returns empty items for plan with no recipes", async () => {
    const app = await getApp();

    const plan = await app.inject({
      method: "POST",
      url: "/api/meal-plans",
      payload: {
        name: "Empty Plan",
        startDate: "2026-02-01",
        endDate: "2026-02-01",
      },
    });
    const planId = plan.json().id;

    const res = await app.inject({
      method: "GET",
      url: `/api/shopping-list?mealPlanId=${planId}`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().items).toEqual([]);
  });
});
