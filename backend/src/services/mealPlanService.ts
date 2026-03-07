import { eq, inArray, sql } from "drizzle-orm";
import type { AppDatabase } from "../db/index.js";
import { mealPlans, mealPlanDays, recipes } from "../db/schema.js";

interface CreateMealPlanInput {
  name: string;
  startDate: string;
  endDate: string;
  days?: Array<{
    dayDate: string;
    recipeId: number;
    mealType?: string;
  }>;
}

interface GenerateMealPlanInput {
  name: string;
  startDate: string;
  endDate: string;
}

function recomputeLastUsedAt(db: AppDatabase, recipeIds: number[]): void {
  if (recipeIds.length === 0) return;

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

function getMealPlanWithDetails(db: AppDatabase, id: number) {
  const plan = db.query.mealPlans.findFirst({
    where: eq(mealPlans.id, id),
    with: { mealPlanDays: { with: { recipe: true } } },
  }).sync();

  if (!plan) return null;

  return {
    ...plan,
    days: plan.mealPlanDays.map((day) => ({
      id: day.id,
      dayDate: day.dayDate,
      mealType: day.mealType,
      recipe: {
        id: day.recipe.id,
        name: day.recipe.name,
        description: day.recipe.description,
        protein: day.recipe.protein,
        freezable: day.recipe.freezable,
      },
    })),
    mealPlanDays: undefined,
  };
}

export function getAllMealPlans(db: AppDatabase) {
  return db.query.mealPlans.findMany({
    with: { mealPlanDays: { with: { recipe: true } } },
  }).sync().map((plan) => ({
    ...plan,
    days: plan.mealPlanDays.map((day) => ({
      id: day.id,
      dayDate: day.dayDate,
      mealType: day.mealType,
      recipe: { id: day.recipe.id, name: day.recipe.name, protein: day.recipe.protein, freezable: day.recipe.freezable },
    })),
    mealPlanDays: undefined,
  }));
}

export function getMealPlanById(db: AppDatabase, id: number) {
  return getMealPlanWithDetails(db, id);
}

export function createMealPlan(db: AppDatabase, input: CreateMealPlanInput) {
  const plan = db
    .insert(mealPlans)
    .values({ name: input.name, startDate: input.startDate, endDate: input.endDate })
    .returning()
    .get();

  if (input.days?.length) {
    for (const day of input.days) {
      db.insert(mealPlanDays)
        .values({ mealPlanId: plan.id, dayDate: day.dayDate, recipeId: day.recipeId, mealType: day.mealType ?? "dinner" })
        .run();
    }
  }

  const usedIds = (input.days ?? []).map((d) => d.recipeId);
  if (usedIds.length > 0) recomputeLastUsedAt(db, [...new Set(usedIds)]);

  return getMealPlanWithDetails(db, plan.id)!;
}

export function updateMealPlan(db: AppDatabase, id: number, input: Partial<CreateMealPlanInput>) {
  const existing = db.select().from(mealPlans).where(eq(mealPlans.id, id)).get();
  if (!existing) return null;

  db.update(mealPlans)
    .set({ name: input.name, startDate: input.startDate, endDate: input.endDate })
    .where(eq(mealPlans.id, id))
    .run();

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

  return getMealPlanWithDetails(db, id)!;
}

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

function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr + "T00:00:00").getDay();
  return day === 0 || day === 6;
}

function getDaysBetween(start: string, end: string): string[] {
  const days: string[] = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    days.push(current.toISOString().split("T")[0]!);
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function sortByLRU(recipeList: typeof recipes.$inferSelect[]): typeof recipes.$inferSelect[] {
  return [...recipeList].sort((a, b) => {
    if (a.lastUsedAt === null && b.lastUsedAt === null) return 0;
    if (a.lastUsedAt === null) return -1;
    if (b.lastUsedAt === null) return 1;
    return a.lastUsedAt.localeCompare(b.lastUsedAt);
  });
}

// Interleave recipes by protein so the same protein doesn't repeat on consecutive days.
// Input is already sorted LRU (oldest/null first) — preserve that order within each group.
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

function recipesForMealType(allRecipes: typeof recipes.$inferSelect[], mealType: string) {
  return allRecipes.filter((r) =>
    (r.mealTypes ?? "dinner").split(",").map((s) => s.trim()).includes(mealType),
  );
}

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

export function generateMealPlan(db: AppDatabase, input: GenerateMealPlanInput) {
  const allRecipes = db.select().from(recipes).all();

  const dinnerRecipes = recipesForMealType(allRecipes, "dinner");
  if (dinnerRecipes.length === 0) {
    throw new Error("No recipes available. Add some recipes before generating a plan.");
  }

  const lunchRecipes = recipesForMealType(allRecipes, "lunch");
  const breakfastRecipes = recipesForMealType(allRecipes, "breakfast");

  const days = getDaysBetween(input.startDate, input.endDate);
  const distributedDinner = distributeByProtein(sortByLRU(dinnerRecipes));
  const distributedLunch = lunchRecipes.length > 0 ? distributeByProtein(sortByLRU(lunchRecipes)) : [];

  // Build breakfast pools.
  // weekdayBfPool: weekday-specific + any-day recipes, used for batch rotation (Mon–Fri).
  // weekendBfPool: only created when weekend-specific recipes exist; when null, weekend days
  //   instead extend the current weekday batch so a new batch never starts on a weekend.
  const weekdayBfRecipes = breakfastRecipes.filter((r) => r.suitableDays === "weekday" || r.suitableDays === "any");
  const weekendSpecificRecipes = breakfastRecipes.filter((r) => r.suitableDays === "weekend");
  const weekdayBfPool = distributeByProtein(sortByLRU(weekdayBfRecipes.length > 0 ? weekdayBfRecipes : breakfastRecipes));
  const weekendBfPool = weekendSpecificRecipes.length > 0
    ? distributeByProtein(sortByLRU([...weekendSpecificRecipes, ...breakfastRecipes.filter((r) => r.suitableDays === "any")]))
    : null;

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

  return createMealPlan(db, {
    name: input.name,
    startDate: input.startDate,
    endDate: input.endDate,
    days: dayEntries,
  });
}
