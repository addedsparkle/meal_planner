import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';

export const db = drizzle({
  connection: process.env.DB_FILE_NAME!,
  casing: 'snake_case',
});
