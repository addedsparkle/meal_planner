import Papa from "papaparse";
import type { RecipeIn } from "../types/Recipe";

interface CSVRow {
  Name: string;
  Ingredients: string;
  "Main Ingredient": RecipeIn["mainProtein"];
  Meal: RecipeIn["meal"];
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
            mainProtein: row["Main Ingredient"] || null,
            meal: row.Meal || null,
            canBatch:
              (row["Can batch"] || "").toLowerCase() === "yes" ||
              (row["Can batch"] || "").toLowerCase() === "true" ||
              (row["Can batch"] || "") === "1",
            instructions: "TBA",
            ingredients: row["Ingredients"].split(",").map((name) => {return {name, amount: 0, unit: null}})
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
