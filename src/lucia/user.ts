import { lucia } from '.'
import type { User } from 'lucia'
import type { AstroCookies } from 'astro'

export function getSessionID(cookies: AstroCookies): string | null {
  const auth_session = cookies.get('auth_session')
  if (!auth_session) return null
  return lucia.readSessionCookie(`auth_session=${auth_session.value}`)
}

export async function getUser(cookies: AstroCookies): Promise<User | null> {
  const session_id = lucia.readSessionCookie(getSessionID(cookies))
  const { user } = await lucia.validateSession(session_id)
  return user
}
