import { parse } from "csv-parse/sync";
import type { AppDatabase } from "../db/index.js";
import { createRecipe } from "./recipeService.js";
import { MEAL_TYPES, SUITABLE_DAYS } from "../types/recipe.js";
import type { CreateRecipeInput, IngredientInput, SuitableDays } from "../types/recipe.js";

interface CsvRow {
  name?: string;
  description?: string;
  protein?: string;
  meal_types?: string;
  suitable_days?: string;
  freezable?: string;
  ingredients?: string;
}

interface ImportResult {
  created: number;
  skipped: number;
  errors: Array<{ row: number; name: string; error: string }>;
}

function parseIngredientString(raw: string): IngredientInput[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
      if (match) {
        const inner = match[2]!.trim();
        const pipeIdx = inner.indexOf("|");
        if (pipeIdx !== -1) {
          return {
            name: match[1]!.trim(),
            quantity: inner.slice(0, pipeIdx).trim() || undefined,
            units: inner.slice(pipeIdx + 1).trim() || undefined,
          };
        }
        return { name: match[1]!.trim(), quantity: inner };
      }
      return { name: entry };
    });
}

function parseSuitableDays(raw: string | undefined): SuitableDays {
  const val = raw?.trim().toLowerCase();
  return (SUITABLE_DAYS as readonly string[]).includes(val ?? "") ? val as SuitableDays : "any";
}

function parseMealTypes(raw: string | undefined): typeof MEAL_TYPES[number][] {
  if (!raw) return ["dinner"];
  const parsed = raw.split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is typeof MEAL_TYPES[number] => MEAL_TYPES.includes(s as typeof MEAL_TYPES[number]));
  return parsed.length > 0 ? parsed : ["dinner"];
}

export async function importRecipesFromCsv(
  db: AppDatabase,
  csvContent: string,
): Promise<ImportResult> {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];

  const result: ImportResult = { created: 0, skipped: 0, errors: [] };

  for (let i = 0; i < records.length; i++) {
    const row = records[i]!;
    const rowNum = i + 2;

    if (!row.name?.trim()) {
      result.errors.push({ row: rowNum, name: row.name ?? "", error: "Missing recipe name" });
      result.skipped++;
      continue;
    }

    try {
      const input: CreateRecipeInput = {
        name: row.name.trim(),
        description: row.description?.trim() || undefined,
        protein: row.protein?.trim() || undefined,
        mealTypes: parseMealTypes(row.meal_types),
        suitableDays: parseSuitableDays(row.suitable_days),
        freezable: row.freezable?.trim().toLowerCase() === "true" || row.freezable?.trim() === "1",
        ingredients: row.ingredients ? parseIngredientString(row.ingredients) : undefined,
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
