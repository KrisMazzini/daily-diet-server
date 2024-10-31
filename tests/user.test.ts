import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'

import { app } from '../src/app'

describe('User routes', () => {
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

  it('should be possible to create a new user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    expect(createUserResponse.status).toBe(201)
  })

  it('should not be possible to create a new user with wrong data', async () => {
    const createUserWithoutNameResponse = await request(app.server)
      .post('/users')
      .send({
        email: 'johndoe@example.com',
      })

    const createUserWithoutEmailResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })

    const createUserWithInvalidNameResponse = await request(app.server)
      .post('/users')
      .send({
        name: 12345,
        email: 'johndoe@example.com',
      })

    const createUserWithInvalidEmailResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoeexample.com',
      })

    expect(createUserWithoutNameResponse.status).toBe(400)
    expect(createUserWithoutEmailResponse.status).toBe(400)
    expect(createUserWithInvalidNameResponse.status).toBe(400)
    expect(createUserWithInvalidEmailResponse.status).toBe(400)
  })

  it('should not be possible to create multiple users with same email', async () => {
    const email = 'anyemail@example.com'

    await request(app.server).post('/users').send({
      name: 'John Doe',
      email,
    })

    const createSecondUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Jane Doe',
        email,
      })

    expect(createSecondUserResponse.status).toBe(400)
  })

  it('should be possible to list users', async () => {
    await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const listUsersResponse = await request(app.server).get('/users').send()

    expect(listUsersResponse.body.users).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'John Doe',
        email: 'johndoe@example.com',
        created_at: expect.any(String),
        session_id: expect.any(String),
      }),
    ])
  })
})
