import { FastifyReply, FastifyRequest } from 'fastify'
import { getUserBySessionId } from '../utils/getUserBySessionId'

export async function auth(request: FastifyRequest, reply: FastifyReply) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized.',
    })
  }

  try {
    const { user } = await getUserBySessionId({ sessionId })

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
