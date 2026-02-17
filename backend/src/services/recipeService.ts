import { eq } from "drizzle-orm";
import type { AppDatabase } from "../db/index.js";
import {
  recipes,
  ingredients,
  recipeIngredients,
} from "../db/schema.js";
import type { CreateRecipeInput, IngredientInput, UpdateRecipeInput } from "../types/recipe.js";

function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase();
}

async function upsertIngredient(db: AppDatabase, input: IngredientInput): Promise<number> {
  const normalized = normalizeIngredientName(input.name);
  const existing = db
    .select()
    .from(ingredients)
    .where(eq(ingredients.name, normalized))
    .get();

  if (existing) {
    return existing.id;
  }

  const result = db
    .insert(ingredients)
    .values({
      name: normalized,
      category: input.category ?? null,
    })
    .returning()
    .get();

  return result.id;
}

async function linkIngredients(
  db: AppDatabase,
  recipeId: number,
  ingredientInputs: IngredientInput[],
): Promise<void> {
  for (const input of ingredientInputs) {
    const ingredientId = await upsertIngredient(db, input);
    db.insert(recipeIngredients)
      .values({
        recipeId,
        ingredientId,
        quantity: input.quantity ?? null,
        notes: input.notes ?? null,
      })
      .run();
  }
}

function getRecipeWithIngredients(db: AppDatabase, recipeId: number) {
  const recipe = db.query.recipes.findFirst({
    where: eq(recipes.id, recipeId),
    with: {
      recipeIngredients: {
        with: {
          ingredient: true,
        },
      },
    },
  }).sync();

  if (!recipe) return null;

  return {
    ...recipe,
    metadata: recipe.metadata ? JSON.parse(recipe.metadata) : null,
    ingredients: recipe.recipeIngredients.map((ri) => ({
      id: ri.ingredient.id,
      name: ri.ingredient.name,
      category: ri.ingredient.category,
      quantity: ri.quantity,
      notes: ri.notes,
    })),
    recipeIngredients: undefined,
  };
}

export function getAllRecipes(db: AppDatabase) {
  const rows = db.query.recipes.findMany({
    with: {
      recipeIngredients: {
        with: {
          ingredient: true,
        },
      },
    },
  }).sync();

  return rows.map((recipe) => ({
    ...recipe,
    metadata: recipe.metadata ? JSON.parse(recipe.metadata) : null,
    ingredients: recipe.recipeIngredients.map((ri) => ({
      id: ri.ingredient.id,
      name: ri.ingredient.name,
      category: ri.ingredient.category,
      quantity: ri.quantity,
      notes: ri.notes,
    })),
    recipeIngredients: undefined,
  }));
}

export function getRecipeById(db: AppDatabase, id: number) {
  return getRecipeWithIngredients(db, id);
}

export async function createRecipe(db: AppDatabase, input: CreateRecipeInput) {
  const { ingredients: ingredientInputs, metadata, ...recipeData } = input;

  const recipe = db
    .insert(recipes)
    .values({
      ...recipeData,
      metadata: metadata ? JSON.stringify(metadata) : null,
    })
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

  const { ingredients: ingredientInputs, metadata, ...recipeData } = input;

  db.update(recipes)
    .set({
      ...recipeData,
      metadata: metadata !== undefined ? JSON.stringify(metadata) : undefined,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(recipes.id, id))
    .run();

  if (ingredientInputs !== undefined) {
    db.delete(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, id))
      .run();

    if (ingredientInputs.length) {
      await linkIngredients(db, id, ingredientInputs);
    }
  }

  return getRecipeWithIngredients(db, id)!;
}

export function deleteRecipe(db: AppDatabase, id: number): boolean {
  const existing = db.select().from(recipes).where(eq(recipes.id, id)).get();
  if (!existing) return false;

  db.delete(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, id))
    .run();

  db.delete(recipes).where(eq(recipes.id, id)).run();
  return true;
}
