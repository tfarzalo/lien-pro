# Lien Professor Design System

## 🎨 Design Philosophy

Our design system balances **legal professionalism** with **modern SaaS usability**. We aim to convey trust, expertise, and authority while remaining approachable and easy to use.

### Core Principles
- **Professional yet Approachable**: Serious enough for legal work, friendly enough for daily use
- **Texas-Inspired**: Subtle nods to Texas identity without being overwhelming  
- **Accessibility First**: WCAG 2.1 AA compliant colors and interactions
- **Mobile-First**: Responsive design that works on all devices
- **Consistency**: Predictable patterns that users can learn once and apply everywhere

## 🎨 Color System

### Brand Colors
```css
/* Primary Brand - Professional Blue */
brand-50:  #f0f7ff  /* Light backgrounds */
brand-100: #e0efff  /* Hover states */
brand-500: #0b8fff  /* Primary actions */
brand-600: #0066cc  /* Default brand */
brand-700: #004d99  /* Pressed states */
brand-900: #001a33  /* Dark text */
```

### Status Colors
```css
/* Success - Texas Green */
success-50:  #f0fdf4  /* Light backgrounds */
success-600: #16a34a  /* Default success */
success-700: #15803d  /* Dark success */

/* Warning - Texas Gold */
warning-50:  #fffbeb  /* Light backgrounds */  
warning-600: #d97706  /* Default warning */
warning-700: #b45309  /* Dark warning */

/* Danger - Professional Red */
danger-50:  #fef2f2  /* Light backgrounds */
danger-600: #dc2626  /* Default danger */
danger-700: #b91c1c  /* Dark danger */
```

### Neutral Grays
```css
/* Professional grays for legal context */
slate-50:  #f8fafc  /* Page backgrounds */
slate-100: #f1f5f9  /* Card backgrounds */
slate-600: #475569  /* Secondary text */
slate-700: #334155  /* Body text */
slate-900: #0f172a  /* Headings */
```

## 📝 Typography

### Font Stack
- **Primary**: Inter (all weights)
- **Fallback**: system-ui, sans-serif

### Scale
```css
/* Display Text - For page titles and hero sections */
.text-display-2xl  /* 36px, font-bold, tracking-tight */
.text-display-xl   /* 30px, font-bold, tracking-tight */
.text-display-lg   /* 24px, font-semibold, tracking-tight */

/* Body Text - For legal content */
.text-legal-body   /* 16px, leading-relaxed, text-slate-700 */
.text-legal-label  /* 14px, font-medium, text-slate-900 */
.text-legal-caption /* 14px, text-slate-600 */
```

### Usage Guidelines
- **Display text**: Page titles, section headers, marketing content
- **Legal body**: Form descriptions, legal explanations, help text
- **Labels**: Form field labels, card titles, navigation items

## 🏗️ Layout System

### Container Widths
```css
max-w-7xl    /* 1280px - Marketing pages */
max-w-4xl    /* 896px  - Assessment forms */
max-w-2xl    /* 672px  - Single column content */
```

### Spacing Scale
```css
/* Based on 4px grid */
space-2   /* 8px  - Tight spacing */
space-4   /* 16px - Default spacing */
space-6   /* 24px - Section spacing */
space-8   /* 32px - Large spacing */
space-12  /* 48px - Section breaks */
space-16  /* 64px - Page sections */
```

## 🧩 Component Library

### Buttons

#### Primary Button
```tsx
<Button variant="primary" size="md">
  Primary Action
</Button>
```
**Use for**: Main CTAs, form submissions, primary navigation

#### Secondary Button  
```tsx
<Button variant="secondary" size="md">
  Secondary Action
</Button>
```
**Use for**: Alternative actions, cancellations, less important CTAs

#### Destructive Button
```tsx
<Button variant="destructive" size="md">
  Delete Item
</Button>
```
**Use for**: Permanent actions, deletions, dangerous operations

### Cards

#### Standard Card
```tsx
<Card variant="elevated" padding="md">
  <CardContent>Content here</CardContent>
</Card>
```

#### Interactive Card
```tsx
<Card variant="interactive" padding="md">
  <CardContent>Clickable content</CardContent>
</Card>
```

#### Specialized Cards
- **KitCard**: Product listings, pricing display
- **DeadlineCard**: Urgent notifications, timeline items
- **FormCard**: Progress tracking, document status

### Layout Components

#### AppShell
```tsx
<AppShell
  header={<DashboardHeader />}
  sidebar={<Navigation />}
>
  <PageContent />
</AppShell>
```

#### PageHeader
```tsx
<PageHeader
  title="Page Title"
  subtitle="Page description"
  actions={<Button>Action</Button>}
/>
```

## 🚨 Alert System

### Alert Variants
```tsx
{/* Informational */}
<Alert variant="info">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>General information message</AlertDescription>
</Alert>

{/* Success */}
<Alert variant="success">
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>Action completed successfully</AlertDescription>
</Alert>

{/* Warning */}
<Alert variant="warning">
  <AlertTitle>Important Deadline</AlertTitle>
  <AlertDescription>You have 7 days remaining to file</AlertDescription>
</Alert>

{/* Danger */}
<Alert variant="danger">
  <AlertTitle>Deadline Passed</AlertTitle>
  <AlertDescription>This lien deadline has expired</AlertDescription>
</Alert>
```

## 📱 Responsive Design

### Breakpoints
```css
sm:   640px  /* Mobile landscape */
md:   768px  /* Tablets */
lg:   1024px /* Desktop */
xl:   1280px /* Large desktop */
2xl:  1536px /* Extra large */
```

### Layout Patterns

#### Dashboard Grid
```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
  <div className="lg:col-span-8">{/* Main content */}</div>
  <div className="lg:col-span-4">{/* Sidebar */}</div>
</div>
```

#### Kit Catalog Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {kits.map(kit => <KitCard key={kit.id} {...kit} />)}
</div>
```

## 🔧 Utility Classes

### Custom Utilities
```css
/* Button styles */
.btn-primary     /* Primary button styling */
.btn-secondary   /* Secondary button styling */

/* Card styles */
.card-elevated   /* Standard card with shadow */
.card-interactive /* Hover effects for clickable cards */

/* Status indicators */
.status-success  /* Success state styling */
.status-warning  /* Warning state styling */
.status-danger   /* Danger state styling */
```

## 🎯 Component Usage Guidelines

### Do's ✅
- Use consistent spacing with the 4px grid system
- Apply status colors semantically (success = completed, warning = urgent, danger = error)
- Keep card content scannable with clear hierarchy
- Use interactive cards for clickable content
- Provide loading states for async actions

### Don'ts ❌
- Don't mix semantic colors (e.g., red for success)
- Don't use more than 3 levels of hierarchy in cards
- Don't make text smaller than 14px for legal content
- Don't use brand colors for system status messages
- Don't animate important legal information

## 🚀 Implementation Tips

### Class Naming
```tsx
// Use semantic component names
<KitCard />        // ✅ Clear purpose
<BlueCard />       // ❌ Implementation detail

// Use descriptive props
variant="primary"  // ✅ Semantic
variant="blue"     // ❌ Implementation detail
```

### Consistency Helpers
```tsx
import { cn } from "@/lib/utils"

// Combine classes safely
<div className={cn("base-classes", conditionalClasses, className)} />
```

### State Management
- Use loading states for buttons during async operations
- Show progress for multi-step forms
- Provide clear feedback for user actions
- Handle error states gracefully

## 📏 Accessibility

### Color Contrast
- All text meets WCAG 2.1 AA standards (4.5:1 ratio)
- Interactive elements have sufficient contrast
- Status colors work for colorblind users

### Focus Management
- Visible focus indicators on all interactive elements
- Logical tab order throughout forms
- Skip links for screen readers

### Content Structure
- Proper heading hierarchy (h1 → h2 → h3)
- Descriptive button and link text
- Alt text for informational images
- Form labels properly associated with inputs

This design system ensures consistent, professional, and accessible interfaces across the Lien Professor application while maintaining the serious tone appropriate for legal software.
