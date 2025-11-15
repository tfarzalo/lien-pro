// =====================================================
// Database Types
// Auto-generated types matching Supabase schema
// =====================================================

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

// Enums
export type UserRole = 'user' | 'attorney' | 'admin'
export type SubscriptionStatus = 'free' | 'active' | 'cancelled' | 'past_due'
export type SubscriptionTier = 'basic' | 'professional' | 'enterprise'
export type KitCategory = 'residential' | 'commercial' | 'subcontractor' | 'specialty'
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'card' | 'ach' | 'invoice'
export type KitAccessType = 'purchased' | 'granted' | 'trial'
export type ProjectType = 'residential_single' | 'residential_multi' | 'commercial' | 'industrial' | 'public'
export type ProjectStatus = 'draft' | 'active' | 'lien_filed' | 'resolved' | 'closed'
export type AssessmentStatus = 'draft' | 'in_progress' | 'completed' | 'archived'
export type AnswerType = 'text' | 'radio' | 'checkbox' | 'date' | 'number'
export type FormCategory = 'preliminary_notice' | 'affidavit' | 'lien' | 'release' | 'demand'
export type FormResponseStatus = 'draft' | 'completed' | 'submitted' | 'filed'
export type DeadlineType = 'preliminary_notice' | 'affidavit_deadline' | 'lien_filing' | 'bond_claim' | 'lawsuit_filing' | 'custom'
export type DeadlinePriority = 'low' | 'medium' | 'high' | 'critical'
export type DeadlineStatus = 'pending' | 'completed' | 'missed' | 'cancelled'
export type UploadCategory = 'contract' | 'invoice' | 'photo' | 'correspondence' | 'court_filing' | 'other'
export type NoteType = 'general' | 'legal_review' | 'strategy' | 'client_communication' | 'court_update'
export type NotePriority = 'low' | 'normal' | 'high' | 'urgent'

// Database Tables
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile
                Insert: ProfileInsert
                Update: ProfileUpdate
            }
            lien_kits: {
                Row: LienKit
                Insert: LienKitInsert
                Update: LienKitUpdate
            }
            orders: {
                Row: Order
                Insert: OrderInsert
                Update: OrderUpdate
            }
            order_items: {
                Row: OrderItem
                Insert: OrderItemInsert
                Update: OrderItemUpdate
            }
            user_kits: {
                Row: UserKit
                Insert: UserKitInsert
                Update: UserKitUpdate
            }
            projects: {
                Row: Project
                Insert: ProjectInsert
                Update: ProjectUpdate
            }
            assessments: {
                Row: Assessment
                Insert: AssessmentInsert
                Update: AssessmentUpdate
            }
            assessment_answers: {
                Row: AssessmentAnswer
                Insert: AssessmentAnswerInsert
                Update: AssessmentAnswerUpdate
            }
            forms: {
                Row: Form
                Insert: FormInsert
                Update: FormUpdate
            }
            form_responses: {
                Row: FormResponse
                Insert: FormResponseInsert
                Update: FormResponseUpdate
            }
            deadlines: {
                Row: Deadline
                Insert: DeadlineInsert
                Update: DeadlineUpdate
            }
            uploads: {
                Row: Upload
                Insert: UploadInsert
                Update: UploadUpdate
            }
            attorney_notes: {
                Row: AttorneyNote
                Insert: AttorneyNoteInsert
                Update: AttorneyNoteUpdate
            }
            case_status_updates: {
                Row: CaseStatusUpdate
                Insert: CaseStatusUpdateInsert
                Update: CaseStatusUpdateUpdate
            }
        }
    }
}

// =====================================================
// Profile Types
// =====================================================

export interface Profile {
    id: string
    email: string
    full_name: string | null
    company_name: string | null
    phone: string | null
    role: UserRole
    subscription_status: SubscriptionStatus | null
    subscription_tier: SubscriptionTier | null
    created_at: string
    updated_at: string
}

export interface ProfileInsert {
    id: string
    email: string
    full_name?: string | null
    company_name?: string | null
    phone?: string | null
    role?: UserRole
    subscription_status?: SubscriptionStatus | null
    subscription_tier?: SubscriptionTier | null
}

export interface ProfileUpdate {
    email?: string
    full_name?: string | null
    company_name?: string | null
    phone?: string | null
    subscription_status?: SubscriptionStatus | null
    subscription_tier?: SubscriptionTier | null
}

// =====================================================
// Lien Kit Types
// =====================================================

export interface LienKit {
    id: string
    name: string
    slug: string
    description: string | null
    long_description: string | null
    price_cents: number
    category: KitCategory | null
    jurisdiction: string
    is_active: boolean
    is_popular: boolean
    features: string[]
    includes_attorney_review: boolean
    form_template_ids: string[]
    sort_order: number
    created_at: string
    updated_at: string
}

export interface LienKitInsert {
    name: string
    slug: string
    description?: string | null
    long_description?: string | null
    price_cents: number
    category?: KitCategory | null
    jurisdiction?: string
    is_active?: boolean
    is_popular?: boolean
    features?: string[]
    includes_attorney_review?: boolean
    form_template_ids?: string[]
    sort_order?: number
}

export interface LienKitUpdate {
    name?: string
    slug?: string
    description?: string | null
    long_description?: string | null
    price_cents?: number
    category?: KitCategory | null
    is_active?: boolean
    is_popular?: boolean
    features?: string[]
    includes_attorney_review?: boolean
    form_template_ids?: string[]
    sort_order?: number
}

// =====================================================
// Order Types
// =====================================================

export interface Order {
    id: string
    user_id: string
    order_number: string
    status: OrderStatus
    subtotal_cents: number
    tax_cents: number
    total_cents: number
    currency: string
    payment_intent_id: string | null
    payment_method: PaymentMethod | null
    billing_email: string | null
    billing_address: Json | null
    metadata: Json
    completed_at: string | null
    created_at: string
    updated_at: string
}

export interface OrderInsert {
    user_id: string
    order_number: string
    status?: OrderStatus
    subtotal_cents: number
    tax_cents?: number
    total_cents: number
    currency?: string
    payment_intent_id?: string | null
    payment_method?: PaymentMethod | null
    billing_email?: string | null
    billing_address?: Json | null
    metadata?: Json
}

export interface OrderUpdate {
    status?: OrderStatus
    payment_intent_id?: string | null
    payment_method?: PaymentMethod | null
    completed_at?: string | null
    metadata?: Json
}

export interface OrderItem {
    id: string
    order_id: string
    lien_kit_id: string
    quantity: number
    unit_price_cents: number
    total_price_cents: number
    kit_name: string
    kit_features: Json
    created_at: string
}

export interface OrderItemInsert {
    order_id: string
    lien_kit_id: string
    quantity?: number
    unit_price_cents: number
    total_price_cents: number
    kit_name: string
    kit_features?: Json
}

export interface OrderItemUpdate {
    quantity?: number
    unit_price_cents?: number
    total_price_cents?: number
}

// =====================================================
// User Kit Types
// =====================================================

export interface UserKit {
    id: string
    user_id: string
    lien_kit_id: string
    order_id: string | null
    granted_by: string | null
    access_type: KitAccessType
    expires_at: string | null
    is_active: boolean
    created_at: string
}

export interface UserKitInsert {
    user_id: string
    lien_kit_id: string
    order_id?: string | null
    granted_by?: string | null
    access_type?: KitAccessType
    expires_at?: string | null
    is_active?: boolean
}

export interface UserKitUpdate {
    expires_at?: string | null
    is_active?: boolean
}

// =====================================================
// Project Types
// =====================================================

export interface Project {
    id: string
    user_id: string
    name: string
    project_type: ProjectType | null
    property_address: Json | null
    property_owner_name: string | null
    property_owner_contact: Json | null
    general_contractor_name: string | null
    general_contractor_contact: Json | null
    contract_date: string | null
    contract_amount_cents: number | null
    work_start_date: string | null
    work_completion_date: string | null
    amount_owed_cents: number | null
    status: ProjectStatus
    assigned_attorney_id: string | null
    notes: string | null
    metadata: Json
    created_at: string
    updated_at: string
}

export interface ProjectInsert {
    user_id: string
    name: string
    project_type?: ProjectType | null
    property_address?: Json | null
    property_owner_name?: string | null
    property_owner_contact?: Json | null
    general_contractor_name?: string | null
    general_contractor_contact?: Json | null
    contract_date?: string | null
    contract_amount_cents?: number | null
    work_start_date?: string | null
    work_completion_date?: string | null
    amount_owed_cents?: number | null
    status?: ProjectStatus
    assigned_attorney_id?: string | null
    notes?: string | null
    metadata?: Json
}

export interface ProjectUpdate {
    name?: string
    project_type?: ProjectType | null
    property_address?: Json | null
    property_owner_name?: string | null
    property_owner_contact?: Json | null
    general_contractor_name?: string | null
    general_contractor_contact?: Json | null
    contract_date?: string | null
    contract_amount_cents?: number | null
    work_start_date?: string | null
    work_completion_date?: string | null
    amount_owed_cents?: number | null
    status?: ProjectStatus
    assigned_attorney_id?: string | null
    notes?: string | null
    metadata?: Json
}

// =====================================================
// Assessment Types
// =====================================================

export interface Assessment {
    id: string
    user_id: string
    project_id: string | null
    assessment_type: string
    status: AssessmentStatus
    current_step: number
    total_steps: number
    result_summary: Json | null
    recommended_kit_ids: string[]
    completed_at: string | null
    created_at: string
    updated_at: string
}

export interface AssessmentInsert {
    user_id: string
    project_id?: string | null
    assessment_type?: string
    status?: AssessmentStatus
    current_step?: number
    total_steps?: number
    result_summary?: Json | null
    recommended_kit_ids?: string[]
}

export interface AssessmentUpdate {
    project_id?: string | null
    status?: AssessmentStatus
    current_step?: number
    result_summary?: Json | null
    recommended_kit_ids?: string[]
    completed_at?: string | null
}

export interface AssessmentAnswer {
    id: string
    assessment_id: string
    question_id: string
    question_text: string
    answer_type: AnswerType
    answer_value: Json
    step_number: number | null
    created_at: string
    updated_at: string
}

export interface AssessmentAnswerInsert {
    assessment_id: string
    question_id: string
    question_text: string
    answer_type: AnswerType
    answer_value: Json
    step_number?: number | null
}

export interface AssessmentAnswerUpdate {
    answer_value?: Json
}

// =====================================================
// Form Types
// =====================================================

export interface Form {
    id: string
    name: string
    slug: string
    description: string | null
    category: FormCategory | null
    jurisdiction: string
    version: string
    field_definitions: Json
    template_content: string | null
    instructions: string | null
    is_active: boolean
    required_for_kit_ids: string[]
    created_at: string
    updated_at: string
}

export interface FormInsert {
    name: string
    slug: string
    description?: string | null
    category?: FormCategory | null
    jurisdiction?: string
    version?: string
    field_definitions: Json
    template_content?: string | null
    instructions?: string | null
    is_active?: boolean
    required_for_kit_ids?: string[]
}

export interface FormUpdate {
    name?: string
    description?: string | null
    field_definitions?: Json
    template_content?: string | null
    instructions?: string | null
    is_active?: boolean
}

export interface FormResponse {
    id: string
    user_id: string
    project_id: string
    form_id: string
    form_name: string
    status: FormResponseStatus
    field_values: Json
    generated_document_url: string | null
    submitted_at: string | null
    filed_at: string | null
    created_at: string
    updated_at: string
}

export interface FormResponseInsert {
    user_id: string
    project_id: string
    form_id: string
    form_name: string
    status?: FormResponseStatus
    field_values?: Json
    generated_document_url?: string | null
}

export interface FormResponseUpdate {
    status?: FormResponseStatus
    field_values?: Json
    generated_document_url?: string | null
    submitted_at?: string | null
    filed_at?: string | null
}

// =====================================================
// Deadline Types
// =====================================================

export interface Deadline {
    id: string
    user_id: string
    project_id: string
    title: string
    description: string | null
    deadline_type: DeadlineType
    due_date: string
    reminder_dates: string[]
    priority: DeadlinePriority
    status: DeadlineStatus
    completed_at: string | null
    related_form_response_id: string | null
    created_at: string
    updated_at: string
}

export interface DeadlineInsert {
    user_id: string
    project_id: string
    title: string
    description?: string | null
    deadline_type: DeadlineType
    due_date: string
    reminder_dates?: string[]
    priority?: DeadlinePriority
    status?: DeadlineStatus
    related_form_response_id?: string | null
}

export interface DeadlineUpdate {
    title?: string
    description?: string | null
    due_date?: string
    reminder_dates?: string[]
    priority?: DeadlinePriority
    status?: DeadlineStatus
    completed_at?: string | null
}

// =====================================================
// Upload Types
// =====================================================

export interface Upload {
    id: string
    user_id: string
    project_id: string | null
    form_response_id: string | null
    file_name: string
    file_size_bytes: number
    file_type: string
    storage_path: string
    storage_bucket: string
    category: UploadCategory | null
    description: string | null
    is_public: boolean
    uploaded_by: string
    created_at: string
}

export interface UploadInsert {
    user_id: string
    project_id?: string | null
    form_response_id?: string | null
    file_name: string
    file_size_bytes: number
    file_type: string
    storage_path: string
    storage_bucket?: string
    category?: UploadCategory | null
    description?: string | null
    is_public?: boolean
    uploaded_by: string
}

export interface UploadUpdate {
    category?: UploadCategory | null
    description?: string | null
    is_public?: boolean
}

// =====================================================
// Attorney Note Types
// =====================================================

export interface AttorneyNote {
    id: string
    project_id: string
    attorney_id: string
    note_type: NoteType
    content: string
    is_internal: boolean
    priority: NotePriority
    created_at: string
    updated_at: string
}

export interface AttorneyNoteInsert {
    project_id: string
    attorney_id: string
    note_type?: NoteType
    content: string
    is_internal?: boolean
    priority?: NotePriority
}

export interface AttorneyNoteUpdate {
    note_type?: NoteType
    content?: string
    is_internal?: boolean
    priority?: NotePriority
}

// =====================================================
// Case Status Update Types
// =====================================================

export interface CaseStatusUpdate {
    id: string
    project_id: string
    updated_by: string
    old_status: ProjectStatus | null
    new_status: ProjectStatus
    comment: string | null
    notify_user: boolean
    created_at: string
}

export interface CaseStatusUpdateInsert {
    project_id: string
    updated_by: string
    old_status?: ProjectStatus | null
    new_status: ProjectStatus
    comment?: string | null
    notify_user?: boolean
}

export interface CaseStatusUpdateUpdate {
    comment?: string | null
    notify_user?: boolean
}

// =====================================================
// Composite Types (with joins)
// =====================================================

export interface OrderWithItems extends Order {
    order_items: (OrderItem & { lien_kit: LienKit | null })[]
}

export interface ProjectWithDeadlines extends Project {
    deadlines: Deadline[]
}

export interface AssessmentWithAnswers extends Assessment {
    assessment_answers: AssessmentAnswer[]
}

export interface UserKitWithKit extends UserKit {
    lien_kit: LienKit
}

// =====================================================
// Dashboard Data Types
// =====================================================

export interface DashboardData {
    user: Profile
    activeProjects: Project[]
    upcomingDeadlines: Deadline[]
    ownedKits: UserKitWithKit[]
    recentOrders: OrderWithItems[]
    assessments: Assessment[]
}

// =====================================================
// Utility Types
// =====================================================

export interface PaginationParams {
    page?: number
    pageSize?: number
}

export interface PaginatedResponse<T> {
    data: T[]
    count: number
    page: number
    pageSize: number
    totalPages: number
}

export interface ApiError {
    message: string
    code?: string
    details?: unknown
}
