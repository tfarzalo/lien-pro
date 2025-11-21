import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { ArrowLeft, ArrowRight, ExternalLink, Download, CheckCircle2, Circle, Building2, Users, CalendarDays, DollarSign, ClipboardList, FileText, BellRing, UserCircle2, Mail, Phone, FileSignature, LifeBuoy, MessageSquare } from "lucide-react"
import type { LucideIcon } from "lucide-react"
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
        id: 'claim_type',
        question: 'What type of claim do you need to file?',
        type: 'radio',
        options: [
            'Mechanics Lien - I worked on a private property project',
            'Payment Bond Claim - I worked on a public/government project',
            'Not sure - Help me determine which one'
        ],
        helpText: 'Private property projects use mechanics liens. Public/government projects require payment bond claims.',
        required: true
    },
    {
        id: 'project_owner',
        question: 'Who owns the property where you worked?',
        type: 'radio',
        options: [
            'Private individual or business',
            'City, county, or municipal government',
            'State of Texas',
            'Federal government (U.S. government)',
            'School district or public institution',
            'Not sure'
        ],
        helpText: 'Property ownership determines whether you file a lien (private) or bond claim (public).',
        required: true
    },
    {
        id: 'project_type',
        question: 'What type of construction project is this?',
        type: 'radio',
        options: [
            'Residential - single-family home',
            'Residential - multi-family/apartment',
            'Commercial building',
            'Industrial facility',
            'Public infrastructure (roads, bridges, etc.)',
            'Government building',
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
            'Property owner directly',
            'General contractor',
            'Another subcontractor',
            'Property management company',
            'Government agency',
            'Not sure'
        ],
        helpText: 'Your relationship to the property owner determines your lien or bond claim rights.',
        required: true
    },
    {
        id: 'work_start_date',
        question: 'When did you first start work or deliver materials?',
        type: 'date',
        helpText: 'This date starts many important deadlines under Texas construction law.',
        required: true
    },
    {
        id: 'last_work_date',
        question: 'When did you last perform work or deliver materials?',
        type: 'date',
        helpText: 'For liens: must file within 4 months after last work. For bonds: notice deadlines are critical.',
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
        helpText: 'A written contract strengthens your legal position for both liens and bond claims.',
        required: true
    },
    {
        id: 'preliminary_notice_sent',
        question: 'Have you sent any preliminary notices or required notices?',
        type: 'radio',
        options: [
            'Yes, sent within required timeframes',
            'Yes, but might be late',
            'No, but I plan to send them',
            'No, and deadlines may have passed',
            'Not sure what notices are required'
        ],
        helpText: 'For liens: subcontractors must send notices. For bonds: monthly notices may be required.',
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
            'Haven\'t requested payment yet'
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

const questionIconMap: Record<string, LucideIcon> = {
    claim_type: Building2,
    project_type: Building2,
    contract_party: Users,
    work_start_date: CalendarDays,
    last_work_date: CalendarDays,
    amount_owed: DollarSign,
    written_contract: FileText,
    preliminary_notice_sent: BellRing,
    payment_attempts: MessageSquare,
    'name-fields': UserCircle2,
    email: Mail,
    interested_in_attorney: LifeBuoy,
    phone: Phone,
    additional_details: FileSignature,
}
const getQuestionIcon = (id: string): LucideIcon => questionIconMap[id] ?? ClipboardList

const assessmentSteps = [
    {
        id: 1,
        title: 'Project & Payment Details',
        description: 'Tell us about the project, parties, and amounts owed.'
    },
    {
        id: 2,
        title: 'Contact Information',
        description: 'Share the best way to reach you with results.'
    },
    {
        id: 3,
        title: 'Review & Confirm',
        description: 'Double-check your answers before submission.'
    },
    {
        id: 4,
        title: 'Personalized Results',
        description: 'Get deadlines, risk analysis, and next steps.'
    }
]

export function AssessmentPage() {
    const navigate = useNavigate()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [showingContactInfo, setShowingContactInfo] = useState(false)
    const [contactQuestionIndex, setContactQuestionIndex] = useState(0)
    const [showSummary, setShowSummary] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [showIntroOverlay, setShowIntroOverlay] = useState(true)
    const [animateSections, setAnimateSections] = useState(false)
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    // Combine assessment and contact questions for current display, filtering out phone if not needed
    const phoneRequired = answers['interested_in_attorney'] === 'Yes, I would like to speak with an attorney'
    const filteredContactQuestions = contactQuestions.filter(q =>
        q.id !== 'phone' || phoneRequired
    )

    const activeStage = showResults ? 4 : showSummary ? 3 : showingContactInfo ? 2 : 1
    const progressPercent = (activeStage / assessmentSteps.length) * 100
    const currentQuestionKey = showingContactInfo ? `contact-${contactQuestionIndex}` : `assessment-${currentQuestionIndex}`
    const stageCardBackgrounds = [
        'bg-white',
        'bg-gradient-to-br from-white via-slate-50 to-brand-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900',
        'bg-gradient-to-br from-brand-50 via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900',
        'bg-gradient-to-br from-emerald-50 via-white to-cyan-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900',
    ]
    const cardBackgroundClass = stageCardBackgrounds[activeStage - 1] ?? 'bg-white'

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
        setShowResults(true)
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
                                // Allow only numbers, commas, and decimal point
                                let value = e.target.value.replace(/[^0-9.,]/g, '')

                                // Remove any commas temporarily for processing
                                value = value.replace(/,/g, '')

                                // Handle decimal point
                                const parts = value.split('.')
                                if (parts.length > 2) {
                                    // Only allow one decimal point
                                    value = parts[0] + '.' + parts.slice(1).join('')
                                }

                                // Limit decimal places to 2
                                if (parts.length === 2 && parts[1].length > 2) {
                                    parts[1] = parts[1].substring(0, 2)
                                    value = parts.join('.')
                                }

                                // Format the integer part with commas
                                let formattedValue = ''
                                if (value.includes('.')) {
                                    const [intPart, decPart] = value.split('.')
                                    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                    formattedValue = formattedInt + '.' + decPart
                                } else if (value) {
                                    // Just format with commas, don't add .00 yet (will be added on blur)
                                    formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                } else {
                                    formattedValue = ''
                                }

                                handleAnswer(question.id, formattedValue)
                            }}
                            onBlur={(e) => {
                                // Add .00 when user finishes typing (loses focus)
                                const value = e.target.value
                                if (value && !value.includes('.')) {
                                    handleAnswer(question.id, value + '.00')
                                } else if (value && value.endsWith('.')) {
                                    // If they typed a decimal but no cents, add 00
                                    handleAnswer(question.id, value + '00')
                                } else if (value && value.includes('.')) {
                                    // If they have one decimal digit, pad to two
                                    const parts = value.split('.')
                                    if (parts[1] && parts[1].length === 1) {
                                        handleAnswer(question.id, value + '0')
                                    }
                                }
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
                        onClick={(e) => {
                            // Show date picker when clicking anywhere on the field
                            (e.target as HTMLInputElement).showPicker?.()
                        }}
                        onFocus={(e) => {
                            // Also show picker on focus
                            (e.target as HTMLInputElement).showPicker?.()
                        }}
                        className="block w-full text-lg px-4 py-3 rounded-lg border-2 border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 transition-all cursor-pointer"
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
        const QuestionIcon = getQuestionIcon(currentQuestion.id)

        return (
            <>
                <div className="mb-6 flex items-start gap-4">
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-brand-600 mb-2">{sectionTitle}</div>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                            {currentQuestion.question}
                        </h2>
                        {currentQuestion.helpText && (
                            <p className="text-sm text-slate-600 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                                {currentQuestion.helpText}
                            </p>
                        )}
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center shadow-inner shrink-0">
                        <QuestionIcon className="h-5 w-5 text-brand-600" />
                    </div>
                </div>

                {renderQuestion(currentQuestion)}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
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

    const handleBeginAssessment = () => {
        setShowIntroOverlay(false)
        requestAnimationFrame(() => setAnimateSections(true))
    }

    // Summary view rendering
    if (showSummary) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 transition-colors">
                {/* Header */}
                <div className="bg-card border-b border-slate-200 dark:border-slate-800">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <Link to="/lien-professor" className="text-brand-600 hover:text-brand-700 flex items-center">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Home
                            </Link>
                            <h1 className="text-2xl font-bold text-slate-900">Review Your Assessment</h1>
                            <div className="w-20"></div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-emerald-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-8 shadow-lg">
                        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600 mb-2">Review & Confirm</p>
                        <h2 className="text-3xl font-bold text-slate-900">Please Review Your Information</h2>
                        <p className="text-slate-600 mt-2">
                            Confirm the project, payment, and contact details below. You can go back to make edits or submit to receive your assessment results.
                        </p>
                    </div>

                    <Card variant="elevated" className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70">
                        <CardContent className="p-8 space-y-8">
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-brand-50/80 dark:bg-slate-900/40 p-6">
                                    <h3 className="text-lg font-semibold text-brand-900 dark:text-brand-200 mb-4">Project Information</h3>
                                    <dl className="space-y-3 text-sm">
                                        {[
                                            ['Project Type', answers['project_type']],
                                            ['Contract Party', answers['contract_party']],
                                            ['Work Start Date', answers['work_start_date']],
                                            ['Last Work Date', answers['last_work_date']],
                                            ['Amount Owed', answers['amount_owed'] ? `$${answers['amount_owed']}` : 'Not provided'],
                                            ['Written Contract', answers['written_contract']],
                                            ['Preliminary Notice', answers['preliminary_notice_sent']],
                                            ['Payment Attempts', answers['payment_attempts']],
                                        ].map(([label, value]) => (
                                            <div key={label} className="flex justify-between gap-4">
                                                <dt className="font-medium text-slate-600 dark:text-slate-300">{label}:</dt>
                                                <dd className="text-slate-900 dark:text-white text-right">{value || '—'}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>

                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h3>
                                    <dl className="space-y-3 text-sm">
                                        {[
                                            ['Name', `${answers['first_name'] || ''} ${answers['last_name'] || ''}`.trim() || '—'],
                                            ['Email', answers['email']],
                                            ['Attorney Consultation', answers['interested_in_attorney']],
                                            ...(phoneRequired ? [['Phone', answers['phone']]] : []),
                                        ].map(([label, value]) => (
                                            <div key={label} className="flex justify-between gap-4">
                                                <dt className="font-medium text-slate-600 dark:text-slate-300">{label}:</dt>
                                                <dd className="text-slate-900 dark:text-white text-right">{value || '—'}</dd>
                                            </div>
                                        ))}
                                    </dl>

                                    {answers['additional_details'] && (
                                        <div className="mt-6 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Additional Details</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{answers['additional_details']}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

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

    if (showResults) {
        // Dynamic Results page
        const validityBgColor = results.isPastDeadline ? 'bg-red-50' : results.lienValidity === 'strong' ? 'bg-success-50' : results.lienValidity === 'moderate' ? 'bg-yellow-50' : 'bg-orange-50'
        const validityTextColor = results.isPastDeadline ? 'text-red-900' : results.lienValidity === 'strong' ? 'text-success-900' : results.lienValidity === 'moderate' ? 'text-yellow-900' : 'text-orange-900'
        const validityBorderColor = results.isPastDeadline ? 'border-red-200' : results.lienValidity === 'strong' ? 'border-success-200' : results.lienValidity === 'moderate' ? 'border-yellow-200' : 'border-orange-200'

        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-12 transition-colors">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 pt-24 pb-10 transition-colors">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-12 relative">
                    {showIntroOverlay && (
                        <div className="absolute inset-0 z-20 rounded-3xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-emerald-50" />
                            <div className="relative h-full w-full flex items-center justify-center px-6">
                                <div className="max-w-3xl text-center space-y-6">
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
                                        Lien Protection Assessment
                                    </p>
                                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                        Understand Your Lien Rights Before You Miss Another Deadline
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-300">
                                        Answer a handful of project and payment questions to reveal the liens you can file, the notices
                                        you still need, and when every deadline hits—paired with reusable attorney-drafted kits tailored
                                        to your answers.
                                    </p>
                                    <div className="pt-2">
                                        <Button size="lg" onClick={handleBeginAssessment} className="px-8">
                                            Get Started
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Left rail */}
                    <aside
                        className={`space-y-6 lg:col-span-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${animateSections ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                            }`}
                        aria-hidden={showIntroOverlay}
                    >
                        <Link
                            to="/lien-professor"
                            className="flex items-center text-brand-600 hover:text-brand-700 font-medium"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Link>

                        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-card text-card-foreground shadow-lg shadow-emerald-100/40 dark:shadow-none p-6 sticky top-24">
                            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                <span>Step {activeStage} of {assessmentSteps.length}</span>
                                <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-600 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="mt-6 space-y-4">
                                {assessmentSteps.map((step) => {
                                    const status = step.id < activeStage ? 'complete' : step.id === activeStage ? 'current' : 'upcoming'
                                    return (
                                        <div
                                            key={step.id}
                                            className={`flex items-start gap-3 rounded-2xl border p-3 transition ${status === 'current'
                                                    ? 'border-brand-300 bg-white dark:bg-slate-900 shadow-sm'
                                                    : 'border-transparent'
                                                }`}
                                        >
                                            <span className="mt-1">
                                                {status === 'complete' ? (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                ) : status === 'current' ? (
                                                    <div className="h-5 w-5 rounded-full border-2 border-brand-600" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-slate-400" />
                                                )}
                                            </span>
                                            <div>
                                                <p className={`text-sm font-semibold ${status === 'current' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {step.title}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{step.description}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* Main assessment panel */}
                    <div
                        className={`lg:col-span-9 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${animateSections ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
                            }`}
                        aria-hidden={showIntroOverlay}
                    >
                        <div className="max-w-5xl mx-auto w-full space-y-6">
                            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-emerald-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-8 shadow-lg shadow-emerald-100/40 dark:shadow-none">
                                <p className="text-sm font-semibold text-brand-600 mb-2">Texas Lien Assessment</p>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Protect your payment rights</h1>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Answer a few targeted questions so we can calculate deadlines and generate the right lien kit for your project.
                                </p>
                            </div>

                            <Card variant="elevated" className={`rounded-3xl border border-slate-200 dark:border-slate-800 ${cardBackgroundClass}`}>
                                <CardContent className="p-8 min-h-[460px] flex flex-col">
                                    <div
                                        key={`${activeStage}-${currentQuestionKey}`}
                                        className="flex-1 space-y-6 transition-colors duration-300"
                                    >
                                        {renderCurrentStep()}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
