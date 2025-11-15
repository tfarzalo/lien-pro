// =====================================================
// Assessments Service
// Data access functions for assessments and answers
// =====================================================

import { supabase } from '@/lib/supabaseClient'
import type {
    Assessment,
    AssessmentInsert,
    AssessmentUpdate,
    AssessmentAnswer,
    AssessmentAnswerInsert,
    AssessmentWithAnswers,
} from '@/types/database'

/**
 * Create a new assessment
 */
export async function createAssessment(
    userId: string,
    projectId?: string
): Promise<Assessment> {
    const assessmentData: AssessmentInsert = {
        user_id: userId,
        project_id: projectId || null,
        assessment_type: 'lien_eligibility',
        status: 'in_progress',
        current_step: 1,
        total_steps: 5,
    }

    const { data, error } = await supabase
        .from('assessments')
        .insert(assessmentData)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

/**
 * Get assessment by ID with all answers
 */
export async function getAssessmentWithAnswers(
    assessmentId: string
): Promise<AssessmentWithAnswers | null> {
    const { data, error } = await supabase
        .from('assessments')
        .select(`
      *,
      assessment_answers(*)
    `)
        .eq('id', assessmentId)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data as AssessmentWithAnswers
}

/**
 * Get user's assessments
 */
export async function getUserAssessments(userId: string): Promise<Assessment[]> {
    const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    return data || []
}

/**
 * Get user's most recent assessment
 */
export async function getLatestAssessment(userId: string): Promise<Assessment | null> {
    const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(error.message)
    }

    return data || null
}

/**
 * Update assessment
 */
export async function updateAssessment(
    assessmentId: string,
    updates: AssessmentUpdate
): Promise<Assessment> {
    const { data, error } = await supabase
        .from('assessments')
        .update(updates)
        .eq('id', assessmentId)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

/**
 * Save or update an assessment answer
 */
export async function saveAssessmentAnswer(
    answer: AssessmentAnswerInsert
): Promise<AssessmentAnswer> {
    // Try to update existing answer first
    const { data: existing } = await supabase
        .from('assessment_answers')
        .select('id')
        .eq('assessment_id', answer.assessment_id)
        .eq('question_id', answer.question_id)
        .single()

    if (existing) {
        // Update existing answer
        const { data, error } = await supabase
            .from('assessment_answers')
            .update({ answer_value: answer.answer_value })
            .eq('id', existing.id)
            .select()
            .single()

        if (error) {
            throw new Error(error.message)
        }

        return data
    } else {
        // Insert new answer
        const { data, error } = await supabase
            .from('assessment_answers')
            .insert(answer)
            .select()
            .single()

        if (error) {
            throw new Error(error.message)
        }

        return data
    }
}

/**
 * Get answers for a specific assessment
 */
export async function getAssessmentAnswers(
    assessmentId: string
): Promise<AssessmentAnswer[]> {
    const { data, error } = await supabase
        .from('assessment_answers')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('step_number', { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return data || []
}

/**
 * Calculate assessment result and recommendations
 */
export async function calculateAssessmentResult(
    assessmentId: string
): Promise<Assessment> {
    // Get assessment with answers
    const assessment = await getAssessmentWithAnswers(assessmentId)

    if (!assessment) {
        throw new Error('Assessment not found')
    }

    // Simple recommendation logic (can be enhanced)
    const answers = assessment.assessment_answers
    const recommendedKitIds: string[] = []

    // Find project type answer
    const projectTypeAnswer = answers.find(a => a.question_id === 'project_type')

    // Basic recommendation logic based on project type
    if (projectTypeAnswer) {
        const projectType = projectTypeAnswer.answer_value as string

        if (projectType?.includes('Residential')) {
            // Recommend residential kit
            const { data: resKit } = await supabase
                .from('lien_kits')
                .select('id')
                .eq('slug', 'texas-residential-lien-kit')
                .single()

            if (resKit) recommendedKitIds.push(resKit.id)
        } else if (projectType?.includes('Commercial')) {
            // Recommend commercial kit
            const { data: comKit } = await supabase
                .from('lien_kits')
                .select('id')
                .eq('slug', 'commercial-lien-package')
                .single()

            if (comKit) recommendedKitIds.push(comKit.id)
        }
    }

    // Find contractor type answer
    const contractorAnswer = answers.find(a => a.question_id === 'contract_party')
    if (contractorAnswer && (contractorAnswer.answer_value as string)?.includes('subcontractor')) {
        const { data: subKit } = await supabase
            .from('lien_kits')
            .select('id')
            .eq('slug', 'subcontractor-essentials')
            .single()

        if (subKit && !recommendedKitIds.includes(subKit.id)) {
            recommendedKitIds.push(subKit.id)
        }
    }

    // Create result summary
    const resultSummary = {
        eligible_for_lien: true, // Could be calculated based on answers
        recommended_actions: [
            'File preliminary notice within 15 days',
            'Document all work performed',
            'Keep detailed records of materials and labor'
        ],
        key_deadlines: [
            {
                type: 'preliminary_notice',
                description: 'File preliminary notice',
                days_from_start: 15
            },
            {
                type: 'lien_filing',
                description: 'File mechanics lien affidavit',
                days_from_completion: 120
            }
        ],
        notes: 'Based on your answers, you appear eligible to file a mechanics lien in Texas.'
    }

    // Update assessment with results
    const updates: AssessmentUpdate = {
        status: 'completed',
        result_summary: resultSummary as any,
        recommended_kit_ids: recommendedKitIds,
        completed_at: new Date().toISOString(),
    }

    return updateAssessment(assessmentId, updates)
}

/**
 * Delete an assessment
 */
export async function deleteAssessment(assessmentId: string): Promise<void> {
    const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId)

    if (error) {
        throw new Error(error.message)
    }
}
