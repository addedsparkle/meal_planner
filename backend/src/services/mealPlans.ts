import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { mealPlans, mealPlansToRecipes } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';

type MealPlan = typeof mealPlans.$inferSelect;
type MealPlanInsert = typeof mealPlans.$inferInsert;
type MealPlanToRecipe = typeof mealPlansToRecipes.$inferSelect;
type MealPlanToRecipeInsert = typeof mealPlansToRecipes.$inferInsert;
type Day = NonNullable<MealPlanToRecipeInsert['day']>;
type MealType = NonNullable<MealPlanToRecipeInsert['mealType']>;

class MealPlanService {
    private db: LibSQLDatabase;
    private logger: FastifyBaseLogger;

    constructor(db: LibSQLDatabase, logger: FastifyBaseLogger) {
        this.db = db;
        this.logger = logger;
    }

    /**
     * Creates a new meal plan
     *
     * @param planData - The meal plan data (name, startDate, endDate)
     * @returns The created meal plan
     */
    async createMealPlan(planData: Omit<MealPlanInsert, 'createdAt'>): Promise<MealPlan> {
        const result = await this.db
            .insert(mealPlans)
            .values(planData)
            .returning();

        return result[0]!;
    }

    /**
     * Gets all meal plans
     */
    async getAllMealPlans(): Promise<MealPlan[]> {
        return this.db.select().from(mealPlans);
    }

    /**
     * Gets a single meal plan with all its recipes
     *
     * @param planId - The ID of the meal plan
     */
    async getMealPlan(planId: number) {
        const plan = await this.db
            .select()
            .from(mealPlans)
            .where(eq(mealPlans.id, planId));

        if (!plan[0]) {
            return undefined;
        }

        // Get all recipes for this plan with their day and meal type
        const planRecipes = await this.db
            .select()
            .from(mealPlansToRecipes)
            .where(eq(mealPlansToRecipes.planId, planId));
        
        return {
            ...plan[0],
            recipes: planRecipes,
        };
    }

    /**
     * Deletes a meal plan and all its recipe associations
     *
     * @param planId - The ID of the meal plan to delete
     */
    async deleteMealPlan(planId: number): Promise<void> {
        // Due to cascade delete on the foreign key, this will automatically
        // delete all associated mealPlansToRecipes records
        await this.db.delete(mealPlans).where(eq(mealPlans.id, planId));
    }

    /**
     * Updates a meal plan's basic info (name, dates)
     *
     * @param planId - The ID of the meal plan
     * @param updates - The fields to update
     */
    async updateMealPlan(
        planId: number,
        updates: Partial<Omit<MealPlanInsert, 'createdAt'>>
    ) {
        const result = await this.db
            .update(mealPlans)
            .set(updates)
            .where(eq(mealPlans.id, planId))
            .returning();

        return result[0];
    }

    /**
     * Adds a recipe to a meal plan for a specific day
     *
     * @param planId - The ID of the meal plan
     * @param recipeId - The ID of the recipe to add
     * @param day - The day of the week
     * @param mealType - Optional meal type (Breakfast, Lunch, Dinner, Snack)
     */
    async addRecipeToPlan(
        planId: number,
        recipeId: number,
        day: Day,
        mealType?: MealType
    ) {
        const result = await this.db
            .insert(mealPlansToRecipes)
            .values({
                planId,
                recipeId,
                day,
                mealType,
            })
            .returning();

        return result[0];
    }

    /**
     * Removes a recipe from a meal plan for a specific day
     *
     * @param planId - The ID of the meal plan
     * @param recipeId - The ID of the recipe to remove
     * @param day - The day of the week
     */
    async removeRecipeFromPlan(
        planId: number,
        recipeId: number,
        day: Day
    ): Promise<void> {
        await this.db
            .delete(mealPlansToRecipes)
            .where(
                and(
                    eq(mealPlansToRecipes.planId, planId),
                    eq(mealPlansToRecipes.recipeId, recipeId),
                    eq(mealPlansToRecipes.day, day)
                )
            );
    }

    /**
     * Updates a recipe assignment in a meal plan (change recipe or meal type for a day)
     *
     * @param planId - The ID of the meal plan
     * @param oldRecipeId - The current recipe ID
     * @param day - The day of the week
     * @param newRecipeId - The new recipe ID (optional, defaults to keeping the same)
     * @param mealType - The new meal type (optional)
     */
    async updateRecipeInPlan(
        planId: number,
        oldRecipeId: number,
        day: Day,
        newRecipeId?: number,
        mealType?: MealType
    ) {
        // Build the update object
        const updates: Partial<MealPlanToRecipeInsert> = {};
        if (newRecipeId !== undefined) {
            updates.recipeId = newRecipeId;
        }
        if (mealType !== undefined) {
            updates.mealType = mealType;
        }

        const result = await this.db
            .update(mealPlansToRecipes)
            .set(updates)
            .where(
                and(
                    eq(mealPlansToRecipes.planId, planId),
                    eq(mealPlansToRecipes.recipeId, oldRecipeId),
                    eq(mealPlansToRecipes.day, day)
                )
            )
            .returning();

        return result[0];
    }

    /**
     * Clears all recipes for a specific day in a meal plan
     *
     * @param planId - The ID of the meal plan
     * @param day - The day to clear
     */
    async clearDay(planId: number, day: Day): Promise<void> {
        await this.db
            .delete(mealPlansToRecipes)
            .where(
                and(
                    eq(mealPlansToRecipes.planId, planId),
                    eq(mealPlansToRecipes.day, day)
                )
            );
    }

    /**
     * Replaces all recipes for a specific day
     *
     * @param planId - The ID of the meal plan
     * @param day - The day to update
     * @param recipes - Array of recipe assignments for the day
     */
    async updateDay(
        planId: number,
        day: Day,
        recipes: Array<{ recipeId: number; mealType?: MealType }>
    ) {
        // First, clear all existing recipes for this day
        await this.clearDay(planId, day);

        // Then, add all the new recipes
        const results = await Promise.all(
            recipes.map(({ recipeId, mealType }) =>
                this.addRecipeToPlan(planId, recipeId, day, mealType)
            )
        );

        return results;
    }

    /**
     * Gets all recipes for a specific day in a meal plan
     *
     * @param planId - The ID of the meal plan
     * @param day - The day of the week
     */
    async getRecipesForDay(planId: number, day: Day) {
        return this.db
            .select()
            .from(mealPlansToRecipes)
            .where(
                and(
                    eq(mealPlansToRecipes.planId, planId),
                    eq(mealPlansToRecipes.day, day)
                )
            );
    }
}

export default MealPlanService;
