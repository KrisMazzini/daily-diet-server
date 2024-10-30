import fastify from 'fastify'

export const app = fastify()

app.get('/', async () => {
  console.log('Hello, World!')
})
