import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { recipesToIngredients, ingredients, recipes } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';

type Ingredient = typeof ingredients.$inferSelect;
type IngredientInsert = typeof ingredients.$inferInsert;

class IngredientService {
    private db: LibSQLDatabase;
    private logger: FastifyBaseLogger;

    constructor(db: LibSQLDatabase, logger: FastifyBaseLogger) {
        this.db = db;
        this.logger = logger;
    }

    async addIngredient(ingredient: IngredientInsert): Promise<Ingredient> {
        const result: Ingredient[] = await this.db.insert(ingredients).values(ingredient).returning();
        return result[0]!;
    }

    async getAllIngredients(): Promise<Ingredient[]> {
        return this.db.select().from(ingredients);
    }

    async getIngredient(id: number) : Promise<Ingredient | undefined> {
        const ingredient = await this.db.select().from(ingredients).where(eq(ingredients.id, id));

        if (!ingredient[0]) {
            return undefined;
        }

        return ingredient[0]
    }

    async getRecipesForIngredient(id: number){
        const ingredient = await this.db.select().from(ingredients).where(eq(ingredients.id, id));

        if (!ingredient[0]) {
            return undefined;
        }

        const ingredientRecipes =  await this.db
                    .select({
                        id: recipes.id,
                        name: recipes.name,
                    })
                    .from(recipesToIngredients)
                    .innerJoin(recipes, eq(recipesToIngredients.recipeId, recipes.id))
                    .where(eq(recipesToIngredients.ingredientId, id));
        return {
            ...ingredient[0],
            recipes: ingredientRecipes,
        };
    }

    async updateIngredient(id: number, data: Partial<IngredientInsert>): Promise<Ingredient | undefined> {
        const result = await this.db
            .update(ingredients)
            .set(data)
            .where(eq(ingredients.id, id))
            .returning();
        return result[0];
    }

    async deleteIngredient(id: number): Promise<void> {
        await this.db.delete(ingredients).where(eq(ingredients.id, id));
    }
}

export default IngredientService;
