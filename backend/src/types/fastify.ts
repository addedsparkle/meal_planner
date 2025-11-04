import 'fastify';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type RecipeService from '../services/recipes.ts';
import type IngredientService from '../services/ingredients.js';
import type MealPlanService from '../services/mealPlans.js';
import type MealPlanGenerator from '../services/mealPlanGenerator.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: LibSQLDatabase;
    recipeService: RecipeService;
    ingredientService: IngredientService;
    mealPlanService: MealPlanService;
    mealPlanGenerator: MealPlanGenerator;
  }
}
