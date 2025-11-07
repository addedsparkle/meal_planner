import type { RecipeIn } from "../types/Recipe";
import { recipesApi } from "./api";

export const bulkRecipeProcessor = async (recipes: RecipeIn[]): Promise<{totalAdded: number, rejected: RecipeIn[]}> => {
    const currentRecipes = await recipesApi.getAll();
    let totalAdded = 0;
    const rejected: RecipeIn[] = [];

    recipes.forEach( (recipe) => {
        const dbRecipe = currentRecipes.find((existing) => existing.name === recipe.name);

        if (!dbRecipe) {
            recipesApi.create(recipe).then(() => {totalAdded += 1}).catch(() => {rejected.push(recipe)})
        }

    })

    return { totalAdded, rejected}
}