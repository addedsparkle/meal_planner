import { eq, like } from "drizzle-orm";
import type { AppDatabase } from "../db/index.js";
import { ingredients, recipeIngredients } from "../db/schema.js";

export function getAllIngredients(db: AppDatabase, search?: string) {
  if (search) {
    return db
      .select()
      .from(ingredients)
      .where(like(ingredients.name, `%${search.toLowerCase()}%`))
      .all();
  }
  return db.select().from(ingredients).all();
}

export function getIngredientById(db: AppDatabase, id: number) {
  return db.select().from(ingredients).where(eq(ingredients.id, id)).get();
}

export function createIngredient(db: AppDatabase, name: string, category?: string) {
  return db
    .insert(ingredients)
    .values({
      name: name.trim().toLowerCase(),
      category: category ?? null,
    })
    .returning()
    .get();
}

export function updateIngredient(
  db: AppDatabase,
  id: number,
  data: { name?: string; category?: string },
) {
  const existing = db
    .select()
    .from(ingredients)
    .where(eq(ingredients.id, id))
    .get();
  if (!existing) return null;

  db.update(ingredients)
    .set({
      name: data.name ? data.name.trim().toLowerCase() : undefined,
      category: data.category !== undefined ? data.category : undefined,
    })
    .where(eq(ingredients.id, id))
    .run();

  return db.select().from(ingredients).where(eq(ingredients.id, id)).get()!;
}

export function deleteIngredient(
  db: AppDatabase,
  id: number,
): { success: boolean; error?: string } {
  const existing = db
    .select()
    .from(ingredients)
    .where(eq(ingredients.id, id))
    .get();
  if (!existing) return { success: false, error: "Ingredient not found" };

  const inUse = db
    .select()
    .from(recipeIngredients)
    .where(eq(recipeIngredients.ingredientId, id))
    .get();

  if (inUse) {
    return {
      success: false,
      error: "Cannot delete ingredient that is used in recipes",
    };
  }

  db.delete(ingredients).where(eq(ingredients.id, id)).run();
  return { success: true };
}
