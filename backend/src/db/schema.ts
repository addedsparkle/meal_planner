import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ─── Recipes ────────────────────────────────────────────────────────────────

export const recipes = sqliteTable("recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  servings: integer("servings"),
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  instructions: text("instructions"),
  metadata: text("metadata"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const recipesRelations = relations(recipes, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
  mealPlanDays: many(mealPlanDays),
}));

// ─── Ingredients ────────────────────────────────────────────────────────────

export const ingredients = sqliteTable("ingredients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  category: text("category"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
}));

// ─── Recipe Ingredients (join table) ────────────────────────────────────────

export const recipeIngredients = sqliteTable("recipe_ingredients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id),
  ingredientId: integer("ingredient_id")
    .notNull()
    .references(() => ingredients.id),
  quantity: text("quantity"),
  notes: text("notes"),
});

export const recipeIngredientsRelations = relations(
  recipeIngredients,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeIngredients.recipeId],
      references: [recipes.id],
    }),
    ingredient: one(ingredients, {
      fields: [recipeIngredients.ingredientId],
      references: [ingredients.id],
    }),
  }),
);

// ─── Meal Plans ─────────────────────────────────────────────────────────────

export const mealPlans = sqliteTable("meal_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const mealPlansRelations = relations(mealPlans, ({ many }) => ({
  mealPlanDays: many(mealPlanDays),
}));

// ─── Meal Plan Days ─────────────────────────────────────────────────────────

export const mealPlanDays = sqliteTable("meal_plan_days", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mealPlanId: integer("meal_plan_id")
    .notNull()
    .references(() => mealPlans.id),
  dayDate: text("day_date").notNull(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id),
  mealType: text("meal_type").default("dinner"),
});

export const mealPlanDaysRelations = relations(mealPlanDays, ({ one }) => ({
  mealPlan: one(mealPlans, {
    fields: [mealPlanDays.mealPlanId],
    references: [mealPlans.id],
  }),
  recipe: one(recipes, {
    fields: [mealPlanDays.recipeId],
    references: [recipes.id],
  }),
}));

// ─── Inferred Types ─────────────────────────────────────────────────────────

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;

export type Ingredient = typeof ingredients.$inferSelect;
export type NewIngredient = typeof ingredients.$inferInsert;

export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type NewRecipeIngredient = typeof recipeIngredients.$inferInsert;

export type MealPlan = typeof mealPlans.$inferSelect;
export type NewMealPlan = typeof mealPlans.$inferInsert;

export type MealPlanDay = typeof mealPlanDays.$inferSelect;
export type NewMealPlanDay = typeof mealPlanDays.$inferInsert;
