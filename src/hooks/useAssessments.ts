// =====================================================
// React Query Hooks for Assessments
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    createAssessment,
    getAssessmentWithAnswers,
    getUserAssessments,
    getLatestAssessment,
    updateAssessment,
    saveAssessmentAnswer,
    getAssessmentAnswers,
    calculateAssessmentResult,
    deleteAssessment,
} from '@/services/assessmentsService'
import { useAuth } from '@/contexts/AuthContext'
import type { AssessmentUpdate, AssessmentAnswerInsert } from '@/types/database'

// Query keys
export const assessmentKeys = {
    all: ['assessments'] as const,
    lists: () => [...assessmentKeys.all, 'list'] as const,
    list: (userId: string) => [...assessmentKeys.lists(), userId] as const,
    details: () => [...assessmentKeys.all, 'detail'] as const,
    detail: (id: string) => [...assessmentKeys.details(), id] as const,
    latest: (userId: string) => [...assessmentKeys.all, 'latest', userId] as const,
    answers: (assessmentId: string) => [...assessmentKeys.all, 'answers', assessmentId] as const,
}

/**
 * Hook to fetch user's assessments
 */
export function useAssessments() {
    const { user } = useAuth()

    return useQuery({
        queryKey: assessmentKeys.list(user?.id || ''),
        queryFn: () => getUserAssessments(user!.id),
        enabled: !!user?.id,
    })
}

/**
 * Hook to fetch a specific assessment with answers
 */
export function useAssessment(assessmentId: string | undefined) {
    return useQuery({
        queryKey: assessmentKeys.detail(assessmentId || ''),
        queryFn: () => getAssessmentWithAnswers(assessmentId!),
        enabled: !!assessmentId,
    })
}

/**
 * Hook to fetch latest assessment
 */
export function useLatestAssessment() {
    const { user } = useAuth()

    return useQuery({
        queryKey: assessmentKeys.latest(user?.id || ''),
        queryFn: () => getLatestAssessment(user!.id),
        enabled: !!user?.id,
    })
}

/**
 * Hook to fetch assessment answers
 */
export function useAssessmentAnswers(assessmentId: string | undefined) {
    return useQuery({
        queryKey: assessmentKeys.answers(assessmentId || ''),
        queryFn: () => getAssessmentAnswers(assessmentId!),
        enabled: !!assessmentId,
    })
}

/**
 * Mutation hook to create a new assessment
 */
export function useCreateAssessment() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: ({ projectId }: { projectId?: string }) =>
            createAssessment(user!.id, projectId),
        onSuccess: () => {
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: assessmentKeys.list(user.id) })
                queryClient.invalidateQueries({ queryKey: assessmentKeys.latest(user.id) })
            }
        },
    })
}

/**
 * Mutation hook to update an assessment
 */
export function useUpdateAssessment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ assessmentId, updates }: { assessmentId: string; updates: AssessmentUpdate }) =>
            updateAssessment(assessmentId, updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(data.id) })
            queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() })
        },
    })
}

/**
 * Mutation hook to save an assessment answer
 */
export function useSaveAssessmentAnswer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (answer: AssessmentAnswerInsert) => saveAssessmentAnswer(answer),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(data.assessment_id) })
            queryClient.invalidateQueries({ queryKey: assessmentKeys.answers(data.assessment_id) })
        },
    })
}

/**
 * Mutation hook to calculate assessment result
 */
export function useCalculateAssessmentResult() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (assessmentId: string) => calculateAssessmentResult(assessmentId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(data.id) })
            queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() })
        },
    })
}

/**
 * Mutation hook to delete an assessment
 */
export function useDeleteAssessment() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: (assessmentId: string) => deleteAssessment(assessmentId),
        onSuccess: () => {
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: assessmentKeys.list(user.id) })
            }
        },
    })
}
