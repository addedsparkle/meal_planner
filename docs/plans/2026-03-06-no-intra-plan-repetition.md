# No Intra-Plan Recipe Repetition Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent the same recipe from appearing more than once in a generated meal plan across all days and meal types, with a leftovers fallback for lunch when unique options are exhausted.

**Architecture:** Add a `pickNext(pool, usedIds)` helper to `generateMealPlan` that scans a recipe pool for the first unused recipe, marking it used. Replace the current `pool[i % pool.length]` index access with `pickNext`. Track a single `usedIds: Set<number>` across all meal types. For breakfast, add the selected recipe to `usedIds` to prevent cross-meal reuse (batch logic unchanged). For lunch, fall back to the previous day's dinner recipe when exhausted (leftovers). For dinner, fall back to wrap-around when exhausted.

**Tech Stack:** TypeScript, Drizzle ORM, Fastify, Vitest

---

### Task 1: Write failing tests for cross-meal-type uniqueness

**Files:**
- Modify: `backend/src/test/meal-plans.test.ts`

**Step 1: Add three failing tests inside the `describe("Meal Plans API", ...)` block**

```typescript
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

  const ids = res.json().days.map((d: { recipe: { id: number } }) => d.recipe.id);
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

  // A dinner-only recipe to fill the second dinner slot
  await app.inject({ method: "POST", url: "/api/recipes", payload: { name: "Dinner Only", mealTypes: ["dinner"] } });

  const res = await app.inject({
    method: "POST",
    url: "/api/meal-plans/generate",
    payload: { name: "No Dupe Plan", startDate: "2026-11-02", endDate: "2026-11-03" }, // 2 days
  });
  expect(res.statusCode).toBe(201);

  const days = res.json().days;
  const sharedAppearances = days.filter((d: { recipe: { id: number } }) => d.recipe.id === sharedId);
  expect(sharedAppearances.length).toBe(1); // used exactly once despite being in both pools
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
  const day1Dinner = days.find(
    (d: { dayDate: string; mealType: string }) => d.dayDate === "2026-11-02" && d.mealType === "dinner",
  );
  const day2Lunch = days.find(
    (d: { dayDate: string; mealType: string }) => d.dayDate === "2026-11-03" && d.mealType === "lunch",
  );
  // Day 2 lunch must be day 1 dinner (leftover)
  expect(day2Lunch.recipe.id).toBe(day1Dinner.recipe.id);
});
```

**Step 2: Run tests to confirm they fail**

```bash
cd /workspaces/meal_planner && npm run test -w backend 2>&1 | tail -20
```

Expected: 3 new tests fail (the current generator repeats recipes freely).

---

### Task 2: Implement `pickNext` and update `generateMealPlan`

**Files:**
- Modify: `backend/src/services/mealPlanService.ts`

**Step 1: Add `pickNext` helper**

Add this function just before `generateMealPlan` (after `recipesForMealType`):

```typescript
/**
 * Returns the ID of the first recipe in pool that is not in usedIds, marks it used,
 * and returns it. Returns null when every recipe in the pool has already been used.
 */
function pickNext(
  pool: typeof recipes.$inferSelect[],
  usedIds: Set<number>,
): number | null {
  for (const recipe of pool) {
    if (!usedIds.has(recipe.id)) {
      usedIds.add(recipe.id);
      return recipe.id;
    }
  }
  return null;
}
```

**Step 2: Update `generateMealPlan` to use a global `usedIds` set and `pickNext`**

Replace the section from `const dayEntries` down to the end of `days.forEach(...)` with:

```typescript
const dayEntries: Array<{ dayDate: string; recipeId: number; mealType: string }> = [];

// Global set of recipe IDs already assigned in this plan — enforces cross-meal uniqueness.
const usedIds = new Set<number>();

// Wrap-around indices for when pools are fully exhausted (best-effort fallback).
let dinnerWrapIdx = 0;
let lunchWrapIdx = 0;

// Track the most recently assigned dinner recipe for the lunch leftovers fallback.
let lastDinnerId: number | null = null;

// Batch state for the weekday/any breakfast pool (unchanged from before).
let batchIdx = 0;
let daysInCurrentBatch = 0;
let weekendBreakfastCount = 0;

days.forEach((dayDate) => {
  // ── Breakfast ──────────────────────────────────────────────────────────────
  if (breakfastRecipes.length > 0) {
    let bfRecipeId: number;
    if (isWeekend(dayDate) && weekendBfPool !== null) {
      bfRecipeId = weekendBfPool[weekendBreakfastCount % weekendBfPool.length]!.id;
      weekendBreakfastCount++;
    } else {
      if (daysInCurrentBatch >= 3 && !isWeekend(dayDate)) {
        batchIdx++;
        daysInCurrentBatch = 0;
      }
      bfRecipeId = weekdayBfPool[batchIdx % weekdayBfPool.length]!.id;
      daysInCurrentBatch++;
    }
    // Add to usedIds so this recipe is not reused for lunch or dinner.
    usedIds.add(bfRecipeId);
    dayEntries.push({ dayDate, recipeId: bfRecipeId, mealType: "breakfast" });
  }

  // ── Lunch ──────────────────────────────────────────────────────────────────
  if (distributedLunch.length > 0) {
    // 1. Try to pick an unused lunch recipe.
    // 2. Fall back to yesterday's dinner (leftovers).
    // 3. Last resort: wrap around the lunch pool (allows repeat).
    const lunchId =
      pickNext(distributedLunch, usedIds) ??
      lastDinnerId ??
      distributedLunch[lunchWrapIdx++ % distributedLunch.length]!.id;
    dayEntries.push({ dayDate, recipeId: lunchId, mealType: "lunch" });
  }

  // ── Dinner ─────────────────────────────────────────────────────────────────
  // 1. Try to pick an unused dinner recipe.
  // 2. Fall back to wrap-around (allows repeat — best effort).
  const dinnerId =
    pickNext(distributedDinner, usedIds) ??
    distributedDinner[dinnerWrapIdx++ % distributedDinner.length]!.id;
  dayEntries.push({ dayDate, recipeId: dinnerId, mealType: "dinner" });
  lastDinnerId = dinnerId;
});
```

Note: the `forEach` callback no longer uses the index `i` (lunch and dinner no longer use `i % pool.length`). Remove the `i` parameter from the callback signature.

**Step 3: Run all tests**

```bash
cd /workspaces/meal_planner && npm run test -w backend
```

Expected: all tests pass — the 3 new ones and all 48 existing ones.

If any existing breakfast batch tests fail, it means the `usedIds.add(bfRecipeId)` is interfering. Check: the breakfast batch tests create only breakfast recipes (no lunch/dinner overlap), so the usedIds set only contains breakfast IDs which lunch/dinner pools never reference. They should not fail.

**Step 4: Commit**

```bash
git add backend/src/services/mealPlanService.ts backend/src/test/meal-plans.test.ts
git commit -m "feat: prevent recipe repetition across meal types within a generated plan

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
