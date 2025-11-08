import type { RecipeIn } from "../types/Recipe";
import { recipesApi } from "./api";

export const bulkRecipeProcessor = async (recipes: RecipeIn[]): Promise<{totalAdded: number, rejected: RecipeIn[]}> => {
    const currentRecipes = await recipesApi.getAll();
    let totalAdded = 0;
    const rejected: RecipeIn[] = [];

    for (const recipe of recipes) {
        let dbRecipe = currentRecipes.find((existing) => existing.name === recipe.name);

        if (!dbRecipe) {
            // Create recipe without ingredients first
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {ingredients, ...recipeInParams} = recipe;
            try {
                dbRecipe = await recipesApi.create(recipeInParams);
                totalAdded += 1;
            } catch {
                rejected.push(recipe);
                continue; // Skip ingredient processing if recipe creation failed
            }
        }

        // Process ingredients for the recipe
        if (recipe.ingredients) {
            for (const ingredient of recipe.ingredients) {
                // Check if the recipe already has the ingredient
                const existingIngredient = dbRecipe.ingredients.find(
                    (existing) => existing.name === ingredient.name
                );

                if (!existingIngredient) {
                    // Add the ingredient to the recipe
                    // The backend will check if the ingredient already exists on the server
                    // If it does not exist, it will create it on the server
                    // Then add the ingredient to the recipe
                    try {
                        await recipesApi.addIngredient(dbRecipe.id, {
                            name: ingredient.name,
                            amount: ingredient.amount,
                            unit: ingredient.unit || 'pieces'
                        });
                    } catch (error) {
                        console.error(`Failed to add ingredient ${ingredient.name} to recipe ${dbRecipe.name}:`, error);
                        // Continue with other ingredients even if one fails
                    }
                }
            }
        }
    }

    return { totalAdded, rejected}
}

export const addNewRecipeWithIngredients = async(recipe: RecipeIn) => {
    const {ingredients, ...recipeInParams} = recipe;

    const dbRecipe = await recipesApi.create(recipeInParams);
    // Process ingredients for the recipe
    if (ingredients) {
        for (const ingredient of ingredients) {
            try {
                await recipesApi.addIngredient(dbRecipe.id, {
                    name: ingredient.name,
                    amount: ingredient.amount,
                    unit: ingredient.unit || 'pieces'
                });
            } catch (error) {
                console.error(`Failed to add ingredient ${ingredient.name} to recipe ${dbRecipe.name}:`, error);
                // Continue with other ingredients even if one fails
            }
        }
        
    }

}