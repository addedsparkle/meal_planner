import { eq } from "drizzle-orm";
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
    db.delete(mealPlanDays).where(eq(mealPlanDays.mealPlanId, id)).run();
    for (const day of input.days) {
      db.insert(mealPlanDays)
        .values({ mealPlanId: id, dayDate: day.dayDate, recipeId: day.recipeId, mealType: day.mealType ?? "dinner" })
        .run();
    }
  }

  return getMealPlanWithDetails(db, id)!;
}

export function deleteMealPlan(db: AppDatabase, id: number): boolean {
  const existing = db.select().from(mealPlans).where(eq(mealPlans.id, id)).get();
  if (!existing) return false;

  db.delete(mealPlanDays).where(eq(mealPlanDays.mealPlanId, id)).run();
  db.delete(mealPlans).where(eq(mealPlans.id, id)).run();
  return true;
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

// Interleave recipes by protein so the same protein doesn't repeat on consecutive days.
// Recipes without a protein are spread evenly among the gaps.
function distributeByProtein(recipeList: typeof recipes.$inferSelect[]): typeof recipes.$inferSelect[] {
  const groups = new Map<string, typeof recipes.$inferSelect[]>();
  for (const recipe of recipeList) {
    const key = recipe.protein ?? "other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(recipe);
  }
  // Shuffle within each group
  for (const group of groups.values()) {
    for (let i = group.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [group[i], group[j]] = [group[j]!, group[i]!];
    }
  }
  // Round-robin across protein groups
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

export function generateMealPlan(db: AppDatabase, input: GenerateMealPlanInput) {
  const allRecipes = db.select().from(recipes).all();

  const dinnerRecipes = recipesForMealType(allRecipes, "dinner");
  if (dinnerRecipes.length === 0) {
    throw new Error("No recipes available. Add some recipes before generating a plan.");
  }

  const lunchRecipes = recipesForMealType(allRecipes, "lunch");
  const breakfastRecipes = recipesForMealType(allRecipes, "breakfast");

  const days = getDaysBetween(input.startDate, input.endDate);
  const distributedDinner = distributeByProtein(dinnerRecipes);
  const distributedLunch = lunchRecipes.length > 0 ? distributeByProtein(lunchRecipes) : [];
  const distributedBreakfast = breakfastRecipes.length > 0 ? distributeByProtein(breakfastRecipes) : [];

  const dayEntries: Array<{ dayDate: string; recipeId: number; mealType: string }> = [];

  days.forEach((dayDate, i) => {
    // Breakfast: same recipe for every 3 consecutive days (bulk-cook friendly)
    if (distributedBreakfast.length > 0) {
      const idx = Math.floor(i / 3) % distributedBreakfast.length;
      dayEntries.push({ dayDate, recipeId: distributedBreakfast[idx]!.id, mealType: "breakfast" });
    }
    // Lunch: daily rotation distributed by protein
    if (distributedLunch.length > 0) {
      dayEntries.push({ dayDate, recipeId: distributedLunch[i % distributedLunch.length]!.id, mealType: "lunch" });
    }
    // Dinner: daily rotation distributed by protein
    dayEntries.push({ dayDate, recipeId: distributedDinner[i % distributedDinner.length]!.id, mealType: "dinner" });
  });

  return createMealPlan(db, {
    name: input.name,
    startDate: input.startDate,
    endDate: input.endDate,
    days: dayEntries,
  });
}
