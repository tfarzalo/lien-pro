import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'user' | 'admin' | 'attorney'

interface AdminAuthState {
  user: User | null
  role: UserRole | null
  isAdmin: boolean
  isAttorney: boolean
  loading: boolean
}

/**
 * Hook for admin/attorney authentication and role checking
 * Extends the base auth hook with role-based permissions
 */
export function useAdminAuth(): AdminAuthState {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          // Fetch user role from profiles table
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single()

          if (error) {
            console.error('Error fetching user role:', error)
            setRole('user') // Default to user role
          } else {
            setRole((profile?.role as UserRole) || 'user')
          }
        } else {
          setRole(null)
        }
      } catch (error) {
        console.error('Error loading user role:', error)
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    loadUserRole()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        // Reload role when user changes
        loadUserRole()
      } else {
        setRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    role,
    isAdmin: role === 'admin',
    isAttorney: role === 'admin' || role === 'attorney',
    loading,
  }
}
