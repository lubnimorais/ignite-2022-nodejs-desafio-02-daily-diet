import { app } from './app';

import { env } from './env';

app
  .listen({
    port: env.API_PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!');
  });
