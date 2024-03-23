// File: src/pages/api/sign/in.ts

import { lucia } from '@/lucia/index'
import { getXataClient } from '@/xata'
import type { APIContext } from 'astro'
import { Argon2id } from 'oslo/password'

export async function POST({ request, cookies, redirect }: APIContext): Promise<Response> {
  const xata = getXataClient()
  const formData = await request.formData()
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  const existingRecord = await xata.db.user.filter({ email }).getFirst()
  if (!existingRecord) return new Response('Incorrect email or password', { status: 400 })
  const validPassword = await new Argon2id().verify(existingRecord.hashed_password, password)
  if (!validPassword) return new Response('Incorrect email or password', { status: 400 })
  const session = await lucia.createSession(existingRecord.user_id, {})
  const sessionCookie = lucia.createSessionCookie(session.id)
  cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  return redirect('/')
}
