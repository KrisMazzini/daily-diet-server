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

  app.get('/:id', { preHandler: [auth] }, async (request, response) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { success, data: params } = getMealParamsSchema.safeParse(
      request.params,
    )

    if (!success) {
      return response.status(400).send({ error: 'Invalid params.' })
    }

    const { id } = params

    const userId = request.user?.id

    const meal = await knex('meals')
      .where({
        id,
        user_id: userId,
      })
      .first()

    return { meal }
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

  app.delete('/:id', { preHandler: [auth] }, async (request, response) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { success, data: params } = deleteMealParamsSchema.safeParse(
      request.params,
    )

    if (!success) {
      return response.status(400).send({ message: 'Invalid params.' })
    }

    const { id } = params

    const meal = await knex('meals').where({ id })

    if (!meal) {
      return response.status(404).send({ message: 'Could not find meal.' })
    }

    await knex('meals').delete().where({
      id,
    })

    return response.status(200).send()
  })
}
