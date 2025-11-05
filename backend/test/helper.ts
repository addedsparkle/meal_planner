import 'dotenv/config';
import Fastify from 'fastify';
import { registerSchemas } from '../src/schemas/index.js';
import sensiblePlugin from '../src/plugins/sensible.js';
import supportPlugin from '../src/plugins/support.js';
import dbPlugin from '../src/plugins/db.js';
import servicesPlugin from '../src/plugins/services.js';
import recipesRoute from '../src/routes/api/recipes.js';
import mealPlansRoute from '../src/routes/api/meal-plans.js';

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
