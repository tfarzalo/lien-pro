// =====================================================
// React Query Hooks for Lien Kits
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getAvailableLienKits,
    getLienKitById,
    getLienKitBySlug,
    getPopularLienKits,
    getLienKitsByCategory,
    getUserKits,
    userOwnsKit,
    createLienKit,
    updateLienKit,
} from '@/services/lienKitsService'
import { useAuth } from '@/contexts/AuthContext'
import type { LienKitInsert, LienKitUpdate } from '@/types/database'

// Query keys
export const lienKitKeys = {
    all: ['lien-kits'] as const,
    lists: () => [...lienKitKeys.all, 'list'] as const,
    list: (filters: string) => [...lienKitKeys.lists(), { filters }] as const,
    details: () => [...lienKitKeys.all, 'detail'] as const,
    detail: (id: string) => [...lienKitKeys.details(), id] as const,
    popular: () => [...lienKitKeys.all, 'popular'] as const,
    category: (category: string) => [...lienKitKeys.all, 'category', category] as const,
    userKits: (userId: string) => [...lienKitKeys.all, 'user', userId] as const,
    ownership: (userId: string, kitId: string) => [...lienKitKeys.all, 'ownership', userId, kitId] as const,
}

/**
 * Hook to fetch all available lien kits
 */
export function useLienKits() {
    return useQuery({
        queryKey: lienKitKeys.lists(),
        queryFn: getAvailableLienKits,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to fetch a single lien kit by ID
 */
export function useLienKit(id: string | undefined) {
    return useQuery({
        queryKey: lienKitKeys.detail(id || ''),
        queryFn: () => getLienKitById(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })
}

/**
 * Hook to fetch a lien kit by slug
 */
export function useLienKitBySlug(slug: string | undefined) {
    return useQuery({
        queryKey: [...lienKitKeys.details(), 'slug', slug],
        queryFn: () => getLienKitBySlug(slug!),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
    })
}

/**
 * Hook to fetch popular lien kits
 */
export function usePopularLienKits() {
    return useQuery({
        queryKey: lienKitKeys.popular(),
        queryFn: getPopularLienKits,
        staleTime: 5 * 60 * 1000,
    })
}

/**
 * Hook to fetch lien kits by category
 */
export function useLienKitsByCategory(category: string) {
    return useQuery({
        queryKey: lienKitKeys.category(category),
        queryFn: () => getLienKitsByCategory(category),
        enabled: !!category,
        staleTime: 5 * 60 * 1000,
    })
}

/**
 * Hook to fetch user's owned kits
 */
export function useUserKits() {
    const { user } = useAuth()

    return useQuery({
        queryKey: lienKitKeys.userKits(user?.id || ''),
        queryFn: () => getUserKits(user!.id),
        enabled: !!user?.id,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

/**
 * Hook to check if user owns a specific kit
 */
export function useUserOwnsKit(kitId: string | undefined) {
    const { user } = useAuth()

    return useQuery({
        queryKey: lienKitKeys.ownership(user?.id || '', kitId || ''),
        queryFn: () => userOwnsKit(user!.id, kitId!),
        enabled: !!user?.id && !!kitId,
        staleTime: 2 * 60 * 1000,
    })
}

/**
 * Mutation hook to create a lien kit (admin only)
 */
export function useCreateLienKit() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (kit: LienKitInsert) => createLienKit(kit),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lienKitKeys.lists() })
        },
    })
}

/**
 * Mutation hook to update a lien kit (admin only)
 */
export function useUpdateLienKit() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: LienKitUpdate }) =>
            updateLienKit(id, updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: lienKitKeys.detail(data.id) })
            queryClient.invalidateQueries({ queryKey: lienKitKeys.lists() })
        },
    })
}
