import fastify from 'fastify';

import cookie from '@fastify/cookie';

import { usersRoutes } from './routes/users';
import { authenticateUserRoutes } from './routes/authenticate_user';
import { mealsRoutes } from './routes/meals';

const app = fastify();

app.register(cookie);

app.register(usersRoutes, {
  prefix: 'users',
});

app.register(authenticateUserRoutes, {
  prefix: 'authenticated',
});

app.register(mealsRoutes, {
  prefix: 'meals',
});

export { app };
