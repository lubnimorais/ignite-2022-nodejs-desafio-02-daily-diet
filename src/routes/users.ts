import { FastifyInstance } from 'fastify';

import { randomUUID } from 'crypto';

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    console.log('post user', randomUUID());
  });
}
