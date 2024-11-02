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
    const createUserReply = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    expect(createUserReply.status).toBe(201)
  })

  it('should not be possible to create a new user with wrong data', async () => {
    const createUserWithoutNameReply = await request(app.server)
      .post('/users')
      .send({
        email: 'johndoe@example.com',
      })

    const createUserWithoutEmailReply = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })

    const createUserWithInvalidNameReply = await request(app.server)
      .post('/users')
      .send({
        name: 12345,
        email: 'johndoe@example.com',
      })

    const createUserWithInvalidEmailReply = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoeexample.com',
      })

    expect(createUserWithoutNameReply.status).toBe(400)
    expect(createUserWithoutEmailReply.status).toBe(400)
    expect(createUserWithInvalidNameReply.status).toBe(400)
    expect(createUserWithInvalidEmailReply.status).toBe(400)
  })

  it('should not be possible to create multiple users with same email', async () => {
    const email = 'anyemail@example.com'

    await request(app.server).post('/users').send({
      name: 'John Doe',
      email,
    })

    const createSecondUserReply = await request(app.server)
      .post('/users')
      .send({
        name: 'Jane Doe',
        email,
      })

    expect(createSecondUserReply.status).toBe(400)
  })

  it('should be possible to get a user by its session id', async () => {
    const createUserReply = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const cookies = createUserReply.get('Set-Cookie') ?? []

    const getUserReply = await request(app.server)
      .get('/users/me')
      .set('Cookie', cookies)
      .send()

    expect(getUserReply.body.user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'John Doe',
        email: 'johndoe@example.com',
        created_at: expect.any(String),
        session_id: expect.any(String),
      }),
    )
  })

  it('should be possible to list users', async () => {
    await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const listUsersReply = await request(app.server).get('/users').send()

    expect(listUsersReply.body.users).toEqual([
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
