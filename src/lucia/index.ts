import { Lucia } from 'lucia'
import { XataAdapter } from './xata'

const adapter = new XataAdapter()

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.PROD,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      paid: attributes.paid,
      email: attributes.email,
    }
  },
})

interface DatabaseUserAttributes {
  email: string
  paid: boolean | null
}

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}
