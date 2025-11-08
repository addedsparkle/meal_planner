import { config } from 'dotenv';
import path from 'path';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

// Load test environment
config({ path: path.resolve(process.cwd(), '.env.test') });

const db = drizzle({
  connection: process.env.DB_FILE_NAME!,
  casing: 'snake_case',
});

console.log('Running migrations on test database...');
await migrate(db, { migrationsFolder: './drizzle' });
console.log('Test database migrations complete!');
process.exit(0);
