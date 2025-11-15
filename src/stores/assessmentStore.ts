// =====================================================
// Assessment Store (Zustand)
// Manages assessment flow state
// =====================================================

import { create } from 'zustand'
import type { AssessmentState, AssessmentStep, AssessmentResult } from '@/types/assessment'

interface AssessmentStore extends AssessmentState {
    // Actions
    startAssessment: () => void
    setAssessmentId: (id: string) => void
    setCurrentStep: (step: AssessmentStep) => void
    setCurrentQuestionIndex: (index: number) => void
    saveAnswer: (questionKey: string, value: any) => void
    markQuestionCompleted: (questionKey: string) => void
    setResult: (result: AssessmentResult) => void
    nextQuestion: () => void
    previousQuestion: () => void
    resetAssessment: () => void
}

const initialState: AssessmentState = {
    assessmentId: null,
    currentStep: 'intro',
    currentQuestionIndex: 0,
    answers: {},
    completedQuestions: new Set(),
    result: null,
}

export const useAssessmentStore = create<AssessmentStore>((set) => ({
    ...initialState,

    startAssessment: () =>
        set({
            currentStep: 'questions',
            currentQuestionIndex: 0,
        }),

    setAssessmentId: (id) =>
        set({ assessmentId: id }),

    setCurrentStep: (step) =>
        set({ currentStep: step }),

    setCurrentQuestionIndex: (index) =>
        set({ currentQuestionIndex: index }),

    saveAnswer: (questionKey, value) =>
        set((state) => ({
            answers: {
                ...state.answers,
                [questionKey]: value,
            },
        })),

    markQuestionCompleted: (questionKey) =>
        set((state) => ({
            completedQuestions: new Set([...state.completedQuestions, questionKey]),
        })),

    setResult: (result) =>
        set({
            result,
            currentStep: 'results',
        }),

    nextQuestion: () =>
        set((state) => ({
            currentQuestionIndex: state.currentQuestionIndex + 1,
        })),

    previousQuestion: () =>
        set((state) => ({
            currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
        })),

    resetAssessment: () =>
        set(initialState),
}))
