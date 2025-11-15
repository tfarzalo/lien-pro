// =====================================================
// Assessment Question Definitions
// =====================================================

import type { AssessmentFlow, AssessmentQuestion } from '@/types/assessment'

export const texasLienAssessmentFlow: AssessmentFlow = {
    id: 'texas-lien-assessment-v1',
    name: 'Texas Construction Lien Assessment',
    description: 'Determine your lien rights and recommended forms',
    startQuestionId: 'q1-project-location',
    questions: [
        {
            id: 'q1-project-location',
            key: 'isTexasProject',
            question: 'Is your construction project located in Texas?',
            description: 'This assessment is specifically designed for Texas construction lien law.',
            type: 'radio',
            required: true,
            options: [
                { value: 'yes', label: 'Yes, my project is in Texas' },
                { value: 'no', label: 'No, my project is outside Texas' },
            ],
            branches: [
                { value: 'no', nextQuestionId: 'q-end-not-texas' },
                { value: 'yes', nextQuestionId: 'q2-project-type' },
            ],
        },
        {
            id: 'q2-project-type',
            key: 'projectType',
            question: 'What type of construction project is this?',
            description: 'Select the category that best describes your project.',
            type: 'radio',
            required: true,
            options: [
                {
                    value: 'residential_single',
                    label: 'Single-Family Residential',
                    description: 'House, townhome, or single-family dwelling'
                },
                {
                    value: 'residential_multi',
                    label: 'Multi-Family Residential',
                    description: 'Apartment complex, condos, or multi-unit housing'
                },
                {
                    value: 'commercial',
                    label: 'Commercial',
                    description: 'Office, retail, restaurant, or business building'
                },
                {
                    value: 'industrial',
                    label: 'Industrial',
                    description: 'Factory, warehouse, or industrial facility'
                },
                {
                    value: 'public',
                    label: 'Public/Government',
                    description: 'School, hospital, or government building'
                },
            ],
            branches: [
                { value: 'public', nextQuestionId: 'q3-public-bonded' },
            ],
        },
        {
            id: 'q3-public-bonded',
            key: 'isPublicProjectBonded',
            question: 'Is this public project bonded?',
            description: 'Public projects typically have payment bonds instead of lien rights.',
            type: 'radio',
            required: true,
            showIf: {
                questionKey: 'projectType',
                value: 'public',
            },
            options: [
                { value: 'yes', label: 'Yes, there is a payment bond' },
                { value: 'no', label: 'No payment bond' },
                { value: 'unknown', label: 'I don\'t know' },
            ],
        },
        {
            id: 'q4-claimant-role',
            key: 'claimantRole',
            question: 'What is your role on this project?',
            description: 'Your role affects your lien rights and notice requirements.',
            type: 'radio',
            required: true,
            options: [
                {
                    value: 'general_contractor',
                    label: 'General Contractor',
                    description: 'Direct contract with property owner'
                },
                {
                    value: 'subcontractor',
                    label: 'Subcontractor',
                    description: 'Contract with general contractor or another sub'
                },
                {
                    value: 'material_supplier',
                    label: 'Material Supplier',
                    description: 'Providing materials to the project'
                },
                {
                    value: 'equipment_lessor',
                    label: 'Equipment Lessor',
                    description: 'Renting equipment for the project'
                },
                {
                    value: 'design_professional',
                    label: 'Design Professional',
                    description: 'Architect, engineer, or surveyor'
                },
            ],
        },
        {
            id: 'q5-written-contract',
            key: 'hasWrittenContract',
            question: 'Do you have a written contract?',
            description: 'A written contract strengthens your claim and helps establish the scope of work.',
            type: 'radio',
            required: true,
            options: [
                { value: 'yes', label: 'Yes, I have a written contract' },
                { value: 'no', label: 'No, verbal agreement only' },
                { value: 'po', label: 'Purchase order or invoice only' },
            ],
        },
        {
            id: 'q6-contract-amount',
            key: 'contractAmount',
            question: 'What is the total contract amount?',
            description: 'Enter the total value of your contract or agreement.',
            type: 'number',
            required: true,
            validation: {
                min: 0,
                message: 'Please enter a valid contract amount',
            },
        },
        {
            id: 'q7-work-start-date',
            key: 'workStartDate',
            question: 'When did you start work or deliver materials?',
            description: 'This date is critical for calculating notice and lien filing deadlines.',
            type: 'date',
            required: true,
            validation: {
                message: 'Please select a valid date',
            },
        },
        {
            id: 'q8-work-status',
            key: 'workStatus',
            question: 'What is the current status of your work?',
            type: 'radio',
            required: true,
            options: [
                { value: 'not_started', label: 'Not started yet' },
                { value: 'in_progress', label: 'Currently working' },
                { value: 'completed', label: 'Work completed' },
                { value: 'stopped', label: 'Work stopped/suspended' },
            ],
        },
        {
            id: 'q9-completion-date',
            key: 'workCompletionDate',
            question: 'When did you complete your work or last deliver materials?',
            description: 'This triggers the 4-month lien filing deadline in Texas.',
            type: 'date',
            required: true,
            showIf: {
                questionKey: 'workStatus',
                value: 'completed',
            },
        },
        {
            id: 'q10-payment-status',
            key: 'paymentStatus',
            question: 'What is your payment status?',
            description: 'Understanding your payment situation helps determine urgency.',
            type: 'radio',
            required: true,
            options: [
                { value: 'current', label: 'Payments are current' },
                { value: 'overdue_30', label: 'Payment is 1-30 days overdue' },
                { value: 'overdue_60', label: 'Payment is 31-60 days overdue' },
                { value: 'overdue_90_plus', label: 'Payment is 61+ days overdue' },
            ],
        },
        {
            id: 'q11-amount-owed',
            key: 'amountOwed',
            question: 'How much are you currently owed?',
            description: 'Enter the total unpaid balance.',
            type: 'number',
            required: true,
            validation: {
                min: 0,
                message: 'Please enter a valid amount',
            },
        },
        {
            id: 'q12-preliminary-notice',
            key: 'sentPreliminaryNotice',
            question: 'Have you sent a preliminary notice (fund trapping notice)?',
            description: 'In Texas, this notice traps funds and preserves your lien rights.',
            type: 'radio',
            required: true,
            options: [
                { value: 'yes', label: 'Yes, I sent the notice' },
                { value: 'no', label: 'No, I have not sent it' },
                { value: 'unsure', label: 'I\'m not sure' },
            ],
        },
        {
            id: 'q13-notice-date',
            key: 'preliminaryNoticeDate',
            question: 'When did you send the preliminary notice?',
            type: 'date',
            required: false,
            showIf: {
                questionKey: 'sentPreliminaryNotice',
                value: 'yes',
            },
        },
        {
            id: 'q14-property-owner-type',
            key: 'propertyOwnerType',
            question: 'Who owns the property?',
            description: 'Property ownership affects your lien rights.',
            type: 'radio',
            required: true,
            options: [
                { value: 'private', label: 'Private individual or company' },
                { value: 'public', label: 'Government or public entity' },
                { value: 'unknown', label: 'I don\'t know' },
            ],
        },
        {
            id: 'q15-homestead',
            key: 'isHomestead',
            question: 'Is this property a homestead (owner\'s primary residence)?',
            description: 'Texas homestead laws provide additional protections.',
            type: 'radio',
            required: true,
            showIf: {
                questionKey: 'projectType',
                value: 'residential_single',
            },
            options: [
                { value: 'yes', label: 'Yes, it\'s the owner\'s primary residence' },
                { value: 'no', label: 'No, it\'s investment or rental property' },
                { value: 'unknown', label: 'I don\'t know' },
            ],
        },
        {
            id: 'q-end-not-texas',
            key: 'endNotTexas',
            question: 'This assessment is for Texas projects only',
            description: 'Unfortunately, we currently only provide lien kits for Texas construction projects.',
            type: 'text',
            required: false,
        },
    ],
}

// Helper function to get next question
export function getNextQuestion(
    currentQuestionId: string,
    answer: any,
    flow: AssessmentFlow
): AssessmentQuestion | null {
    const currentQuestion = flow.questions.find(q => q.id === currentQuestionId)

    if (!currentQuestion) return null

    // Check for branches based on answer
    if (currentQuestion.branches) {
        const branch = currentQuestion.branches.find(b => b.value === answer)
        if (branch) {
            return flow.questions.find(q => q.id === branch.nextQuestionId) || null
        }
    }

    // Get next question in sequence
    const currentIndex = flow.questions.findIndex(q => q.id === currentQuestionId)

    // Find next visible question
    for (let i = currentIndex + 1; i < flow.questions.length; i++) {
        const question = flow.questions[i]

        // Check if question should be shown based on previous answers
        if (question.showIf) {
            // This will be checked by the component
            return question
        }

        return question
    }

    return null // End of questions
}

// Check if a question should be shown based on previous answers
export function shouldShowQuestion(
    question: AssessmentQuestion,
    answers: Record<string, any>
): boolean {
    if (!question.showIf) return true

    const dependentAnswer = answers[question.showIf.questionKey]
    return dependentAnswer === question.showIf.value
}
