import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { recipes, recipesToIngredients, ingredients } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';

type Recipe = typeof recipes.$inferSelect;
type RecipeInsert = typeof recipes.$inferInsert;
type RecipeToIngredientInsert = typeof recipesToIngredients.$inferInsert;
type Unit = NonNullable<RecipeToIngredientInsert['unit']>;

class RecipeService {
    private db: LibSQLDatabase;

    constructor(db: LibSQLDatabase) {
        this.db = db;
    }

    async addRecipe(recipe: RecipeInsert): Promise<Recipe> {
        const result: Recipe[] = await this.db.insert(recipes).values(recipe).returning();
        return result[0]!;
    }

    async getAllRecipes(): Promise<Recipe[]> {
        return this.db.select().from(recipes);
    }

    async getRecipe(id: number) {
        const recipe = await this.db.select().from(recipes).where(eq(recipes.id, id));

        if (!recipe[0]) {
            return undefined;
        }

        const recipeIngredients = await this.db
            .select({
                id: ingredients.id,
                name: ingredients.name,
                amount: recipesToIngredients.amount,
                unit: recipesToIngredients.unit,
            })
            .from(recipesToIngredients)
            .innerJoin(ingredients, eq(recipesToIngredients.ingredientId, ingredients.id))
            .where(eq(recipesToIngredients.recipeId, id));

        return {
            ...recipe[0],
            ingredients: recipeIngredients,
        };
    }

    async deleteRecipe(id: number): Promise<void> {
        await this.db.delete(recipes).where(eq(recipes.id, id));
    }

    /**
     * Adds an ingredient to a recipe, creating the ingredient if it doesn't exist
     *
     * @param recipeId - The ID of the recipe to add the ingredient to
     * @param ingredient - The ingredient name
     * @param unit - The unit of measurement for this specific recipe
     * @param amount - The quantity needed for this recipe
     */
    async addIngredientToRecipe(recipeId: number, ingredientName: string, unit: Unit, amount: number){
        // Step 1: Check if the ingredient already exists by searching for its name
        // Use a SELECT query with a WHERE clause on the name field
        const existingIngredient = await this.db
            .select()
            .from(ingredients)
            .where(eq(ingredients.name, ingredientName));

        // Step 2: Determine the ingredient ID
        // If the ingredient doesn't exist (array is empty), create it and get the returned ID
        // If it exists, use the existing ingredient's ID
        let ingredientId: number;

        if (existingIngredient.length === 0) {
            // Ingredient doesn't exist - insert it into the ingredients table
            const newIngredient = await this.db
                .insert(ingredients)
                .values({name: ingredientName})
                .returning();
            ingredientId = newIngredient[0]!.id;
        } else {
            // Ingredient exists - use its ID
            ingredientId = existingIngredient[0]!.id;
        }

        // Step 3: Create the relationship in the junction table (recipesToIngredients)
        // This links the recipe to the ingredient with the specific amount and unit
        const result = await this.db
            .insert(recipesToIngredients)
            .values({
                recipeId,
                ingredientId,
                amount,
                unit,
            })
            .returning();

        // Return the created relationship
        return result[0];
    }

    /**
     * Removes an ingredient from a recipe
     *
     * @param recipeId - The ID of the recipe
     * @param ingredientId - The ID of the ingredient to remove
     */
    async removeIngredientFromRecipe(recipeId: number, ingredientId: number): Promise<void> {
        // Delete the relationship from the junction table
        // This removes the ingredient from the recipe but doesn't delete the ingredient itself
        await this.db
            .delete(recipesToIngredients)
            .where(
                and(
                    eq(recipesToIngredients.recipeId, recipeId),
                    eq(recipesToIngredients.ingredientId, ingredientId)
                )
            );
    }

    /**
     * Updates the amount and unit of an ingredient in a recipe
     *
     * @param recipeId - The ID of the recipe
     * @param ingredientId - The ID of the ingredient
     * @param amount - The new quantity
     * @param unit - The new unit of measurement
     */
    async updateRecipeIngredient(
        recipeId: number,
        ingredientId: number,
        amount: number,
        unit: Unit
    ) {
        // Update the junction table entry with new amount and unit
        const result = await this.db
            .update(recipesToIngredients)
            .set({ amount, unit })
            .where(
                and(
                    eq(recipesToIngredients.recipeId, recipeId),
                    eq(recipesToIngredients.ingredientId, ingredientId)
                )
            )
            .returning();

        return result[0];
    }
}

export default RecipeService;
