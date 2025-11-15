import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import RecipeService from './recipes.ts';
import MealPlanService from './mealPlans.ts';
import { NONAME } from 'dns';
import { FastifyBaseLogger } from 'fastify';

type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

interface GenerateMealPlanOptions {
    name: string;
    startDate: Date;
    endDate?: Date;
    days?: Day[];
    mealsPerDay?: number;
    filterByMealType?: boolean;
}

class MealPlanGenerator {
    private recipeService: RecipeService;
    private mealPlanService: MealPlanService;

    constructor(db: LibSQLDatabase, logger: FastifyBaseLogger) {
        this.recipeService = new RecipeService(db, logger);
        this.mealPlanService = new MealPlanService(db, logger);
    }

    /**
     * Generates a meal plan by randomly assigning recipes to days
     *
     * @param options - Configuration for meal plan generation
     * @returns The created meal plan with assigned recipes
     */
    async generateMealPlan(options: GenerateMealPlanOptions) {
        const {
            name,
            startDate,
            endDate,
            days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            mealsPerDay = 3,
            filterByMealType = false,
        } = options;

        // Get all available recipes
        const allRecipes = await this.recipeService.getAllRecipes();

        if (allRecipes.length === 0) {
            throw new Error('No recipes available to generate meal plan');
        }

        const availableSnacks = allRecipes.filter(
            recipe => recipe.meal?.includes("Snack")
        );

        let snack: number | null = null;

        if (availableSnacks.length > 0){
            const randomIndex = Math.floor(Math.random() * availableSnacks.length);
            const selectedSnack = availableSnacks[randomIndex]!;
            snack = selectedSnack.id
        }

        // Create the meal plan
        const mealPlan = await this.mealPlanService.createMealPlan({
            name,
            startDate,
            endDate,
            snack,
        });

        // Define meal types to use
        const mealTypes: MealType[] = ["Breakfast", "Lunch", "Dinner"];

        // Assign random recipes to each day
        for (const day of days) {
            const recipesToAdd: Array<{ recipeId: number; mealType?: MealType }> = [];

            for (let i = 0; i < mealsPerDay && i < mealTypes.length; i++) {
                const mealType = mealTypes[i];

                // Filter recipes by meal type if enabled
                let availableRecipes = allRecipes;
                if (filterByMealType) {
                    availableRecipes = allRecipes.filter(
                        recipe => recipe.meal?.includes(mealType) || recipe.meal === null || recipe.meal?.length === 0
                    );
                }

                // If no recipes match the meal type, fall back to all recipes
                if (availableRecipes.length === 0) {
                    availableRecipes = allRecipes;
                }

                // Pick a random recipe
                const randomIndex = Math.floor(Math.random() * availableRecipes.length);
                const selectedRecipe = availableRecipes[randomIndex]!;

                recipesToAdd.push({
                    recipeId: selectedRecipe.id,
                    mealType,
                });
            }

            // Add all recipes for this day
            await this.mealPlanService.updateDay(mealPlan.id, day, recipesToAdd);
        }

        // Return the complete meal plan
        return this.mealPlanService.getMealPlan(mealPlan.id);
    }

    /**
     * Regenerates a single day in an existing meal plan
     *
     * @param planId - The ID of the meal plan
     * @param day - The day to regenerate
     * @param mealsPerDay - Number of meals to generate for the day
     * @param filterByMealType - Whether to filter recipes by meal type
     */
    async regenerateDay(
        planId: number,
        day: Day,
        mealsPerDay: number = 3,
        filterByMealType: boolean = false
    ) {
        const allRecipes = await this.recipeService.getAllRecipes();

        if (allRecipes.length === 0) {
            throw new Error('No recipes available to regenerate day');
        }

        const mealTypes: MealType[] = ["Breakfast", "Lunch", "Dinner"];
        const recipesToAdd: Array<{ recipeId: number; mealType?: MealType }> = [];

        for (let i = 0; i < mealsPerDay && i < mealTypes.length; i++) {
            const mealType = mealTypes[i];

            let availableRecipes = allRecipes;
            if (filterByMealType) {
                availableRecipes = allRecipes.filter(
                    recipe => recipe.meal?.includes(mealType) || recipe.meal === null || recipe.meal?.length === 0
                );
            }

            if (availableRecipes.length === 0) {
                availableRecipes = allRecipes;
            }

            const randomIndex = Math.floor(Math.random() * availableRecipes.length);
            const selectedRecipe = availableRecipes[randomIndex]!;

            recipesToAdd.push({
                recipeId: selectedRecipe.id,
                mealType,
            });
        }

        return this.mealPlanService.updateDay(planId, day, recipesToAdd);
    }
}

export default MealPlanGenerator;
