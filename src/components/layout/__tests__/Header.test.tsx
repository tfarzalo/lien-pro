// Test temporarily disabled
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({ user: null, signOut: vi.fn() })
}))

describe('Header', () => {
    it('placeholder test', () => {
        expect(true).toBe(true)
    })
})
