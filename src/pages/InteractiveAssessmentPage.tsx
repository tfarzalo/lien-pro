// =====================================================
// Interactive Assessment Page
// Main orchestrator for the assessment flow
// =====================================================

import { useEffect, useRef, useState } from 'react'
import { useAssessmentStore } from '@/stores/assessmentStore'
import { AssessmentIntro } from '@/components/assessment/AssessmentIntro'
import { AssessmentQuestion } from '@/components/assessment/AssessmentQuestion'
import { AssessmentSummary } from '@/components/assessment/AssessmentSummary'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/hooks/useAuth'
import { useCreateAssessment, useSaveAssessmentAnswer, useCalculateAssessmentResult } from '@/hooks/useAssessments'
import { useLienKits } from '@/hooks/useLienKits'
import { texasLienAssessmentFlow, shouldShowQuestion } from '@/lib/assessmentQuestions'
import { generateKitRecommendation } from '@/lib/kitRecommendationEngine'
import type { AssessmentQuestion as QuestionType, AssessmentResult } from '@/types/assessment'

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

    // Local state for visible questions and animation
    const [visibleQuestions, setVisibleQuestions] = useState<QuestionType[]>([])
    const [animationClass, setAnimationClass] = useState('')
    const [isAnimating, setIsAnimating] = useState(false)
    const animationTimerRef = useRef<number | null>(null)
    const animationDuration = 350

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

    const runSlideAnimation = (
        direction: 'forward' | 'backward',
        navigate: () => boolean
    ) => {
        if (isAnimating) return

        const exitClass = direction === 'forward' ? 'slide-out-to-left' : 'slide-out-to-right'
        const enterClass = direction === 'forward' ? 'slide-in-from-right' : 'slide-in-from-left'

        if (animationTimerRef.current) {
            clearTimeout(animationTimerRef.current)
        }

        setIsAnimating(true)
        setAnimationClass(exitClass)

        animationTimerRef.current = window.setTimeout(() => {
            const shouldAnimateIn = navigate()

            if (shouldAnimateIn) {
                setAnimationClass(enterClass)
                animationTimerRef.current = window.setTimeout(() => {
                    setAnimationClass('')
                    setIsAnimating(false)
                }, animationDuration)
            } else {
                setAnimationClass('')
                setIsAnimating(false)
            }
        }, animationDuration)
    }

    // Next question
    const handleNext = () => {
        const currentQuestion = visibleQuestions[currentQuestionIndex]
        if (!currentQuestion) return

        runSlideAnimation('forward', () => {
            if (currentQuestionIndex < visibleQuestions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1)
                return true
            }

            void handleShowSummary()
            return false
        })
    }

    // Previous question
    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            runSlideAnimation('backward', () => {
                setCurrentQuestionIndex(currentQuestionIndex - 1)
                return true
            })
        }
    }

    // Show summary
    const handleShowSummary = async () => {
        if (!assessmentId || !availableKits) return

        try {
            const answersForCalc = useAssessmentStore.getState().answers;
            const calculatedResult = await calculateResult.mutateAsync(assessmentId);

            // The recommendation engine returns the full AssessmentResult object
            const recommendationResult = generateKitRecommendation(answersForCalc, availableKits);

            const fullResult: AssessmentResult = {
                ...calculatedResult, // Contains assessment metadata
                ...recommendationResult, // Contains score, kits, deadlines, etc.
            };

            setResult(fullResult);
            setCurrentStep('results');
        } catch (error) {
            console.error('Failed to calculate assessment result:', error);
        }
    }

    // Start over
    const handleStartOver = () => {
        resetAssessment()
        setCurrentStep('intro')
        setCurrentQuestionIndex(0)
    }

    useEffect(() => {
        return () => {
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current)
            }
        }
    }, [])

    return (
        <AppShell>
            <div className="container mx-auto py-8 overflow-x-hidden">
                {currentStep === 'intro' && <AssessmentIntro onStart={handleStart} />}

                {currentStep === 'questions' && visibleQuestions.length > 0 && (
                    <div className={`transition-transform duration-300 ${animationClass}`}>
                        <AssessmentQuestion
                            key={visibleQuestions[currentQuestionIndex].id}
                            question={visibleQuestions[currentQuestionIndex]}
                            value={answers[visibleQuestions[currentQuestionIndex].key]}
                            onAnswer={handleAnswer}
                            onNext={handleNext}
                            onBack={handleBack}
                            canGoBack={currentQuestionIndex > 0}
                            isTransitioning={isAnimating}
                            progress={{
                                current: currentQuestionIndex + 1,
                                total: visibleQuestions.length,
                            }}
                        />
                    </div>
                )}

                {currentStep === 'results' && result && (
                    <AssessmentSummary result={result} onStartOver={handleStartOver} />
                )}
            </div>
        </AppShell>
    )
}
