import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.ts';
import '../types/fastify.ts';

/**
 * This plugin adds the database instance to Fastify
 */
const dbPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.decorate('db', db);
};

export default fp(dbPlugin);