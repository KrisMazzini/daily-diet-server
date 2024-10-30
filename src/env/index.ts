import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
})

const { success, error, data } = envSchema.safeParse(process.env)

if (!success) {
  console.error('⚠️ Invalid environment variables', error.format())

  throw new Error('Invalid environment variables')
}

export const env = data
