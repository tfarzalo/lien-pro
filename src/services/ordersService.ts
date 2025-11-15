// =====================================================
// Orders Service
// Data access functions for orders and purchases
// =====================================================

import { supabase } from '@/lib/supabaseClient'
import type {
    Order,
    OrderInsert,
    OrderUpdate,
    OrderItemInsert,
    OrderWithItems,
} from '@/types/database'

/**
 * Generate a unique order number
 */
async function generateOrderNumber(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_order_number')

    if (error || !data) {
        // Fallback to client-side generation
        return `LP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }

    return data
}

/**
 * Create an order from selected lien kits
 */
export async function createOrderFromKitSelection(
    userId: string,
    kitIds: string[]
): Promise<Order> {
    // Fetch kit details
    const { data: kits, error: kitsError } = await supabase
        .from('lien_kits')
        .select('*')
        .in('id', kitIds)

    if (kitsError) {
        throw new Error(kitsError.message)
    }

    if (!kits || kits.length === 0) {
        throw new Error('No valid kits found')
    }

    // Calculate totals
    const subtotal = kits.reduce((sum, kit) => sum + kit.price_cents, 0)
    const tax = Math.round(subtotal * 0.0825) // 8.25% Texas sales tax
    const total = subtotal + tax

    // Generate order number
    const orderNumber = await generateOrderNumber()

    // Create order
    const orderData: OrderInsert = {
        user_id: userId,
        order_number: orderNumber,
        status: 'pending',
        subtotal_cents: subtotal,
        tax_cents: tax,
        total_cents: total,
        currency: 'USD',
    }

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

    if (orderError) {
        throw new Error(orderError.message)
    }

    // Create order items
    const orderItems: OrderItemInsert[] = kits.map(kit => ({
        order_id: order.id,
        lien_kit_id: kit.id,
        quantity: 1,
        unit_price_cents: kit.price_cents,
        total_price_cents: kit.price_cents,
        kit_name: kit.name,
        kit_features: kit.features as any,
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

    if (itemsError) {
        throw new Error(itemsError.message)
    }

    return order
}

/**
 * Get user's orders with items
 */
export async function getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items(
        *,
        lien_kit:lien_kits(*)
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    return data as OrderWithItems[]
}

/**
 * Get a specific order by ID
 */
export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items(
        *,
        lien_kit:lien_kits(*)
      )
    `)
        .eq('id', orderId)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data as OrderWithItems
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_items(
        *,
        lien_kit:lien_kits(*)
      )
    `)
        .eq('order_number', orderNumber)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data as OrderWithItems
}

/**
 * Update order status
 */
export async function updateOrderStatus(
    orderId: string,
    status: Order['status'],
    paymentIntentId?: string
): Promise<Order> {
    const updates: OrderUpdate = {
        status,
        payment_intent_id: paymentIntentId,
    }

    if (status === 'completed') {
        updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

/**
 * Complete an order (mark as paid)
 * This will trigger the database trigger to grant kit access
 */
export async function completeOrder(
    orderId: string,
    paymentIntentId: string
): Promise<Order> {
    return updateOrderStatus(orderId, 'completed', paymentIntentId)
}

/**
 * Cancel/refund an order
 */
export async function refundOrder(orderId: string): Promise<Order> {
    return updateOrderStatus(orderId, 'refunded')
}

/**
 * Get order statistics for user
 */
export async function getUserOrderStats(userId: string): Promise<{
    totalOrders: number
    totalSpentCents: number
    completedOrders: number
    pendingOrders: number
}> {
    const { data, error } = await supabase
        .from('orders')
        .select('status, total_cents')
        .eq('user_id', userId)

    if (error) {
        throw new Error(error.message)
    }

    const stats = {
        totalOrders: data.length,
        totalSpentCents: data
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + o.total_cents, 0),
        completedOrders: data.filter(o => o.status === 'completed').length,
        pendingOrders: data.filter(o => o.status === 'pending').length,
    }

    return stats
}
