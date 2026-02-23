import { inArray } from "drizzle-orm";
import type { AppDatabase } from "../db/index.js";
import { mealPlanDays } from "../db/schema.js";

interface ShoppingListItem {
  ingredientId: number;
  name: string;
  category: string | null;
  units: string | null;
  quantities: Array<{
    quantity: string | null;
    recipeName: string;
    dayDate: string;
  }>;
}

export function getShoppingList(db: AppDatabase, mealPlanIds: number[]): ShoppingListItem[] {
  const days = db.query.mealPlanDays.findMany({
    where: inArray(mealPlanDays.mealPlanId, mealPlanIds),
    with: {
      recipe: {
        with: {
          recipeIngredients: {
            with: {
              ingredient: true,
            },
          },
        },
      },
    },
  }).sync();

  const itemMap = new Map<number, ShoppingListItem>();

  for (const day of days) {
    for (const ri of day.recipe.recipeIngredients) {
      const existing = itemMap.get(ri.ingredient.id);
      const entry = {
        quantity: ri.quantity,
        recipeName: day.recipe.name,
        dayDate: day.dayDate,
      };

      if (existing) {
        existing.quantities.push(entry);
      } else {
        itemMap.set(ri.ingredient.id, {
          ingredientId: ri.ingredient.id,
          name: ri.ingredient.name,
          category: ri.ingredient.category,
          units: ri.ingredient.units,
          quantities: [entry],
        });
      }
    }
  }

  return Array.from(itemMap.values()).sort((a, b) =>
    (a.category ?? "").localeCompare(b.category ?? "") ||
    a.name.localeCompare(b.name),
  );
}
