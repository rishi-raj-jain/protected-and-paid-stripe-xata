import { Lucia } from 'lucia'
import { XataAdapter } from './xata'

const adapter = new XataAdapter()

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.PROD,
    },
  },
})

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
  }
}
