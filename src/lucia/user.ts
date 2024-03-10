import { lucia } from '.'
import type { User } from 'lucia'
import { getXataClient, type UserRecord } from '@/xata'

export async function getUser(authCookie: string | undefined): Promise<User | null> {
  if (!authCookie) return null
  const sessionId = lucia.readSessionCookie(authCookie)
  const { user } = await lucia.validateSession(sessionId)
  return user
}

export async function getUserWithData(authCookie: string | undefined): Promise<UserRecord | null> {
  if (!authCookie) return null
  const xata = getXataClient()
  const sessionId = lucia.readSessionCookie(authCookie)
  const { user } = await lucia.validateSession(sessionId)
  return await xata.db.user.read(user)
}
