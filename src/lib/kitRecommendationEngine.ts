// =====================================================
// Kit Recommendation Engine
// Maps assessment answers to recommended lien kits
// =====================================================

import type {
    AssessmentResult,
    RecommendedKit,
    UrgencyLevel,
    IdentifiedDeadline,
    RequiredDocument,
    AnswerProfile,
} from '@/types/assessment'
import type { LienKit } from '@/types/database'

/**
 * Main function to generate kit recommendations from assessment answers
 */
export function generateKitRecommendation(
    answers: Record<string, any>,
    availableKits: LienKit[]
): AssessmentResult {
    // Build answer profile
    const profile = buildAnswerProfile(answers)

    // Calculate urgency level
    const urgencyLevel = calculateUrgency(profile, answers)

    // Identify critical deadlines
    const identifiedDeadlines = calculateDeadlines(profile, answers)

    // Match kits based on profile
    const recommendedKits = matchKits(profile, availableKits, urgencyLevel)

    // Determine required documents
    const requiredDocuments = identifyRequiredDocuments(profile)

    // Generate explanation and next steps
    const explanation = generateExplanation(profile, recommendedKits, urgencyLevel)
    const nextSteps = generateNextSteps(profile, urgencyLevel, identifiedDeadlines)
    const warnings = generateWarnings(profile, answers)

    // Calculate overall score
    const score = calculateScore(profile, urgencyLevel, identifiedDeadlines)

    return {
        score,
        recommendedKits,
        urgencyLevel,
        identifiedDeadlines,
        requiredDocuments,
        explanation,
        nextSteps,
        warnings,
    }
}

/**
 * Build a structured profile from raw answers
 */
function buildAnswerProfile(answers: Record<string, any>): AnswerProfile {
    return {
        projectType: answers.projectType || 'residential_single',
        claimantRole: answers.claimantRole || 'subcontractor',
        contractAmount: parseFloat(answers.contractAmount) || 0,
        hasWrittenContract: answers.hasWrittenContract === 'yes',
        workStartDate: answers.workStartDate ? new Date(answers.workStartDate) : undefined,
        workStatus: answers.workStatus || 'in_progress',
        paymentStatus: answers.paymentStatus || 'current',
        propertyOwnerType: answers.propertyOwnerType || 'private',
        noticesSent: answers.sentPreliminaryNotice === 'yes' ? ['preliminary_notice'] : [],
        isTexasProject: answers.isTexasProject === 'yes',
    }
}

/**
 * Calculate urgency level based on payment status and deadlines
 */
function calculateUrgency(profile: AnswerProfile, answers: Record<string, any>): UrgencyLevel {
    const paymentOverdue = profile.paymentStatus !== 'current'
    const workCompleted = profile.workStatus === 'completed'
    const completionDate = answers.workCompletionDate ? new Date(answers.workCompletionDate) : null
    const noticeSent = profile.noticesSent.includes('preliminary_notice')

    // Critical: Overdue payment + work completed + approaching deadline
    if (paymentOverdue && workCompleted && completionDate) {
        const daysSinceCompletion = Math.floor(
            (Date.now() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Texas lien filing deadline is 4 months (120 days) after completion
        if (daysSinceCompletion > 90) {
            return 'critical' // Less than 30 days to file
        }
        if (daysSinceCompletion > 60) {
            return 'high' // Less than 60 days to file
        }
    }

    // High: Overdue 60+ days
    if (profile.paymentStatus === 'overdue_90_plus') {
        return 'high'
    }

    // Standard: Overdue 30+ days or no preliminary notice sent
    if (paymentOverdue || (!noticeSent && profile.claimantRole !== 'general_contractor')) {
        return 'standard'
    }

    // Low: Everything on track
    return 'low'
}

/**
 * Calculate important deadlines based on project dates
 */
function calculateDeadlines(
    profile: AnswerProfile,
    answers: Record<string, any>
): IdentifiedDeadline[] {
    const deadlines: IdentifiedDeadline[] = []
    const today = new Date()

    // Preliminary Notice deadline (15th day of 2nd month after first delivery)
    if (!profile.noticesSent.includes('preliminary_notice') && profile.workStartDate) {
        const preliminaryNoticeDeadline = new Date(profile.workStartDate)
        preliminaryNoticeDeadline.setMonth(preliminaryNoticeDeadline.getMonth() + 2)
        preliminaryNoticeDeadline.setDate(15)

        const daysUntil = Math.floor(
            (preliminaryNoticeDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntil > 0) {
            deadlines.push({
                title: 'Preliminary Notice Deadline',
                description: 'Send preliminary notice (fund trapping notice) to preserve lien rights',
                daysFromNow: daysUntil,
                type: 'preliminary_notice',
                priority: daysUntil < 10 ? 'critical' : daysUntil < 30 ? 'high' : 'medium',
                calculatedFrom: 'workStartDate',
            })
        }
    }

    // Lien Filing deadline (4 months after completion)
    const completionDate = answers.workCompletionDate ? new Date(answers.workCompletionDate) : null
    if (profile.workStatus === 'completed' && completionDate) {
        const lienFilingDeadline = new Date(completionDate)
        lienFilingDeadline.setMonth(lienFilingDeadline.getMonth() + 4)

        const daysUntil = Math.floor(
            (lienFilingDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntil > 0) {
            deadlines.push({
                title: 'Lien Filing Deadline',
                description: 'File mechanic\'s lien with the county clerk',
                daysFromNow: daysUntil,
                type: 'lien_filing',
                priority: daysUntil < 15 ? 'critical' : daysUntil < 30 ? 'high' : 'medium',
                calculatedFrom: 'workCompletionDate',
            })
        }
    }

    // Affidavit of Non-Payment deadline (typically before lien filing)
    if (profile.paymentStatus !== 'current' && completionDate) {
        const affidavitDeadline = new Date(completionDate)
        affidavitDeadline.setMonth(affidavitDeadline.getMonth() + 3)
        affidavitDeadline.setDate(affidavitDeadline.getDate() + 15) // 15 days before lien deadline

        const daysUntil = Math.floor(
            (affidavitDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntil > 0) {
            deadlines.push({
                title: 'Affidavit of Non-Payment',
                description: 'Prepare and send affidavit documenting unpaid amounts',
                daysFromNow: daysUntil,
                type: 'affidavit_deadline',
                priority: daysUntil < 10 ? 'high' : 'medium',
                calculatedFrom: 'workCompletionDate',
            })
        }
    }

    return deadlines.sort((a, b) => a.daysFromNow - b.daysFromNow)
}

/**
 * Match user profile to available kits
 */
function matchKits(
    profile: AnswerProfile,
    availableKits: LienKit[],
    urgencyLevel: UrgencyLevel
): RecommendedKit[] {
    const recommendations: RecommendedKit[] = []

    // Determine kit category based on project type
    let primaryCategory: string

    switch (profile.projectType) {
        case 'residential_single':
        case 'residential_multi':
            primaryCategory = 'residential'
            break
        case 'commercial':
        case 'industrial':
            primaryCategory = 'commercial'
            break
        case 'public':
            primaryCategory = 'specialty'
            break
        default:
            primaryCategory = 'residential'
    }

    // Find primary kit
    const primaryKit = availableKits.find(kit =>
        kit.category === primaryCategory && kit.is_active
    )

    if (primaryKit) {
        let reason = `Recommended for ${profile.projectType.replace('_', ' ')} projects`

        if (profile.claimantRole !== 'general_contractor') {
            reason += ` as a ${profile.claimantRole.replace('_', ' ')}`
        }

        recommendations.push({
            kit: primaryKit,
            priority: 'primary',
            reason,
            matchScore: 100,
        })
    }

    // Find subcontractor kit if applicable
    if (profile.claimantRole === 'subcontractor') {
        const subKit = availableKits.find(kit =>
            kit.category === 'subcontractor' && kit.is_active
        )

        if (subKit && subKit.id !== primaryKit?.id) {
            recommendations.push({
                kit: subKit,
                priority: 'secondary',
                reason: 'Additional forms specifically for subcontractors',
                matchScore: 85,
            })
        }
    }

    // Add specialty kit for complex situations
    if (urgencyLevel === 'critical' || urgencyLevel === 'high') {
        const specialtyKit = availableKits.find(kit =>
            kit.category === 'specialty' && kit.is_active
        )

        if (specialtyKit && !recommendations.find(r => r.kit.id === specialtyKit.id)) {
            recommendations.push({
                kit: specialtyKit,
                priority: 'optional',
                reason: 'Advanced forms for complex or urgent situations',
                matchScore: 70,
            })
        }
    }

    return recommendations
}

/**
 * Identify required documents based on profile
 */
function identifyRequiredDocuments(
    profile: AnswerProfile
): RequiredDocument[] {
    const documents: RequiredDocument[] = []

    // Contract documents
    documents.push({
        name: 'Contract or Agreement',
        description: profile.hasWrittenContract
            ? 'Your written contract'
            : 'Written summary of the agreement',
        category: 'contract',
        required: true,
        included: true,
    })

    // Invoices
    documents.push({
        name: 'Invoices',
        description: 'All invoices for work performed or materials delivered',
        category: 'invoice',
        required: true,
        included: true,
    })

    // Payment records
    documents.push({
        name: 'Payment Records',
        description: 'Documentation of payments received and amounts still owed',
        category: 'correspondence',
        required: true,
        included: true,
    })

    // Preliminary notice (if sent)
    if (profile.noticesSent.includes('preliminary_notice')) {
        documents.push({
            name: 'Preliminary Notice',
            description: 'Copy of the preliminary notice you sent',
            category: 'correspondence',
            required: true,
            included: false,
        })
    }

    // Photos (for property work)
    if (['residential_single', 'residential_multi', 'commercial'].includes(profile.projectType)) {
        documents.push({
            name: 'Project Photos',
            description: 'Photos of work performed or materials delivered',
            category: 'photo',
            required: false,
            included: false,
        })
    }

    // Correspondence
    documents.push({
        name: 'Communication Records',
        description: 'Emails, letters, or text messages about payment or the project',
        category: 'correspondence',
        required: false,
        included: false,
    })

    return documents
}

/**
 * Generate explanation text
 */
function generateExplanation(
    profile: AnswerProfile,
    recommendedKits: RecommendedKit[],
    urgencyLevel: UrgencyLevel
): string {
    const parts: string[] = []

    // Opening
    parts.push(
        `Based on your answers, we've identified the best lien kit for your situation.`
    )

    // Project context
    parts.push(
        `You are a ${profile.claimantRole.replace('_', ' ')} working on a ${profile.projectType.replace('_', ' ')} project in Texas.`
    )

    // Urgency
    if (urgencyLevel === 'critical') {
        parts.push(
            `⚠️ Your situation is time-sensitive. You have critical deadlines approaching that require immediate action.`
        )
    } else if (urgencyLevel === 'high') {
        parts.push(
            `Your payment is overdue, and you should take action soon to preserve your lien rights.`
        )
    } else if (urgencyLevel === 'standard') {
        parts.push(
            `You should take action to protect your lien rights and ensure payment.`
        )
    }

    // Kit recommendation
    if (recommendedKits.length > 0) {
        const primaryKit = recommendedKits[0]
        parts.push(
            `The ${primaryKit.kit.name} includes all the forms and instructions you need to file a valid mechanic's lien in Texas.`
        )
    }

    return parts.join(' ')
}

/**
 * Generate next steps
 */
function generateNextSteps(
    profile: AnswerProfile,
    urgencyLevel: UrgencyLevel,
    deadlines: IdentifiedDeadline[]
): string[] {
    const steps: string[] = []

    // Immediate actions based on urgency
    if (urgencyLevel === 'critical' && deadlines.length > 0) {
        steps.push(`🚨 URGENT: ${deadlines[0].title} in ${deadlines[0].daysFromNow} days`)
        steps.push('Purchase your lien kit immediately and begin preparing documents')
    }

    // Preliminary notice
    if (!profile.noticesSent.includes('preliminary_notice') &&
        profile.claimantRole !== 'general_contractor') {
        steps.push('Send preliminary notice (fund trapping notice) to preserve lien rights')
    }

    // Document gathering
    steps.push('Gather all required documents (contract, invoices, payment records)')

    // Kit selection
    steps.push('Select and purchase the recommended lien kit below')

    // Form completion
    steps.push('Complete all required forms following the included instructions')

    // Filing
    if (profile.workStatus === 'completed') {
        steps.push('File your mechanic\'s lien with the county clerk before the deadline')
    }

    // Payment demand
    if (profile.paymentStatus !== 'current') {
        steps.push('Send formal payment demand to the responsible party')
    }

    // Attorney consultation
    if (urgencyLevel === 'critical' || urgencyLevel === 'high') {
        steps.push('Consider consulting with an attorney for your specific situation')
    }

    return steps
}

/**
 * Generate warnings
 */
function generateWarnings(profile: AnswerProfile, answers: Record<string, any>): string[] {
    const warnings: string[] = []

    // Public project without bond
    if (profile.projectType === 'public' && answers.isPublicProjectBonded === 'no') {
        warnings.push(
            'Warning: Lien rights on public projects are limited. You may need to pursue a bond claim instead.'
        )
    }

    // Homestead property
    if (answers.isHomestead === 'yes' && profile.claimantRole !== 'general_contractor') {
        warnings.push(
            'Note: Texas homestead laws provide extra protections to owners. Your lien rights may be affected.'
        )
    }

    // No written contract
    if (!profile.hasWrittenContract) {
        warnings.push(
            'Tip: Without a written contract, proving your claim may be more difficult. Document everything carefully.'
        )
    }

    // Deadline approaching
    const completionDate = answers.workCompletionDate ? new Date(answers.workCompletionDate) : null
    if (completionDate) {
        const daysSince = Math.floor((Date.now() - completionDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysSince > 90) {
            warnings.push(
                '⚠️ Critical: You have less than 30 days to file your lien. Act immediately!'
            )
        }
    }

    return warnings
}

/**
 * Calculate overall assessment score
 */
function calculateScore(
    profile: AnswerProfile,
    urgencyLevel: UrgencyLevel,
    deadlines: IdentifiedDeadline[]
): number {
    let score = 50 // Base score

    // Add points for having proper documentation
    if (profile.hasWrittenContract) score += 15
    if (profile.noticesSent.length > 0) score += 10

    // Deduct points based on urgency
    switch (urgencyLevel) {
        case 'critical':
            score -= 20
            break
        case 'high':
            score -= 10
            break
        case 'standard':
            score -= 5
            break
    }

    // Deduct points for missed deadlines
    const missedDeadlines = deadlines.filter(d => d.daysFromNow < 0).length
    score -= missedDeadlines * 15

    // Add points for proactive action (work not yet complete)
    if (profile.workStatus !== 'completed') score += 10

    return Math.max(0, Math.min(100, score))
}
