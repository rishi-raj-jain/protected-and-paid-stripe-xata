import Stripe from 'stripe'
import type { APIContext } from 'astro'

export async function POST(context: APIContext) {
  const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY
  if (!STRIPE_SECRET_KEY) return new Response(null, { status: 500 })
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_configuration: 'pmc_1O2qH3SE9voLRYpuz5FLmkvn',
    line_items: [
      {
        quantity: 1,
        price_data: {
          unit_amount: 0,
          currency: 'usd',
          product: 'prod_OqWkk7Rz9Yw18f',
        },
      },
    ],
    success_url: 'http://localhost:4321',
  })
  return context.redirect(session.url)
}
