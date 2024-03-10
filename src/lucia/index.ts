import { Lucia } from 'lucia'
import { XataAdapter } from './xata'

const adapter = new XataAdapter()

interface DatabaseUser {
  id: string
  email: string
  password: string
}

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.PROD,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
    }
  },
})

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: Omit<DatabaseUser, 'id'>
  }
}
