import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core';

export const recipesTable = sqliteTable("recipes", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  mainProtein: text({enum: ["Chicken", "Beef", "Pork", "Bean", "Egg"]}),
  meal: text({ enum: ["Breakfast", "Lunch", "Dinner", "Snack"] }),
  instructions: text(),
  canBatch: integer({mode: 'boolean'}),
  lastUsed: integer({mode: 'timestamp'}),
}, (t) => [
  unique('name').on(t.id, t.name)
]);