// =====================================================
// React Query Hooks for Orders
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    createOrderFromKitSelection,
    getUserOrders,
    getOrderById,
    getOrderByNumber,
    completeOrder,
    refundOrder,
    getUserOrderStats,
} from '@/services/ordersService'
import { useAuth } from '@/contexts/AuthContext'

// Query keys
export const orderKeys = {
    all: ['orders'] as const,
    lists: () => [...orderKeys.all, 'list'] as const,
    list: (userId: string) => [...orderKeys.lists(), userId] as const,
    details: () => [...orderKeys.all, 'detail'] as const,
    detail: (id: string) => [...orderKeys.details(), id] as const,
    byNumber: (orderNumber: string) => [...orderKeys.all, 'number', orderNumber] as const,
    stats: (userId: string) => [...orderKeys.all, 'stats', userId] as const,
}

/**
 * Hook to fetch user's orders
 */
export function useUserOrders() {
    const { user } = useAuth()

    return useQuery({
        queryKey: orderKeys.list(user?.id || ''),
        queryFn: () => getUserOrders(user!.id),
        enabled: !!user?.id,
    })
}

/**
 * Hook to fetch a specific order by ID
 */
export function useOrder(orderId: string | undefined) {
    return useQuery({
        queryKey: orderKeys.detail(orderId || ''),
        queryFn: () => getOrderById(orderId!),
        enabled: !!orderId,
    })
}

/**
 * Hook to fetch an order by order number
 */
export function useOrderByNumber(orderNumber: string | undefined) {
    return useQuery({
        queryKey: orderKeys.byNumber(orderNumber || ''),
        queryFn: () => getOrderByNumber(orderNumber!),
        enabled: !!orderNumber,
    })
}

/**
 * Hook to fetch user's order statistics
 */
export function useUserOrderStats() {
    const { user } = useAuth()

    return useQuery({
        queryKey: orderKeys.stats(user?.id || ''),
        queryFn: () => getUserOrderStats(user!.id),
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Mutation hook to create an order from kit selection
 */
export function useCreateOrder() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: (kitIds: string[]) => createOrderFromKitSelection(user!.id, kitIds),
        onSuccess: () => {
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: orderKeys.list(user.id) })
                queryClient.invalidateQueries({ queryKey: orderKeys.stats(user.id) })
            }
        },
    })
}

/**
 * Mutation hook to complete an order (mark as paid)
 */
export function useCompleteOrder() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: ({ orderId, paymentIntentId }: { orderId: string; paymentIntentId: string }) =>
            completeOrder(orderId, paymentIntentId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) })
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: orderKeys.list(user.id) })
                queryClient.invalidateQueries({ queryKey: orderKeys.stats(user.id) })
                // Also invalidate user kits since completing an order grants kit access
                queryClient.invalidateQueries({ queryKey: ['lien-kits', 'user', user.id] })
            }
        },
    })
}

/**
 * Mutation hook to refund an order
 */
export function useRefundOrder() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: (orderId: string) => refundOrder(orderId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) })
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: orderKeys.list(user.id) })
                queryClient.invalidateQueries({ queryKey: orderKeys.stats(user.id) })
            }
        },
    })
}
