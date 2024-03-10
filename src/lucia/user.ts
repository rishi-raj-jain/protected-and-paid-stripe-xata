import { lucia } from '.'
import { getXataClient, type UserRecord } from '@/xata'

export async function getUser(authCookie: string | undefined): Promise<UserRecord | null> {
  if (!authCookie) return null
  const xata = getXataClient()
  const sessionId = lucia.readSessionCookie(authCookie)
  const { user } = await lucia.validateSession(sessionId)
  return await xata.db.user.read(user)
}
