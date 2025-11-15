// =====================================================
// Lien Kits Service
// Data access functions for lien kits
// =====================================================

import { supabase } from '@/lib/supabaseClient'
import type {
    LienKit,
    LienKitInsert,
    LienKitUpdate,
    UserKitWithKit,
} from '@/types/database'

/**
 * Get all available (active) lien kits
 */
export async function getAvailableLienKits(): Promise<LienKit[]> {
    const { data, error } = await supabase
        .from('lien_kits')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return data || []
}

/**
 * Get a single lien kit by ID
 */
export async function getLienKitById(id: string): Promise<LienKit | null> {
    const { data, error } = await supabase
        .from('lien_kits')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

/**
 * Get a single lien kit by slug
 */
export async function getLienKitBySlug(slug: string): Promise<LienKit | null> {
    const { data, error } = await supabase
        .from('lien_kits')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

/**
 * Get popular lien kits
 */
export async function getPopularLienKits(): Promise<LienKit[]> {
    const { data, error } = await supabase
        .from('lien_kits')
        .select('*')
        .eq('is_active', true)
        .eq('is_popular', true)
        .order('sort_order', { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return data || []
}

/**
 * Get lien kits by category
 */
export async function getLienKitsByCategory(category: string): Promise<LienKit[]> {
    const { data, error } = await supabase
        .from('lien_kits')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return data || []
}

/**
 * Get user's owned/purchased kits
 */
export async function getUserKits(userId: string): Promise<UserKitWithKit[]> {
    const { data, error } = await supabase
        .from('user_kits')
        .select(`
      *,
      lien_kit:lien_kits(*)
    `)
        .eq('user_id', userId)
        .eq('is_active', true)

    if (error) {
        throw new Error(error.message)
    }

    return data as UserKitWithKit[]
}

/**
 * Check if user owns a specific kit
 */
export async function userOwnsKit(userId: string, kitId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('user_kits')
        .select('id')
        .eq('user_id', userId)
        .eq('lien_kit_id', kitId)
        .eq('is_active', true)
        .single()

    return !error && !!data
}

/**
 * Admin: Create a new lien kit
 */
export async function createLienKit(kit: LienKitInsert): Promise<LienKit> {
    const { data, error } = await supabase
        .from('lien_kits')
        .insert(kit)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

/**
 * Admin: Update a lien kit
 */
export async function updateLienKit(id: string, updates: LienKitUpdate): Promise<LienKit> {
    const { data, error } = await supabase
        .from('lien_kits')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}
