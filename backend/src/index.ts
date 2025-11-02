import 'dotenv/config';
import Fastify from 'fastify';
import { registerSchemas } from './schemas/index.js';

// Import plugins
import sensiblePlugin from './plugins/sensible.js';
import supportPlugin from './plugins/support.js';
import dbPlugin from './plugins/db.js';
import servicesPlugin from './plugins/services.js';

// Import routes
import rootRoute from './routes/root.js';
import recipesRoute from './routes/api/recipes.js';
import weekPlansRoute from './routes/api/week-plans.js';

const fastify = Fastify({
  logger: true,
});

const start = async () => {
  try {
    // Register JSON schemas
    registerSchemas(fastify);

    // Register plugins
    await fastify.register(sensiblePlugin);
    await fastify.register(supportPlugin);
    await fastify.register(dbPlugin);
    await fastify.register(servicesPlugin);

    // Register routes
    await fastify.register(rootRoute);
    await fastify.register(recipesRoute, { prefix: '/api/recipes' });
    await fastify.register(weekPlansRoute, { prefix: '/api/week-plans' });

    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    fastify.log.info(`Server listening on ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();