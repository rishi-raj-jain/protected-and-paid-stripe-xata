import { lucia } from '.'
import type { User } from 'lucia'
import type { AstroCookies } from 'astro'
import { getXataClient, type UserRecord } from '@/xata'

export async function getUser(cookies: AstroCookies): Promise<User | null> {
  const auth_session = cookies.get('auth_session')
  if (!auth_session) return null
  const session_id = lucia.readSessionCookie(auth_session.value)
  const { user } = await lucia.validateSession(session_id)
  return user
}

export async function getUserWithData(cookies: AstroCookies): Promise<UserRecord | null> {
  const auth_session = cookies.get('auth_session')
  if (!auth_session) return null
  const xata = getXataClient()
  const session_id = lucia.readSessionCookie(auth_session.value)
  const { user } = await lucia.validateSession(session_id)
  return await xata.db.user.read(user)
}
