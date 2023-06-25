import { FastifyRequest, FastifyReply } from 'fastify';

export async function checkUserSession(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionUserId = request.cookies.sessionUserId;

  if (!sessionUserId) {
    reply.status(401).send({
      error: 'Unauthorized',
    });
  }
}
