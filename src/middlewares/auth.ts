import { FastifyReply, FastifyRequest } from 'fastify'
import { getUserBySessionId } from '../utils/getUserBySessionId'

export async function auth(request: FastifyRequest, response: FastifyReply) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return response.status(401).send({
      error: 'Unauthorized.',
    })
  }

  try {
    const { user } = await getUserBySessionId({ sessionId })

    if (!user) {
      return response.status(401).send({
        error: 'Unauthorized.',
      })
    }

    request.user = user
  } catch {
    return response.status(500).send({
      error: 'Internal Server Error.',
    })
  }
}
