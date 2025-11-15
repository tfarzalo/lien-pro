// =====================================================
// Interactive Assessment Page
// Main orchestrator for the assessment flow
// =====================================================

import { useEffect, useState } from 'react'
import { useAssessmentStore } from '@/stores/assessmentStore'
import { AssessmentIntro } from '@/components/assessment/AssessmentIntro'
import { AssessmentQuestion } from '@/components/assessment/AssessmentQuestion'
import { AssessmentSummary } from '@/components/assessment/AssessmentSummary'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { useCreateAssessment, useSaveAssessmentAnswer, useCalculateAssessmentResult } from '@/hooks/useAssessments'
import { useLienKits } from '@/hooks/useLienKits'
import { texasLienAssessmentFlow, shouldShowQuestion } from '@/lib/assessmentQuestions'
import { generateKitRecommendation } from '@/lib/kitRecommendationEngine'
import type { AssessmentQuestion as QuestionType } from '@/types/assessment'

export function InteractiveAssessmentPage() {
    const { user } = useAuth()
    const { data: availableKits } = useLienKits()

    // Zustand store
    const {
        assessmentId,
        currentStep,
        currentQuestionIndex,
        answers,
        result,
        setAssessmentId,
        setCurrentStep,
        setCurrentQuestionIndex,
        saveAnswer,
        markQuestionCompleted,
        setResult,
        resetAssessment,
    } = useAssessmentStore()

    // React Query mutations
    const createAssessment = useCreateAssessment()
    const saveAssessmentAnswer = useSaveAssessmentAnswer()
    const calculateResult = useCalculateAssessmentResult()

    // Local state for visible questions
    const [visibleQuestions, setVisibleQuestions] = useState<QuestionType[]>([])

    // Filter questions based on previous answers
    useEffect(() => {
        const filtered = texasLienAssessmentFlow.questions.filter(q =>
            shouldShowQuestion(q, answers)
        )
        setVisibleQuestions(filtered)
    }, [answers])

    // Start assessment
    const handleStart = async () => {
        if (!user) return

        try {
            // Create assessment in database
            const newAssessment = await createAssessment.mutateAsync({ projectId: undefined })
            setAssessmentId(newAssessment.id)
            setCurrentStep('questions')
        } catch (error) {
            console.error('Failed to start assessment:', error)
        }
    }

    // Handle answer
    const handleAnswer = async (value: any) => {
        const currentQuestion = visibleQuestions[currentQuestionIndex]
        if (!currentQuestion) return

        // Save answer locally
        saveAnswer(currentQuestion.key, value)
        markQuestionCompleted(currentQuestion.key)

        // Save to database (fire and forget, don't block UI)
        if (assessmentId) {
            // Map question type to answer type (select -> radio, as they're similar)
            const answerType: 'text' | 'radio' | 'checkbox' | 'date' | 'number' =
                currentQuestion.type === 'select' ? 'radio' : currentQuestion.type

            saveAssessmentAnswer.mutate({
                assessment_id: assessmentId,
                question_id: currentQuestion.id,
                question_text: currentQuestion.question,
                answer_type: answerType,
                answer_value: value,
                step_number: currentQuestionIndex + 1,
            })
        }
    }

    // Next question
    const handleNext = () => {
        const currentQuestion = visibleQuestions[currentQuestionIndex]
        if (!currentQuestion) return

        // Check if we're at the end
        if (currentQuestionIndex >= visibleQuestions.length - 1) {
            handleComplete()
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    // Previous question
    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    // Complete assessment
    const handleComplete = async () => {
        setCurrentStep('processing')

        try {
            // Generate recommendation
            const recommendation = generateKitRecommendation(
                answers,
                availableKits || []
            )

            // Save result to database
            if (assessmentId) {
                await calculateResult.mutateAsync(assessmentId)
            }

            // Update local state
            setResult(recommendation)
        } catch (error) {
            console.error('Failed to complete assessment:', error)
        }
    }

    // Start over
    const handleStartOver = () => {
        resetAssessment()
        setCurrentStep('intro')
        setCurrentQuestionIndex(0)
    }

    // Render based on current step
    const renderStep = () => {
        switch (currentStep) {
            case 'intro':
                return <AssessmentIntro onStart={handleStart} />

            case 'questions':
                const currentQuestion = visibleQuestions[currentQuestionIndex]

                if (!currentQuestion) {
                    return (
                        <div className="max-w-2xl mx-auto py-12 text-center">
                            <p className="text-slate-600">No questions available</p>
                        </div>
                    )
                }

                return (
                    <AssessmentQuestion
                        question={currentQuestion}
                        value={answers[currentQuestion.key]}
                        onAnswer={handleAnswer}
                        onNext={handleNext}
                        onBack={handleBack}
                        canGoBack={currentQuestionIndex > 0}
                        progress={{
                            current: currentQuestionIndex + 1,
                            total: visibleQuestions.length,
                        }}
                    />
                )

            case 'processing':
                return (
                    <div className="max-w-2xl mx-auto py-24">
                        <Card>
                            <CardContent className="p-12 text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600 mx-auto mb-6"></div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    Analyzing Your Answers
                                </h2>
                                <p className="text-slate-600">
                                    We're reviewing Texas lien law to provide personalized recommendations...
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )

            case 'results':
                if (!result) {
                    return (
                        <div className="max-w-2xl mx-auto py-12 text-center">
                            <p className="text-slate-600">No results available</p>
                        </div>
                    )
                }

                return <AssessmentSummary result={result} onStartOver={handleStartOver} />

            default:
                return null
        }
    }

    return <AppShell>{renderStep()}</AppShell>
}
