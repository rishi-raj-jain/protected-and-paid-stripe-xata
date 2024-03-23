// File: src/pages/api/sign/up.ts

import { generateId } from 'lucia'
import { lucia } from '@/lucia/index'
import { getXataClient } from '@/xata'
import type { APIContext } from 'astro'
import { Argon2id } from 'oslo/password'

export async function POST({ request, redirect, cookies }: APIContext): Promise<Response> {
  const xata = getXataClient()
  const user_id = generateId(15)
  const formData = await request.formData()
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  const hashed_password = await new Argon2id().hash(password)
  const existingRecord = await xata.db.user.filter({ email }).getFirst()
  if (existingRecord) {
    if (existingRecord.hashed_password !== null) {
      return redirect('/signin')
    } else {
      await xata.db.user.update(existingRecord.id, { user_id, hashed_password })
    }
  } else {
    await xata.db.user.create({ email, user_id, hashed_password })
  }
  const session = await lucia.createSession(user_id, {})
  const sessionCookie = lucia.createSessionCookie(session.id)
  cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  return redirect('/')
}
