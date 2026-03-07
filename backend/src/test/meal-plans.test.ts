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

  it("POST /api/meal-plans/generate assigns weekday breakfast to Mon-Fri and weekend breakfast to Sat-Sun", async () => {
    const app = await getApp();

    // One recipe for each suitableDays value
    const wdRes = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Weekday Oats", mealTypes: ["breakfast"], suitableDays: "weekday" },
    });
    const weekdayId = wdRes.json().id;

    const weRes = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Weekend Shakshuka", mealTypes: ["breakfast"], suitableDays: "weekend" },
    });
    const weekendId = weRes.json().id;

    await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Pasta", mealTypes: ["dinner"] },
    });

    // 2026-09-07 Mon → 2026-09-13 Sun: 5 weekdays + 2 weekend days
    const res = await app.inject({
      method: "POST",
      url: "/api/meal-plans/generate",
      payload: { name: "Split Plan", startDate: "2026-09-07", endDate: "2026-09-13" },
    });
    expect(res.statusCode).toBe(201);

    const breakfasts: Array<{ dayDate: string; recipe: { id: number } }> = res
      .json()
      .days.filter((d: { mealType: string }) => d.mealType === "breakfast");
    expect(breakfasts).toHaveLength(7);

    const weekdayDates = new Set(["2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11"]);
    const weekendDates = new Set(["2026-09-12", "2026-09-13"]);

    for (const bf of breakfasts) {
      if (weekdayDates.has(bf.dayDate)) {
        expect(bf.recipe.id).toBe(weekdayId);
      } else if (weekendDates.has(bf.dayDate)) {
        expect(bf.recipe.id).toBe(weekendId);
      }
    }
  });

  it("POST /api/meal-plans/generate batches weekday breakfast every 3 days but rotates weekend breakfast daily", async () => {
    const app = await getApp();

    // Two weekday and two weekend breakfast recipes
    await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Weekday A", mealTypes: ["breakfast"], suitableDays: "weekday" },
    });
    await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Weekday B", mealTypes: ["breakfast"], suitableDays: "weekday" },
    });

    const weRes1 = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Weekend A", mealTypes: ["breakfast"], suitableDays: "weekend" },
    });
    const weId1 = weRes1.json().id;

    const weRes2 = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Weekend B", mealTypes: ["breakfast"], suitableDays: "weekend" },
    });
    const weId2 = weRes2.json().id;

    await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Pasta", mealTypes: ["dinner"] },
    });

    // 2026-09-07 Mon → 2026-09-13 Sun: 5 weekdays (Mon-Fri) + 2 weekend days (Sat-Sun)
    const res = await app.inject({
      method: "POST",
      url: "/api/meal-plans/generate",
      payload: { name: "Batch Plan", startDate: "2026-09-07", endDate: "2026-09-13" },
    });
    expect(res.statusCode).toBe(201);

    const breakfasts: Array<{ dayDate: string; recipe: { id: number } }> = res
      .json()
      .days.filter((d: { mealType: string }) => d.mealType === "breakfast");

    const byDate = Object.fromEntries(breakfasts.map((b) => [b.dayDate, b.recipe.id]));

    // Mon-Tue-Wed (weekday batch 1) all get the same recipe
    expect(byDate["2026-09-07"]).toBe(byDate["2026-09-08"]);
    expect(byDate["2026-09-08"]).toBe(byDate["2026-09-09"]);

    // Thu-Fri (weekday batch 2) share a different recipe from Mon-Wed
    expect(byDate["2026-09-10"]).toBe(byDate["2026-09-11"]);
    expect(byDate["2026-09-10"]).not.toBe(byDate["2026-09-07"]);

    // Sat and Sun come from the weekend pool and rotate daily (different from each other)
    expect([weId1, weId2]).toContain(byDate["2026-09-12"]);
    expect([weId1, weId2]).toContain(byDate["2026-09-13"]);
    expect(byDate["2026-09-12"]).not.toBe(byDate["2026-09-13"]);

    // Weekend recipes must not appear on weekdays
    const weekdayIds = ["2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11"].map(
      (d) => byDate[d],
    );
    expect(weekdayIds).not.toContain(weId1);
    expect(weekdayIds).not.toContain(weId2);
  });

  it("POST /api/meal-plans/generate extends the current weekday batch into weekends when no weekend-specific recipes exist", async () => {
    const app = await getApp();

    // Two "any" breakfast recipes — no weekend-specific ones
    const bfRes1 = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Oats", mealTypes: ["breakfast"], suitableDays: "any" },
    });
    const oatsId = bfRes1.json().id;

    const bfRes2 = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Granola", mealTypes: ["breakfast"], suitableDays: "any" },
    });
    const granolaId = bfRes2.json().id;

    await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Pasta", mealTypes: ["dinner"] },
    });

    // 2026-09-07 Mon → 2026-09-13 Sun
    // Batch 0: Mon-Tue-Wed (3 days, starts on Mon ✓)
    // Batch 1: Thu-Fri-Sat (3 days, starts on Thu ✓ — a batch can naturally end on a weekend)
    // Sun: would start batch 2, but Sun is a weekend → held back, extends batch 1
    const res = await app.inject({
      method: "POST",
      url: "/api/meal-plans/generate",
      payload: { name: "Extend Batch Plan", startDate: "2026-09-07", endDate: "2026-09-13" },
    });
    expect(res.statusCode).toBe(201);

    const breakfasts: Array<{ dayDate: string; recipe: { id: number } }> = res
      .json()
      .days.filter((d: { mealType: string }) => d.mealType === "breakfast");

    const byDate = Object.fromEntries(breakfasts.map((b) => [b.dayDate, b.recipe.id]));

    // Mon-Tue-Wed all share batch 0's recipe
    expect(byDate["2026-09-07"]).toBe(byDate["2026-09-08"]);
    expect(byDate["2026-09-08"]).toBe(byDate["2026-09-09"]);

    // Thu-Fri-Sat are all batch 1 (batch starts on Thu — a weekday — and Sat is its 3rd day)
    expect(byDate["2026-09-10"]).toBe(byDate["2026-09-11"]);
    expect(byDate["2026-09-11"]).toBe(byDate["2026-09-12"]);
    expect(byDate["2026-09-10"]).not.toBe(byDate["2026-09-07"]);

    // Sun would start batch 2 but is a weekend, so it extends batch 1
    expect(byDate["2026-09-13"]).toBe(byDate["2026-09-10"]);

    // Both recipe IDs are the two we created
    const allIds = new Set(Object.values(byDate));
    expect(allIds.size).toBe(2);
    expect(allIds).toContain(oatsId);
    expect(allIds).toContain(granolaId);
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

  it("creating a meal plan sets lastUsedAt on used recipes", async () => {
    const app = await getApp();
    const recipe = await createTestRecipe(app, "Curry");

    await app.inject({
      method: "POST",
      url: "/api/meal-plans",
      payload: {
        name: "Week",
        startDate: "2026-10-01",
        endDate: "2026-10-02",
        days: [
          { dayDate: "2026-10-01", recipeId: recipe.id },
          { dayDate: "2026-10-02", recipeId: recipe.id },
        ],
      },
    });

    const res = await app.inject({ method: "GET", url: `/api/recipes/${recipe.id}` });
    expect(res.json().lastUsedAt).toBe("2026-10-02");
  });

  it("deleting a meal plan clears lastUsedAt when recipe no longer used", async () => {
    const app = await getApp();
    const recipe = await createTestRecipe(app, "Soup");

    const plan = await app.inject({
      method: "POST",
      url: "/api/meal-plans",
      payload: {
        name: "Solo Plan",
        startDate: "2026-10-05",
        endDate: "2026-10-05",
        days: [{ dayDate: "2026-10-05", recipeId: recipe.id }],
      },
    });

    await app.inject({ method: "DELETE", url: `/api/meal-plans/${plan.json().id}` });

    const res = await app.inject({ method: "GET", url: `/api/recipes/${recipe.id}` });
    expect(res.json().lastUsedAt).toBeNull();
  });

  it("POST /api/meal-plans/generate prefers least-recently-used recipes", async () => {
    const app = await getApp();

    // Create two dinner recipes
    const recentRes = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Recent Recipe", mealTypes: ["dinner"] },
    });
    const recentId = recentRes.json().id;

    const oldRes = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Old Recipe", mealTypes: ["dinner"] },
    });
    const oldId = oldRes.json().id;

    // Use "Recent Recipe" in a plan ending 2026-10-20
    await app.inject({
      method: "POST",
      url: "/api/meal-plans",
      payload: {
        name: "Previous Plan",
        startDate: "2026-10-20",
        endDate: "2026-10-20",
        days: [{ dayDate: "2026-10-20", recipeId: recentId }],
      },
    });

    // Generate a new 2-day plan — "Old Recipe" (never used) should appear on day 1
    const res = await app.inject({
      method: "POST",
      url: "/api/meal-plans/generate",
      payload: { name: "New Plan", startDate: "2026-10-21", endDate: "2026-10-22" },
    });
    expect(res.statusCode).toBe(201);
    const dinners = res.json().days.filter((d: { mealType: string }) => d.mealType === "dinner");
    expect(dinners[0].recipe.id).toBe(oldId);
    expect(dinners[1].recipe.id).toBe(recentId);
  });

  it("editing a meal plan to remove a recipe recomputes lastUsedAt from remaining plans", async () => {
    const app = await getApp();
    const recipe = await createTestRecipe(app, "Stew");

    // Plan A: uses recipe on 2026-11-01
    await app.inject({
      method: "POST",
      url: "/api/meal-plans",
      payload: {
        name: "Plan A",
        startDate: "2026-11-01",
        endDate: "2026-11-01",
        days: [{ dayDate: "2026-11-01", recipeId: recipe.id }],
      },
    });

    // Plan B: uses recipe on 2026-11-10 (more recent)
    const planB = await app.inject({
      method: "POST",
      url: "/api/meal-plans",
      payload: {
        name: "Plan B",
        startDate: "2026-11-10",
        endDate: "2026-11-10",
        days: [{ dayDate: "2026-11-10", recipeId: recipe.id }],
      },
    });

    // Remove recipe from Plan B — lastUsedAt should fall back to Plan A's date
    await app.inject({
      method: "PUT",
      url: `/api/meal-plans/${planB.json().id}`,
      payload: { name: "Plan B", days: [] },
    });

    const res = await app.inject({ method: "GET", url: `/api/recipes/${recipe.id}` });
    expect(res.json().lastUsedAt).toBe("2026-11-01");
  });

  it("POST /api/meal-plans/generate does not repeat recipes across meal types when enough exist", async () => {
    const app = await getApp();

    // 3 dinner-only + 3 lunch-only = 6 unique recipes for a 3-day plan (3 dinners + 3 lunches)
    for (let i = 0; i < 3; i++) {
      await app.inject({ method: "POST", url: "/api/recipes", payload: { name: `Dinner ${i}`, mealTypes: ["dinner"] } });
      await app.inject({ method: "POST", url: "/api/recipes", payload: { name: `Lunch ${i}`, mealTypes: ["lunch"] } });
    }

    const res = await app.inject({
      method: "POST",
      url: "/api/meal-plans/generate",
      // 2026-11-02 Mon to 2026-11-04 Wed — 3 weekdays, no breakfast recipes so only lunch+dinner
      payload: { name: "Unique Plan", startDate: "2026-11-02", endDate: "2026-11-04" },
    });
    expect(res.statusCode).toBe(201);

    const days = res.json().days;
    expect(days).toHaveLength(6); // 3 days × 2 meal types (lunch + dinner)
    const ids = days.map((d: { recipe: { id: number } | null }) => {
      if (!d.recipe) throw new Error(`Slot missing recipe: ${JSON.stringify(d)}`);
      return d.recipe.id;
    });
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length); // every slot has a different recipe
  });

  it("POST /api/meal-plans/generate does not use a multi-meal-type recipe in both lunch and dinner", async () => {
    const app = await getApp();

    // One recipe suitable for both lunch and dinner
    const sharedRes = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Shared Recipe", mealTypes: ["lunch", "dinner"] },
    });
    const sharedId = sharedRes.json().id;

    // A lunch-only recipe to fill the remaining lunch slot
    await app.inject({ method: "POST", url: "/api/recipes", payload: { name: "Lunch Only", mealTypes: ["lunch"] } });

    // Two dinner-only recipes to fill the dinner slots
    await app.inject({ method: "POST", url: "/api/recipes", payload: { name: "Dinner Only 1", mealTypes: ["dinner"] } });
    await app.inject({ method: "POST", url: "/api/recipes", payload: { name: "Dinner Only 2", mealTypes: ["dinner"] } });

    const res = await app.inject({
      method: "POST",
      url: "/api/meal-plans/generate",
      payload: { name: "No Dupe Plan", startDate: "2026-11-02", endDate: "2026-11-03" }, // 2 days
    });
    expect(res.statusCode).toBe(201);

    const days = res.json().days;
    expect(days).toHaveLength(4); // 2 days × 2 meal types (lunch + dinner)
    const sharedAppearances = days.filter((d: { recipe: { id: number } }) => d.recipe.id === sharedId);
    // The shared recipe must appear exactly once — it should fill one slot (lunch or dinner)
    // and must not duplicate into the other meal type pool
    expect(sharedAppearances.length).toBeGreaterThanOrEqual(1); // actually selected
    expect(sharedAppearances.length).toBe(1); // selected at most once
  });

  it("POST /api/meal-plans/generate uses previous day dinner as lunch fallback when lunch pool exhausted", async () => {
    const app = await getApp();

    // Only 1 lunch recipe but 2-day plan → day 2 lunch must reuse a dinner
    await app.inject({ method: "POST", url: "/api/recipes", payload: { name: "Lunch Recipe", mealTypes: ["lunch"] } });
    await app.inject({ method: "POST", url: "/api/recipes", payload: { name: "Dinner 1", mealTypes: ["dinner"] } });
    await app.inject({ method: "POST", url: "/api/recipes", payload: { name: "Dinner 2", mealTypes: ["dinner"] } });

    const res = await app.inject({
      method: "POST",
      url: "/api/meal-plans/generate",
      payload: { name: "Leftovers Plan", startDate: "2026-11-02", endDate: "2026-11-03" }, // 2 days
    });
    expect(res.statusCode).toBe(201);

    const days = res.json().days;
    expect(days).toHaveLength(4); // 2 days × 2 meal types (lunch + dinner)
    const day1Dinner = days.find(
      (d: { dayDate: string; mealType: string }) => d.dayDate === "2026-11-02" && d.mealType === "dinner",
    );
    const day2Lunch = days.find(
      (d: { dayDate: string; mealType: string }) => d.dayDate === "2026-11-03" && d.mealType === "lunch",
    );
    if (!day1Dinner || !day2Lunch) {
      throw new Error(`Expected slots not found in response. days: ${JSON.stringify(days)}`);
    }
    // Day 2 lunch must be day 1 dinner (leftover)
    expect((day2Lunch as { recipe: { id: number } }).recipe.id).toBe((day1Dinner as { recipe: { id: number } }).recipe.id);
  });
});
