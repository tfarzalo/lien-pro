# Data Access Layer Documentation

This document explains the typed data access layer architecture for the Lien Professor App, including TypeScript types, service functions, and React Query hooks.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [TypeScript Types](#typescript-types)
3. [Service Layer](#service-layer)
4. [React Query Hooks](#react-query-hooks)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

---

## Architecture Overview

The data access layer follows a three-tier architecture:

```
┌─────────────────────┐
│   React Components  │  ← UI Layer
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  React Query Hooks  │  ← Data Fetching & Caching Layer
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Service Functions  │  ← Business Logic Layer
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Supabase Client    │  ← Database Access Layer
└─────────────────────┘
```

### Key Benefits

- **Type Safety**: Full TypeScript coverage from database to UI
- **Separation of Concerns**: Each layer has a clear responsibility
- **Caching & Performance**: React Query handles caching, refetching, and optimistic updates
- **Reusability**: Services and hooks can be used across multiple components
- **Testability**: Each layer can be tested independently

---

## TypeScript Types

All database types are defined in `/src/types/database.ts` and match the Supabase schema exactly.

### Core Types

```typescript
// Enums
export type UserRole = 'user' | 'attorney' | 'admin'
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type KitCategory = 'residential' | 'commercial' | 'subcontractor' | 'specialty'
export type ProjectStatus = 'draft' | 'active' | 'lien_filed' | 'resolved' | 'closed'
export type DeadlinePriority = 'low' | 'medium' | 'high' | 'critical'

// Main Entities
export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  subscription_status: SubscriptionStatus
  subscription_tier: SubscriptionTier
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface LienKit {
  id: string
  name: string
  description: string | null
  price_cents: number
  category: KitCategory
  features: string[] | null
  is_popular: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  total_cents: number
  status: OrderStatus
  payment_method: PaymentMethod | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  project_type: ProjectType
  status: ProjectStatus
  property_address: string
  property_owner_name: string | null
  contract_amount_cents: number | null
  start_date: string | null
  created_at: string
  updated_at: string
}

export interface Assessment {
  id: string
  user_id: string
  project_id: string | null
  status: AssessmentStatus
  score: number | null
  result_data: Json | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Deadline {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string | null
  due_date: string
  deadline_type: DeadlineType
  priority: DeadlinePriority
  status: DeadlineStatus
  completed_at: string | null
  created_at: string
  updated_at: string
}
```

### Extended Types with Relations

```typescript
// User Kit with related Lien Kit data
export interface UserKitWithKit extends UserKit {
  lien_kit: LienKit
}

// Order with related items
export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

// Project with related data
export interface ProjectWithDeadlines extends Project {
  deadlines: Deadline[]
}
```

---

## Service Layer

Service functions handle all direct database interactions and business logic. Located in `/src/services/`.

### Lien Kits Service (`lienKitsService.ts`)

```typescript
import { supabase } from '@/lib/supabaseClient'
import type { LienKit, UserKit, UserKitWithKit } from '@/types/database'

// Get all active lien kits
export async function getAvailableLienKits(): Promise<LienKit[]> {
  const { data, error } = await supabase
    .from('lien_kits')
    .select('*')
    .eq('is_active', true)
    .order('is_popular', { ascending: false })
    .order('price_cents', { ascending: true })

  if (error) throw error
  return data || []
}

// Get user's owned kits with kit details
export async function getUserLienKits(userId: string): Promise<UserKitWithKit[]> {
  const { data, error } = await supabase
    .from('user_kits')
    .select(`
      *,
      lien_kit:lien_kits(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as UserKitWithKit[] || []
}
```

### Assessments Service (`assessmentsService.ts`)

```typescript
import { supabase } from '@/lib/supabaseClient'
import type { Assessment, AssessmentAnswer, AssessmentInsert } from '@/types/database'

// Create new assessment
export async function createAssessment(
  userId: string,
  projectId?: string
): Promise<Assessment> {
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
      project_id: projectId || null,
      status: 'in_progress',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Save assessment answer
export async function saveAssessmentAnswer(
  assessmentId: string,
  questionKey: string,
  answerValue: any
): Promise<AssessmentAnswer> {
  const { data, error } = await supabase
    .from('assessment_answers')
    .upsert({
      assessment_id: assessmentId,
      question_key: questionKey,
      answer_value: answerValue,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Complete assessment and calculate result
export async function completeAssessment(
  assessmentId: string
): Promise<Assessment> {
  // Get all answers
  const { data: answers, error: answersError } = await supabase
    .from('assessment_answers')
    .select('*')
    .eq('assessment_id', assessmentId)

  if (answersError) throw answersError

  // Calculate score (example logic)
  const score = calculateScore(answers || [])

  // Update assessment
  const { data, error } = await supabase
    .from('assessments')
    .update({
      status: 'completed',
      score,
      completed_at: new Date().toISOString(),
    })
    .eq('id', assessmentId)
    .select()
    .single()

  if (error) throw error
  return data
}

function calculateScore(answers: AssessmentAnswer[]): number {
  // Implement your scoring logic here
  return answers.length * 10
}
```

### Orders Service (`ordersService.ts`)

```typescript
import { supabase } from '@/lib/supabaseClient'
import type { Order, OrderInsert, OrderItem, OrderWithItems } from '@/types/database'

// Create order from kit selection
export async function createOrderFromKitSelection(
  userId: string,
  kitIds: string[]
): Promise<OrderWithItems> {
  // Get kit prices
  const { data: kits, error: kitsError } = await supabase
    .from('lien_kits')
    .select('id, price_cents')
    .in('id', kitIds)

  if (kitsError) throw kitsError

  const totalCents = kits?.reduce((sum, kit) => sum + kit.price_cents, 0) || 0

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      order_number: orderNumber,
      total_cents: totalCents,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Create order items
  const orderItems = kits?.map(kit => ({
    order_id: order.id,
    lien_kit_id: kit.id,
    price_cents: kit.price_cents,
    quantity: 1,
  })) || []

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select()

  if (itemsError) throw itemsError

  return {
    ...order,
    order_items: items || [],
  }
}

// Get user orders
export async function getUserOrders(userId: string): Promise<OrderWithItems[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as OrderWithItems[] || []
}
```

### Dashboard Service (`dashboardService.ts`)

```typescript
import { supabase } from '@/lib/supabaseClient'
import type { Profile, Project, Deadline, UserKitWithKit, Order } from '@/types/database'

export interface DashboardData {
  user: Profile | null
  activeProjects: Project[]
  upcomingDeadlines: Deadline[]
  ownedKits: UserKitWithKit[]
  recentOrders: Order[]
}

export interface DashboardStats {
  activeProjects: number
  upcomingDeadlines: number
  ownedKits: number
  completedAssessments: number
}

// Get comprehensive dashboard data
export async function getUserDashboardData(userId: string): Promise<DashboardData> {
  // Fetch all data in parallel
  const [userRes, projectsRes, deadlinesRes, kitsRes, ordersRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['draft', 'active', 'lien_filed'])
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('deadlines')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(5),
    supabase
      .from('user_kits')
      .select('*, lien_kit:lien_kits(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  return {
    user: userRes.data || null,
    activeProjects: projectsRes.data || [],
    upcomingDeadlines: deadlinesRes.data || [],
    ownedKits: (kitsRes.data as UserKitWithKit[]) || [],
    recentOrders: ordersRes.data || [],
  }
}

// Get dashboard statistics
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [projectsCount, deadlinesCount, kitsCount, assessmentsCount] = await Promise.all([
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['active', 'lien_filed']),
    supabase
      .from('deadlines')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('due_date', new Date().toISOString())
      .lte('due_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('user_kits')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('assessments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed'),
  ])

  return {
    activeProjects: projectsCount.count || 0,
    upcomingDeadlines: deadlinesCount.count || 0,
    ownedKits: kitsCount.count || 0,
    completedAssessments: assessmentsCount.count || 0,
  }
}
```

---

## React Query Hooks

React Query hooks wrap service functions and provide caching, automatic refetching, and loading/error states. Located in `/src/hooks/`.

### Lien Kits Hooks (`useLienKits.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAvailableLienKits, getUserLienKits } from '@/services/lienKitsService'
import { useAuth } from '@/hooks/useAuth'

// Get available lien kits
export function useLienKits() {
  return useQuery({
    queryKey: ['lien-kits'],
    queryFn: getAvailableLienKits,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get user's owned kits
export function useUserLienKits() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-kits', user?.id],
    queryFn: () => getUserLienKits(user!.id),
    enabled: !!user?.id,
  })
}
```

### Assessment Hooks (`useAssessments.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createAssessment,
  getAssessmentById,
  saveAssessmentAnswer,
  completeAssessment,
} from '@/services/assessmentsService'
import { useAuth } from '@/hooks/useAuth'

// Create new assessment
export function useCreateAssessment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (projectId?: string) => createAssessment(user!.id, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}

// Get assessment by ID
export function useAssessment(assessmentId: string | undefined) {
  return useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => getAssessmentById(assessmentId!),
    enabled: !!assessmentId,
  })
}

// Save assessment answer
export function useSaveAssessmentAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      assessmentId,
      questionKey,
      answerValue,
    }: {
      assessmentId: string
      questionKey: string
      answerValue: any
    }) => saveAssessmentAnswer(assessmentId, questionKey, answerValue),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assessment', variables.assessmentId] })
    },
  })
}

// Complete assessment
export function useCompleteAssessment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assessmentId: string) => completeAssessment(assessmentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assessment', data.id] })
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}
```

### Orders Hooks (`useOrders.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createOrderFromKitSelection, getUserOrders } from '@/services/ordersService'
import { useAuth } from '@/hooks/useAuth'

// Get user orders
export function useUserOrders() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => getUserOrders(user!.id),
    enabled: !!user?.id,
  })
}

// Create order from kit selection
export function useCreateOrder() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (kitIds: string[]) => createOrderFromKitSelection(user!.id, kitIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['user-kits'] })
    },
  })
}
```

### Dashboard Hooks (`useDashboard.ts`)

```typescript
import { useQuery } from '@tanstack/react-query'
import { getUserDashboardData, getDashboardStats, getRecentActivity } from '@/services/dashboardService'
import { useAuth } from '@/hooks/useAuth'

// Get full dashboard data
export function useDashboard() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: () => getUserDashboardData(user!.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get dashboard statistics
export function useDashboardStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: () => getDashboardStats(user!.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  })
}

// Get recent activity
export function useRecentActivity(limit: number = 10) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['recent-activity', user?.id, limit],
    queryFn: () => getRecentActivity(user!.id, limit),
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
```

---

## Usage Examples

### Example 1: Display Available Lien Kits

```tsx
import { useLienKits } from '@/hooks/useLienKits'
import { KitCard } from '@/components/ui/SpecializedCards'

export function LienKitsPage() {
  const { data: kits, isLoading, error } = useLienKits()

  if (isLoading) return <div>Loading kits...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kits?.map((kit) => (
        <KitCard
          key={kit.id}
          title={kit.name}
          description={kit.description || ''}
          price={kit.price_cents}
          features={kit.features || []}
          popular={kit.is_popular}
          onSelect={() => handleSelectKit(kit.id)}
        />
      ))}
    </div>
  )
}
```

### Example 2: Create and Complete Assessment

```tsx
import { useCreateAssessment, useSaveAssessmentAnswer, useCompleteAssessment } from '@/hooks/useAssessments'
import { useState } from 'react'

export function AssessmentFlow() {
  const [assessmentId, setAssessmentId] = useState<string>()
  
  const createMutation = useCreateAssessment()
  const saveMutation = useSaveAssessmentAnswer()
  const completeMutation = useCompleteAssessment()

  const startAssessment = async () => {
    const assessment = await createMutation.mutateAsync()
    setAssessmentId(assessment.id)
  }

  const saveAnswer = async (questionKey: string, value: any) => {
    if (!assessmentId) return
    await saveMutation.mutateAsync({
      assessmentId,
      questionKey,
      answerValue: value,
    })
  }

  const finishAssessment = async () => {
    if (!assessmentId) return
    const result = await completeMutation.mutateAsync(assessmentId)
    console.log('Assessment completed:', result)
  }

  return (
    <div>
      <button onClick={startAssessment}>Start Assessment</button>
      {/* Assessment form fields */}
      <button onClick={finishAssessment}>Complete Assessment</button>
    </div>
  )
}
```

### Example 3: Dashboard with All Data

```tsx
import { useDashboard, useDashboardStats } from '@/hooks/useDashboard'
import { Card } from '@/components/ui/Card'

export function DashboardPage() {
  const { data: dashboardData, isLoading } = useDashboard()
  const { data: stats } = useDashboardStats()

  if (isLoading) return <div>Loading dashboard...</div>

  const { user, activeProjects, upcomingDeadlines, ownedKits } = dashboardData || {}

  return (
    <div>
      <h1>Welcome, {user?.full_name}!</h1>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Active Projects" value={stats?.activeProjects || 0} />
        <StatCard title="Deadlines" value={stats?.upcomingDeadlines || 0} />
        <StatCard title="Owned Kits" value={stats?.ownedKits || 0} />
        <StatCard title="Assessments" value={stats?.completedAssessments || 0} />
      </div>

      {/* Projects */}
      <section>
        <h2>Active Projects</h2>
        {activeProjects?.map((project) => (
          <Card key={project.id}>
            <h3>{project.name}</h3>
            <p>{project.property_address}</p>
          </Card>
        ))}
      </section>

      {/* Deadlines */}
      <section>
        <h2>Upcoming Deadlines</h2>
        {upcomingDeadlines?.map((deadline) => (
          <Card key={deadline.id}>
            <h3>{deadline.title}</h3>
            <p>Due: {new Date(deadline.due_date).toLocaleDateString()}</p>
          </Card>
        ))}
      </section>
    </div>
  )
}
```

### Example 4: Create Order from Cart

```tsx
import { useCreateOrder } from '@/hooks/useOrders'
import { useState } from 'react'

export function CheckoutPage() {
  const [selectedKits, setSelectedKits] = useState<string[]>([])
  const createOrder = useCreateOrder()

  const handleCheckout = async () => {
    try {
      const order = await createOrder.mutateAsync(selectedKits)
      console.log('Order created:', order)
      // Redirect to payment or success page
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }

  return (
    <div>
      {/* Kit selection UI */}
      <button
        onClick={handleCheckout}
        disabled={createOrder.isPending}
      >
        {createOrder.isPending ? 'Processing...' : 'Complete Purchase'}
      </button>
    </div>
  )
}
```

---

## Best Practices

### 1. **Always Use Hooks in Components**

✅ **Good:**
```tsx
export function MyComponent() {
  const { data, isLoading, error } = useLienKits()
  // Use data in component
}
```

❌ **Bad:**
```tsx
export function MyComponent() {
  const [data, setData] = useState([])
  useEffect(() => {
    getAvailableLienKits().then(setData) // Don't call service directly
  }, [])
}
```

### 2. **Handle Loading and Error States**

✅ **Good:**
```tsx
const { data, isLoading, error } = useDashboard()

if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
if (!data) return <EmptyState />

return <DashboardContent data={data} />
```

### 3. **Use Query Keys Consistently**

```tsx
// Always use the same query key structure
queryKey: ['entity', 'action', ...params]

// Examples:
queryKey: ['lien-kits']
queryKey: ['user-kits', userId]
queryKey: ['assessment', assessmentId]
queryKey: ['dashboard', userId]
```

### 4. **Invalidate Related Queries After Mutations**

```tsx
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrderFromKitSelection,
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['user-kits'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
```

### 5. **Set Appropriate Stale Times**

```tsx
// Frequent updates: 1-2 minutes
queryKey: ['dashboard'],
staleTime: 2 * 60 * 1000

// Infrequent updates: 5-10 minutes
queryKey: ['lien-kits'],
staleTime: 5 * 60 * 1000

// Static data: 30 minutes or more
queryKey: ['settings'],
staleTime: 30 * 60 * 1000
```

### 6. **Enable Queries Conditionally**

```tsx
// Only fetch when we have required data
useQuery({
  queryKey: ['user-orders', userId],
  queryFn: () => getUserOrders(userId!),
  enabled: !!userId, // Don't run if userId is undefined
})
```

### 7. **Type Safety Everywhere**

```tsx
// Always use proper TypeScript types
export async function createOrder(
  userId: string,
  kitIds: string[]
): Promise<OrderWithItems> {
  // Function implementation
}

// Use type inference in hooks
const { data } = useUserOrders() // data is typed as OrderWithItems[]
```

### 8. **Error Handling**

```tsx
// Service layer: Throw errors
export async function getKits(): Promise<LienKit[]> {
  const { data, error } = await supabase.from('lien_kits').select('*')
  if (error) throw error // Let React Query handle it
  return data
}

// Component layer: Display errors
const { error } = useLienKits()
if (error) {
  return <Alert variant="danger">{error.message}</Alert>
}
```

---

## Testing

### Testing Service Functions

```typescript
import { describe, it, expect, vi } from 'vitest'
import { getAvailableLienKits } from './lienKitsService'
import { supabase } from '@/lib/supabaseClient'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }
}))

describe('lienKitsService', () => {
  it('should fetch available lien kits', async () => {
    const kits = await getAvailableLienKits()
    expect(Array.isArray(kits)).toBe(true)
  })
})
```

### Testing React Query Hooks

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLienKits } from './useLienKits'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('useLienKits', () => {
  it('should fetch lien kits', async () => {
    const { result } = renderHook(() => useLienKits(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })
})
```

---

## Summary

The Lien Professor App uses a clean, type-safe data access layer that:

1. **Separates concerns** across types, services, and hooks
2. **Provides full TypeScript coverage** from database to UI
3. **Leverages React Query** for optimal data fetching and caching
4. **Follows best practices** for maintainability and scalability
5. **Makes testing easy** with clear boundaries between layers

All database tables have corresponding:
- TypeScript types in `/src/types/database.ts`
- Service functions in `/src/services/`
- React Query hooks in `/src/hooks/`

Use the examples in this document as templates for building new features.
