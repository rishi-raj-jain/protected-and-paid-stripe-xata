import Stripe from 'stripe'
import { getXataClient } from '@/xata'
import type { APIContext } from 'astro'

// Process rawBody from the request Object
async function getRawBody(request: Request) {
  let chunks = []
  let done = false
  const reader = request.body.getReader()
  while (!done) {
    const { value, done: isDone } = await reader.read()
    if (value) {
      chunks.push(value)
    }
    done = isDone
  }
  const bodyData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
  let offset = 0
  for (const chunk of chunks) {
    bodyData.set(chunk, offset)
    offset += chunk.length
  }
  return Buffer.from(bodyData)
}

// Stripe API Reference
// https://stripe.com/docs/webhooks#webhook-endpoint-def
export async function POST({ request }: APIContext) {
  try {
    const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY
    const STRIPE_WEBHOOK_SIG = import.meta.env.STRIPE_WEBHOOK_SIG
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SIG) return new Response(null, { status: 500 })
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
    const rawBody = await getRawBody(request)
    let event = JSON.parse(rawBody.toString())
    const sig = request.headers.get('stripe-signature')
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SIG)
    } catch (err) {
      console.log(err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      const email = event.data.object?.customer_details?.email
      if (email) {
        const xata = getXataClient()
        const existingRecord = await xata.db.user.filter('email', email).getFirst()
        if (existingRecord) {
          await xata.db.user.update(existingRecord.id, { paid: true })
        } else {
          await xata.db.user.create({ email, paid: true })
        }
        return new Response('marked the user as paid', { status: 200 })
      }
      return new Response('no email of the user is found', { status: 200 })
    }
    return new Response(JSON.stringify(event), { status: 404 })
  } catch (e) {
    return new Response(e.message || e.toString(), { status: 500 })
  }
}
