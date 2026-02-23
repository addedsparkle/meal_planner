import { writeFileSync } from "fs";
import { resolve } from "path";
import { db } from "../db/index.js";
import { getAllRecipes } from "../services/recipeService.js";

type Recipe = Awaited<ReturnType<typeof getAllRecipes>>[number];

function csvCell(value: string): string {
  // Wrap in quotes if the value contains a comma, quote, or newline
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatIngredients(ingredients: Recipe["ingredients"]): string {
  return ingredients
    .map((ing) => {
      const inner = [ing.quantity, ing.units].filter(Boolean).join("|");
      return inner ? `${ing.name} (${inner})` : ing.name;
    })
    .join(", ");
}

const COLUMNS = ["name", "description", "protein", "meal_types", "suitable_days", "freezable", "ingredients"] as const;

const recipes = getAllRecipes(db);

if (recipes.length === 0) {
  console.log("No recipes found in database.");
  process.exit(0);
}

const lines: string[] = [COLUMNS.join(",")];

for (const r of recipes) {
  const values = [
    r.name,
    r.description ?? "",
    r.protein ?? "",
    r.mealTypes.join(","),
    r.suitableDays,
    r.freezable ? "true" : "false",
    formatIngredients(r.ingredients),
  ];
  lines.push(values.map(csvCell).join(","));
}

const defaultName = `recipes-export-${new Date().toISOString().slice(0, 10)}.csv`;
const outPath = resolve(process.argv[2] ?? defaultName);

writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.log(`Exported ${recipes.length} recipe${recipes.length === 1 ? "" : "s"} to ${outPath}`);
