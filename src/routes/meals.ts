import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { auth } from '../middlewares/auth'

export function mealRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [auth] }, async (request) => {
    const userId = request.user?.id

    const meals = await knex('meals').where({
      user_id: userId,
    })

    return { meals }
  })

  app.post('/', { preHandler: [auth] }, async (request, response) => {
    const createMealSchema = z.object({
      name: z.string().trim().min(1),
      description: z.string().trim().min(1),
      date: z.string().datetime(),
      partOfDiet: z.boolean(),
    })

    const { success, data: body } = createMealSchema.safeParse(request.body)

    if (!success) {
      return response.status(400).send({ message: 'Invalid body.' })
    }

    const { name, description, date, partOfDiet } = body

    const userId = request.user?.id

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      date,
      part_of_diet: partOfDiet,
      user_id: userId,
    })

    response.status(201).send()
  })
}
