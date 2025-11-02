import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { recipesTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

type Recipe = typeof recipesTable.$inferSelect;
type RecipeInsert = typeof recipesTable.$inferInsert;

class RecipeService {
    private db: LibSQLDatabase;

    constructor(db: LibSQLDatabase) {
        this.db = db;
    }

    async addRecipe(recipe: RecipeInsert): Promise<Recipe> {
        const result: Recipe[] = await this.db.insert(recipesTable).values(recipe).returning();
        return result[0]!;
    }

    async getAllRecipes(): Promise<Recipe[]> {
        return this.db.select().from(recipesTable);
    }

    async getRecipe(id: number): Promise<Recipe | undefined> {
        const result = await this.db.select().from(recipesTable).where(eq(recipesTable.id, id));
        return result[0];
    }

    async deleteRecipe(id: number): Promise<void> {
        await this.db.delete(recipesTable).where(eq(recipesTable.id, id));
    }
}

export default RecipeService;
