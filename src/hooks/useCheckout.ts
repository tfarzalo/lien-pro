// =====================================================
// React Query Hooks for Checkout & Stripe
// =====================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createCheckoutSession,
    getCheckoutSession,
    processTestPayment,
    getOrderDetails,
    cancelOrder,
} from '@/services/stripeService'
import { useAuth } from '@/hooks/useAuth'
import type { CreateCheckoutSessionRequest } from '@/types/stripe'

/**
 * Hook to create a Stripe checkout session
 */
export function useCreateCheckoutSession() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: CreateCheckoutSessionRequest) =>
            createCheckoutSession(request),
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['orders'] })
        },
    })
}

/**
 * Hook to get checkout session details
 */
export function useCheckoutSession(sessionId: string | undefined) {
    return useQuery({
        queryKey: ['checkout-session', sessionId],
        queryFn: () => getCheckoutSession(sessionId!),
        enabled: !!sessionId,
    })
}

/**
 * Hook to process test payment (development only)
 */
export function useProcessTestPayment() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: (kitIds: string[]) => processTestPayment(user!.id, kitIds),
        onSuccess: () => {
            // Invalidate all related queries
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['user-kits'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        },
    })
}

/**
 * Hook to get order details
 */
export function useOrderDetails(orderId: string | undefined) {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: () => getOrderDetails(orderId!),
        enabled: !!orderId,
    })
}

/**
 * Hook to cancel an order
 */
export function useCancelOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (orderId: string) => cancelOrder(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
        },
    })
}
