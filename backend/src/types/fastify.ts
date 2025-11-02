import 'fastify';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type RecipeService from '../services/recipes.ts';

declare module 'fastify' {
  interface FastifyInstance {
    db: LibSQLDatabase;
    recipeService: RecipeService;
  }
}
