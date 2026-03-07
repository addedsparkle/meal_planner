# Recipe Last-Used Tracking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Track when each recipe was last used in a meal plan, use that to prioritize least-recently-used recipes during generation, and display last-used info in the UI.

**Architecture:** Add a `last_used_at` column to `recipes` (nullable ISO date string). After any meal plan write (create/update/delete), recompute `last_used_at` for affected recipes by querying `MAX(day_date)` from `meal_plan_days`. The generator sorts each recipe pool by `last_used_at` ascending (nulls first) before the existing protein-distribution step. The frontend sorts client-side and displays last-used on recipe cards and detail view.

**Tech Stack:** Drizzle ORM migrations (SQLite), Fastify routes, Vitest, React + TanStack Query, Tailwind CSS, date-fns

---

### Task 1: Add `lastUsedAt` to the schema and generate migration

**Files:**
- Modify: `backend/src/db/schema.ts`

**Step 1: Add the column to the recipes table definition**

In `backend/src/db/schema.ts`, add `lastUsedAt` after `freezable`:

```typescript
lastUsedAt: text("last_used_at"),
```

The full recipes table should look like:

```typescript
export const recipes = sqliteTable("recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  protein: text("protein"),
  mealTypes: text("meal_types").notNull().default("dinner"),
  suitableDays: text("suitable_days").notNull().default("any"),
  freezable: integer("freezable", { mode: "boolean" }).notNull().default(false),
  lastUsedAt: text("last_used_at"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});
```

**Step 2: Generate the migration**

```bash
cd /workspaces/meal_planner && npm run generate -w backend
```

Expected: a new file appears in `backend/drizzle/` containing an `ALTER TABLE recipes ADD COLUMN last_used_at text;` statement.

**Step 3: Verify tests still pass**

```bash
cd /workspaces/meal_planner && npm run test -w backend
```

Expected: all existing tests pass (the column is nullable, so no existing data is affected).

**Step 4: Commit**

```bash
git add backend/src/db/schema.ts backend/drizzle/
git commit -m "feat: add last_used_at column to recipes table"
```

---

### Task 2: Recompute `lastUsedAt` after meal plan writes

**Files:**
- Modify: `backend/src/services/mealPlanService.ts`
- Modify: `backend/src/test/meal-plans.test.ts`

**Step 1: Write failing tests**

Add these tests to `backend/src/test/meal-plans.test.ts`, inside the `describe("Meal Plans API", ...)` block:

```typescript
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
```

**Step 2: Run tests to confirm they fail**

```bash
cd /workspaces/meal_planner && npm run test -w backend 2>&1 | grep -A3 "lastUsedAt\|FAIL"
```

Expected: 3 new tests fail.

**Step 3: Implement `recomputeLastUsedAt` and wire it up**

In `backend/src/services/mealPlanService.ts`, add this helper function before `getMealPlanWithDetails`:

```typescript
import { eq, inArray, sql } from "drizzle-orm";
```

(Update the existing `import { eq } from "drizzle-orm"` to include `inArray` and `sql`)

Then add the helper:

```typescript
function recomputeLastUsedAt(db: AppDatabase, recipeIds: number[]): void {
  if (recipeIds.length === 0) return;

  // Find the max day_date for each affected recipe across ALL plans
  const rows = db
    .select({
      recipeId: mealPlanDays.recipeId,
      maxDate: sql<string>`MAX(${mealPlanDays.dayDate})`,
    })
    .from(mealPlanDays)
    .where(inArray(mealPlanDays.recipeId, recipeIds))
    .groupBy(mealPlanDays.recipeId)
    .all();

  const lastUsedMap = new Map(rows.map((r) => [r.recipeId, r.maxDate]));

  for (const recipeId of recipeIds) {
    db.update(recipes)
      .set({ lastUsedAt: lastUsedMap.get(recipeId) ?? null })
      .where(eq(recipes.id, recipeId))
      .run();
  }
}
```

**Step 4: Call `recomputeLastUsedAt` in write operations**

In `createMealPlan`, after inserting all day rows, add:

```typescript
const usedIds = (input.days ?? []).map((d) => d.recipeId);
if (usedIds.length > 0) recomputeLastUsedAt(db, [...new Set(usedIds)]);
```

In `updateMealPlan`, after deleting and re-inserting days, collect the union of old and new recipe IDs and recompute. Replace the days section with:

```typescript
if (input.days !== undefined) {
  // Collect old recipe IDs before deleting
  const oldDays = db.select({ recipeId: mealPlanDays.recipeId })
    .from(mealPlanDays)
    .where(eq(mealPlanDays.mealPlanId, id))
    .all();
  const oldIds = oldDays.map((d) => d.recipeId);

  db.delete(mealPlanDays).where(eq(mealPlanDays.mealPlanId, id)).run();
  for (const day of input.days) {
    db.insert(mealPlanDays)
      .values({ mealPlanId: id, dayDate: day.dayDate, recipeId: day.recipeId, mealType: day.mealType ?? "dinner" })
      .run();
  }

  const newIds = input.days.map((d) => d.recipeId);
  const affectedIds = [...new Set([...oldIds, ...newIds])];
  if (affectedIds.length > 0) recomputeLastUsedAt(db, affectedIds);
}
```

In `deleteMealPlan`, before deleting days, collect recipe IDs then recompute after:

```typescript
export function deleteMealPlan(db: AppDatabase, id: number): boolean {
  const existing = db.select().from(mealPlans).where(eq(mealPlans.id, id)).get();
  if (!existing) return false;

  const days = db.select({ recipeId: mealPlanDays.recipeId })
    .from(mealPlanDays)
    .where(eq(mealPlanDays.mealPlanId, id))
    .all();
  const recipeIds = [...new Set(days.map((d) => d.recipeId))];

  db.delete(mealPlanDays).where(eq(mealPlanDays.mealPlanId, id)).run();
  db.delete(mealPlans).where(eq(mealPlans.id, id)).run();

  if (recipeIds.length > 0) recomputeLastUsedAt(db, recipeIds);
  return true;
}
```

**Step 5: Run tests**

```bash
cd /workspaces/meal_planner && npm run test -w backend
```

Expected: all tests pass.

**Step 6: Commit**

```bash
git add backend/src/services/mealPlanService.ts backend/src/test/meal-plans.test.ts
git commit -m "feat: recompute recipe lastUsedAt after meal plan writes"
```

---

### Task 3: LRU sorting in meal plan generation

**Files:**
- Modify: `backend/src/services/mealPlanService.ts`
- Modify: `backend/src/test/meal-plans.test.ts`

**Step 1: Write a failing test**

Add this test to `meal-plans.test.ts`:

```typescript
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
```

**Step 2: Run test to confirm it fails**

```bash
cd /workspaces/meal_planner && npm run test -w backend 2>&1 | grep -A3 "prefers least-recently\|FAIL"
```

Expected: 1 test fails (order is random, not LRU-based).

**Step 3: Replace the shuffle in `distributeByProtein` with LRU ordering**

The `distributeByProtein` function currently shuffles randomly within protein groups. We need to keep the protein-based round-robin but respect LRU order. The simplest approach: sort the input to `distributeByProtein` by `lastUsedAt` ascending before calling it, and remove the shuffle inside.

Replace the `distributeByProtein` function in `mealPlanService.ts`:

```typescript
function distributeByProtein(recipeList: typeof recipes.$inferSelect[]): typeof recipes.$inferSelect[] {
  // Input is already sorted LRU (oldest/null first) — preserve that order within each group
  const groups = new Map<string, typeof recipes.$inferSelect[]>();
  for (const recipe of recipeList) {
    const key = recipe.protein ?? "other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(recipe);
  }
  // Round-robin across protein groups, preserving LRU order within each group
  const result: typeof recipes.$inferSelect[] = [];
  const groupArrays = [...groups.values()];
  const maxLen = Math.max(...groupArrays.map((g) => g.length));
  for (let i = 0; i < maxLen; i++) {
    for (const group of groupArrays) {
      if (i < group.length) result.push(group[i]!);
    }
  }
  return result;
}
```

Add a helper to sort by `lastUsedAt` (nulls first):

```typescript
function sortByLRU(recipeList: typeof recipes.$inferSelect[]): typeof recipes.$inferSelect[] {
  return [...recipeList].sort((a, b) => {
    if (a.lastUsedAt === null && b.lastUsedAt === null) return 0;
    if (a.lastUsedAt === null) return -1;
    if (b.lastUsedAt === null) return 1;
    return a.lastUsedAt.localeCompare(b.lastUsedAt);
  });
}
```

In `generateMealPlan`, update the distribution calls to sort first:

```typescript
const distributedDinner = distributeByProtein(sortByLRU(dinnerRecipes));
const distributedLunch = lunchRecipes.length > 0 ? distributeByProtein(sortByLRU(lunchRecipes)) : [];
```

For the breakfast pools, also sort before distributing:

```typescript
const weekdayBfPool = distributeByProtein(sortByLRU(weekdayBfRecipes.length > 0 ? weekdayBfRecipes : breakfastRecipes));
const weekendBfPool = weekendSpecificRecipes.length > 0
  ? distributeByProtein(sortByLRU([...weekendSpecificRecipes, ...breakfastRecipes.filter((r) => r.suitableDays === "any")]))
  : null;
```

**Step 4: Run all tests**

```bash
cd /workspaces/meal_planner && npm run test -w backend
```

Expected: all tests pass. Note: the existing breakfast batch tests use recipes created in the same test (all `lastUsedAt === null`), so their relative order is stable and tests should still pass.

**Step 5: Commit**

```bash
git add backend/src/services/mealPlanService.ts backend/src/test/meal-plans.test.ts
git commit -m "feat: sort generation pools by LRU to prevent recipe repetition"
```

---

### Task 4: Expose `lastUsedAt` in the recipes API response

**Files:**
- Modify: `backend/src/services/recipeService.ts`
- Modify: `backend/src/test/recipes.test.ts`

**Step 1: Write a failing test**

Add to `backend/src/test/recipes.test.ts`:

```typescript
it("GET /api/recipes includes lastUsedAt (null when unused)", async () => {
  const app = await getApp();
  await app.inject({
    method: "POST",
    url: "/api/recipes",
    payload: { name: "Fresh Recipe" },
  });

  const res = await app.inject({ method: "GET", url: "/api/recipes" });
  expect(res.statusCode).toBe(200);
  const recipes = res.json();
  expect(recipes[0]).toHaveProperty("lastUsedAt");
  expect(recipes[0].lastUsedAt).toBeNull();
});
```

**Step 2: Run to confirm failure**

```bash
cd /workspaces/meal_planner && npm run test -w backend 2>&1 | grep -A3 "lastUsedAt.*null\|FAIL"
```

**Step 3: Add `lastUsedAt` to the `shapeRecipe` output**

In `backend/src/services/recipeService.ts`, the `shapeRecipe` function spreads `...recipe` which already includes all columns, so `lastUsedAt` is already present in the spread. The issue is that `shapeRecipe` currently uses `{ ...recipe, ... }` — since `lastUsedAt` is on the `recipe` row, it's already returned automatically via the spread.

Run the test first — it may already pass. If it doesn't, it's because the type doesn't include it yet. Check the output and proceed to Step 4.

**Step 4: Run tests**

```bash
cd /workspaces/meal_planner && npm run test -w backend
```

Expected: all tests pass (the spread already includes the column).

**Step 5: Commit**

```bash
git add backend/src/test/recipes.test.ts
git commit -m "test: verify lastUsedAt included in recipe API responses"
```

---

### Task 5: Update frontend types and API client

**Files:**
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/lib/api.ts`

**Step 1: Add `lastUsedAt` to the `Recipe` interface**

In `frontend/src/lib/types.ts`, update the `Recipe` interface:

```typescript
export interface Recipe {
  id: number;
  name: string;
  description: string | null;
  protein: string | null;
  mealTypes: string[];
  suitableDays: SuitableDays;
  freezable: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
  ingredients: RecipeIngredient[];
}
```

**Step 2: Add a typed sort param to `fetchRecipes`**

In `frontend/src/lib/api.ts`, update `fetchRecipes`:

```typescript
export type RecipeSortField = "name" | "lastUsedAt" | "createdAt";
export type SortOrder = "asc" | "desc";

export function fetchRecipes(sortBy?: RecipeSortField, order?: SortOrder): Promise<Recipe[]> {
  return apiFetch<Recipe[]>("/recipes");
}
```

Note: sorting is done client-side, so the API call doesn't change for now. The params are accepted for future use and to keep the hook signature clean.

**Step 3: Verify TypeScript compiles**

```bash
cd /workspaces/meal_planner/frontend && npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit**

```bash
git add frontend/src/lib/types.ts frontend/src/lib/api.ts
git commit -m "feat: add lastUsedAt to Recipe type and API client"
```

---

### Task 6: Add "Last used" display to RecipeCard

**Files:**
- Modify: `frontend/src/components/recipes/RecipeCard.tsx`
- Modify: `frontend/src/components/recipes/RecipeCard.stories.tsx`

**Step 1: Add a `formatLastUsed` helper at the top of the file**

In `frontend/src/components/recipes/RecipeCard.tsx`, add this helper before the component (uses only native Date, no import needed):

```typescript
function formatLastUsed(lastUsedAt: string | null): string {
  if (!lastUsedAt) return "Never used";
  const diffDays = Math.floor(
    (Date.now() - new Date(lastUsedAt + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Used today";
  if (diffDays === 1) return "Used yesterday";
  if (diffDays < 7) return `Used ${diffDays} days ago`;
  if (diffDays < 30) return `Used ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? "s" : ""} ago`;
  return `Used ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? "s" : ""} ago`;
}
```

**Step 2: Add the badge to the card body**

In `RecipeCard.tsx`, inside the `<CardBody>` div, after the existing badge row (the `<div className="mt-3 flex flex-wrap...">` section), add:

```tsx
<p className="mt-2 text-xs text-gray-400">
  {formatLastUsed(recipe.lastUsedAt)}
</p>
```

**Step 3: Update stories**

In `frontend/src/components/recipes/RecipeCard.stories.tsx`, add `lastUsedAt` to the existing story recipe objects. Check the current stories file for the recipe shape and add:
- One story with `lastUsedAt: null` (shows "Never used")
- One story with a recent date (e.g., `lastUsedAt: "2026-03-03"`) (shows "Used 3 days ago")

Update the existing default story recipe to include `lastUsedAt: null`, and add a `RecentlyUsed` story variant.

**Step 4: Check TypeScript**

```bash
cd /workspaces/meal_planner/frontend && npx tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
git add frontend/src/components/recipes/RecipeCard.tsx frontend/src/components/recipes/RecipeCard.stories.tsx
git commit -m "feat: show last-used date on recipe cards"
```

---

### Task 7: Add sort-by-last-used to RecipeList

**Files:**
- Modify: `frontend/src/components/recipes/RecipeList.tsx`

**Step 1: Add sort state and a sort utility**

In `frontend/src/components/recipes/RecipeList.tsx`, add a sort state after existing state:

```typescript
type SortOption = "name" | "lastUsedAt";
const [sortBy, setSortBy] = useState<SortOption>("name");
```

Add a sort function before the return:

```typescript
function sortedRecipes(list: Recipe[]): Recipe[] {
  return [...list].sort((a, b) => {
    if (sortBy === "lastUsedAt") {
      // Nulls first (never used = prioritize showing first)
      if (a.lastUsedAt === null && b.lastUsedAt === null) return 0;
      if (a.lastUsedAt === null) return -1;
      if (b.lastUsedAt === null) return 1;
      return a.lastUsedAt.localeCompare(b.lastUsedAt);
    }
    return a.name.localeCompare(b.name);
  });
}
```

**Step 2: Add the sort control UI**

In the header div (alongside the "New Recipe" button), add a sort select:

```tsx
<div className="mb-6 flex items-center justify-between">
  <h2 className="text-xl font-semibold text-gray-900">
    Recipes
    {recipes && recipes.length > 0 && (
      <span className="ml-2 text-sm font-normal text-gray-400">({recipes.length})</span>
    )}
  </h2>
  <div className="flex items-center gap-3">
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value as SortOption)}
      className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-600 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="name">Sort: Name</option>
      <option value="lastUsedAt">Sort: Last used</option>
    </select>
    <Button size="sm" onClick={() => setModal({ kind: "create" })}>
      <Plus className="h-4 w-4" />
      New Recipe
    </Button>
  </div>
</div>
```

**Step 3: Apply sort to the grid render**

Change the grid render from:
```tsx
{recipes.map((recipe) => (
```
to:
```tsx
{sortedRecipes(recipes).map((recipe) => (
```

**Step 4: Check TypeScript**

```bash
cd /workspaces/meal_planner/frontend && npx tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
git add frontend/src/components/recipes/RecipeList.tsx
git commit -m "feat: add sort-by-last-used to recipe list"
```

---

### Task 8: Show `lastUsedAt` in RecipeDetail

**Files:**
- Modify: `frontend/src/components/recipes/RecipeDetail.tsx`
- Modify: `frontend/src/components/recipes/RecipeDetail.stories.tsx`

**Step 1: Add last-used field to the detail view**

In `frontend/src/components/recipes/RecipeDetail.tsx`, import or inline the same `formatLastUsed` helper from Task 6. To avoid duplication, extract it to a shared utility.

Create `frontend/src/lib/formatLastUsed.ts`:

```typescript
export function formatLastUsed(lastUsedAt: string | null): string {
  if (!lastUsedAt) return "Never used";
  const diffDays = Math.floor(
    (Date.now() - new Date(lastUsedAt + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Used today";
  if (diffDays === 1) return "Used yesterday";
  if (diffDays < 7) return `Used ${diffDays} days ago`;
  if (diffDays < 30) return `Used ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? "s" : ""} ago`;
  return `Used ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? "s" : ""} ago`;
}
```

Update `RecipeCard.tsx` to import from `../../lib/formatLastUsed` instead of the inline helper.

In `RecipeDetail.tsx`, after the badges row, add:

```tsx
import { formatLastUsed } from "../../lib/formatLastUsed";

// Inside the component, after the badges div:
<p className="text-sm text-gray-500">
  <span className="font-medium text-gray-700">Last used:</span>{" "}
  {formatLastUsed(recipe.lastUsedAt)}
</p>
```

**Step 2: Update RecipeDetail stories**

In `frontend/src/components/recipes/RecipeDetail.stories.tsx`, add `lastUsedAt` to existing story recipe objects (e.g., `lastUsedAt: null` and a `lastUsedAt: "2026-02-01"` variant).

**Step 3: Check TypeScript**

```bash
cd /workspaces/meal_planner/frontend && npx tsc --noEmit
```

Expected: no errors.

**Step 4: Run backend tests one final time**

```bash
cd /workspaces/meal_planner && npm run test -w backend
```

Expected: all tests pass.

**Step 5: Commit**

```bash
git add frontend/src/components/recipes/RecipeDetail.tsx frontend/src/components/recipes/RecipeDetail.stories.tsx frontend/src/lib/formatLastUsed.ts frontend/src/components/recipes/RecipeCard.tsx
git commit -m "feat: show last-used date in recipe detail view"
```
