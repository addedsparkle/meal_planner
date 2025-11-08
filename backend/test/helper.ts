// Load .env.test before .env for test-specific configuration
import { config } from 'dotenv';
import path from 'path';

// Load test environment first if it exists
config({ path: path.resolve(process.cwd(), '.env.test') });
// Then load default .env as fallback
config();

import Fastify from 'fastify';
import { registerSchemas } from '../src/schemas/index.ts';
import sensiblePlugin from '../src/plugins/sensible.ts';
import supportPlugin from '../src/plugins/support.ts';
import dbPlugin from '../src/plugins/db.ts';
import servicesPlugin from '../src/plugins/services.ts';
import recipesRoute from '../src/routes/api/recipes.ts';
import mealPlansRoute from '../src/routes/api/meal-plans.ts';
import ingredientsRoute from '../src/routes/api/ingredients.ts';

// Build app for testing
export async function build(t?: any) {
  const fastify = Fastify({
    logger: false // Disable logging during tests
  });

  try {
    // Register JSON schemas
    registerSchemas(fastify);

    // Register plugins
    await fastify.register(sensiblePlugin);
    await fastify.register(supportPlugin);
    await fastify.register(dbPlugin);  // This uses the db from src/db/index.ts which has casing configured
    await fastify.register(servicesPlugin);

    // Register routes
    await fastify.register(recipesRoute, { prefix: '/api/recipes' });
    await fastify.register(mealPlansRoute, { prefix: '/api/meal-plans' });
    await fastify.register(ingredientsRoute, { prefix: '/api/ingredients' });

    // Close the app after we are done
    if (t && t.after) {
      t.after(() => fastify.close());
    }

    return fastify;
  } catch (err) {
    console.error('Error building app for tests:', err);
    throw err;
  }
}
