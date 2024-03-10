import { lucia } from '.'
import type { User } from 'lucia'

export async function getUser(authCookie: string | undefined): Promise<User | null> {
  if (!authCookie) return null
  const sessionId = lucia.readSessionCookie(authCookie)
  const { user } = await lucia.validateSession(sessionId)
  return user
}
