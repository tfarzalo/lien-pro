// =====================================================
// Supabase Edge Function: Create Stripe Checkout Session
// Path: supabase/functions/create-checkout-session/index.ts
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CheckoutRequest {
    kitIds: string[]
    successUrl: string
    cancelUrl: string
    metadata?: Record<string, string>
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { kitIds, successUrl, cancelUrl, metadata }: CheckoutRequest = await req.json()

        // Get Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        // Fetch kit details from Supabase
        const kitsResponse = await fetch(`${supabaseUrl}/rest/v1/lien_kits?id=in.(${kitIds.join(',')})`, {
            headers: {
                apikey: supabaseServiceKey,
                Authorization: `Bearer ${supabaseServiceKey}`,
            },
        })

        if (!kitsResponse.ok) {
            throw new Error('Failed to fetch kit details')
        }

        const kits = await kitsResponse.json()

        // Build line items for Stripe
        const lineItems = kits.map((kit: any) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: kit.name,
                    description: kit.description || undefined,
                },
                unit_amount: kit.price_cents,
            },
            quantity: 1,
        }))

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                ...metadata,
                kitIds: kitIds.join(','),
            },
        })

        return new Response(
            JSON.stringify({
                sessionId: session.id,
                url: session.url,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
