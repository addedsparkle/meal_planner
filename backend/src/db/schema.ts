import { relations } from 'drizzle-orm';
import { sqliteTable, integer, text, unique, primaryKey } from 'drizzle-orm/sqlite-core';

export const recipes = sqliteTable("recipes", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  mainProtein: text({enum: ["Chicken", "Beef", "Pork", "Bean", "Egg"]}),
  meal: text({ enum: ["Breakfast", "Lunch", "Dinner", "Snack"] }),
  instructions: text(),
  canBatch: integer({mode: 'boolean'}),
  lastUsed: integer({mode: 'timestamp'}),
}, (t) => [
  unique('recipe_name_unique').on(t.id, t.name)
]);


export const recipesRelations = relations(recipes, ({ many }) => ({
  recipesToIngredients: many(recipesToIngredients),
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