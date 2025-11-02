import type { Recipe } from "../types/Recipe";

/**
 * Converts a list of recipes to a JSON string that can be used for downloading
 * @param recipes Array of Recipe objects to export
 * @returns JSON string representation of the recipes
 */
export const recipesToJson = (recipes: Recipe[]): string => {
  return JSON.stringify(recipes, null, 2);
};

/**
 * Creates a downloadable blob URL from a list of recipes
 * @param recipes Array of Recipe objects to export
 * @returns Blob URL that can be used as a download link href
 */
export const createRecipeDownloadUrl = (recipes: Recipe[]): string => {
  const jsonString = recipesToJson(recipes);
  const blob = new Blob([jsonString], { type: "application/json" });
  return URL.createObjectURL(blob);
};
