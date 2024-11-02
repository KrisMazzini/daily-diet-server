import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'

import { app } from '../src/app'

describe('Meal routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  afterAll(async () => {
    execSync('npm run knex migrate:rollback --all')
    await app.close()
  })

  it('should be possible to create a meal', async () => {
    const createUserReply = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const cookies = createUserReply.get('Set-Cookie') ?? []

    const createMealReply = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Lunch',
        description: 'Rice, beans and beef',
        partOfDiet: true,
        date: '2024-12-01T12:00:00.000Z',
      })

    expect(createMealReply.status).toBe(201)
  })

  it('should not be possible to create a meal without a user', async () => {
    const createMealReply = await request(app.server).post('/meals').send({
      name: 'Lunch',
      description: 'Rice, beans and beef',
      partOfDiet: true,
      date: '2024-12-01T12:00:00.000Z',
    })

    expect(createMealReply.status).toBe(401)
  })

  it('should be possible to list all user meals', async () => {
    const createUserReply = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const cookies = createUserReply.get('Set-Cookie') ?? []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Lunch',
      description: 'Rice, beans and beef',
      partOfDiet: true,
      date: '2024-12-01T12:00:00.000Z',
    })

    const listMealsReply = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(listMealsReply.body.meals).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'Lunch',
        description: 'Rice, beans and beef',
        part_of_diet: 1,
        date: '2024-12-01T12:00:00.000Z',
      }),
    ])
  })

  it('should be possible to get a specific meal', async () => {
    const createUserReply = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const cookies = createUserReply.get('Set-Cookie') ?? []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Lunch',
      description: 'Rice, beans and beef',
      partOfDiet: true,
      date: '2024-12-01T12:00:00.000Z',
    })

    const listMealsReply = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMealsReply.body.meals[0].id

    const getMealReply = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(getMealReply.body.meal).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Lunch',
        description: 'Rice, beans and beef',
        part_of_diet: 1,
        date: '2024-12-01T12:00:00.000Z',
      }),
    )
  })

  it('should be possible to delete a meal', async () => {
    const createUserReply = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const cookies = createUserReply.get('Set-Cookie') ?? []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Lunch',
      description: 'Rice, beans and beef',
      partOfDiet: true,
      date: '2024-12-01T12:00:00.000Z',
    })

    const listMealsReply = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMealsReply.body.meals[0].id

    const deleteMealReply = await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)

    const getMealReply = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(deleteMealReply.status).toBe(200)
    expect(getMealReply.body.meal).toBe(null)
  })
})
