# Data Access Cheat Sheet

Quick reference for common data access patterns in the Lien Professor App.

## 🎯 Quick Reference

### Import What You Need

```tsx
// Types
import type { LienKit, Order, Project, Deadline } from '@/types/database'

// Hooks
import { useLienKits, useUserLienKits } from '@/hooks/useLienKits'
import { useUserOrders, useCreateOrder } from '@/hooks/useOrders'
import { useDashboard, useDashboardStats } from '@/hooks/useDashboard'
import { useCreateAssessment, useSaveAssessmentAnswer } from '@/hooks/useAssessments'

// Auth
import { useAuth } from '@/hooks/useAuth'
```

## 📚 Common Patterns

### 1. Fetch and Display List

```tsx
export function KitsList() {
  const { data: kits, isLoading, error } = useLienKits()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {kits?.map(kit => <KitCard key={kit.id} {...kit} />)}
    </div>
  )
}
```

### 2. Create/Update (Mutation)

```tsx
export function CreateOrderButton({ kitIds }: { kitIds: string[] }) {
  const createOrder = useCreateOrder()

  return (
    <button 
      onClick={() => createOrder.mutate(kitIds)}
      disabled={createOrder.isPending}
    >
      {createOrder.isPending ? 'Creating...' : 'Create Order'}
    </button>
  )
}
```

### 3. Form with Mutation

```tsx
export function OrderForm() {
  const createOrder = useCreateOrder()
  const { register, handleSubmit } = useForm()

  const onSubmit = async (data) => {
    try {
      await createOrder.mutateAsync(data.kitIds)
      toast.success('Order created!')
    } catch (error) {
      toast.error('Failed to create order')
    }
  }

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>
}
```

### 4. Multi-Source Dashboard

```tsx
export function Dashboard() {
  const { data: dashboard } = useDashboard()
  const { data: stats } = useDashboardStats()

  return (
    <>
      <Stats {...stats} />
      <Projects projects={dashboard?.activeProjects} />
      <Deadlines deadlines={dashboard?.upcomingDeadlines} />
    </>
  )
}
```

## 🔧 Available Hooks

### Query Hooks (Read Data)

| Hook | Returns | When to Use |
|------|---------|-------------|
| `useLienKits()` | `LienKit[]` | Browse available kits |
| `useUserLienKits()` | `UserKitWithKit[]` | User's purchased kits |
| `useUserOrders()` | `OrderWithItems[]` | User's order history |
| `useDashboard()` | `DashboardData` | Full dashboard view |
| `useDashboardStats()` | `DashboardStats` | Dashboard statistics |
| `useRecentActivity(limit)` | `Activity[]` | Recent user actions |

### Mutation Hooks (Create/Update Data)

| Hook | Parameters | Returns | When to Use |
|------|-----------|---------|-------------|
| `useCreateOrder()` | `kitIds: string[]` | `OrderWithItems` | Purchase kits |
| `useCreateAssessment()` | `projectId?: string` | `Assessment` | Start assessment |
| `useSaveAssessmentAnswer()` | `{ assessmentId, questionKey, answerValue }` | `AssessmentAnswer` | Save answer |
| `useCompleteAssessment()` | `assessmentId: string` | `Assessment` | Finish assessment |

## 📝 TypeScript Types

### Main Entities

```typescript
LienKit         // Available lien kits for purchase
Order           // User's orders
OrderItem       // Individual items in an order
UserKit         // User's owned kits
Project         // Construction projects
Assessment      // Lien assessments
Deadline        // Important dates
Upload          // File uploads
Form            // Legal forms
FormResponse    // Completed forms
```

### Extended Types (with Relations)

```typescript
UserKitWithKit       // UserKit + LienKit details
OrderWithItems       // Order + OrderItem[]
ProjectWithDeadlines // Project + Deadline[]
```

### Enums

```typescript
UserRole: 'user' | 'attorney' | 'admin'
OrderStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
ProjectStatus: 'draft' | 'active' | 'lien_filed' | 'resolved' | 'closed'
DeadlinePriority: 'low' | 'medium' | 'high' | 'critical'
```

## 🎨 Component Patterns

### Loading States

```tsx
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorAlert error={error} />
if (!data) return <EmptyState />
return <Content data={data} />
```

### Optimistic Updates

```tsx
const mutation = useCreateItem()

<button onClick={() => mutation.mutate(item, {
  onSuccess: () => {
    // Auto-refetches related queries
    toast.success('Created!')
  },
  onError: (error) => {
    toast.error(error.message)
  }
})}>
  Create
</button>
```

### Conditional Fetching

```tsx
const { data } = useQuery({
  queryKey: ['item', id],
  queryFn: () => getItem(id!),
  enabled: !!id, // Only fetch when id exists
})
```

## 🚀 Performance Tips

### 1. Set Appropriate Stale Times

```tsx
// Rarely changes: 10 minutes
queryKey: ['lien-kits'],
staleTime: 10 * 60 * 1000

// Changes frequently: 1 minute  
queryKey: ['dashboard'],
staleTime: 1 * 60 * 1000
```

### 2. Use Select to Transform Data

```tsx
const { data: kitNames } = useLienKits({
  select: (kits) => kits.map(k => k.name)
})
```

### 3. Prefetch for Better UX

```tsx
const queryClient = useQueryClient()

<Link 
  to="/kit/123"
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: ['kit', '123'],
      queryFn: () => getKit('123')
    })
  }}
>
  View Kit
</Link>
```

## 🐛 Error Handling

### In Components

```tsx
const { error } = useQuery()

if (error) {
  return <Alert variant="danger">{error.message}</Alert>
}
```

### In Mutations

```tsx
const mutation = useMutation()

try {
  await mutation.mutateAsync(data)
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message)
  }
}
```

### Global Error Boundary

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        toast.error('Something went wrong')
        console.error(error)
      }
    }
  }
})
```

## 📂 File Locations

```
src/
├── types/database.ts           # All TypeScript types
├── services/
│   ├── lienKitsService.ts     # Kit CRUD operations
│   ├── ordersService.ts       # Order management
│   ├── assessmentsService.ts  # Assessment logic
│   └── dashboardService.ts    # Dashboard aggregation
└── hooks/
    ├── useLienKits.ts         # Kit hooks
    ├── useOrders.ts           # Order hooks
    ├── useAssessments.ts      # Assessment hooks
    └── useDashboard.ts        # Dashboard hooks
```

## 🔗 Related Documentation

- [Full Documentation](./DATA_ACCESS_LAYER.md)
- [Quick Start Guide](./QUICK_START_GUIDE.md)
- [Database Schema](../supabase/migrations/README.md)
- [Example Implementation](../src/pages/EnhancedDashboardPage.tsx)
