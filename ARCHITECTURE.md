# Lien Professor App - Architecture Documentation

## Recommended React Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── forms/           # Form-specific components
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   └── common/          # Shared business components
├── features/            # Feature-based modules
│   ├── assessment/      # Assessment engine
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   ├── ecommerce/       # Kit catalog & purchasing
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   ├── dashboard/       # User dashboard
│   ├── forms/           # Online form builder/filler
│   ├── documents/       # PDF generation & management
│   ├── deadlines/       # Deadline tracking
│   └── admin/           # Attorney/admin features
├── lib/                 # Utility libraries
│   ├── supabase.ts      # Supabase client
│   ├── stripe.ts        # Stripe utilities
│   ├── validations.ts   # Zod schemas
│   ├── utils.ts         # General utilities
│   └── constants.ts     # App constants
├── hooks/               # Global custom hooks
├── stores/              # Zustand stores
├── types/               # Global TypeScript types
├── styles/              # Global styles & Tailwind config
└── pages/               # Page components (if using file-based routing)
```

## Feature Modules Breakdown

### 1. Assessment Engine
**Purpose:** Interactive quiz to determine appropriate lien kit
**Components:**
- QuestionRenderer (multiple choice, conditional logic)
- ProgressTracker
- ResultsDisplay
- RecommendationEngine

**Key Features:**
- Dynamic question flow based on previous answers
- Save/resume capability
- Integration with kit recommendation algorithm
- Analytics tracking

### 2. Kit Catalog & E-commerce
**Purpose:** Product showcase and purchasing flow
**Components:**
- KitCard, KitGrid
- ProductDetails
- ShoppingCart
- StripeCheckout integration

**Key Features:**
- Kit comparison tool
- Bundle discounts
- Secure checkout with Stripe
- Order confirmation and receipts

### 3. User Dashboard
**Purpose:** Central hub for purchased kits and ongoing cases
**Components:**
- DashboardOverview
- PurchasedKits
- ActiveDeadlines
- RecentActivity

**Key Features:**
- Quick access to all user resources
- Status indicators for forms and deadlines
- Progress tracking
- Document library

### 4. Online Forms System
**Purpose:** Dynamic form generation and completion
**Components:**
- FormRenderer (handles different field types)
- FormBuilder (admin tool)
- ValidationEngine
- SaveDraft functionality

**Key Features:**
- Dynamic form generation from JSON schema
- Auto-save and draft management
- Field validation and error handling
- Progress indicators for multi-step forms

### 5. Document Generation
**Purpose:** PDF creation and management
**Components:**
- PDFPreview
- DocumentTemplate
- DownloadManager
- SignatureCapture

**Key Features:**
- Template-based PDF generation
- Real-time preview
- Digital signatures
- Version control

### 6. Deadline Management
**Purpose:** Track important dates and send notifications
**Components:**
- DeadlineCalendar
- NotificationCenter
- ReminderSettings
- StatusTracker

**Key Features:**
- Automated deadline calculation
- Multiple notification channels
- Calendar integration
- Status tracking

### 7. Admin/Attorney Portal
**Purpose:** Case management and client oversight
**Components:**
- ClientDashboard
- CaseAssignment
- DocumentReview
- CommunicationLog

**Key Features:**
- Client case overview
- Document approval workflow
- Internal messaging
- Progress monitoring

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
1. **Project Setup**
   - Initialize Vite + React + TypeScript project
   - Configure Tailwind CSS and shadcn/ui
   - Set up ESLint, Prettier, testing framework
   - Configure Supabase project and basic auth

2. **Core Infrastructure**
   - Authentication system (login/register)
   - Basic routing structure
   - Database schema implementation
   - Row Level Security (RLS) policies

3. **Basic UI Framework**
   - Design system components
   - Layout components (Header, Navigation, Footer)
   - Responsive design patterns
   - Loading and error states

### Phase 2: Assessment & E-commerce (Weeks 3-4)
1. **Assessment Engine**
   - Question flow logic
   - Answer persistence
   - Recommendation algorithm
   - Results display

2. **Kit Catalog**
   - Product display system
   - Shopping cart functionality
   - Stripe integration
   - Order processing

### Phase 3: User Dashboard & Forms (Weeks 5-6)
1. **Dashboard Implementation**
   - User profile management
   - Purchased kits display
   - Navigation to forms and documents

2. **Dynamic Forms System**
   - Form renderer from JSON schema
   - Validation and error handling
   - Draft saving/loading
   - Submission processing

### Phase 4: Document Generation (Weeks 7-8)
1. **PDF Generation**
   - Template system
   - Data binding from form submissions
   - Preview functionality
   - Download management

2. **File Storage Integration**
   - Supabase Storage setup
   - Secure file upload/download
   - Document versioning

### Phase 5: Deadline Management (Weeks 9-10)
1. **Deadline Tracking**
   - Automatic deadline calculation
   - Calendar integration
   - Notification system
   - Status updates

### Phase 6: Admin Features & Polish (Weeks 11-12)
1. **Attorney Portal**
   - Client case management
   - Document review workflow
   - Communication tools

2. **Final Polish**
   - Performance optimization
   - Security audit
   - User testing and bug fixes
   - Documentation

## Critical Security & Privacy Considerations

### Row Level Security (RLS) Policies
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Form submissions are private to user and assigned attorneys
CREATE POLICY "Users can view own submissions" ON form_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Attorneys can view assigned submissions" ON form_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM case_assignments 
      WHERE submission_id = form_submissions.id 
      AND attorney_id = auth.uid()
    )
  );

-- Documents are accessible to owners and assigned attorneys
CREATE POLICY "Document access control" ON generated_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM form_submissions fs
      WHERE fs.id = generated_documents.submission_id
      AND (fs.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM case_assignments ca
        WHERE ca.submission_id = fs.id AND ca.attorney_id = auth.uid()
      ))
    )
  );
```

### Data Protection Measures
1. **Encryption at Rest:** All sensitive data encrypted in Supabase
2. **Transport Security:** HTTPS everywhere, secure API endpoints
3. **Access Control:** JWT-based auth with role-based permissions
4. **Audit Logging:** Track all document access and modifications
5. **Data Retention:** Configurable retention policies for client data
6. **GDPR Compliance:** Data export and deletion capabilities

### Environment Security
1. **Secrets Management:** Use Vercel environment variables
2. **API Key Rotation:** Regular rotation of Stripe, Supabase keys
3. **CORS Configuration:** Strict origin policies
4. **Rate Limiting:** Prevent abuse of API endpoints
5. **Input Validation:** Server-side validation for all inputs

### Client-Side Security
1. **Content Security Policy:** Prevent XSS attacks
2. **Secure Storage:** Use httpOnly cookies for sensitive tokens
3. **Input Sanitization:** Sanitize all user inputs
4. **File Upload Security:** Validate file types and scan uploads

## Development Workflow with GitHub Copilot

### VS Code Extensions Recommended
- GitHub Copilot & Copilot Chat
- ES7+ React snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Thunder Client (API testing)

### GitHub Integration
- Feature branches for each module
- Pull request templates with security checklist
- GitHub Actions for CI/CD
- Dependabot for dependency updates
- CodeQL for security scanning

This architecture provides a solid foundation for building a scalable, secure, and maintainable lien assessment and management platform. The modular approach allows for iterative development while maintaining code quality and user experience standards.
