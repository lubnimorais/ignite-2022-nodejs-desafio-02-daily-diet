import { FastifyInstance } from 'fastify';

import { randomUUID } from 'node:crypto';

import { z } from 'zod';

import { knex } from '../database';

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    });

    const { name, email, password } = createUserBodySchema.parse(request.body);

    const userData = {
      id: randomUUID(),
      name,
      email,
      password,
    };

    const user = await knex('users').insert(userData).returning('*');

    if (user.length > 0) {
      reply.cookie('sessionUserId', user[0].id, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    return reply.status(201).send({ user: user[0] });
  });
}
