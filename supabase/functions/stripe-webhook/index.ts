// =====================================================
// Supabase Edge Function: Stripe Webhook Handler
// Path: supabase/functions/stripe-webhook/index.ts
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

        // Get Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        const headers = {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session

                // Extract metadata
                const kitIds = session.metadata?.kitIds?.split(',') || []
                const userId = session.metadata?.userId
                const orderNumber = session.metadata?.orderNumber || `ORD-${Date.now()}`

                if (!userId || kitIds.length === 0) {
                    console.error('Missing userId or kitIds in session metadata')
                    break
                }

                // Fetch kit details
                const kitsResponse = await fetch(
                    `${supabaseUrl}/rest/v1/lien_kits?id=in.(${kitIds.join(',')})`,
                    { headers }
                )

                if (!kitsResponse.ok) {
                    throw new Error('Failed to fetch kit details')
                }

                const kits = await kitsResponse.json()
                const totalCents = kits.reduce((sum: number, kit: any) => sum + kit.price_cents, 0)

                // Create order
                const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        user_id: userId,
                        order_number: orderNumber,
                        total_cents: totalCents,
                        status: 'completed',
                        payment_method: 'card',
                        stripe_session_id: session.id,
                        paid_at: new Date().toISOString(),
                        payment_metadata: {
                            stripe_payment_intent: session.payment_intent,
                            customer_email: session.customer_email,
                        },
                    }),
                })

                if (!orderResponse.ok) {
                    throw new Error('Failed to create order')
                }

                const orders = await orderResponse.json()
                const order = orders[0]

                // Create order items
                const orderItems = kits.map((kit: any) => ({
                    order_id: order.id,
                    lien_kit_id: kit.id,
                    unit_price_cents: kit.price_cents,
                    total_price_cents: kit.price_cents,
                    kit_name: kit.name,
                    kit_features: kit.features,
                    quantity: 1,
                }))

                await fetch(`${supabaseUrl}/rest/v1/order_items`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(orderItems),
                })

                // Grant kit access to user
                const userKits = kits.map((kit: any) => ({
                    user_id: userId,
                    lien_kit_id: kit.id,
                    access_type: 'purchased',
                    purchase_date: new Date().toISOString(),
                }))

                await fetch(`${supabaseUrl}/rest/v1/user_kits`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(userKits),
                })

                console.log(`Order ${orderNumber} created successfully for user ${userId}`)
                break
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent
                console.error('Payment failed:', paymentIntent.id)
                // Handle failed payment (e.g., update order status, notify user)
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error('Webhook error:', error)
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Webhook handler failed',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
