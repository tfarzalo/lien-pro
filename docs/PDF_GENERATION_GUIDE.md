# PDF Generation Flow Documentation

## Overview

This document explains the complete PDF generation flow in the Lien Professor App, from form completion to PDF download.

---

## Architecture

```
┌─────────────────┐
│   User fills    │
│   form using    │
│   FormRunner    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Auto-save to  │
│  form_responses │
│   (every 2s)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User clicks     │
│ "Generate PDF"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validate all   │
│  required       │
│  fields         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Call Supabase  │
│  Edge Function  │
│  "generate-pdf" │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch form     │
│  response data  │
│  and template   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Download PDF   │
│  template from  │
│  Storage        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fill PDF       │
│  fields using   │
│  pdf-lib        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Upload filled  │
│  PDF to Storage │
│  bucket         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update form    │
│  response with  │
│  PDF URL        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return PDF URL │
│  to frontend    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User downloads │
│  PDF            │
└─────────────────┘
```

---

## Components

### 1. FormRunner Component

**Location:** `src/components/forms/FormRunner.tsx`

**Purpose:** Dynamically renders forms from templates and handles autosave

**Key Features:**
- Loads form template (JSON-based structure)
- Renders inputs dynamically using FormFieldRenderer
- Auto-saves every 2 seconds (configurable)
- Calculates progress percentage
- Validates required fields
- Section-by-section navigation
- "Generate PDF & Save" button integration

**Usage:**
```tsx
<FormRunner
  template={formTemplate}
  projectId={projectId}
  userId={userId}
  existingResponseId={formResponseId}
  initialValues={existingValues}
  commonFields={commonFields}
  onSave={handleSave}
  onGeneratePDF={handleGeneratePDF}
  onComplete={handleComplete}
  autoSave={true}
  autoSaveDelay={2000}
/>
```

### 2. FormFieldRenderer Component

**Location:** `src/components/forms/FormFieldRenderer.tsx`

**Purpose:** Renders individual form fields based on their type

**Supported Field Types:**
- `text` - Single-line text input
- `textarea` - Multi-line text input
- `email` - Email input with validation
- `phone` - Phone number input
- `number` - Numeric input
- `date` - Date picker
- `select` - Dropdown selection
- `radio` - Radio button group
- `checkbox` - Checkbox group (multiple selection)
- `signature` - Signature capture (placeholder implementation)

**Usage:**
```tsx
<FormFieldRenderer
  field={field}
  value={values[field.id]}
  error={errors[field.id]}
  onChange={(value) => handleChange(field.id, value)}
/>
```

### 3. Form Utilities

**Location:** `src/lib/formUtils.ts`

**Functions:**
- `validateField()` - Validates a single field
- `validateForm()` - Validates entire form
- `autofillField()` - Autofills field from common fields
- `autofillAllFields()` - Autofills all fields at once
- `calculateProgress()` - Calculates form completion percentage
- `shouldDisplayField()` - Conditional field display logic
- `formatFieldValue()` - Formats values for display
- `isFormComplete()` - Checks if all required fields are filled

### 4. PDF Generation Hook

**Location:** `src/hooks/usePDFGeneration.ts`

**Hooks:**
- `useGeneratePDF()` - React Query hook for PDF generation
- `useSaveFormResponse()` - React Query hook for saving form data

**Functions:**
- `generatePDF(formResponseId)` - Calls Edge Function
- `saveFormResponse()` - Saves/updates form response

**Usage:**
```tsx
const generatePDFMutation = useGeneratePDF();

const handleGeneratePDF = async () => {
  const result = await generatePDFMutation.mutateAsync(formResponseId);
  if (result.success) {
    console.log('PDF URL:', result.pdfUrl);
  }
};
```

---

## Backend Implementation

### 1. Database Schema

**Location:** `supabase/migrations/006_pdf_generation.sql`

**Tables:**
- `form_responses` - Stores user form data
  - `generated_pdf_url` - URL to generated PDF
  - `pdf_generated_at` - Timestamp
  - `pdf_generation_status` - Status (pending/processing/completed/failed)

- `pdf_templates` - Stores PDF template metadata
  - `template_url` - URL in Supabase Storage
  - `field_mappings` - Maps form fields to PDF fields (JSONB)

- `pdf_generation_jobs` - Tracks PDF generation requests
  - `status` - Job status
  - `pdf_url` - Generated PDF URL
  - `error_message` - Error details if failed

### 2. Edge Function

**Location:** `supabase/functions/generate-pdf/index.ts`

**Deployment:**
```bash
supabase functions deploy generate-pdf
```

**Environment Variables Required:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

**Process:**
1. Authenticate user
2. Fetch form response data
3. Fetch PDF template
4. Download template from Storage
5. Fill PDF fields using pdf-lib
6. Upload filled PDF to Storage
7. Update form_response with PDF URL
8. Return success response

### 3. Storage Buckets

**Required Buckets:**
- `pdf-templates` - Stores blank PDF templates
- `generated-pdfs` - Stores filled PDFs for users

**Create Buckets:**
```sql
-- In Supabase Dashboard > Storage
-- 1. Create bucket: pdf-templates (public)
-- 2. Create bucket: generated-pdfs (private)
```

**Storage Policies:**
```sql
-- Users can read their own generated PDFs
CREATE POLICY "Users can read own generated PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Form Template Structure

### Example Template

```typescript
const preliminaryNoticeTemplate: FormTemplate = {
  id: 'prelim-notice-ca',
  name: 'Preliminary Notice (California)',
  slug: 'preliminary-notice-california',
  description: 'Required notice for mechanics lien rights in California',
  category: 'Lien Forms',
  jurisdiction: 'California',
  version: '1.0',
  sections: [
    {
      id: 'section-1',
      title: 'Your Information',
      description: 'Information about you or your company',
      order: 1,
      fields: [
        {
          id: 'claimant_name',
          name: 'claimant_name',
          label: 'Your Name or Company Name',
          type: 'text',
          required: true,
          autofill: 'user.name',
          gridColumn: 12,
        },
        {
          id: 'claimant_address',
          name: 'claimant_address',
          label: 'Your Address',
          type: 'text',
          required: true,
          autofill: 'user.company',
          gridColumn: 12,
        },
        {
          id: 'claimant_phone',
          name: 'claimant_phone',
          label: 'Your Phone Number',
          type: 'phone',
          required: true,
          autofill: 'user.phone',
          gridColumn: 6,
        },
        {
          id: 'claimant_email',
          name: 'claimant_email',
          label: 'Your Email',
          type: 'email',
          required: true,
          autofill: 'user.email',
          gridColumn: 6,
        },
      ],
    },
    {
      id: 'section-2',
      title: 'Project Information',
      order: 2,
      fields: [
        {
          id: 'property_address',
          name: 'property_address',
          label: 'Property Address',
          type: 'text',
          required: true,
          autofill: 'project.property_address',
          gridColumn: 12,
        },
        {
          id: 'owner_name',
          name: 'owner_name',
          label: 'Property Owner Name',
          type: 'text',
          required: true,
          autofill: 'project.owner_name',
          gridColumn: 12,
        },
      ],
    },
  ],
  instructions: 'Complete all sections...',
  pdfTemplate: 'https://your-storage.supabase.co/pdf-templates/prelim-notice.pdf',
  isActive: true,
  requiredForKitIds: ['ca-mechanics-lien-kit'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

---

## Field Reuse / Autofill

### Common Fields

The app supports autofilling fields across multiple forms using the `autofill` property:

**User Fields:**
- `user.name`
- `user.email`
- `user.phone`
- `user.company`
- `user.license_number`

**Project Fields:**
- `project.name`
- `project.address`
- `project.owner_name`
- `project.owner_address`
- `project.property_address`
- `project.start_date`
- `project.completion_date`

### How It Works

1. User completes their profile with basic information
2. User creates a project with property details
3. When starting any form, common fields are auto-filled
4. User can override autofilled values if needed
5. Values are saved per form response

### Example

```typescript
// Field definition with autofill
{
  id: 'contractor_name',
  label: 'Contractor Name',
  type: 'text',
  autofill: 'user.name', // Will auto-fill from user profile
  required: true,
}
```

---

## Frontend Implementation Example

### Complete Form Page

See: `src/pages/FormCompletionPage.tsx`

**Key Steps:**
1. Load form template from database
2. Load existing form response (if continuing)
3. Load common fields for autofill
4. Render FormRunner with all data
5. Handle autosave
6. Handle PDF generation
7. Display download link

### Integration with Dashboard

```tsx
// In dashboard, link to form:
<Link to={`/projects/${projectId}/forms/${formId}`}>
  Open Form
</Link>

// Or with FormRunner directly:
<FormRunner
  template={template}
  // ... other props
/>
```

---

## API Reference

### Generate PDF

**Endpoint:** Supabase Edge Function `generate-pdf`

**Request:**
```typescript
{
  formResponseId: string
}
```

**Response:**
```typescript
{
  success: boolean
  pdfUrl?: string
  message?: string
  error?: string
}
```

**Example:**
```typescript
const { data } = await supabase.functions.invoke('generate-pdf', {
  body: { formResponseId: '123-456-789' }
});
```

### Save Form Response

**Method:** Supabase insert/update

**Example:**
```typescript
// Create new response
const { data } = await supabase
  .from('form_responses')
  .insert({
    user_id: userId,
    project_id: projectId,
    form_id: formId,
    form_name: 'Preliminary Notice',
    field_values: { field1: 'value1', field2: 'value2' },
    status: 'draft',
  })
  .select()
  .single();

// Update existing response
const { data } = await supabase
  .from('form_responses')
  .update({
    field_values: updatedValues,
    status: 'completed',
  })
  .eq('id', formResponseId);
```

---

## Testing

### Local Testing

1. **Start dev server:**
```bash
npm run dev
```

2. **Test form completion:**
   - Navigate to `/projects/:projectId/forms/:formId`
   - Fill out form fields
   - Verify autosave works
   - Click "Generate PDF"

3. **Test Edge Function locally:**
```bash
supabase functions serve generate-pdf
```

### Edge Function Testing

```bash
# Test with curl
curl -X POST 'http://localhost:54321/functions/v1/generate-pdf' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"formResponseId": "test-id"}'
```

---

## Deployment Checklist

### Database
- [ ] Run migration `006_pdf_generation.sql`
- [ ] Create storage buckets
- [ ] Set up storage policies
- [ ] Add sample PDF templates

### Edge Functions
- [ ] Deploy generate-pdf function
- [ ] Set environment variables
- [ ] Test with sample data

### Frontend
- [ ] Update routes in App.tsx
- [ ] Test form completion flow
- [ ] Test PDF generation
- [ ] Test autofill functionality

---

## Troubleshooting

### PDF Generation Fails

**Check:**
1. Form response exists in database
2. PDF template exists in storage
3. Field mappings are correct
4. Storage bucket permissions
5. Edge function logs

**Debug:**
```typescript
// Check form response
const { data } = await supabase
  .from('form_responses')
  .select('*')
  .eq('id', formResponseId);
console.log('Form response:', data);

// Check PDF template
const { data: template } = await supabase
  .from('pdf_templates')
  .select('*')
  .eq('form_id', formId);
console.log('PDF template:', template);
```

### Autosave Not Working

**Check:**
1. useDebounce hook is working
2. onSave function is provided
3. Network requests in dev tools
4. Supabase connection

### Fields Not Autofilling

**Check:**
1. Common fields are loaded
2. Autofill source is correct
3. Field IDs match
4. User profile/project data exists

---

## Future Enhancements

### Short Term
- [ ] Add signature capture component
- [ ] Add file upload fields
- [ ] Implement conditional fields
- [ ] Add form validation rules

### Medium Term
- [ ] Batch PDF generation
- [ ] PDF preview before download
- [ ] Custom PDF templates per user
- [ ] E-signature integration

### Long Term
- [ ] AI-powered form filling
- [ ] OCR for scanned documents
- [ ] Multi-party signatures
- [ ] Blockchain verification

---

## Support

For issues or questions:
- Check the code comments in each file
- Review the error logs in Supabase Dashboard
- Test with the example form template
- Use the FormCompletionPage as a reference implementation
