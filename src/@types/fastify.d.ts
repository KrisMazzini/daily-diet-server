// eslint-disable-next-line
import fastify from 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    user: {
      id: string
      name: string
      email: string
      created_at: string
      session_id: string
    } | null
  }
}
