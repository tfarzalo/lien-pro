# Form & PDF Generation Quick Reference

## 🚀 Dev Server

**Local URL:** http://localhost:5175/

```bash
npm run dev
```

---

## 📋 What Was Implemented

### ✅ Components Created

1. **FormFieldRenderer** (`src/components/forms/FormFieldRenderer.tsx`)
   - Renders all form field types dynamically
   - Supports: text, textarea, email, phone, number, date, select, radio, checkbox, signature

2. **FormRunner** (`src/components/forms/FormRunner.tsx`)
   - Dynamic form renderer from JSON templates
   - Auto-saves every 2 seconds
   - Progress tracking
   - Section navigation
   - Validation
   - PDF generation button

3. **FormCompletionPage** (`src/pages/FormCompletionPage.tsx`)
   - Complete example implementation
   - Shows how to integrate all pieces
   - Handles autofill, save, and PDF generation

### ✅ Utilities & Hooks

1. **formUtils.ts** (`src/lib/formUtils.ts`)
   - `validateField()` - Single field validation
   - `validateForm()` - Full form validation
   - `autofillField()` - Auto-populate from common fields
   - `calculateProgress()` - Form completion %
   - `isFormComplete()` - Check if ready to submit

2. **usePDFGeneration.ts** (`src/hooks/usePDFGeneration.ts`)
   - `useGeneratePDF()` - React Query hook
   - `useSaveFormResponse()` - Save/update forms
   - `generatePDF()` - Call Edge Function
   - `saveFormResponse()` - Persist to database

3. **useDebounce.ts** (`src/hooks/useDebounce.ts`)
   - Debounces values for autosave

### ✅ Backend Implementation

1. **Database Migration** (`supabase/migrations/006_pdf_generation.sql`)
   - `form_responses` table updates
   - `pdf_templates` table
   - `pdf_generation_jobs` table
   - RLS policies
   - Helper functions

2. **Edge Function** (`supabase/functions/generate-pdf/index.ts`)
   - Fetches form data
   - Downloads PDF template
   - Fills PDF fields
   - Uploads to Storage
   - Returns PDF URL

### ✅ Documentation

1. **PDF_GENERATION_GUIDE.md** (`docs/PDF_GENERATION_GUIDE.md`)
   - Complete architecture overview
   - Step-by-step flow diagrams
   - API reference
   - Testing guide
   - Troubleshooting

---

## 🎯 Quick Start: Using the Forms System

### 1. Create a Form Template

```typescript
import { FormTemplate } from '@/types/forms';

const myFormTemplate: FormTemplate = {
  id: 'my-form-id',
  name: 'My Custom Form',
  slug: 'my-custom-form',
  description: 'Description here',
  category: 'Lien Forms',
  jurisdiction: 'California',
  version: '1.0',
  sections: [
    {
      id: 'section-1',
      title: 'Your Information',
      order: 1,
      fields: [
        {
          id: 'name',
          name: 'name',
          label: 'Your Name',
          type: 'text',
          required: true,
          autofill: 'user.name', // Auto-fills from user profile
          gridColumn: 12,
        },
        {
          id: 'email',
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          autofill: 'user.email',
          gridColumn: 6,
        },
        // ... more fields
      ],
    },
  ],
  instructions: 'Fill out all required fields...',
  pdfTemplate: 'url-to-pdf-template',
  isActive: true,
  requiredForKitIds: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

### 2. Use FormRunner in Your Page

```typescript
import { FormRunner } from '@/components/forms/FormRunner';
import { useGeneratePDF, useSaveFormResponse } from '@/hooks/usePDFGeneration';

function MyFormPage() {
  const generatePDF = useGeneratePDF();
  const saveForm = useSaveFormResponse();
  
  const handleSave = async (values: Record<string, FormFieldValue>) => {
    await saveForm.mutateAsync({
      formResponseId: existingId,
      data: {
        userId,
        projectId,
        formId: template.id,
        formName: template.name,
        fieldValues: values,
        status: 'draft',
      },
    });
  };

  const handleGeneratePDF = async () => {
    const result = await generatePDF.mutateAsync(formResponseId);
    if (result.success) {
      alert('PDF generated! ' + result.pdfUrl);
    }
  };

  return (
    <FormRunner
      template={myFormTemplate}
      projectId={projectId}
      userId={userId}
      onSave={handleSave}
      onGeneratePDF={handleGeneratePDF}
      autoSave={true}
      autoSaveDelay={2000}
    />
  );
}
```

### 3. Deploy Backend

```bash
# Run database migration
supabase db push

# Deploy Edge Function
supabase functions deploy generate-pdf

# Create storage buckets in Supabase Dashboard:
# - pdf-templates (public)
# - generated-pdfs (private)
```

---

## 🔑 Key Features

### Autofill / Field Reuse

Fields can auto-populate from user profile or project data:

```typescript
{
  id: 'contractor_name',
  label: 'Contractor Name',
  type: 'text',
  autofill: 'user.name', // 👈 Auto-fills from user profile
  required: true,
}
```

**Available autofill sources:**
- `user.name`
- `user.email`
- `user.phone`
- `user.company`
- `user.license_number`
- `project.name`
- `project.address`
- `project.owner_name`
- `project.property_address`
- `project.start_date`
- `project.completion_date`

### Auto-Save

Forms automatically save every 2 seconds (configurable):

```typescript
<FormRunner
  autoSave={true}
  autoSaveDelay={2000} // milliseconds
  onSave={handleSave}
  // ...
/>
```

### Validation

Built-in validation for all field types:

```typescript
{
  id: 'phone',
  type: 'phone',
  required: true,
  validation: {
    pattern: '^[0-9]{10}$',
    customMessage: 'Phone must be 10 digits',
  },
}
```

### Progress Tracking

Automatically calculates completion percentage based on required fields.

### Section Navigation

Multi-section forms with previous/next navigation and validation per section.

---

## 📁 File Structure

```
src/
├── components/
│   └── forms/
│       ├── FormRunner.tsx           # Main form renderer
│       └── FormFieldRenderer.tsx    # Individual field renderer
├── hooks/
│   ├── usePDFGeneration.ts          # PDF & form save hooks
│   └── useDebounce.ts               # Debounce utility
├── lib/
│   └── formUtils.ts                 # Form validation & utilities
├── pages/
│   └── FormCompletionPage.tsx       # Example implementation
└── types/
    └── forms.ts                     # TypeScript types

supabase/
├── migrations/
│   └── 006_pdf_generation.sql       # Database schema
└── functions/
    └── generate-pdf/
        └── index.ts                 # PDF generation Edge Function

docs/
└── PDF_GENERATION_GUIDE.md          # Complete documentation
```

---

## 🎨 Supported Field Types

| Type | Description | Props |
|------|-------------|-------|
| `text` | Single-line text | placeholder, validation |
| `textarea` | Multi-line text | rows, placeholder |
| `email` | Email input | validation |
| `phone` | Phone number | format validation |
| `number` | Numeric input | min, max |
| `currency` | Money input | format validation |
| `date` | Date picker | min, max dates |
| `select` | Dropdown | options array |
| `radio` | Radio buttons | options array |
| `checkbox` | Checkboxes | options array |
| `address` | Full address | structured input |
| `signature` | Signature pad | placeholder for now |

---

## 🔄 PDF Generation Flow

1. User fills form → Auto-saves to `form_responses`
2. User clicks "Generate PDF" → Validates all fields
3. Frontend calls Edge Function with `formResponseId`
4. Edge Function:
   - Fetches form data from database
   - Downloads PDF template from Storage
   - Fills PDF fields using pdf-lib
   - Uploads filled PDF to Storage
   - Updates `form_responses` with PDF URL
5. Frontend receives PDF URL → Shows download link

---

## 🧪 Testing

### Test Form Completion
```
1. Navigate to: http://localhost:5175/projects/:projectId/forms/:formId
2. Fill out form fields
3. Verify autosave (check Network tab)
4. Click "Generate PDF"
5. Download and verify PDF
```

### Test Edge Function Locally
```bash
# Terminal 1: Start Supabase
supabase start

# Terminal 2: Serve Edge Function
supabase functions serve generate-pdf

# Terminal 3: Test with curl
curl -X POST 'http://localhost:54321/functions/v1/generate-pdf' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"formResponseId": "test-id"}'
```

---

## 📊 Data Model

### FormTemplate
```typescript
{
  id: string
  name: string
  sections: FormSection[]
  pdfTemplate?: string  // URL to blank PDF
  // ...
}
```

### FormSection
```typescript
{
  id: string
  title: string
  fields: FormField[]
  order: number
}
```

### FormField
```typescript
{
  id: string
  label: string
  type: FormFieldType
  required?: boolean
  autofill?: AutofillSource
  validation?: FormFieldValidation
  options?: FormFieldOption[]  // For select/radio/checkbox
}
```

### FormResponse (Database)
```typescript
{
  id: uuid
  user_id: uuid
  project_id: uuid
  form_id: uuid
  field_values: jsonb
  status: 'draft' | 'completed' | 'submitted'
  generated_pdf_url: text
  pdf_generated_at: timestamp
}
```

---

## 🚨 Common Issues & Fixes

### Issue: Autosave not working
**Fix:** Check that `onSave` prop is provided and `autoSave={true}`

### Issue: PDF generation fails
**Fix:** 
- Verify form response exists in database
- Check PDF template exists in Storage
- View Edge Function logs in Supabase

### Issue: Fields not autofilling
**Fix:**
- Ensure `commonFields` prop is provided
- Check user profile/project data exists
- Verify `autofill` source matches available data

### Issue: Validation errors not showing
**Fix:**
- Check field `validation` config
- Ensure `FormFieldRenderer` displays errors
- Call `validateForm()` before submission

---

## 📝 Next Steps

1. **Create sample forms** in your database
2. **Upload PDF templates** to Storage
3. **Test the complete flow** end-to-end
4. **Customize styling** to match your brand
5. **Add more field types** as needed
6. **Implement e-signatures** for legal forms

---

## 🔗 Related Documentation

- **DASHBOARD_GUIDE.md** - Dashboard implementation
- **PDF_GENERATION_GUIDE.md** - Complete PDF flow details
- **ARCHITECTURE.md** - Overall system architecture

---

## 💡 Pro Tips

1. **Reuse fields across forms** using autofill sources
2. **Test with partial data** to verify autosave
3. **Use conditional display** for dynamic forms
4. **Validate early and often** to catch errors
5. **Monitor Edge Function logs** during development
6. **Keep PDF templates simple** for easier field mapping

---

## 🎉 Summary

You now have a complete online forms system with:
- ✅ Dynamic form rendering
- ✅ Autosave functionality
- ✅ Field reuse/autofill
- ✅ Progress tracking
- ✅ Validation
- ✅ PDF generation
- ✅ Storage integration
- ✅ Type-safe implementation

**Everything is ready to use!** 🚀
