// =====================================================
// Stripe Service
// Handles Stripe Checkout Sessions and Payments
// =====================================================

import { supabase } from '@/lib/supabaseClient'
import type {
    CreateCheckoutSessionRequest,
    CreateCheckoutSessionResponse,
    PaymentMetadata,
} from '@/types/stripe'
import type { LienKit, Order } from '@/types/database'

const STRIPE_API_URL = import.meta.env.VITE_STRIPE_API_URL || '/api/stripe'

/**
 * Create a Stripe Checkout session
 */
export async function createCheckoutSession(
    request: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> {
    const response = await fetch(`${STRIPE_API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create checkout session')
    }

    return response.json()
}

/**
 * Get checkout session status
 */
export async function getCheckoutSession(sessionId: string): Promise<any> {
    const response = await fetch(`${STRIPE_API_URL}/checkout-session/${sessionId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error('Failed to get checkout session')
    }

    return response.json()
}

/**
 * Create order from checkout session (called after successful payment)
 */
export async function createOrderFromCheckout(
    userId: string,
    sessionId: string,
    metadata: PaymentMetadata
): Promise<Order> {
    // Get kit details
    const { data: kits, error: kitsError } = await supabase
        .from('lien_kits')
        .select('*')
        .in('id', metadata.kitIds)

    if (kitsError) throw kitsError

    const totalCents = kits?.reduce((sum: number, kit: LienKit) => sum + kit.price_cents, 0) || 0

    // Create order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: userId,
            order_number: metadata.orderNumber,
            total_cents: totalCents,
            status: 'completed',
            payment_method: 'card',
            stripe_session_id: sessionId,
            paid_at: new Date().toISOString(),
        })
        .select()
        .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = kits?.map((kit: LienKit) => ({
        order_id: order.id,
        lien_kit_id: kit.id,
        unit_price_cents: kit.price_cents,
        total_price_cents: kit.price_cents,
        kit_name: kit.name,
        kit_features: kit.features,
        quantity: 1,
    })) || []

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

    if (itemsError) throw itemsError

    // Grant kit access to user
    const userKits = kits?.map((kit: LienKit) => ({
        user_id: userId,
        lien_kit_id: kit.id,
        access_type: 'purchased' as const,
        purchase_date: new Date().toISOString(),
    })) || []

    const { error: userKitsError } = await supabase
        .from('user_kits')
        .insert(userKits)

    if (userKitsError) throw userKitsError

    return order
}

/**
 * Test payment processing (for development)
 * Simulates successful payment without actually calling Stripe
 */
export async function processTestPayment(
    userId: string,
    kitIds: string[]
): Promise<Order> {
    // Get kit details
    const { data: kits, error: kitsError } = await supabase
        .from('lien_kits')
        .select('*')
        .in('id', kitIds)

    if (kitsError) throw kitsError

    const totalCents = kits?.reduce((sum: number, kit: LienKit) => sum + kit.price_cents, 0) || 0

    // Generate test order number
    const orderNumber = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: userId,
            order_number: orderNumber,
            total_cents: totalCents,
            status: 'completed',
            payment_method: 'card',
            stripe_session_id: `test_session_${Date.now()}`,
            paid_at: new Date().toISOString(),
            payment_metadata: {
                test: true,
                processed_at: new Date().toISOString(),
            },
        })
        .select()
        .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = kits?.map((kit: LienKit) => ({
        order_id: order.id,
        lien_kit_id: kit.id,
        unit_price_cents: kit.price_cents,
        total_price_cents: kit.price_cents,
        kit_name: kit.name,
        kit_features: kit.features,
        quantity: 1,
    })) || []

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

    if (itemsError) throw itemsError

    // Grant kit access to user
    const userKits = kits?.map((kit: LienKit) => ({
        user_id: userId,
        lien_kit_id: kit.id,
        access_type: 'purchased' as const,
        purchase_date: new Date().toISOString(),
    })) || []

    const { error: userKitsError } = await supabase
        .from('user_kits')
        .insert(userKits)

    if (userKitsError) throw userKitsError

    return order
}

/**
 * Get order details with items and kits
 */
export async function getOrderDetails(orderId: string) {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (
        *,
        lien_kit:lien_kits (*)
      )
    `)
        .eq('id', orderId)
        .single()

    if (error) throw error
    return data
}

/**
 * Cancel pending order
 */
export async function cancelOrder(orderId: string): Promise<void> {
    const { error } = await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', orderId)
        .eq('status', 'pending')

    if (error) throw error
}
