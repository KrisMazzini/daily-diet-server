import { FastifyReply, FastifyRequest } from 'fastify'

import { knex } from '../database'

export async function auth(request: FastifyRequest, reply: FastifyReply) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized.',
    })
  }

  try {
    const user = await knex('users').where({ session_id: sessionId }).first()

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized.',
      })
    }

    request.user = user
  } catch {
    return reply.status(500).send({
      error: 'Internal Server Error.',
    })
  }
}
