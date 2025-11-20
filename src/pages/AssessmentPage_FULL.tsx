import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { ArrowLeft, ArrowRight, ExternalLink, Download } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { generateAssessmentPDF } from "@/lib/pdfGenerator"

interface AssessmentQuestion {
    id: string
    question: string
    type: 'radio' | 'checkbox' | 'text' | 'date' | 'textarea' | 'currency' | 'name-fields'
    options?: string[]
    helpText?: string
    required?: boolean
    subFields?: Array<{
        id: string
        placeholder: string
        label: string
    }>
}

const sampleQuestions: AssessmentQuestion[] = [
    {
        id: 'project_type',
        question: 'What type of construction project is this?',
        type: 'radio',
        options: [
            'Residential (single-family home)',
            'Residential (multi-family/apartment)',
            'Commercial building',
            'Industrial facility',
            'Public/government project',
            'Other'
        ],
        helpText: 'The project type affects which lien laws apply and filing requirements.',
        required: true
    },
    {
        id: 'contract_party',
        question: 'Who did you contract with directly?',
        type: 'radio',
        options: [
            'Property owner',
            'General contractor',
            'Another subcontractor',
            'Property management company',
            'Not sure'
        ],
        helpText: 'Your relationship to the property owner determines your lien rights.',
        required: true
    },
    {
        id: 'work_start_date',
        question: 'When did you first start work or deliver materials?',
        type: 'date',
        helpText: 'This date starts many important deadlines under Texas lien law.',
        required: true
    },
    {
        id: 'last_work_date',
        question: 'When did you last perform work or deliver materials?',
        type: 'date',
        helpText: 'Your mechanics lien must be filed within specific timeframes after your last work date.',
        required: true
    },
    {
        id: 'amount_owed',
        question: 'What is the total amount owed to you?',
        type: 'currency',
        helpText: 'Include all unpaid labor, materials, and approved change orders.',
        required: true
    },
    {
        id: 'written_contract',
        question: 'Do you have a written contract?',
        type: 'radio',
        options: [
            'Yes, signed written contract',
            'Verbal agreement only',
            'Purchase order or work order',
            'Email or text confirmation',
            'No formal agreement'
        ],
        helpText: 'A written contract strengthens your lien rights and makes enforcement easier.',
        required: true
    },
    {
        id: 'preliminary_notice_sent',
        question: 'Have you sent any preliminary notices or lien warnings?',
        type: 'radio',
        options: [
            'Yes, within required timeframe',
            'Yes, but might be late',
            'No, but I plan to',
            'No, and I\'m past deadlines',
            'Not sure what this is'
        ],
        helpText: 'Preliminary notices protect your lien rights and are required in some situations.',
        required: true
    },
    {
        id: 'payment_attempts',
        question: 'Have you made formal demands for payment?',
        type: 'radio',
        options: [
            'Yes, multiple written demands',
            'Yes, one written demand',
            'Only verbal requests',
            'Haven\'t requested yet'
        ],
        helpText: 'Documentation of payment demands strengthens your legal position.',
        required: true
    }
]

const contactQuestions: AssessmentQuestion[] = [
    {
        id: 'name-fields',
        question: 'What is your name?',
        type: 'name-fields',
        helpText: 'We need your name to personalize your assessment results.',
        required: true,
        subFields: [
            {
                id: 'first_name',
                label: 'First Name',
                placeholder: 'John'
            },
            {
                id: 'last_name',
                label: 'Last Name',
                placeholder: 'Doe'
            }
        ]
    },
    {
        id: 'email',
        question: 'What is your email address?',
        type: 'text',
        helpText: 'We\'ll send your assessment results to this email.',
        required: true
    },
    {
        id: 'interested_in_attorney',
        question: 'Would you like to speak with an attorney about your situation?',
        type: 'radio',
        options: [
            'Yes, I would like to speak with an attorney',
            'No, not at this time'
        ],
        helpText: 'We can connect you with experienced construction law attorneys in Texas.',
        required: true
    },
    {
        id: 'phone',
        question: 'What is your phone number?',
        type: 'text',
        helpText: 'An attorney will contact you to discuss your lien options.',
        required: false
    },
    {
        id: 'additional_details',
        question: 'Any additional details about your situation?',
        type: 'textarea',
        helpText: 'Optional: Share any disputes, defective work claims, or other relevant information.',
        required: false
    }
]

export function AssessmentPage() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [showingContactInfo, setShowingContactInfo] = useState(false)
    const [contactQuestionIndex, setContactQuestionIndex] = useState(0)
    const [showSummary, setShowSummary] = useState(false)
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    // Combine assessment and contact questions for current display, filtering out phone if not needed
    const phoneRequired = answers['interested_in_attorney'] === 'Yes, I would like to speak with an attorney'
    const filteredContactQuestions = contactQuestions.filter(q =>
        q.id !== 'phone' || phoneRequired
    )

    const allQuestions = showingContactInfo ? filteredContactQuestions : sampleQuestions
    const currentQuestion = allQuestions[showingContactInfo ? contactQuestionIndex : currentQuestionIndex]
    const isLastQuestion = showingContactInfo
        ? contactQuestionIndex === filteredContactQuestions.length - 1
        : currentQuestionIndex === sampleQuestions.length - 1

    const handleAnswer = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }))
    }

    const handleNext = () => {
        if (showingContactInfo) {
            if (contactQuestionIndex === filteredContactQuestions.length - 1) {
                // All contact info collected, show summary
                setShowSummary(true)
            } else {
                setContactQuestionIndex(prev => prev + 1)
            }
        } else {
            if (isLastQuestion) {
                // Move to contact info section
                setShowingContactInfo(true)
                setContactQuestionIndex(0)
            } else {
                setCurrentQuestionIndex(prev => prev + 1)
            }
        }
    }

    const handleSubmitAssessment = () => {
        setShowSummary(false)
        setCurrentStep(5)
    }

    const handlePrevious = () => {
        if (showingContactInfo) {
            if (contactQuestionIndex > 0) {
                setContactQuestionIndex(prev => prev - 1)
            } else {
                // Go back to last assessment question
                setShowingContactInfo(false)
                setCurrentQuestionIndex(sampleQuestions.length - 1)
            }
        } else {
            if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(prev => prev - 1)
            }
        }
    }

    // Validation for Next button
    const canProceed = () => {
        if (!currentQuestion) return false

        // For name-fields type, check both first_name and last_name
        if (currentQuestion.type === 'name-fields') {
            return answers['first_name'] && answers['last_name'] &&
                answers['first_name'].trim() !== '' && answers['last_name'].trim() !== ''
        }

        // For currency type
        if (currentQuestion.type === 'currency') {
            return answers[currentQuestion.id] && answers[currentQuestion.id] !== ''
        }

        // Standard validation
        if (currentQuestion.required) {
            return answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== ''
        }

        // Phone validation if required
        if (currentQuestion.id === 'phone' && phoneRequired) {
            return answers['phone'] !== undefined && answers['phone'] !== ''
        }

        return true
    }

    const renderQuestion = (question: AssessmentQuestion) => {
        // Helper function to get placeholder text
        const getPlaceholder = (id: string) => {
            const placeholders: Record<string, string> = {
                'first_name': 'Enter your first name',
                'last_name': 'Enter your last name',
                'email': 'your@email.com',
                'phone': '(555) 555-5555',
                'amount_owed': 'e.g., 25000',
                'additional_details': 'Describe any disputes, defective work claims, liens already filed, or other relevant information...'
            }
            return placeholders[id] || ''
        }

        switch (question.type) {
            case 'radio':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option, index) => (
                            <label
                                key={index}
                                className="flex items-center space-x-3 p-4 rounded-lg border-2 border-slate-200 hover:border-brand-300 hover:bg-brand-50 cursor-pointer transition-all"
                            >
                                <input
                                    type="radio"
                                    name={question.id}
                                    value={option}
                                    checked={answers[question.id] === option}
                                    onChange={(e) => {
                                        handleAnswer(question.id, e.target.value)
                                        // Auto-advance after selection
                                        setTimeout(() => {
                                            handleNext()
                                        }, 300)
                                    }}
                                    className="h-5 w-5 text-brand-600 focus:ring-brand-500 border-slate-300"
                                />
                                <span className="text-slate-700 font-medium">{option}</span>
                            </label>
                        ))}
                    </div>
                )

            case 'name-fields':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        {question.subFields?.map((field) => (
                            <div key={field.id}>
                                <label htmlFor={field.id} className="block text-sm font-medium text-slate-700 mb-2">
                                    {field.label}
                                </label>
                                <input
                                    type="text"
                                    id={field.id}
                                    value={answers[field.id] || ''}
                                    onChange={(e) => handleAnswer(field.id, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="block w-full text-lg px-4 py-3 rounded-lg border-2 border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 transition-all"
                                />
                            </div>
                        ))}
                    </div>
                )

            case 'currency':
                return (
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-500 text-lg">$</span>
                        </div>
                        <input
                            type="text"
                            value={answers[question.id] || ''}
                            onChange={(e) => {
                                // Allow only numbers and commas
                                const value = e.target.value.replace(/[^0-9,]/g, '')
                                // Format with commas
                                const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                handleAnswer(question.id, formatted)
                            }}
                            placeholder="0.00"
                            className="block w-full text-lg pl-8 pr-4 py-3 rounded-lg border-2 border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 transition-all"
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <span className="text-slate-400 text-sm">USD</span>
                        </div>
                    </div>
                )

            case 'checkbox':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option, index) => (
                            <label
                                key={index}
                                className="flex items-center space-x-3 p-4 rounded-lg border-2 border-slate-200 hover:border-brand-300 hover:bg-brand-50 cursor-pointer transition-all"
                            >
                                <input
                                    type="checkbox"
                                    name={question.id}
                                    checked={answers[question.id] === true}
                                    onChange={(e) => handleAnswer(question.id, e.target.checked)}
                                    className="h-5 w-5 text-brand-600 focus:ring-brand-500 border-slate-300 rounded"
                                />
                                <span className="text-slate-700 font-medium">{option}</span>
                            </label>
                        ))}
                    </div>
                )

            case 'text':
                // Special handling for phone number formatting
                if (question.id === 'phone') {
                    return (
                        <input
                            type="tel"
                            value={answers[question.id] || ''}
                            onChange={(e) => {
                                // Remove all non-numeric characters
                                const cleaned = e.target.value.replace(/\D/g, '')
                                // Limit to 10 digits
                                const limited = cleaned.substring(0, 10)
                                // Format as (###) ###-####
                                let formatted = ''
                                if (limited.length > 0) {
                                    formatted = '('
                                    formatted += limited.substring(0, 3)
                                    if (limited.length >= 3) {
                                        formatted += ') '
                                        formatted += limited.substring(3, 6)
                                    }
                                    if (limited.length >= 6) {
                                        formatted += '-'
                                        formatted += limited.substring(6, 10)
                                    }
                                }
                                handleAnswer(question.id, formatted)
                            }}
                            placeholder={getPlaceholder(question.id)}
                            className="block w-full text-lg px-4 py-3 rounded-lg border-2 border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 transition-all"
                        />
                    )
                }

                return (
                    <input
                        type={question.id === 'email' ? 'email' : 'text'}
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        placeholder={getPlaceholder(question.id)}
                        className="block w-full text-lg px-4 py-3 rounded-lg border-2 border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 transition-all"
                    />
                )

            case 'textarea':
                return (
                    <textarea
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        rows={6}
                        placeholder={getPlaceholder(question.id)}
                        className="block w-full text-lg px-4 py-3 rounded-lg border-2 border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 transition-all"
                    />
                )

            case 'date':
                return (
                    <input
                        type="date"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        className="block w-full text-lg px-4 py-3 rounded-lg border-2 border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 transition-all"
                    />
                )

            default:
                return null
        }
    }

    // Render current step with question and navigation
    const renderCurrentStep = () => {
        if (!currentQuestion) return null

        const sectionTitle = showingContactInfo ? 'Contact Information' : 'Assessment Questions'
        const progressText = showingContactInfo
            ? `Contact Info: ${contactQuestionIndex + 1} of ${filteredContactQuestions.length}`
            : `Question ${currentQuestionIndex + 1} of ${sampleQuestions.length}`

        return (
            <>
                <div className="mb-6">
                    <div className="text-sm font-medium text-brand-600 mb-2">{sectionTitle}</div>
                    <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                        {currentQuestion.question}
                    </h2>
                    {currentQuestion.helpText && (
                        <p className="text-slate-600 mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            {currentQuestion.helpText}
                        </p>
                    )}
                </div>

                {renderQuestion(currentQuestion)}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                    <Button
                        variant="secondary"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0 && !showingContactInfo}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>

                    <div className="text-sm text-slate-500">
                        {progressText}
                    </div>

                    <Button
                        onClick={handleNext}
                        disabled={!canProceed()}
                    >
                        {isLastQuestion ? 'Review' : 'Next'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </>
        )
    }

    // Calculate deadline and assessment results based on answers
    const calculateResults = () => {
        const lastWorkDate = answers['last_work_date'] ? new Date(answers['last_work_date']) : null
        const today = new Date()

        if (!lastWorkDate) {
            return {
                daysRemaining: null,
                deadlineDate: null,
                isUrgent: false,
                isPastDeadline: false,
                canFileLien: false,
                lienValidity: 'unknown',
                recommendations: []
            }
        }

        // Texas law: 15th day of 3rd month after last work (for original contractors)
        // or 15th day of 2nd month (for subcontractors)
        const isOriginalContractor = answers['contract_party'] === 'Property owner'
        const monthsToAdd = isOriginalContractor ? 3 : 2

        const deadlineDate = new Date(lastWorkDate)
        deadlineDate.setMonth(deadlineDate.getMonth() + monthsToAdd)
        deadlineDate.setDate(15) // 15th of the month

        const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const isUrgent = daysRemaining <= 30 && daysRemaining > 0
        const isPastDeadline = daysRemaining < 0
        const canFileLien = daysRemaining > 0

        // Analyze lien validity
        let lienValidity = 'strong'
        const recommendations: string[] = []

        if (isPastDeadline) {
            lienValidity = 'expired'
            recommendations.push('Unfortunately, your lien filing deadline has passed. You may still have other legal remedies.')
            recommendations.push('Consider consulting an attorney about breach of contract or unjust enrichment claims.')
        } else {
            // Check for risk factors
            if (answers['written_contract'] === 'No formal agreement' || answers['written_contract'] === 'Verbal agreement only') {
                lienValidity = 'moderate'
                recommendations.push('Lack of written contract weakens your position. Gather all documentation of work performed.')
            }

            if (answers['preliminary_notice_sent'] === 'No, and I\'m past deadlines') {
                lienValidity = 'weak'
                recommendations.push('Missing preliminary notices may affect your lien rights. File immediately.')
            } else if (answers['preliminary_notice_sent'] !== 'Yes, within required timeframe') {
                recommendations.push('Send preliminary notice immediately if you haven\'t already.')
            }

            if (answers['payment_attempts'] === 'Haven\'t requested yet') {
                recommendations.push('Send formal payment demand letter immediately, documenting all amounts owed.')
            }

            if (isUrgent) {
                recommendations.push(`URGENT: You have only ${daysRemaining} days remaining to file your mechanics lien!`)
            }

            // Project type specific advice
            if (answers['project_type']?.includes('Public/government')) {
                recommendations.push('Government projects have special bond claim requirements instead of traditional liens.')
            }

            // General recommendations
            recommendations.push('Compile all invoices, change orders, daily logs, and photos of your work.')
            recommendations.push('Get a property records report to identify the legal property owner.')

            if (daysRemaining > 30) {
                recommendations.push('You still have time, but don\'t delay. Prepare your lien documents now.')
            }
        }

        return {
            daysRemaining,
            deadlineDate,
            isUrgent,
            isPastDeadline,
            canFileLien,
            lienValidity,
            recommendations
        }
    }

    const results = calculateResults()

    // Handle PDF download
    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true)

        try {
            const pdfData = {
                firstName: answers['first_name'] || 'User',
                lastName: answers['last_name'] || '',
                email: answers['email'] || '',
                phone: answers['phone'],
                projectType: answers['project_type'] || 'Not specified',
                contractParty: answers['contract_party'] || 'Not specified',
                workStartDate: answers['work_start_date'] || 'Not specified',
                lastWorkDate: answers['last_work_date'] || 'Not specified',
                amountOwed: answers['amount_owed'] || '0',
                writtenContract: answers['written_contract'] || 'Not specified',
                preliminaryNoticeSent: answers['preliminary_notice_sent'] || 'Not specified',
                paymentAttempts: answers['payment_attempts'] || 'Not specified',
                additionalDetails: answers['additional_details'],
                interestedInAttorney: answers['interested_in_attorney'] || 'No response',
                results: results
            }

            // Small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 500))
            generateAssessmentPDF(pdfData)
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    // Summary view rendering
    if (showSummary) {
        return (
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <Link to="/" className="text-brand-600 hover:text-brand-700 flex items-center">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Home
                            </Link>
                            <h1 className="text-2xl font-bold text-slate-900">Review Your Assessment</h1>
                            <div className="w-20"></div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card variant="elevated">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Please Review Your Information</h2>

                            {/* Assessment Answers */}
                            <div className="space-y-6 mb-8">
                                <div className="bg-brand-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-brand-900 mb-4">Project Information</h3>
                                    <dl className="space-y-3">
                                        <div className="flex justify-between">
                                            <dt className="font-medium text-slate-700">Project Type:</dt>
                                            <dd className="text-slate-900">{answers['project_type']}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium text-slate-700">Contract Party:</dt>
                                            <dd className="text-slate-900">{answers['contract_party']}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium text-slate-700">Work Start Date:</dt>
                                            <dd className="text-slate-900">{answers['work_start_date']}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium text-slate-700">Last Work Date:</dt>
                                            <dd className="text-slate-900">{answers['last_work_date']}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium text-slate-700">Amount Owed:</dt>
                                            <dd className="text-slate-900 font-semibold">${answers['amount_owed']}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium text-slate-700">Written Contract:</dt>
                                            <dd className="text-slate-900">{answers['written_contract']}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium text-slate-700">Preliminary Notice:</dt>
                                            <dd className="text-slate-900">{answers['preliminary_notice_sent']}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium text-slate-700">Payment Attempts:</dt>
                                            <dd className="text-slate-900">{answers['payment_attempts']}</dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-slate-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
                                    <dl className="space-y-3">
                                        <div className="flex justify-between">
                                            <dt className="font-medium text-slate-700">Name:</dt>
                                            <dd className="text-slate-900">{answers['first_name']} {answers['last_name']}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium text-slate-700">Email:</dt>
                                            <dd className="text-slate-900">{answers['email']}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="font-medium text-slate-700">Attorney Consultation:</dt>
                                            <dd className="text-slate-900">{answers['interested_in_attorney']}</dd>
                                        </div>
                                        {phoneRequired && (
                                            <div className="flex justify-between">
                                                <dt className="font-medium text-slate-700">Phone:</dt>
                                                <dd className="text-slate-900">{answers['phone']}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>

                                {answers['additional_details'] && (
                                    <div className="bg-blue-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-blue-900 mb-3">Additional Details:</h3>
                                        <p className="text-blue-800 whitespace-pre-wrap">{answers['additional_details']}</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowSummary(false)
                                        setShowingContactInfo(true)
                                        setContactQuestionIndex(filteredContactQuestions.length - 1)
                                    }}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Go Back
                                </Button>
                                <Button size="lg" onClick={handleSubmitAssessment}>
                                    Submit Assessment
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (currentStep === 5) {
        // Dynamic Results page
        const validityBgColor = results.isPastDeadline ? 'bg-red-50' : results.lienValidity === 'strong' ? 'bg-success-50' : results.lienValidity === 'moderate' ? 'bg-yellow-50' : 'bg-orange-50'
        const validityTextColor = results.isPastDeadline ? 'text-red-900' : results.lienValidity === 'strong' ? 'text-success-900' : results.lienValidity === 'moderate' ? 'text-yellow-900' : 'text-orange-900'
        const validityBorderColor = results.isPastDeadline ? 'border-red-200' : results.lienValidity === 'strong' ? 'border-success-200' : results.lienValidity === 'moderate' ? 'border-yellow-200' : 'border-orange-200'

        return (
            <div className="min-h-screen bg-slate-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card variant="elevated" className="text-center">
                        <CardContent className="p-12">
                            <div className="mb-8">
                                <div className={`h-20 w-20 ${validityBgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                                    {results.canFileLien ? (
                                        <svg className={`h-10 w-10 ${validityTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                                    {answers['first_name']}'s Lien Assessment Results
                                </h1>
                                <p className="text-xl text-slate-600">
                                    Based on your specific situation, here's your personalized analysis.
                                </p>
                            </div>

                            {/* Deadline Alert */}
                            {results.deadlineDate && (
                                <Alert variant={results.isPastDeadline || results.isUrgent ? 'danger' : 'warning'} className="mb-8 text-left">
                                    <AlertDescription>
                                        <strong>{results.isPastDeadline ? 'Deadline Passed' : results.isUrgent ? 'URGENT DEADLINE' : 'Important Deadline'}:</strong>
                                        {results.isPastDeadline ? (
                                            <> Your lien filing deadline was {results.deadlineDate.toLocaleDateString()}. You are {Math.abs(results.daysRemaining || 0)} days past the deadline.</>
                                        ) : (
                                            <> You have <strong>{results.daysRemaining} days</strong> remaining to file your mechanics lien (deadline: {results.deadlineDate.toLocaleDateString()}).</>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Lien Validity Assessment */}
                            <div className={`${validityBgColor} border ${validityBorderColor} rounded-lg p-6 mb-8 text-left`}>
                                <h3 className={`text-lg font-semibold ${validityTextColor} mb-3`}>
                                    Lien Claim Validity: {results.lienValidity === 'strong' ? 'Strong' : results.lienValidity === 'moderate' ? 'Moderate' : results.lienValidity === 'weak' ? 'Weak' : 'Expired'}
                                </h3>
                                <div className="space-y-2">
                                    <p className={validityTextColor}>
                                        <strong>Project Type:</strong> {answers['project_type']}
                                    </p>
                                    <p className={validityTextColor}>
                                        <strong>Contract Party:</strong> {answers['contract_party']}
                                    </p>
                                    <p className={validityTextColor}>
                                        <strong>Amount Owed:</strong> ${answers['amount_owed']}
                                    </p>
                                    <p className={validityTextColor}>
                                        <strong>Written Contract:</strong> {answers['written_contract']}
                                    </p>
                                </div>
                            </div>

                            {/* Available Lien Rights */}
                            {results.canFileLien && (
                                <div className="bg-brand-50 rounded-lg p-6 mb-8 text-left">
                                    <h3 className="text-lg font-semibold text-brand-900 mb-3">You Can File These Liens:</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-center justify-between text-brand-800 p-3 bg-white rounded-lg">
                                            <div className="flex items-center">
                                                <svg className="h-4 w-4 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium">Mechanics and Materialmen's Lien</span>
                                            </div>
                                            <Link
                                                to="/learn/what-is-a-lien"
                                                className="flex items-center text-brand-600 hover:text-brand-700 text-sm font-medium"
                                            >
                                                Learn More
                                                <ExternalLink className="h-3 w-3 ml-1" />
                                            </Link>
                                        </li>
                                        {answers['contract_party'] !== 'Property owner' && (
                                            <li className="flex items-center justify-between text-brand-800 p-3 bg-white rounded-lg">
                                                <div className="flex items-center">
                                                    <svg className="h-4 w-4 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-medium">Preliminary Notice / Bond Claim</span>
                                                </div>
                                                <Link
                                                    to="/learn/preliminary-notice"
                                                    className="flex items-center text-brand-600 hover:text-brand-700 text-sm font-medium"
                                                >
                                                    Learn More
                                                    <ExternalLink className="h-3 w-3 ml-1" />
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Recommended Actions */}
                            <div className="bg-slate-100 rounded-lg p-6 mb-8 text-left">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommended Next Steps:</h3>
                                <ol className="space-y-3 list-decimal list-inside text-slate-700">
                                    {results.recommendations.map((rec, idx) => (
                                        <li key={idx} className="leading-relaxed">{rec}</li>
                                    ))}
                                </ol>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {results.canFileLien && (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={() => navigate('/kits')}
                                    >
                                        Get Your Lien Kit
                                    </Button>
                                )}
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={handleDownloadPDF}
                                    disabled={isGeneratingPDF}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    {isGeneratingPDF ? 'Generating...' : 'Download PDF Report'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with Back to Home */}
                <div className="mb-8 flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center text-brand-600 hover:text-brand-700 font-medium"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>
                    <div className="text-sm text-slate-500">
                        Step {currentStep} of 4
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Assessment Progress</span>
                        <span className="text-sm text-slate-500">{Math.round((currentStep / 4) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / 4) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <Card variant="elevated" className="mb-8">
                    <CardContent className="p-8">
                        {renderCurrentStep()}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
