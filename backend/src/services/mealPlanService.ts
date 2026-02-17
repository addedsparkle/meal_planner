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
  mealType?: string;
}

function getMealPlanWithDetails(db: AppDatabase, id: number) {
  const plan = db.query.mealPlans.findFirst({
    where: eq(mealPlans.id, id),
    with: {
      mealPlanDays: {
        with: {
          recipe: true,
        },
      },
    },
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
        servings: day.recipe.servings,
        prepTime: day.recipe.prepTime,
        cookTime: day.recipe.cookTime,
      },
    })),
    mealPlanDays: undefined,
  };
}

export function getAllMealPlans(db: AppDatabase) {
  return db.query.mealPlans.findMany({
    with: {
      mealPlanDays: {
        with: {
          recipe: true,
        },
      },
    },
  }).sync().map((plan) => ({
    ...plan,
    days: plan.mealPlanDays.map((day) => ({
      id: day.id,
      dayDate: day.dayDate,
      mealType: day.mealType,
      recipe: {
        id: day.recipe.id,
        name: day.recipe.name,
      },
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
    .values({
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
    })
    .returning()
    .get();

  if (input.days?.length) {
    for (const day of input.days) {
      db.insert(mealPlanDays)
        .values({
          mealPlanId: plan.id,
          dayDate: day.dayDate,
          recipeId: day.recipeId,
          mealType: day.mealType ?? "dinner",
        })
        .run();
    }
  }

  return getMealPlanWithDetails(db, plan.id)!;
}

export function updateMealPlan(
  db: AppDatabase,
  id: number,
  input: Partial<CreateMealPlanInput>,
) {
  const existing = db
    .select()
    .from(mealPlans)
    .where(eq(mealPlans.id, id))
    .get();
  if (!existing) return null;

  db.update(mealPlans)
    .set({
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
    })
    .where(eq(mealPlans.id, id))
    .run();

  if (input.days !== undefined) {
    db.delete(mealPlanDays)
      .where(eq(mealPlanDays.mealPlanId, id))
      .run();

    if (input.days.length) {
      for (const day of input.days) {
        db.insert(mealPlanDays)
          .values({
            mealPlanId: id,
            dayDate: day.dayDate,
            recipeId: day.recipeId,
            mealType: day.mealType ?? "dinner",
          })
          .run();
      }
    }
  }

  return getMealPlanWithDetails(db, id)!;
}

export function deleteMealPlan(db: AppDatabase, id: number): boolean {
  const existing = db
    .select()
    .from(mealPlans)
    .where(eq(mealPlans.id, id))
    .get();
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

export function generateMealPlan(db: AppDatabase, input: GenerateMealPlanInput) {
  const allRecipes = db.select().from(recipes).all();

  if (allRecipes.length === 0) {
    throw new Error("No recipes available to generate a meal plan");
  }

  const days = getDaysBetween(input.startDate, input.endDate);
  const mealType = input.mealType ?? "dinner";

  const shuffled = [...allRecipes].sort(() => Math.random() - 0.5);
  const dayEntries = days.map((dayDate, i) => ({
    dayDate,
    recipeId: shuffled[i % shuffled.length]!.id,
    mealType,
  }));

  return createMealPlan(db, {
    name: input.name,
    startDate: input.startDate,
    endDate: input.endDate,
    days: dayEntries,
  });
}
