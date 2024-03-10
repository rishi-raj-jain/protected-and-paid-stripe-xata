import { lucia } from '@/lucia/index'
import type { APIContext } from 'astro'

export async function GET(context: APIContext): Promise<Response> {
  const sessionCookie = lucia.createBlankSessionCookie()
  context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  return context.redirect('/')
}
