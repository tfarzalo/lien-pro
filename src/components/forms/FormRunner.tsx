// =====================================================
// FormRunner Component
// Dynamically renders forms from templates and autosaves
// =====================================================

import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import {
    FormTemplate,
    FormSection,
    FormFieldValue,
    CommonFields,
} from '@/types/forms'
import {
    FileText,
    Save,
    CheckCircle,
    Download,
} from 'lucide-react'
import { FormFieldRenderer } from '@/components/forms/FormFieldRenderer'
import { validateForm, autofillField } from '@/lib/formUtils'

interface FormRunnerProps {
    template: FormTemplate
    projectId: string
    userId: string
    existingResponseId?: string
    initialValues?: Record<string, FormFieldValue>
    commonFields?: CommonFields
    onSave?: (values: Record<string, FormFieldValue>) => Promise<void>
    onGeneratePDF?: () => Promise<void>
    onComplete?: () => void
    autoSave?: boolean
    autoSaveDelay?: number
}

export function FormRunner({
    template,
    projectId: _projectId,
    userId: _userId,
    existingResponseId: _existingResponseId,
    initialValues = {},
    commonFields,
    onSave,
    onGeneratePDF,
    onComplete,
    autoSave = true,
    autoSaveDelay = 2000,
}: FormRunnerProps) {
    // Form state
    const [formValues, setFormValues] = useState<Record<string, FormFieldValue>>(initialValues)
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [currentSection, setCurrentSection] = useState(0)
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    // Debounce form values for autosave
    const debouncedValues = useDebounce(formValues, autoSaveDelay)

    // Autofill fields on mount
    useEffect(() => {
        if (commonFields && Object.keys(initialValues).length === 0) {
            const autofilledValues: Record<string, FormFieldValue> = {}

            template.sections.forEach((section) => {
                section.fields.forEach((field) => {
                    if (field.autofill) {
                        const value = autofillField(field, commonFields)
                        if (value !== null && value !== undefined) {
                            autofilledValues[field.id] = value
                        }
                    } else if (field.defaultValue !== undefined) {
                        autofilledValues[field.id] = field.defaultValue
                    }
                })
            })

            setFormValues((prev) => ({ ...prev, ...autofilledValues }))
        }
    }, [template, commonFields, initialValues])

    // Autosave effect
    useEffect(() => {
        if (autoSave && Object.keys(debouncedValues).length > 0 && onSave) {
            handleSave(debouncedValues)
        }
    }, [debouncedValues, autoSave, onSave])

    // Handle field change
    const handleFieldChange = useCallback((fieldId: string, value: FormFieldValue) => {
        setFormValues((prev) => ({
            ...prev,
            [fieldId]: value,
        }))

        // Clear validation error for this field
        setValidationErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors[fieldId]
            return newErrors
        })
    }, [])

    // Handle save
    const handleSave = async (values: Record<string, FormFieldValue>) => {
        if (!onSave || isSaving) return

        setIsSaving(true)
        try {
            await onSave(values)
            setLastSaved(new Date())
        } catch (error) {
            console.error('Error saving form:', error)
        } finally {
            setIsSaving(false)
        }
    }

    // Manual save
    const handleManualSave = () => {
        handleSave(formValues)
    }

    // Validate current section
    const validateCurrentSection = (): boolean => {
        const section = template.sections[currentSection]
        const errors = validateForm(template, formValues)

        // Filter errors for current section only
        const sectionErrors: Record<string, string> = {}
        section.fields.forEach(field => {
            if (errors[field.id]) {
                sectionErrors[field.id] = errors[field.id]
            }
        })

        setValidationErrors(sectionErrors)
        return Object.keys(sectionErrors).length === 0
    }

    // Go to next section
    const handleNextSection = () => {
        if (validateCurrentSection()) {
            if (currentSection < template.sections.length - 1) {
                setCurrentSection(currentSection + 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        }
    }

    // Go to previous section
    const handlePreviousSection = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    // Complete form
    const handleComplete = () => {
        // Validate all sections
        const errors = validateForm(template, formValues)

        if (Object.keys(errors).length === 0) {
            onComplete?.()
        } else {
            setValidationErrors(errors)
            // Find first section with error
            for (let i = 0; i < template.sections.length; i++) {
                const sectionFields = template.sections[i].fields
                const hasError = sectionFields.some((field) => errors[field.id])
                if (hasError) {
                    setCurrentSection(i)
                    break
                }
            }
        }
    }

    // Generate PDF
    const handleGeneratePDF = async () => {
        if (!onGeneratePDF) return

        // Validate all fields first
        const errors = validateForm(template, formValues)

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            alert('Please complete all required fields before generating PDF')
            return
        }

        setIsGeneratingPDF(true)
        try {
            await onGeneratePDF()
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF. Please try again.')
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    // Calculate progress
    const calculateProgress = (): number => {
        const allFields = template.sections.flatMap((s) => s.fields)
        const requiredFields = allFields.filter((f) => f.required)
        const completedRequired = requiredFields.filter((f) => {
            const value = formValues[f.id]
            return value !== undefined && value !== null && value !== ''
        })

        return requiredFields.length > 0
            ? Math.round((completedRequired.length / requiredFields.length) * 100)
            : 0
    }

    const progress = calculateProgress()
    const isLastSection = currentSection === template.sections.length - 1
    const isFirstSection = currentSection === 0

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{template.name}</h1>
                    {template.description && (
                        <p className="text-slate-600">{template.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-3">
                        <Badge variant="primary">{template.jurisdiction}</Badge>
                        <Badge variant="secondary">v{template.version}</Badge>
                        {template.category && (
                            <Badge variant="secondary">{template.category}</Badge>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-600 mb-2">Progress</div>
                    <div className="text-2xl font-bold text-brand-600">{progress}%</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                    className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Auto-save indicator */}
            {autoSave && (
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600"></div>
                                <span className="text-slate-600">Saving...</span>
                            </>
                        ) : lastSaved ? (
                            <>
                                <CheckCircle className="h-4 w-4 text-success-600" />
                                <span className="text-slate-600">
                                    Saved {lastSaved.toLocaleTimeString()}
                                </span>
                            </>
                        ) : null}
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleManualSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Now
                    </Button>
                </div>
            )}

            {/* Instructions */}
            {template.instructions && (
                <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                        <details className="cursor-pointer">
                            <summary className="font-semibold">Instructions</summary>
                            <div className="mt-2 prose prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap text-sm">{template.instructions}</pre>
                            </div>
                        </details>
                    </AlertDescription>
                </Alert>
            )}

            {/* Section Navigation */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {template.sections.map((section, index) => (
                    <button
                        key={section.id}
                        onClick={() => setCurrentSection(index)}
                        className={`
              flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${index === currentSection
                                ? 'bg-brand-600 text-white'
                                : index < currentSection
                                    ? 'bg-success-100 text-success-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }
            `}
                    >
                        <div className="flex items-center space-x-2">
                            <span>
                                {index + 1}. {section.title}
                            </span>
                            {index < currentSection && <CheckCircle className="h-4 w-4" />}
                        </div>
                    </button>
                ))}
            </div>

            {/* Current Section */}
            <FormSectionRenderer
                section={template.sections[currentSection]}
                values={formValues}
                errors={validationErrors}
                onChange={handleFieldChange}
            />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <Button
                    variant="secondary"
                    onClick={handlePreviousSection}
                    disabled={isFirstSection}
                >
                    Previous
                </Button>

                <div className="flex items-center space-x-3">
                    {onGeneratePDF && (
                        <Button
                            variant="ghost"
                            onClick={handleGeneratePDF}
                            disabled={isGeneratingPDF || progress < 100}
                        >
                            {isGeneratingPDF ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600 mr-2"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Generate PDF
                                </>
                            )}
                        </Button>
                    )}

                    {isLastSection ? (
                        <Button onClick={handleComplete}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete Form
                        </Button>
                    ) : (
                        <Button onClick={handleNextSection}>
                            Next Section
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

// =====================================================
// Component: Form Section Renderer
// =====================================================

interface FormSectionRendererProps {
    section: FormSection
    values: Record<string, FormFieldValue>
    errors: Record<string, string>
    onChange: (fieldId: string, value: FormFieldValue) => void
}

function FormSectionRenderer({
    section,
    values,
    errors,
    onChange,
}: FormSectionRendererProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                {section.description && (
                    <p className="text-sm text-slate-600 mt-2">{section.description}</p>
                )}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-12 gap-4">
                    {section.fields.map((field) => (
                        <div
                            key={field.id}
                            className={`col-span-12 md:col-span-${field.gridColumn || 12}`}
                        >
                            <FormFieldRenderer
                                field={field}
                                value={values[field.id]}
                                error={errors[field.id]}
                                onChange={(value) => onChange(field.id, value)}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
