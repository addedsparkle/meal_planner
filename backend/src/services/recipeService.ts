import { eq } from "drizzle-orm";
import type { AppDatabase } from "../db/index.js";
import {
  recipes,
  ingredients,
  recipeIngredients,
} from "../db/schema.js";
import type { CreateRecipeInput, IngredientInput, UpdateRecipeInput } from "../types/recipe.js";

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function serializeMealTypes(types: string[]): string {
  return types.join(",");
}

function deserializeMealTypes(raw: string | null): string[] {
  if (!raw) return ["dinner"];
  return raw.split(",").filter(Boolean);
}

function shapeRecipe(recipe: typeof recipes.$inferSelect, ris: Array<{
  ingredient: typeof ingredients.$inferSelect;
  quantity: string | null;
  notes: string | null;
}>) {
  return {
    ...recipe,
    mealTypes: deserializeMealTypes(recipe.mealTypes),
    ingredients: ris.map((ri) => ({
      id: ri.ingredient.id,
      name: ri.ingredient.name,
      category: ri.ingredient.category,
      units: ri.ingredient.units,
      quantity: ri.quantity,
      notes: ri.notes,
    })),
  };
}

async function upsertIngredient(db: AppDatabase, input: IngredientInput): Promise<number> {
  const normalized = normalizeName(input.name);
  const existing = db
    .select()
    .from(ingredients)
    .where(eq(ingredients.name, normalized))
    .get();

  if (existing) {
    if (input.units !== undefined) {
      db.update(ingredients)
        .set({ units: input.units })
        .where(eq(ingredients.id, existing.id))
        .run();
    }
    return existing.id;
  }

  return db
    .insert(ingredients)
    .values({ name: normalized, category: input.category ?? null, units: input.units ?? null })
    .returning()
    .get().id;
}

async function linkIngredients(
  db: AppDatabase,
  recipeId: number,
  ingredientInputs: IngredientInput[],
): Promise<void> {
  for (const input of ingredientInputs) {
    const ingredientId = await upsertIngredient(db, input);
    db.insert(recipeIngredients)
      .values({ recipeId, ingredientId, quantity: input.quantity ?? null, notes: input.notes ?? null })
      .run();
  }
}

function getRecipeWithIngredients(db: AppDatabase, recipeId: number) {
  const recipe = db.query.recipes.findFirst({
    where: eq(recipes.id, recipeId),
    with: { recipeIngredients: { with: { ingredient: true } } },
  }).sync();

  if (!recipe) return null;
  return shapeRecipe(recipe, recipe.recipeIngredients);
}

export function getAllRecipes(db: AppDatabase) {
  return db.query.recipes.findMany({
    with: { recipeIngredients: { with: { ingredient: true } } },
  }).sync().map((r) => shapeRecipe(r, r.recipeIngredients));
}

export function getRecipeById(db: AppDatabase, id: number) {
  return getRecipeWithIngredients(db, id);
}

export async function createRecipe(db: AppDatabase, input: CreateRecipeInput) {
  const { ingredients: ingredientInputs, mealTypes, ...rest } = input;

  const recipe = db
    .insert(recipes)
    .values({ ...rest, mealTypes: serializeMealTypes(mealTypes ?? ["dinner"]) })
    .returning()
    .get();

  if (ingredientInputs?.length) {
    await linkIngredients(db, recipe.id, ingredientInputs);
  }

  return getRecipeWithIngredients(db, recipe.id)!;
}

export async function updateRecipe(db: AppDatabase, id: number, input: UpdateRecipeInput) {
  const existing = db.select().from(recipes).where(eq(recipes.id, id)).get();
  if (!existing) return null;

  const { ingredients: ingredientInputs, mealTypes, ...rest } = input;

  db.update(recipes)
    .set({
      ...rest,
      ...(mealTypes !== undefined && { mealTypes: serializeMealTypes(mealTypes) }),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(recipes.id, id))
    .run();

  if (ingredientInputs !== undefined) {
    db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id)).run();
    if (ingredientInputs.length) {
      await linkIngredients(db, id, ingredientInputs);
    }
  }

  return getRecipeWithIngredients(db, id)!;
}

export function deleteRecipe(db: AppDatabase, id: number): boolean {
  const existing = db.select().from(recipes).where(eq(recipes.id, id)).get();
  if (!existing) return false;

  db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id)).run();
  db.delete(recipes).where(eq(recipes.id, id)).run();
  return true;
}
