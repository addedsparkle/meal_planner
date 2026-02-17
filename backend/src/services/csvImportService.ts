import { parse } from "csv-parse/sync";
import type { AppDatabase } from "../db/index.js";
import { createRecipe } from "./recipeService.js";
import type { CreateRecipeInput, IngredientInput } from "../types/recipe.js";

interface CsvRow {
  name?: string;
  description?: string;
  servings?: string;
  prep_time?: string;
  cook_time?: string;
  instructions?: string;
  ingredients?: string;
}

interface ImportResult {
  created: number;
  skipped: number;
  errors: Array<{ row: number; name: string; error: string }>;
}

function parseIngredientString(raw: string): IngredientInput[] {
  return raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
      if (match) {
        return { name: match[1]!.trim(), quantity: match[2]!.trim() };
      }
      return { name: entry };
    });
}

export async function importRecipesFromCsv(
  db: AppDatabase,
  csvContent: string,
): Promise<ImportResult> {
  const records: CsvRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const result: ImportResult = { created: 0, skipped: 0, errors: [] };

  for (let i = 0; i < records.length; i++) {
    const row = records[i]!;
    const rowNum = i + 2; // 1-indexed + header row

    if (!row.name?.trim()) {
      result.errors.push({
        row: rowNum,
        name: row.name ?? "",
        error: "Missing recipe name",
      });
      result.skipped++;
      continue;
    }

    try {
      const input: CreateRecipeInput = {
        name: row.name.trim(),
        description: row.description?.trim() || undefined,
        servings: row.servings ? Number(row.servings) : undefined,
        prepTime: row.prep_time ? Number(row.prep_time) : undefined,
        cookTime: row.cook_time ? Number(row.cook_time) : undefined,
        instructions: row.instructions?.trim() || undefined,
        ingredients: row.ingredients
          ? parseIngredientString(row.ingredients)
          : undefined,
      };

      await createRecipe(db, input);
      result.created++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      result.errors.push({ row: rowNum, name: row.name, error: message });
      result.skipped++;
    }
  }

  return result;
}
