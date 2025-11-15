# Quick Start Guide - Data Access Layer

This guide shows you how to quickly implement common features using the data access layer.

## 🚀 Quick Examples

### Fetch and Display Data

```tsx
import { useLienKits } from '@/hooks/useLienKits'

export function MyComponent() {
  const { data: kits, isLoading, error } = useLienKits()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {kits?.map(kit => (
        <div key={kit.id}>{kit.name}</div>
      ))}
    </div>
  )
}
```

### Create Data (Mutations)

```tsx
import { useCreateOrder } from '@/hooks/useOrders'

export function CheckoutButton({ kitIds }: { kitIds: string[] }) {
  const createOrder = useCreateOrder()

  const handleClick = async () => {
    try {
      const order = await createOrder.mutateAsync(kitIds)
      console.log('Order created!', order)
    } catch (error) {
      console.error('Failed:', error)
    }
  }

  return (
    <button 
      onClick={handleClick}
      disabled={createOrder.isPending}
    >
      {createOrder.isPending ? 'Processing...' : 'Checkout'}
    </button>
  )
}
```

### Dashboard with Multiple Data Sources

```tsx
import { useDashboard, useDashboardStats } from '@/hooks/useDashboard'

export function Dashboard() {
  const { data, isLoading } = useDashboard()
  const { data: stats } = useDashboardStats()

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <h1>Welcome, {data?.user?.full_name}!</h1>
      <Stats {...stats} />
      <ProjectsList projects={data?.activeProjects} />
      <DeadlinesList deadlines={data?.upcomingDeadlines} />
    </div>
  )
}
```

## 📁 File Structure

```
src/
├── types/
│   └── database.ts          # All TypeScript types
├── services/
│   ├── lienKitsService.ts   # Lien kits logic
│   ├── assessmentsService.ts # Assessments logic
│   ├── ordersService.ts     # Orders logic
│   └── dashboardService.ts  # Dashboard aggregation
├── hooks/
│   ├── useLienKits.ts       # Lien kits hooks
│   ├── useAssessments.ts    # Assessment hooks
│   ├── useOrders.ts         # Orders hooks
│   └── useDashboard.ts      # Dashboard hooks
└── pages/
    └── EnhancedDashboardPage.tsx # Example usage
```

## 🔄 Common Patterns

### Pattern 1: List View

```tsx
const { data: items, isLoading, error } = useItems()

if (isLoading) return <Spinner />
if (error) return <ErrorAlert error={error} />
if (!items?.length) return <EmptyState />

return <ItemsList items={items} />
```

### Pattern 2: Detail View

```tsx
const { id } = useParams()
const { data: item, isLoading } = useItem(id)

if (isLoading) return <Spinner />
if (!item) return <NotFound />

return <ItemDetail item={item} />
```

### Pattern 3: Form with Mutation

```tsx
const mutation = useCreateItem()

const onSubmit = async (formData) => {
  try {
    await mutation.mutateAsync(formData)
    toast.success('Created!')
    navigate('/items')
  } catch (error) {
    toast.error(error.message)
  }
}

return <form onSubmit={handleSubmit(onSubmit)}>...</form>
```

## 🛠️ Available Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useLienKits()` | Get all available lien kits | `LienKit[]` |
| `useUserLienKits()` | Get user's owned kits | `UserKitWithKit[]` |
| `useUserOrders()` | Get user's orders | `OrderWithItems[]` |
| `useCreateOrder()` | Create new order | Mutation |
| `useDashboard()` | Get dashboard data | `DashboardData` |
| `useDashboardStats()` | Get statistics | `DashboardStats` |
| `useCreateAssessment()` | Start assessment | Mutation |
| `useSaveAssessmentAnswer()` | Save answer | Mutation |
| `useCompleteAssessment()` | Complete assessment | Mutation |

## 📖 More Information

- Full documentation: [DATA_ACCESS_LAYER.md](./DATA_ACCESS_LAYER.md)
- Database schema: [../supabase/migrations/README.md](../supabase/migrations/README.md)
- Example implementation: [../src/pages/EnhancedDashboardPage.tsx](../src/pages/EnhancedDashboardPage.tsx)
