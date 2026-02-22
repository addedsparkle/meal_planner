import { describe, it, expect } from "vitest";
import { getApp, db } from "./setup.js";

async function createTestRecipe(app: ReturnType<typeof getApp> extends Promise<infer T> ? T : never, name = "Test Recipe") {
  const res = await app.inject({
    method: "POST",
    url: "/api/recipes",
    payload: { name },
  });
  return res.json();
}

describe("Meal Plans API", () => {
  it("GET /api/meal-plans returns empty list", async () => {
    const app = await getApp();
    const res = await app.inject({ method: "GET", url: "/api/meal-plans" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it("POST /api/meal-plans creates a meal plan with days", async () => {
    const app = await getApp();
    const recipe = await createTestRecipe(app);

    const res = await app.inject({
      method: "POST",
      url: "/api/meal-plans",
      payload: {
        name: "Week 1",
        startDate: "2026-01-05",
        endDate: "2026-01-07",
        days: [
          { dayDate: "2026-01-05", recipeId: recipe.id, mealType: "dinner" },
          { dayDate: "2026-01-06", recipeId: recipe.id, mealType: "lunch" },
        ],
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.name).toBe("Week 1");
    expect(body.days).toHaveLength(2);
    expect(body.days[0].recipe.id).toBe(recipe.id);
  });

  it("POST /api/meal-plans creates a plan without days", async () => {
    const app = await getApp();
    const res = await app.inject({
      method: "POST",
      url: "/api/meal-plans",
      payload: {
        name: "Empty Plan",
        startDate: "2026-02-01",
        endDate: "2026-02-07",
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().days).toHaveLength(0);
  });

  it("GET /api/meal-plans/:id returns plan with nested recipes", async () => {
    const app = await getApp();
    const recipe = await createTestRecipe(app, "Stir Fry");

    const created = await app.inject({
      method: "POST",
      url: "/api/meal-plans",
      payload: {
        name: "Test Plan",
        startDate: "2026-03-01",
        endDate: "2026-03-01",
        days: [{ dayDate: "2026-03-01", recipeId: recipe.id }],
      },
    });
    const id = created.json().id;

    const res = await app.inject({ method: "GET", url: `/api/meal-plans/${id}` });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.days[0].recipe.name).toBe("Stir Fry");
  });

  it("GET /api/meal-plans/:id returns 404", async () => {
    const app = await getApp();
    const res = await app.inject({ method: "GET", url: "/api/meal-plans/9999" });
    expect(res.statusCode).toBe(404);
  });

  it("PUT /api/meal-plans/:id updates a plan", async () => {
    const app = await getApp();
    const recipe = await createTestRecipe(app);

    const created = await app.inject({
      method: "POST",
      url: "/api/meal-plans",
      payload: {
        name: "Original",
        startDate: "2026-04-01",
        endDate: "2026-04-03",
      },
    });
    const id = created.json().id;

    const res = await app.inject({
      method: "PUT",
      url: `/api/meal-plans/${id}`,
      payload: {
        name: "Updated",
        days: [{ dayDate: "2026-04-01", recipeId: recipe.id }],
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().name).toBe("Updated");
    expect(res.json().days).toHaveLength(1);
  });

  it("PUT /api/meal-plans/:id returns 404 for missing", async () => {
    const app = await getApp();
    const res = await app.inject({
      method: "PUT",
      url: "/api/meal-plans/9999",
      payload: { name: "Nope" },
    });
    expect(res.statusCode).toBe(404);
  });

  it("DELETE /api/meal-plans/:id deletes a plan", async () => {
    const app = await getApp();
    const created = await app.inject({
      method: "POST",
      url: "/api/meal-plans",
      payload: {
        name: "To Delete",
        startDate: "2026-05-01",
        endDate: "2026-05-01",
      },
    });
    const id = created.json().id;

    const res = await app.inject({ method: "DELETE", url: `/api/meal-plans/${id}` });
    expect(res.statusCode).toBe(204);

    const check = await app.inject({ method: "GET", url: `/api/meal-plans/${id}` });
    expect(check.statusCode).toBe(404);
  });

  it("DELETE /api/meal-plans/:id returns 404 for missing", async () => {
    const app = await getApp();
    const res = await app.inject({ method: "DELETE", url: "/api/meal-plans/9999" });
    expect(res.statusCode).toBe(404);
  });

  it("POST /api/meal-plans/generate creates a plan from recipes", async () => {
    const app = await getApp();
    // Default recipes have mealTypes: ["dinner"] — generates one dinner entry per day
    await createTestRecipe(app, "Recipe A");
    await createTestRecipe(app, "Recipe B");

    const res = await app.inject({
      method: "POST",
      url: "/api/meal-plans/generate",
      payload: {
        name: "Generated Plan",
        startDate: "2026-06-01",
        endDate: "2026-06-03",
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.name).toBe("Generated Plan");
    // 3 days × 1 meal type (dinner only) = 3 entries
    expect(body.days).toHaveLength(3);
    for (const day of body.days) {
      expect(day.recipe).toBeDefined();
      expect(day.mealType).toBe("dinner");
    }
  });

  it("POST /api/meal-plans/generate includes breakfast every 3 days and lunch daily", async () => {
    const app = await getApp();
    await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Oats", mealTypes: ["breakfast"] },
    });
    await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Sandwich", mealTypes: ["lunch"] },
    });
    await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Pasta", mealTypes: ["dinner"] },
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/meal-plans/generate",
      payload: { name: "Full Plan", startDate: "2026-08-01", endDate: "2026-08-06" },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    // 6 days × 3 meal types = 18 entries
    expect(body.days).toHaveLength(18);

    const byDate = body.days.reduce((acc: Record<string, typeof body.days>, d: typeof body.days[0]) => {
      (acc[d.dayDate] ??= []).push(d);
      return acc;
    }, {});

    // Each day has breakfast, lunch and dinner
    for (const entries of Object.values(byDate) as typeof body.days[]) {
      const types = entries.map((e: typeof body.days[0]) => e.mealType).sort();
      expect(types).toEqual(["breakfast", "dinner", "lunch"]);
    }

    // Days 1-3 share the same breakfast recipe; days 4-6 share the same
    const breakfasts = body.days.filter((d: typeof body.days[0]) => d.mealType === "breakfast");
    expect(breakfasts[0].recipe.id).toBe(breakfasts[1].recipe.id);
    expect(breakfasts[1].recipe.id).toBe(breakfasts[2].recipe.id);
    expect(breakfasts[3].recipe.id).toBe(breakfasts[4].recipe.id);
    expect(breakfasts[4].recipe.id).toBe(breakfasts[5].recipe.id);
  });

  it("POST /api/meal-plans/generate returns 400 with no recipes", async () => {
    const app = await getApp();
    const res = await app.inject({
      method: "POST",
      url: "/api/meal-plans/generate",
      payload: {
        name: "Empty Generate",
        startDate: "2026-07-01",
        endDate: "2026-07-03",
      },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toContain("No recipes available");
  });
});
