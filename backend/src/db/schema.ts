import { relations } from 'drizzle-orm';
import { sqliteTable, integer, text, unique, primaryKey } from 'drizzle-orm/sqlite-core';

export const recipes = sqliteTable("recipes", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  mainProtein: text({enum: ["Chicken", "Beef", "Pork", "Bean", "Egg"]}),
  instructions: text(),
  canBatch: integer({mode: 'boolean'}),
  lastUsed: integer({mode: 'timestamp'}),
}, (t) => [
  unique('recipe_name_unique').on(t.id, t.name)
]);


export const recipesRelations = relations(recipes, ({ many }) => ({
  recipesToIngredients: many(recipesToIngredients),
  recipesToMealTypes: many(recipesToMealTypes),
  mealPlansToRecipes: many(mealPlansToRecipes),
  mealPlansSnack: many(mealPlans),
}));

export const ingredients = sqliteTable("ingredients", {
  id: integer().primaryKey({autoIncrement: true}),
  name: text().notNull(),
}, (t) => [
  unique('ingredient_name_unique').on(t.id, t.name)
])

export const ingredientRelationships = relations(ingredients, ({ many }) => ({
  recipesToIngredients: many(recipesToIngredients),
}));

export const recipesToIngredients = sqliteTable(
  'recipes_to_ingredients',
  {
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id),
    ingredientId: integer('ingredient_id')
      .notNull()
      .references(() => ingredients.id),
    unit: text({enum: ["g", "ml", "pieces", "cup", "tbsp", "tsp"]}),
    amount: integer().notNull(),
  },
  (t) => [
		primaryKey({ columns: [t.recipeId, t.ingredientId] })
	],
);

export const recipesToIngredientsRelations = relations(recipesToIngredients, ({ one }) => ({
  recipes: one(recipes, {
    fields: [recipesToIngredients.recipeId],
    references: [recipes.id],
  }),
  ingredients: one(ingredients, {
    fields: [recipesToIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));

// Junction table for recipes to meal types (many-to-many)
export const recipesToMealTypes = sqliteTable(
  'recipes_to_meal_types',
  {
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    mealType: text('meal_type', {
      enum: ["Breakfast", "Lunch", "Dinner", "Snack"]
    }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.recipeId, t.mealType] })
  ],
);

export const recipesToMealTypesRelations = relations(recipesToMealTypes, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipesToMealTypes.recipeId],
    references: [recipes.id],
  }),
}));

// Meal Plans table
export const mealPlans = sqliteTable("meal_plans", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  startDate: integer({ mode: 'timestamp' }).notNull(),
  endDate: integer({ mode: 'timestamp' }),
  snack: integer()
      .references(() => recipes.id),
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const mealPlansRelations = relations(mealPlans, ({ many, one }) => ({
  mealPlansToRecipes: many(mealPlansToRecipes),
  snackRecipe: one(recipes, {
    fields: [mealPlans.snack],
    references: [recipes.id],
  }),
}));

// Junction table between meal plans and recipes with day information
export const mealPlansToRecipes = sqliteTable(
  'meal_plans_to_recipes',
  {
    planId: integer('plan_id')
      .notNull()
      .references(() => mealPlans.id, { onDelete: 'cascade' }),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id),
    day: text({
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }).notNull(),
    mealType: text('meal_type', {
      enum: ["Breakfast", "Lunch", "Dinner", "Snack"]
    }),
  },
  (t) => [
    primaryKey({ columns: [t.planId, t.recipeId, t.day] })
  ],
);

export const mealPlansToRecipesRelations = relations(mealPlansToRecipes, ({ one }) => ({
  mealPlan: one(mealPlans, {
    fields: [mealPlansToRecipes.planId],
    references: [mealPlans.id],
  }),
  recipe: one(recipes, {
    fields: [mealPlansToRecipes.recipeId],
    references: [recipes.id],
  }),
}));