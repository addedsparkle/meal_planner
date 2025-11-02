import 'dotenv/config';
import { db } from './index.js';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('Creating database schema...');

  // Create recipes table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      main_protein TEXT CHECK(main_protein IN ('Chicken', 'Beef', 'Pork', 'Bean', 'Egg')),
      meal TEXT CHECK(meal IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
      instructions TEXT,
      can_batch INTEGER,
      last_used INTEGER,
      UNIQUE(id, name)
    )
  `);

  console.log('Database schema created successfully!');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
