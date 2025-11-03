import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { recipes, recipesToIngredients, ingredients } from '../db/schema.js';
import { eq } from 'drizzle-orm';

type Recipe = typeof recipes.$inferSelect;
type RecipeInsert = typeof recipes.$inferInsert;

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
                defaultUnit: ingredients.defaultUnit,
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
}

export default RecipeService;
