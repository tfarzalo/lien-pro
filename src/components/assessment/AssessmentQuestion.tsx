// =====================================================
// Assessment Question Component
// Handles different input types dynamically
// =====================================================

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { AssessmentQuestion as QuestionType } from '@/types/assessment'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface AssessmentQuestionProps {
    question: QuestionType
    value?: any
    onAnswer: (value: any) => void
    onNext: () => void
    onBack: () => void
    canGoBack: boolean
    isTransitioning?: boolean
    progress: {
        current: number
        total: number
    }
}

export function AssessmentQuestion({
    question,
    value,
    onAnswer,
    onNext,
    onBack,
    canGoBack,
    isTransitioning = false,
    progress,
}: AssessmentQuestionProps) {
    const [localValue, setLocalValue] = useState<any>(value || '')
    const [error, setError] = useState<string>('')

    useEffect(() => {
        setLocalValue(value || '')
    }, [value])

    const handleChange = (newValue: any) => {
        setLocalValue(newValue)
        setError('')
    }

    const validate = (): boolean => {
        // Required validation
        if (question.required && !localValue) {
            setError('This question is required')
            return false
        }

        // Custom validation
        if (question.validation) {
            if (question.type === 'number') {
                const numValue = parseFloat(localValue)
                if (question.validation.min !== undefined && numValue < question.validation.min) {
                    setError(question.validation.message || `Value must be at least ${question.validation.min}`)
                    return false
                }
                if (question.validation.max !== undefined && numValue > question.validation.max) {
                    setError(question.validation.message || `Value must be at most ${question.validation.max}`)
                    return false
                }
            }

            if (question.validation.pattern) {
                const regex = new RegExp(question.validation.pattern)
                if (!regex.test(localValue)) {
                    setError(question.validation.message || 'Invalid format')
                    return false
                }
            }
        }

        return true
    }

    const handleNext = () => {
        if (validate()) {
            onAnswer(localValue)
            onNext()
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && question.type !== 'checkbox') {
            handleNext()
        }
    }

    const renderInput = () => {
        switch (question.type) {
            case 'radio':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option) => (
                            <label
                                key={option.value}
                                className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${localValue === option.value
                                        ? 'border-brand-500 bg-brand-50'
                                        : 'border-slate-200 hover:border-brand-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={question.key}
                                    value={option.value.toString()}
                                    checked={localValue === option.value}
                                    onChange={() => handleChange(option.value)}
                                    className="mt-1 mr-3 text-brand-600 focus:ring-brand-500"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-slate-900">{option.label}</div>
                                    {option.description && (
                                        <div className="text-sm text-slate-500 mt-1">{option.description}</div>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                )

            case 'select':
                return (
                    <div>
                        <select
                            value={localValue}
                            onChange={(e) => handleChange(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        >
                            <option value="">Select an option...</option>
                            {question.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )

            case 'checkbox':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option) => (
                            <label
                                key={option.value}
                                className="flex items-start p-4 border border-slate-200 rounded-lg cursor-pointer hover:border-brand-300 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    value={option.value.toString()}
                                    checked={(localValue || []).includes(option.value)}
                                    onChange={(e) => {
                                        const currentValues = localValue || []
                                        if (e.target.checked) {
                                            handleChange([...currentValues, option.value])
                                        } else {
                                            handleChange(currentValues.filter((v: any) => v !== option.value))
                                        }
                                    }}
                                    className="mt-1 mr-3 text-brand-600 focus:ring-brand-500 rounded"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-slate-900">{option.label}</div>
                                    {option.description && (
                                        <div className="text-sm text-slate-500 mt-1">{option.description}</div>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                )

            case 'date':
                return (
                    <div>
                        <Input
                            type="date"
                            value={localValue}
                            onChange={(e) => handleChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full"
                        />
                    </div>
                )

            case 'number':
                return (
                    <div>
                        <div className="relative">
                            {question.key.toLowerCase().includes('amount') && (
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                    $
                                </span>
                            )}
                            <Input
                                type="number"
                                value={localValue}
                                onChange={(e) => handleChange(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className={`w-full ${question.key.toLowerCase().includes('amount') ? 'pl-8' : ''
                                    }`}
                                min={question.validation?.min}
                                max={question.validation?.max}
                                placeholder={question.key.toLowerCase().includes('amount') ? '0.00' : ''}
                            />
                        </div>
                    </div>
                )

            case 'text':
                return (
                    <div>
                        <Input
                            type="text"
                            value={localValue}
                            onChange={(e) => handleChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full"
                            placeholder="Type your answer..."
                        />
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                        Question {progress.current} of {progress.total}
                    </span>
                    <span className="text-sm text-slate-500">
                        {Math.round((progress.current / progress.total) * 100)}% complete
                    </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-600 transition-all duration-300"
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <Card variant="elevated">
                <CardHeader>
                    <CardTitle className="text-2xl">{question.question}</CardTitle>
                    {question.description && (
                        <CardDescription className="text-base mt-2">
                            {question.description}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Input */}
                    <div>{renderInput()}</div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-800 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4">
                        <Button
                            variant="secondary"
                            onClick={onBack}
                            disabled={!canGoBack || isTransitioning}
                            className="flex items-center"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>

                        <Button
                            onClick={handleNext}
                            className="flex items-center"
                            disabled={isTransitioning}
                        >
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Helper Text */}
            <p className="text-center text-sm text-slate-500 mt-6">
                Your answers are saved automatically as you progress
            </p>
        </div>
    )
}
