// =====================================================
// Texas Lien Deadline Calculator
// Calculates all important deadlines based on Texas Property Code
// =====================================================

import { addDays, addMonths, isBefore, isAfter, differenceInDays } from 'date-fns';

// =====================================================
// Types & Interfaces
// =====================================================

export type DeadlineType =
    | 'preliminary_notice'
    | 'monthly_notice'
    | 'retainage_notice'
    | 'mechanics_lien'
    | 'bond_claim'
    | 'payment_demand'
    | 'lawsuit_filing'
    | 'payment_due';

export type DeadlineSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ProjectData {
    projectId: string;
    projectType: 'residential' | 'commercial' | 'public';
    propertyType: 'homestead' | 'non_homestead';
    contractType: 'direct' | 'subcontractor' | 'supplier';

    // Key dates
    firstFurnishedDate: string | null;
    lastFurnishedDate: string | null;
    contractDate: string | null;
    noticeOfCompletionDate: string | null;

    // Project details
    originalContractAmount: number;
    retainedAmount: number;

    // Relationships
    hasDirectContractWithOwner: boolean;
    workedWithGeneralContractor: boolean;
    generalContractorName?: string;
    propertyOwnerName?: string;
}

export interface AssessmentData {
    canFilePreliminaryNotice: boolean;
    canFileMonthlyNotice: boolean;
    canFileMechanicsLien: boolean;
    canFileBondClaim: boolean;
    needsRetainageNotice: boolean;
    workType: string;
    jurisdiction: string;
}

export interface Deadline {
    id?: string;
    projectId: string;
    userId: string;
    type: DeadlineType;
    title: string;
    description: string;
    dueDate: string;
    severity: DeadlineSeverity;
    status: 'upcoming' | 'due_soon' | 'overdue' | 'completed';
    isOptional: boolean;
    legalReference: string;
    actionItems: string[];
    createdAt?: string;
    updatedAt?: string;
}

// =====================================================
// Texas Lien Law Constants
// =====================================================

const TEXAS_DEADLINE_RULES = {
    // Preliminary Notice (Residential)
    RESIDENTIAL_PRELIM_NOTICE_DAYS: 15, // 15th day of 2nd month

    // Monthly Notice (Residential)
    RESIDENTIAL_MONTHLY_NOTICE_DAYS: 15, // 15th day of following month

    // Retainage Notice (Residential)
    RESIDENTIAL_RETAINAGE_NOTICE_DAYS: 30, // 30 days before filing lien

    // Mechanics Lien Filing
    RESIDENTIAL_LIEN_FILING_DAYS: 15, // 15th day of 3rd month after last work
    COMMERCIAL_LIEN_FILING_DAYS: 15, // 15th day of 4th month after last work

    // Bond Claim (Public Projects)
    BOND_CLAIM_FILING_DAYS: 90, // 90 days after last work
    BOND_CLAIM_SECOND_TIER_DAYS: 60, // 60 days for 2nd tier subcontractors

    // Lawsuit to Foreclose
    LAWSUIT_FILING_YEARS: 2, // 2 years after lien filing or 1 year after completion

    // Payment Demand
    PAYMENT_DEMAND_DAYS: 10, // Recommended before further action

    // Warning periods
    CRITICAL_WARNING_DAYS: 7,
    HIGH_WARNING_DAYS: 14,
    MEDIUM_WARNING_DAYS: 30,
};

// =====================================================
// Main Deadline Calculator
// =====================================================

/**
 * Calculates all applicable deadlines for a Texas construction project
 * @param assessmentData - Results from the lien assessment
 * @param projectData - Project details and dates
 * @param userId - User ID for database storage
 * @returns Array of deadline objects
 */
export function calculateDeadlines(
    assessmentData: AssessmentData,
    projectData: ProjectData,
    userId: string
): Deadline[] {
    const deadlines: Deadline[] = [];

    // Validate required dates
    if (!projectData.firstFurnishedDate) {
        console.warn('First furnished date is required for deadline calculation');
        return deadlines;
    }

    const firstFurnished = new Date(projectData.firstFurnishedDate);
    const lastFurnished = projectData.lastFurnishedDate
        ? new Date(projectData.lastFurnishedDate)
        : new Date(); // Use today if work is ongoing

    // Calculate each applicable deadline type
    if (assessmentData.canFilePreliminaryNotice) {
        const prelimDeadlines = calculatePreliminaryNoticeDeadlines(
            projectData,
            firstFurnished,
            userId
        );
        deadlines.push(...prelimDeadlines);
    }

    if (assessmentData.canFileMonthlyNotice) {
        const monthlyDeadlines = calculateMonthlyNoticeDeadlines(
            projectData,
            firstFurnished,
            lastFurnished,
            userId
        );
        deadlines.push(...monthlyDeadlines);
    }

    if (assessmentData.needsRetainageNotice) {
        const retainageDeadlines = calculateRetainageNoticeDeadlines(
            projectData,
            lastFurnished,
            userId
        );
        deadlines.push(...retainageDeadlines);
    }

    if (assessmentData.canFileMechanicsLien) {
        const lienDeadlines = calculateMechanicsLienDeadlines(
            projectData,
            lastFurnished,
            userId
        );
        deadlines.push(...lienDeadlines);
    }

    if (assessmentData.canFileBondClaim) {
        const bondDeadlines = calculateBondClaimDeadlines(
            projectData,
            lastFurnished,
            userId
        );
        deadlines.push(...bondDeadlines);
    }

    // Add payment-related deadlines
    const paymentDeadlines = calculatePaymentDeadlines(
        projectData,
        lastFurnished,
        userId
    );
    deadlines.push(...paymentDeadlines);

    // Calculate status for each deadline
    return deadlines.map(deadline => ({
        ...deadline,
        status: calculateDeadlineStatus(new Date(deadline.dueDate)),
        severity: calculateDeadlineSeverity(new Date(deadline.dueDate)),
    }));
}

// =====================================================
// Preliminary Notice Deadlines
// =====================================================

function calculatePreliminaryNoticeDeadlines(
    projectData: ProjectData,
    firstFurnished: Date,
    userId: string
): Deadline[] {
    const deadlines: Deadline[] = [];

    if (projectData.projectType === 'residential') {
        // Residential: 15th day of 2nd month after first furnishing
        const month1 = addMonths(firstFurnished, 1);
        const dueDate = new Date(month1.getFullYear(), month1.getMonth(), 15);

        deadlines.push({
            projectId: projectData.projectId,
            userId,
            type: 'preliminary_notice',
            title: 'File Preliminary Notice',
            description: `Required for residential projects to preserve lien rights. Must be filed by the 15th day of the 2nd month after first furnishing labor/materials.`,
            dueDate: dueDate.toISOString(),
            severity: 'critical',
            status: 'upcoming',
            isOptional: false,
            legalReference: 'Texas Property Code § 53.056',
            actionItems: [
                'Complete preliminary notice form',
                'Include property description and owner information',
                'Send via certified mail to property owner',
                'Send copy to general contractor if applicable',
                'Keep proof of delivery',
            ],
        });

        // Add warning deadline
        const warningDate = addDays(dueDate, -TEXAS_DEADLINE_RULES.CRITICAL_WARNING_DAYS);
        deadlines.push({
            projectId: projectData.projectId,
            userId,
            type: 'preliminary_notice',
            title: 'Preliminary Notice Due Soon',
            description: `Warning: Preliminary notice deadline approaching in ${TEXAS_DEADLINE_RULES.CRITICAL_WARNING_DAYS} days.`,
            dueDate: warningDate.toISOString(),
            severity: 'high',
            status: 'upcoming',
            isOptional: true,
            legalReference: 'Texas Property Code § 53.056',
            actionItems: ['Start preparing preliminary notice documents'],
        });
    }

    return deadlines;
}

// =====================================================
// Monthly Notice Deadlines
// =====================================================

function calculateMonthlyNoticeDeadlines(
    projectData: ProjectData,
    firstFurnished: Date,
    lastFurnished: Date,
    userId: string
): Deadline[] {
    const deadlines: Deadline[] = [];

    if (projectData.projectType === 'residential' && projectData.contractType === 'subcontractor') {
        // Monthly notices: 15th of each month following work
        let currentMonth = new Date(firstFurnished);
        const endMonth = new Date(lastFurnished);

        while (currentMonth <= endMonth) {
            const nextMonth = addMonths(currentMonth, 1);
            const dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15);

            if (isBefore(new Date(), dueDate)) {
                deadlines.push({
                    projectId: projectData.projectId,
                    userId,
                    type: 'monthly_notice',
                    title: `Monthly Notice - ${nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
                    description: 'Required monthly notice to preserve lien rights for unpaid amounts from previous month.',
                    dueDate: dueDate.toISOString(),
                    severity: 'high',
                    status: 'upcoming',
                    isOptional: false,
                    legalReference: 'Texas Property Code § 53.056(e)',
                    actionItems: [
                        'Calculate unpaid balance from previous month',
                        'Complete monthly notice form',
                        'Send to property owner via certified mail',
                        'Keep proof of delivery',
                    ],
                });
            }

            currentMonth = nextMonth;
        }
    }

    return deadlines;
}

// =====================================================
// Retainage Notice Deadlines
// =====================================================

function calculateRetainageNoticeDeadlines(
    projectData: ProjectData,
    lastFurnished: Date,
    userId: string
): Deadline[] {
    const deadlines: Deadline[] = [];

    if (projectData.retainedAmount > 0 && projectData.projectType === 'residential') {
        // Must give 30 days notice before filing lien for retainage
        const lienFilingDeadline = calculateLienFilingDeadline(projectData, lastFurnished);
        const retainageNoticeDate = addDays(lienFilingDeadline, -TEXAS_DEADLINE_RULES.RESIDENTIAL_RETAINAGE_NOTICE_DAYS);

        deadlines.push({
            projectId: projectData.projectId,
            userId,
            type: 'retainage_notice',
            title: 'File Retainage Notice',
            description: `Required 30-day notice before filing lien for retained funds ($${projectData.retainedAmount.toLocaleString()}).`,
            dueDate: retainageNoticeDate.toISOString(),
            severity: 'high',
            status: 'upcoming',
            isOptional: false,
            legalReference: 'Texas Property Code § 53.056(c)',
            actionItems: [
                'Calculate total retainage amount',
                'Complete retainage notice form',
                'Send via certified mail to property owner',
                'Wait 30 days before filing lien',
            ],
        });
    }

    return deadlines;
}

// =====================================================
// Mechanics Lien Deadlines
// =====================================================

function calculateMechanicsLienDeadlines(
    projectData: ProjectData,
    lastFurnished: Date,
    userId: string
): Deadline[] {
    const deadlines: Deadline[] = [];

    const lienFilingDate = calculateLienFilingDeadline(projectData, lastFurnished);

    deadlines.push({
        projectId: projectData.projectId,
        userId,
        type: 'mechanics_lien',
        title: 'File Mechanics Lien',
        description: `Last day to file mechanics lien with the county clerk. After this date, lien rights are lost.`,
        dueDate: lienFilingDate.toISOString(),
        severity: 'critical',
        status: 'upcoming',
        isOptional: false,
        legalReference: projectData.projectType === 'residential'
            ? 'Texas Property Code § 53.052'
            : 'Texas Property Code § 53.053',
        actionItems: [
            'Complete mechanics lien affidavit',
            'Include accurate property description',
            'Calculate total amount due',
            'File with county clerk',
            'Serve copy on property owner',
            'Keep certified copies',
        ],
    });

    // Add warning deadlines
    const criticalWarning = addDays(lienFilingDate, -TEXAS_DEADLINE_RULES.CRITICAL_WARNING_DAYS);
    deadlines.push({
        projectId: projectData.projectId,
        userId,
        type: 'mechanics_lien',
        title: 'URGENT: Mechanics Lien Deadline Approaching',
        description: `Critical: Only ${TEXAS_DEADLINE_RULES.CRITICAL_WARNING_DAYS} days left to file mechanics lien!`,
        dueDate: criticalWarning.toISOString(),
        severity: 'critical',
        status: 'upcoming',
        isOptional: true,
        legalReference: projectData.projectType === 'residential'
            ? 'Texas Property Code § 53.052'
            : 'Texas Property Code § 53.053',
        actionItems: ['Start preparing lien documents immediately'],
    });

    // Add lawsuit filing deadline (2 years after lien filing)
    const lawsuitDeadline = addMonths(lienFilingDate, 24);
    deadlines.push({
        projectId: projectData.projectId,
        userId,
        type: 'lawsuit_filing',
        title: 'File Lawsuit to Foreclose Lien',
        description: 'Deadline to file lawsuit to foreclose on mechanics lien. Lien becomes unenforceable after this date.',
        dueDate: lawsuitDeadline.toISOString(),
        severity: 'medium',
        status: 'upcoming',
        isOptional: false,
        legalReference: 'Texas Property Code § 53.158',
        actionItems: [
            'Consult with attorney',
            'Prepare foreclosure lawsuit',
            'File in appropriate court',
            'Serve all parties',
        ],
    });

    return deadlines;
}

// =====================================================
// Bond Claim Deadlines (Public Projects)
// =====================================================

function calculateBondClaimDeadlines(
    projectData: ProjectData,
    lastFurnished: Date,
    userId: string
): Deadline[] {
    const deadlines: Deadline[] = [];

    if (projectData.projectType === 'public') {
        const daysToFile = projectData.contractType === 'direct'
            ? TEXAS_DEADLINE_RULES.BOND_CLAIM_FILING_DAYS
            : TEXAS_DEADLINE_RULES.BOND_CLAIM_SECOND_TIER_DAYS;

        const bondClaimDate = addDays(lastFurnished, daysToFile);

        deadlines.push({
            projectId: projectData.projectId,
            userId,
            type: 'bond_claim',
            title: 'File Payment Bond Claim',
            description: `Deadline to file claim against payment bond for public project. Must file within ${daysToFile} days of last work.`,
            dueDate: bondClaimDate.toISOString(),
            severity: 'critical',
            status: 'upcoming',
            isOptional: false,
            legalReference: 'Texas Government Code § 2253.073',
            actionItems: [
                'Obtain copy of payment bond',
                'Identify bond surety company',
                'Complete bond claim form',
                'Include detailed billing information',
                'Send via certified mail to surety',
                'Send copy to general contractor',
            ],
        });

        // Add warning
        const warningDate = addDays(bondClaimDate, -TEXAS_DEADLINE_RULES.HIGH_WARNING_DAYS);
        deadlines.push({
            projectId: projectData.projectId,
            userId,
            type: 'bond_claim',
            title: 'Bond Claim Deadline Approaching',
            description: `Warning: ${TEXAS_DEADLINE_RULES.HIGH_WARNING_DAYS} days until bond claim deadline.`,
            dueDate: warningDate.toISOString(),
            severity: 'high',
            status: 'upcoming',
            isOptional: true,
            legalReference: 'Texas Government Code § 2253.073',
            actionItems: ['Begin preparing bond claim documents'],
        });
    }

    return deadlines;
}

// =====================================================
// Payment-Related Deadlines
// =====================================================

function calculatePaymentDeadlines(
    projectData: ProjectData,
    lastFurnished: Date,
    userId: string
): Deadline[] {
    const deadlines: Deadline[] = [];

    // Payment demand (before filing lien)
    const paymentDemandDate = addDays(lastFurnished, TEXAS_DEADLINE_RULES.PAYMENT_DEMAND_DAYS);

    deadlines.push({
        projectId: projectData.projectId,
        userId,
        type: 'payment_demand',
        title: 'Send Payment Demand Letter',
        description: 'Recommended: Send formal payment demand before pursuing lien rights.',
        dueDate: paymentDemandDate.toISOString(),
        severity: 'medium',
        status: 'upcoming',
        isOptional: true,
        legalReference: 'Best Practice',
        actionItems: [
            'Draft demand letter with amount due',
            'Include copies of invoices',
            'Set payment deadline (typically 10 days)',
            'Send via certified mail',
            'Document all communication',
        ],
    });

    return deadlines;
}

// =====================================================
// Helper Functions
// =====================================================

function calculateLienFilingDeadline(projectData: ProjectData, lastFurnished: Date): Date {
    if (projectData.projectType === 'residential') {
        // 15th day of 3rd month after last work
        const month3 = addMonths(lastFurnished, 2);
        return new Date(month3.getFullYear(), month3.getMonth(), 15);
    } else {
        // Commercial: 15th day of 4th month after last work
        const month4 = addMonths(lastFurnished, 3);
        return new Date(month4.getFullYear(), month4.getMonth(), 15);
    }
}

function calculateDeadlineStatus(dueDate: Date): Deadline['status'] {
    const today = new Date();
    const daysUntil = differenceInDays(dueDate, today);

    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= TEXAS_DEADLINE_RULES.CRITICAL_WARNING_DAYS) return 'due_soon';
    return 'upcoming';
}

function calculateDeadlineSeverity(dueDate: Date): DeadlineSeverity {
    const today = new Date();
    const daysUntil = differenceInDays(dueDate, today);

    if (daysUntil < 0) return 'critical';
    if (daysUntil <= TEXAS_DEADLINE_RULES.CRITICAL_WARNING_DAYS) return 'critical';
    if (daysUntil <= TEXAS_DEADLINE_RULES.HIGH_WARNING_DAYS) return 'high';
    if (daysUntil <= TEXAS_DEADLINE_RULES.MEDIUM_WARNING_DAYS) return 'medium';
    return 'low';
}

// =====================================================
// Export Utility Functions
// =====================================================

/**
 * Recalculates deadlines when project data changes
 */
export function recalculateDeadlines(
    existingDeadlines: Deadline[],
    assessmentData: AssessmentData,
    projectData: ProjectData,
    userId: string
): Deadline[] {
    // Calculate fresh deadlines
    const newDeadlines = calculateDeadlines(assessmentData, projectData, userId);

    // Preserve completed status from existing deadlines
    return newDeadlines.map(newDeadline => {
        const existing = existingDeadlines.find(
            d => d.type === newDeadline.type && d.title === newDeadline.title
        );

        if (existing && existing.status === 'completed') {
            return { ...newDeadline, status: 'completed' };
        }

        return newDeadline;
    });
}

/**
 * Gets deadlines that need reminders sent
 */
export function getDeadlinesNeedingReminders(
    deadlines: Deadline[],
    reminderDaysBefore: number = 7
): Deadline[] {
    const today = new Date();
    const reminderDate = addDays(today, reminderDaysBefore);

    return deadlines.filter(deadline => {
        const dueDate = new Date(deadline.dueDate);
        return (
            deadline.status !== 'completed' &&
            deadline.status !== 'overdue' &&
            isBefore(dueDate, reminderDate) &&
            isAfter(dueDate, today)
        );
    });
}

/**
 * Formats deadline for display
 */
export function formatDeadline(deadline: Deadline): string {
    const dueDate = new Date(deadline.dueDate);
    const today = new Date();
    const daysUntil = differenceInDays(dueDate, today);

    if (daysUntil < 0) {
        return `Overdue by ${Math.abs(daysUntil)} days`;
    } else if (daysUntil === 0) {
        return 'Due today';
    } else if (daysUntil === 1) {
        return 'Due tomorrow';
    } else if (daysUntil <= 7) {
        return `Due in ${daysUntil} days`;
    } else {
        return dueDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}
