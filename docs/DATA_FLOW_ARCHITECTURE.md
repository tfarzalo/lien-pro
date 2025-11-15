# Data Flow Architecture

Visual guide showing how data flows through the Lien Professor App.

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Dashboard  │  │ Assessment │  │   Orders   │           │
│  │   Page     │  │    Page    │  │    Page    │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
└────────┼────────────────┼────────────────┼──────────────────┘
         │                │                │
         │  Uses Hooks    │                │
         ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    REACT QUERY HOOKS                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │useDashboard│  │useAssessm. │  │ useOrders  │           │
│  │   Stats    │  │   Create   │  │   Create   │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
│        │                │                │                   │
│   Caching & State Management (React Query)                  │
└────────┼────────────────┼────────────────┼──────────────────┘
         │                │                │
         │  Calls Service │                │
         ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ dashboard  │  │assessment  │  │   orders   │           │
│  │  Service   │  │  Service   │  │  Service   │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
│        │                │                │                   │
│   Business Logic & Data Transformation                      │
└────────┼────────────────┼────────────────┼──────────────────┘
         │                │                │
         │  Uses Client   │                │
         ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE CLIENT                            │
│            (Database Access & Authentication)                │
└────────┬─────────────────────────────────────────┬──────────┘
         │                                          │
         │  SQL Queries                    Auth    │
         ▼                                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ PostgreSQL │  │    Auth    │  │  Storage   │           │
│  │  Database  │  │   Service  │  │   (Files)  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                              │
│  Row Level Security (RLS) enforced at database level        │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Examples

### Example 1: Loading Dashboard Data

```
User visits Dashboard Page
         ↓
Component calls useDashboard()
         ↓
React Query checks cache
         ↓
Cache miss → calls dashboardService.getUserDashboardData()
         ↓
Service queries Supabase (parallel requests):
  - profiles table (user info)
  - projects table (active projects)
  - deadlines table (upcoming deadlines)
  - user_kits table + lien_kits (owned kits)
  - orders table (recent orders)
         ↓
Supabase enforces RLS (user can only see their data)
         ↓
Data returned to service
         ↓
Service formats/transforms data
         ↓
React Query caches result
         ↓
Component receives data
         ↓
UI renders with fresh data
```

### Example 2: Creating an Order

```
User clicks "Checkout" button
         ↓
Component calls createOrder.mutate(kitIds)
         ↓
useCreateOrder hook triggered
         ↓
Hook calls ordersService.createOrderFromKitSelection()
         ↓
Service executes:
  1. Fetch kit prices from lien_kits table
  2. Calculate total
  3. Insert order record
  4. Insert order_items records
         ↓
Supabase validates:
  - User authentication
  - RLS policies
  - Foreign key constraints
         ↓
Data inserted successfully
         ↓
Service returns complete order with items
         ↓
React Query onSuccess:
  - Invalidates orders cache
  - Invalidates user-kits cache
  - Invalidates dashboard cache
         ↓
All related queries refetch automatically
         ↓
UI updates with new data
         ↓
Success message shown to user
```

### Example 3: Assessment Flow

```
User starts assessment
         ↓
Component calls createAssessment.mutate()
         ↓
Service creates assessment record (status: 'in_progress')
         ↓
User answers questions
         ↓
Each answer triggers saveMutation.mutate({ assessmentId, questionKey, value })
         ↓
Service upserts assessment_answer record
         ↓
User clicks "Complete"
         ↓
Component calls completeMutation.mutate(assessmentId)
         ↓
Service:
  1. Fetches all answers
  2. Calculates score
  3. Updates assessment (status: 'completed', score, completed_at)
         ↓
React Query invalidates assessment cache
         ↓
UI shows results with score
```

## 🔐 Security Flow

```
User logs in via Supabase Auth
         ↓
Supabase sets JWT in cookies
         ↓
Every API request includes JWT automatically
         ↓
Supabase validates JWT
         ↓
RLS policies check:
  - auth.uid() = user_id (can only access own data)
  - role checks for admin/attorney features
         ↓
If authorized → return data
If not authorized → throw error
         ↓
React Query error boundary catches errors
         ↓
User sees error message
```

## 🔄 Caching Strategy

```
┌──────────────────────────────────────┐
│          React Query Cache           │
├──────────────────────────────────────┤
│                                      │
│  lien-kits         [stale: 5 min]   │  ← Rarely changes
│  user-kits         [stale: 2 min]   │
│  dashboard         [stale: 2 min]   │  ← Frequently viewed
│  orders            [stale: 1 min]   │
│  assessment-123    [stale: 30 sec]  │  ← Active editing
│                                      │
│  On mutation:                        │
│    - Invalidate related queries      │
│    - Auto-refetch in background      │
│    - Optimistic updates (optional)   │
│                                      │
└──────────────────────────────────────┘
```

## 🎯 Query Key Structure

Consistent query keys enable efficient cache management:

```typescript
// Entity list
['lien-kits']
['orders', userId]

// Single entity
['assessment', assessmentId]
['project', projectId]

// Aggregations
['dashboard', userId]
['dashboard-stats', userId]

// Filtered lists
['recent-activity', userId, limit]
['user-kits', userId]
```

## 🚀 Performance Optimizations

### 1. Parallel Data Fetching

```typescript
// ✅ Good: Parallel requests
const [projects, deadlines, kits] = await Promise.all([
  getProjects(),
  getDeadlines(),
  getUserKits()
])

// ❌ Bad: Sequential requests
const projects = await getProjects()
const deadlines = await getDeadlines()
const kits = await getUserKits()
```

### 2. Query Deduplication

```typescript
// Multiple components use useLienKits()
// React Query only makes ONE API call
// All components share the cached data
```

### 3. Background Refetching

```typescript
// User switches tabs
// React Query refetches stale data in background
// User doesn't see loading state
// Fresh data appears seamlessly
```

### 4. Optimistic Updates

```typescript
// User creates order
// UI updates immediately (optimistic)
// API call happens in background
// If fails, revert to previous state
```

## 📦 Type Safety Flow

```
Database Schema (SQL)
         ↓
Supabase Auto-generated Types
         ↓
src/types/database.ts (Manual/Generated)
         ↓
Service Functions (Typed Parameters & Returns)
         ↓
React Query Hooks (Typed Data & Mutations)
         ↓
React Components (Typed Props & State)
         ↓
TypeScript Compiler Validation
         ↓
IntelliSense & Autocomplete in IDE
```

## 🧪 Testing Flow

```
┌─────────────────────────────────────┐
│          Unit Tests                 │
│  - Service functions in isolation   │
│  - Mock Supabase client             │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│       Integration Tests             │
│  - Hooks with mocked services       │
│  - React Query wrapper              │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│         E2E Tests                   │
│  - Full user flows                  │
│  - Real Supabase test instance      │
└─────────────────────────────────────┘
```

## 💡 Key Principles

### 1. Single Source of Truth
- Database is the source of truth
- React Query cache is a client-side mirror
- Always refetch on stale or when needed

### 2. Optimistic UI
- Update UI immediately for better UX
- Roll back if API call fails
- User perceives instant feedback

### 3. Error Boundaries
- Errors caught at hook level
- Components handle gracefully
- User sees helpful messages

### 4. Type Safety
- Types flow from DB to UI
- Compiler catches errors early
- Refactoring is safe

### 5. Separation of Concerns
- UI components don't know about DB
- Services don't know about React
- Hooks bridge the gap cleanly

## 🔗 Data Dependencies

```
Profile (User)
  ├── Projects
  │     ├── Assessments
  │     ├── Deadlines
  │     └── Uploads
  ├── Orders
  │     └── OrderItems (→ LienKits)
  ├── UserKits (→ LienKits)
  ├── FormResponses (→ Forms)
  └── AttorneyNotes (if attorney)

LienKits (Independent)
Forms (Independent)
```

When you invalidate a query, consider its dependencies!

## 📚 Related Documentation

- [Full Documentation](./DATA_ACCESS_LAYER.md)
- [Quick Start Guide](./QUICK_START_GUIDE.md)
- [Cheat Sheet](./CHEAT_SHEET.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
