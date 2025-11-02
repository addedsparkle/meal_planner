import Papa from "papaparse";
import type { RecipeIn } from "../types/Recipe";

interface CSVRow {
  Name: string;
  Ingredients: string;
  "Main Ingredient": string;
  Meal: string;
  "Can batch": string;
}

export async function parseContents(file: File): Promise<RecipeIn[]> {
  return new Promise((resolve, reject) => {
    const importedRecipes: RecipeIn[] = [];

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach((row) => {
          importedRecipes.push({
            name: row.Name || "",
            ingredients: row.Ingredients || "",
            main_ingredient: row["Main Ingredient"] || "",
            meal: row.Meal || "",
            can_batch:
              (row["Can batch"] || "").toLowerCase() === "yes" ||
              (row["Can batch"] || "").toLowerCase() === "true" ||
              (row["Can batch"] || "") === "1",
            created_at: new Date().toISOString(),
          });
        });
        resolve(importedRecipes);
      },
      error: (error: unknown) => {
        console.error("CSV parsing error:", error);
        reject(new Error(`CSV parsing error: ${String(error)}`));
      },
    });
  });
}
