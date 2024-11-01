import { knex } from '../database'

interface GetUserBySessionIdProps {
  sessionId: string
}

export async function getUserBySessionId({
  sessionId,
}: GetUserBySessionIdProps) {
  const user = await knex('users').where({ session_id: sessionId }).first()

  return { user }
}
