import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

const supportPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.decorate('someSupport', function () {
    return 'hugs';
  });
};

export default fp(supportPlugin);