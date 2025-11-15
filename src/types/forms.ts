// =====================================================
// Form Types & Schema Definitions
// Defines the structure for form templates and responses
// =====================================================

// =====================================================
// Form Field Types
// =====================================================

export type FormFieldType =
    | 'text'
    | 'textarea'
    | 'email'
    | 'phone'
    | 'number'
    | 'currency'
    | 'date'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'address'
    | 'signature'

export interface FormField {
    id: string
    name: string
    label: string
    type: FormFieldType
    description?: string
    placeholder?: string
    defaultValue?: string | number | boolean
    required?: boolean
    validation?: FormFieldValidation
    options?: FormFieldOption[] // For select, radio, checkbox
    conditionalDisplay?: FormFieldCondition
    autofill?: AutofillSource // For reusing common fields
    gridColumn?: number // For layout (1-12)
}

export interface FormFieldValidation {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
    customMessage?: string
}

export interface FormFieldOption {
    label: string
    value: string | number
}

export interface FormFieldCondition {
    field: string // Field ID to watch
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
    value: string | number | boolean
}

// =====================================================
// Autofill Sources (for reusing common fields)
// =====================================================

export type AutofillSource =
    | 'user.name'
    | 'user.email'
    | 'user.phone'
    | 'user.company'
    | 'user.license_number'
    | 'project.name'
    | 'project.address'
    | 'project.owner_name'
    | 'project.owner_address'
    | 'project.property_address'
    | 'project.start_date'
    | 'project.completion_date'

// =====================================================
// Form Template Structure
// =====================================================

export interface FormTemplate {
    id: string
    name: string
    slug: string
    description: string | null
    category: string
    jurisdiction: string
    version: string
    sections: FormSection[]
    instructions: string | null
    pdfTemplate?: string // URL or path to PDF template
    isActive: boolean
    requiredForKitIds: string[]
    createdAt: string
    updatedAt: string
}

export interface FormSection {
    id: string
    title: string
    description?: string
    fields: FormField[]
    order: number
}

// =====================================================
// Form Response (User's filled data)
// =====================================================

export interface FormResponseData {
    id: string
    userId: string
    projectId: string
    formId: string
    formName: string
    status: 'draft' | 'completed' | 'submitted' | 'filed'
    fieldValues: Record<string, FormFieldValue>
    generatedDocumentUrl: string | null
    submittedAt: string | null
    filedAt: string | null
    createdAt: string
    updatedAt: string
}

export type FormFieldValue = string | number | boolean | string[] | AddressValue | SignatureValue

export interface AddressValue {
    street: string
    city: string
    state: string
    zip: string
    county?: string
}

export interface SignatureValue {
    dataUrl: string
    timestamp: string
    name: string
}

// =====================================================
// Common Field Definitions (for autofill)
// =====================================================

export interface CommonFields {
    user: {
        name: string
        email: string
        phone: string
        company: string
        licenseNumber: string
    }
    project: {
        name: string
        address: string
        ownerName: string
        ownerAddress: string
        propertyAddress: string
        startDate: string
        completionDate: string
    }
}

// =====================================================
// PDF Generation Types
// =====================================================

export interface PDFGenerationRequest {
    formResponseId: string
    templateType: 'standard' | 'custom'
    options?: PDFGenerationOptions
}

export interface PDFGenerationOptions {
    includeWatermark?: boolean
    watermarkText?: string
    includeTimestamp?: boolean
    includeSignature?: boolean
    format?: 'letter' | 'legal' | 'a4'
    orientation?: 'portrait' | 'landscape'
}

export interface PDFGenerationResult {
    success: boolean
    documentUrl?: string
    fileName?: string
    error?: string
}

// =====================================================
// Form Validation Result
// =====================================================

export interface FormValidationResult {
    isValid: boolean
    errors: Record<string, string> // Field ID -> Error message
    warnings?: Record<string, string>
}

// =====================================================
// Example Form Template (Texas Preliminary Notice)
// =====================================================

export const TEXAS_PRELIMINARY_NOTICE_TEMPLATE: FormTemplate = {
    id: 'texas-preliminary-notice-v1',
    name: 'Texas Preliminary Notice',
    slug: 'texas-preliminary-notice',
    description: 'Notice to Owner/Contractor of Unpaid Balance for Texas Construction Projects',
    category: 'preliminary_notice',
    jurisdiction: 'Texas',
    version: '1.0',
    sections: [
        {
            id: 'contractor-info',
            title: 'Contractor Information',
            description: 'Your business information',
            order: 1,
            fields: [
                {
                    id: 'contractor_name',
                    name: 'contractor_name',
                    label: 'Contractor/Company Name',
                    type: 'text',
                    required: true,
                    autofill: 'user.company',
                    gridColumn: 12,
                },
                {
                    id: 'contractor_address',
                    name: 'contractor_address',
                    label: 'Business Address',
                    type: 'address',
                    required: true,
                    gridColumn: 12,
                },
                {
                    id: 'contractor_phone',
                    name: 'contractor_phone',
                    label: 'Phone Number',
                    type: 'phone',
                    required: true,
                    autofill: 'user.phone',
                    gridColumn: 6,
                },
                {
                    id: 'contractor_email',
                    name: 'contractor_email',
                    label: 'Email Address',
                    type: 'email',
                    required: true,
                    autofill: 'user.email',
                    gridColumn: 6,
                },
                {
                    id: 'license_number',
                    name: 'license_number',
                    label: 'License Number (if applicable)',
                    type: 'text',
                    required: false,
                    autofill: 'user.license_number',
                    gridColumn: 6,
                },
            ],
        },
        {
            id: 'project-info',
            title: 'Project Information',
            description: 'Details about the construction project',
            order: 2,
            fields: [
                {
                    id: 'project_name',
                    name: 'project_name',
                    label: 'Project Name',
                    type: 'text',
                    required: true,
                    autofill: 'project.name',
                    gridColumn: 12,
                },
                {
                    id: 'property_address',
                    name: 'property_address',
                    label: 'Property Address',
                    type: 'address',
                    required: true,
                    autofill: 'project.property_address',
                    gridColumn: 12,
                },
                {
                    id: 'work_description',
                    name: 'work_description',
                    label: 'Description of Work Performed',
                    type: 'textarea',
                    required: true,
                    placeholder: 'Describe the labor, materials, or equipment provided...',
                    gridColumn: 12,
                    validation: {
                        minLength: 10,
                        maxLength: 1000,
                    },
                },
                {
                    id: 'start_date',
                    name: 'start_date',
                    label: 'Work Start Date',
                    type: 'date',
                    required: true,
                    autofill: 'project.start_date',
                    gridColumn: 6,
                },
                {
                    id: 'first_furnished_date',
                    name: 'first_furnished_date',
                    label: 'Date First Furnished Labor/Materials',
                    type: 'date',
                    required: true,
                    gridColumn: 6,
                },
            ],
        },
        {
            id: 'owner-info',
            title: 'Owner/General Contractor Information',
            description: 'Information about the property owner or general contractor',
            order: 3,
            fields: [
                {
                    id: 'owner_name',
                    name: 'owner_name',
                    label: 'Owner/GC Name',
                    type: 'text',
                    required: true,
                    autofill: 'project.owner_name',
                    gridColumn: 12,
                },
                {
                    id: 'owner_address',
                    name: 'owner_address',
                    label: 'Owner/GC Address',
                    type: 'address',
                    required: true,
                    autofill: 'project.owner_address',
                    gridColumn: 12,
                },
            ],
        },
        {
            id: 'amount-info',
            title: 'Amount Information',
            description: 'Details about the unpaid amount',
            order: 4,
            fields: [
                {
                    id: 'original_contract_amount',
                    name: 'original_contract_amount',
                    label: 'Original Contract Amount',
                    type: 'currency',
                    required: true,
                    gridColumn: 6,
                },
                {
                    id: 'amount_paid',
                    name: 'amount_paid',
                    label: 'Amount Paid to Date',
                    type: 'currency',
                    required: true,
                    gridColumn: 6,
                },
                {
                    id: 'unpaid_balance',
                    name: 'unpaid_balance',
                    label: 'Current Unpaid Balance',
                    type: 'currency',
                    required: true,
                    gridColumn: 6,
                },
                {
                    id: 'last_payment_date',
                    name: 'last_payment_date',
                    label: 'Date of Last Payment',
                    type: 'date',
                    required: false,
                    gridColumn: 6,
                },
            ],
        },
        {
            id: 'signature',
            title: 'Signature',
            description: 'Sign and date this notice',
            order: 5,
            fields: [
                {
                    id: 'signatory_name',
                    name: 'signatory_name',
                    label: 'Printed Name',
                    type: 'text',
                    required: true,
                    autofill: 'user.name',
                    gridColumn: 6,
                },
                {
                    id: 'signatory_title',
                    name: 'signatory_title',
                    label: 'Title',
                    type: 'text',
                    required: true,
                    placeholder: 'e.g., Owner, President, etc.',
                    gridColumn: 6,
                },
                {
                    id: 'signature',
                    name: 'signature',
                    label: 'Signature',
                    type: 'signature',
                    required: true,
                    gridColumn: 12,
                },
                {
                    id: 'signature_date',
                    name: 'signature_date',
                    label: 'Date',
                    type: 'date',
                    required: true,
                    defaultValue: new Date().toISOString().split('T')[0],
                    gridColumn: 6,
                },
            ],
        },
    ],
    instructions: `
# Texas Preliminary Notice Instructions

## When to File
This notice must be sent by the 15th day of the third month following each month in which labor or materials were provided.

## Who Must Receive Notice
- Property Owner
- General Contractor (if you're a subcontractor)

## Delivery Method
Send via certified mail, return receipt requested.

## Important Notes
- Keep a copy of the notice and proof of mailing
- This notice preserves your lien rights
- Failure to send may result in loss of lien rights
  `,
    pdfTemplate: '/templates/texas-preliminary-notice.pdf',
    isActive: true,
    requiredForKitIds: ['residential-kit', 'commercial-kit'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}
