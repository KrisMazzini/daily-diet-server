import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { userRoutes } from './routes/users'

export const app = fastify()

app.decorateRequest('user', null)

app.register(cookie)

app.register(userRoutes, {
  prefix: 'users',
})
