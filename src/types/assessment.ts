// =====================================================
// Assessment Flow Types
// =====================================================

import type { LienKit, KitCategory } from './database'

// Assessment question types
export type QuestionType = 'radio' | 'select' | 'checkbox' | 'date' | 'text' | 'number'

export interface AssessmentQuestion {
    id: string
    key: string
    question: string
    description?: string
    type: QuestionType
    required: boolean
    options?: AssessmentOption[]
    validation?: {
        min?: number
        max?: number
        pattern?: string
        message?: string
    }
    // Conditional logic
    showIf?: {
        questionKey: string
        value: any
    }
    // Branch to different questions based on answer
    branches?: {
        value: any
        nextQuestionId: string
    }[]
}

export interface AssessmentOption {
    value: string | number
    label: string
    description?: string
}

// Assessment flow steps
export type AssessmentStep =
    | 'intro'
    | 'questions'
    | 'processing'
    | 'results'

// Assessment state
export interface AssessmentState {
    assessmentId: string | null
    currentStep: AssessmentStep
    currentQuestionIndex: number
    answers: Record<string, any>
    completedQuestions: Set<string>
    result: AssessmentResult | null
}

// Assessment result
export interface AssessmentResult {
    score: number
    recommendedKits: RecommendedKit[]
    urgencyLevel: UrgencyLevel
    identifiedDeadlines: IdentifiedDeadline[]
    requiredDocuments: RequiredDocument[]
    explanation: string
    nextSteps: string[]
    warnings?: string[]
}

export interface RecommendedKit {
    kit: LienKit
    priority: 'primary' | 'secondary' | 'optional'
    reason: string
    matchScore: number
}

export type UrgencyLevel = 'low' | 'standard' | 'high' | 'critical'

export interface IdentifiedDeadline {
    title: string
    description: string
    daysFromNow: number
    type: 'preliminary_notice' | 'affidavit_deadline' | 'lien_filing' | 'bond_claim' | 'lawsuit_filing'
    priority: 'low' | 'medium' | 'high' | 'critical'
    calculatedFrom: string // Which answer this was calculated from
}

export interface RequiredDocument {
    name: string
    description: string
    category: 'contract' | 'invoice' | 'photo' | 'correspondence' | 'other'
    required: boolean
    included: boolean // Whether it's included in the recommended kit
}

// Assessment flow configuration
export interface AssessmentFlow {
    id: string
    name: string
    description: string
    questions: AssessmentQuestion[]
    startQuestionId: string
}

// Answer mapping for kit recommendation
export interface AnswerProfile {
    projectType: 'residential_single' | 'residential_multi' | 'commercial' | 'industrial' | 'public'
    claimantRole: 'general_contractor' | 'subcontractor' | 'material_supplier' | 'equipment_lessor' | 'design_professional'
    contractAmount?: number
    hasWrittenContract: boolean
    workStartDate?: Date
    workStatus: 'not_started' | 'in_progress' | 'completed' | 'stopped'
    paymentStatus: 'current' | 'overdue_30' | 'overdue_60' | 'overdue_90_plus'
    propertyOwnerType: 'private' | 'public' | 'unknown'
    noticesSent: ('preliminary_notice' | 'monthly_notice' | 'notice_of_nonpayment')[]
    isTexasProject: boolean
}

// Kit recommendation engine types
export interface KitMatchCriteria {
    category: KitCategory
    score: number
    reasons: string[]
    urgency: UrgencyLevel
    deadlines: Partial<IdentifiedDeadline>[]
}
