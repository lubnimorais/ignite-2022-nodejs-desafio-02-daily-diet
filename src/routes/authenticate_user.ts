import { FastifyInstance } from 'fastify';

import { z } from 'zod';

import { knex } from '../database';

export async function authenticateUserRoutes(app: FastifyInstance) {
  app.post('/session', async (request, reply) => {
    const authenticateUserBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = authenticateUserBodySchema.parse(request.body);

    const user = await knex('users')
      .select('*')
      .where('email', email)
      .andWhere('password', password)
      .returning('*')
      .first();

    if (user) {
      reply.cookie('sessionUserId', user.id, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    return reply.status(200).send({ user });
  });
}
