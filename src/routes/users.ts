import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'

export async function userRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const users = await knex('users').select('*')

    return { users }
  })

  app.post('/', async (request, response) => {
    const createUserSchema = z.object({
      name: z.string().trim().min(1),
      email: z.string().email(),
    })

    const { success, data: body } = createUserSchema.safeParse(request.body)

    if (!success) {
      return response.status(400).send({ message: 'Invalid body.' })
    }

    const { name, email } = body

    const existingUser = await knex('users').where({ email }).first()

    if (existingUser) {
      return response.status(400).send({ message: 'E-mail already exists.' })
    }

    const sessionId = randomUUID()

    response.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return response.status(201).send()
  })
}
