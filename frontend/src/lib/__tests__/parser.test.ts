import { describe, it, expect } from "vitest";
import { parseContents } from "../parser";
import { readFileSync } from "fs";
import { join } from "path";

describe("parseContents", () => {
  it("should parse CSV file correctly with test fixture", async () => {
    // Read the test CSV file
    const csvPath = join(__dirname, "./__fixtures__/test_import.csv");
    const csvContent = readFileSync(csvPath, "utf-8");

    // Create a mock File object
    const mockFile = new File([csvContent], "test_import.csv", {
      type: "text/csv",
    });

    // Parse the file
    const result = await parseContents(mockFile);

    // Verify the results
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // Check the first recipe (Chicken Fajitas)
    const firstRecipe = result[0];
    expect(firstRecipe.name).toBe("Chicken Fajitas");
    expect(firstRecipe.ingredients).toBe(
      "Chicken Breast, Fajita Seasoning, Guacamole, Peppers, Red Onion, Salsa, Soured Cream, Tortillas",
    );
    expect(firstRecipe.main_ingredient).toBe("Chicken");
    expect(firstRecipe.meal).toBe("Dinner");
    expect(firstRecipe.can_batch).toBe(false);
    expect(firstRecipe.created_at).toBeDefined();

    // Check a recipe that can batch (Keema Matar)
    const secondRecipe = result[1];
    expect(secondRecipe.name).toBe("Keema Matar");
    expect(secondRecipe.can_batch).toBe(true);
    expect(secondRecipe.main_ingredient).toBe("Beef");

    // Check a recipe with multiple meals (French toast with bacon)
    const frenchToastRecipe = result.find(
      (recipe) => recipe.name === "French toast with bacon",
    );
    expect(frenchToastRecipe).toBeDefined();
    expect(frenchToastRecipe?.meal).toBe("Breakfast, Dinner, Lunch");
    expect(frenchToastRecipe?.main_ingredient).toBe("Bacon");
    expect(frenchToastRecipe?.can_batch).toBe(false);

    // Check a recipe with empty ingredients (Pizza)
    const pizzaRecipe = result.find((recipe) => recipe.name === "Pizza");
    expect(pizzaRecipe).toBeDefined();
    expect(pizzaRecipe?.ingredients).toBe("");
    expect(pizzaRecipe?.main_ingredient).toBe("");
    expect(pizzaRecipe?.meal).toBe("Dinner");

    // Verify all recipes have required fields
    result.forEach((recipe) => {
      expect(recipe.name).toBeDefined();
      expect(recipe.created_at).toBeDefined();
      expect(typeof recipe.can_batch).toBe("boolean");
    });

    // Verify we parsed all 70 recipes from the CSV
    expect(result.length).toBe(70);
  });

  it("should handle empty CSV file", async () => {
    const emptyCSV = "Name,Can batch,Ingredients,Main Ingredient,Meal\n";
    const mockFile = new File([emptyCSV], "empty.csv", {
      type: "text/csv",
    });

    const result = await parseContents(mockFile);
    expect(result).toEqual([]);
  });

  it("should handle CSV with only headers", async () => {
    const headersOnlyCSV = "Name,Can batch,Ingredients,Main Ingredient,Meal";
    const mockFile = new File([headersOnlyCSV], "headers_only.csv", {
      type: "text/csv",
    });

    const result = await parseContents(mockFile);
    expect(result).toEqual([]);
  });

  it("should handle CSV with missing fields", async () => {
    const csvWithMissingFields = `Name,Can batch,Ingredients,Main Ingredient,Meal
Test Recipe,No,Missing ingredients,,Dinner`;

    const mockFile = new File([csvWithMissingFields], "missing_fields.csv", {
      type: "text/csv",
    });

    const result = await parseContents(mockFile);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Test Recipe");
    expect(result[0].ingredients).toBe("Missing ingredients");
    expect(result[0].main_ingredient).toBe("");
    expect(result[0].meal).toBe("Dinner");
    expect(result[0].can_batch).toBe(false);
  });
});
