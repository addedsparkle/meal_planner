import type { FastifyPluginAsync } from 'fastify';

const rootRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get('/', async function (request, reply) {
    return { root: true };
  });
};

export default rootRoute;
