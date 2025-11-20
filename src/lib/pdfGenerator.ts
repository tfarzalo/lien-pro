import jsPDF from 'jspdf'

interface PDFReportData {
    firstName: string
    lastName: string
    email: string
    phone?: string
    projectType: string
    contractParty: string
    workStartDate: string
    lastWorkDate: string
    amountOwed: string
    writtenContract: string
    preliminaryNoticeSent: string
    paymentAttempts: string
    additionalDetails?: string
    interestedInAttorney: string | boolean
    results: {
        daysRemaining: number | null
        deadlineDate: Date | null
        isUrgent: boolean
        isPastDeadline: boolean
        canFileLien: boolean
        lienValidity: string
        recommendations: string[]
    }
}

export function generateAssessmentPDF(data: PDFReportData): void {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (2 * margin)
    let yPosition = margin

    // Helper function to add a section divider
    const addDivider = () => {
        if (yPosition > pageHeight - 30) {
            doc.addPage()
            yPosition = margin
        }
        doc.setDrawColor(200, 200, 200)
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 8
    }

    // Helper function for section headings with reduced spacing
    const addSectionHeading = (text: string) => {
        if (yPosition > pageHeight - 30) {
            doc.addPage()
            yPosition = margin
        }
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(59, 130, 246)
        doc.text(text, margin, yPosition)
        yPosition += 8
    }

    // Helper function for info fields with minimal spacing
    const addInfoField = (label: string, value: string) => {
        if (yPosition > pageHeight - 30) {
            doc.addPage()
            yPosition = margin
        }
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(60, 60, 60)
        doc.text(label, margin, yPosition)

        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        const lines = doc.splitTextToSize(value, contentWidth - 50)
        doc.text(lines, margin + 50, yPosition)
        yPosition += Math.max(lines.length * 4, 6)
    }

    // Header - Company Logo/Title
    doc.setFillColor(59, 130, 246) // Brand blue
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('LIEN PROFESSOR', pageWidth / 2, 25, { align: 'center' })

    yPosition = 50

    // Report Title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Texas Mechanics Lien Assessment Report', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 12

    addDivider()

    // Client Information Section
    addSectionHeading('CLIENT INFORMATION')
    addInfoField('Name:', `${data.firstName} ${data.lastName}`)
    addInfoField('Email:', data.email)
    if (data.phone) {
        addInfoField('Phone:', data.phone)
    }
    yPosition += 5

    addDivider()

    // Project Details Section
    addSectionHeading('PROJECT DETAILS')
    addInfoField('Project Type:', data.projectType)
    addInfoField('Contract Party:', data.contractParty)
    addInfoField('Work Start Date:', data.workStartDate)
    addInfoField('Last Work Date:', data.lastWorkDate)
    addInfoField('Amount Owed:', `$${data.amountOwed}`)
    addInfoField('Written Contract:', data.writtenContract)
    addInfoField('Preliminary Notice:', data.preliminaryNoticeSent)
    addInfoField('Payment Attempts:', data.paymentAttempts)

    if (data.additionalDetails) {
        yPosition += 3
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(60, 60, 60)
        doc.text('Additional Details:', margin, yPosition)
        yPosition += 5

        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        const detailLines = doc.splitTextToSize(data.additionalDetails, contentWidth)
        doc.text(detailLines, margin, yPosition)
        yPosition += detailLines.length * 4 + 5
    }

    yPosition += 5
    addDivider()

    // Assessment Results Section
    addSectionHeading('ASSESSMENT RESULTS')

    // Lien Validity Status
    const validityColor: [number, number, number] =
        data.results.isPastDeadline ? [220, 38, 38] : // Red
            data.results.lienValidity === 'strong' ? [34, 197, 94] : // Green
                data.results.lienValidity === 'moderate' ? [234, 179, 8] : // Yellow
                    [249, 115, 22] // Orange

    const validityText = data.results.lienValidity === 'strong' ? 'STRONG' :
        data.results.lienValidity === 'moderate' ? 'MODERATE' :
            data.results.lienValidity === 'weak' ? 'WEAK' : 'EXPIRED'

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(validityColor[0], validityColor[1], validityColor[2])
    doc.text(`Lien Claim Validity: ${validityText}`, margin, yPosition)
    yPosition += 7

    // Deadline Information
    if (data.results.deadlineDate) {
        const deadlineText = data.results.isPastDeadline
            ? `Deadline Passed: ${data.results.deadlineDate.toLocaleDateString()} (${Math.abs(data.results.daysRemaining || 0)} days overdue)`
            : `Filing Deadline: ${data.results.deadlineDate.toLocaleDateString()} (${data.results.daysRemaining} days remaining)`

        const deadlineColor: [number, number, number] = data.results.isPastDeadline || data.results.isUrgent ? [220, 38, 38] : [234, 179, 8]

        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(deadlineColor[0], deadlineColor[1], deadlineColor[2])
        doc.text(deadlineText, margin, yPosition)
        yPosition += 7
    }

    if (data.results.canFileLien) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(34, 197, 94)
        doc.text('Status: You can file a mechanics lien', margin, yPosition)
        yPosition += 7
    } else {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(220, 38, 38)
        doc.text('Status: Filing deadline has passed', margin, yPosition)
        yPosition += 7
    }

    yPosition += 5
    addDivider()

    // Available Lien Rights
    if (data.results.canFileLien) {
        addSectionHeading('AVAILABLE LIEN RIGHTS')

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        doc.text('✓ Mechanics and Materialmen\'s Lien', margin, yPosition)
        yPosition += 6

        if (data.contractParty !== 'Property owner') {
            doc.text('✓ Constitutional Retainage Lien (if applicable)', margin, yPosition)
            yPosition += 6
        }

        if (data.preliminaryNoticeSent === 'No, but I want to') {
            doc.text('✓ Notice to Owner/Preliminary Notice (send immediately)', margin, yPosition)
            yPosition += 6
        }

        yPosition += 5
        addDivider()
    }

    // Recommendations / Action Plan
    addSectionHeading('YOUR ACTION PLAN')

    data.results.recommendations.forEach((rec, index) => {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        const recText = `${index + 1}. ${rec}`
        const lines = doc.splitTextToSize(recText, contentWidth - 5)
        doc.text(lines, margin, yPosition)
        yPosition += lines.length * 5
    })

    yPosition += 10
    addDivider()

    // Legal Disclaimer
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(220, 38, 38)
    doc.text('LEGAL DISCLAIMER', margin, yPosition)
    yPosition += 8

    const disclaimer = 'This report provides general information about Texas mechanics lien laws and is not legal advice. ' +
        'The information is based on the details you provided and may not account for all circumstances affecting ' +
        'your lien rights. Mechanics lien laws are complex and vary by jurisdiction. For specific legal advice ' +
        'regarding your situation, please consult with a licensed attorney in Texas who specializes in construction law. ' +
        'Lien Professor is not a law firm and does not provide legal representation.'

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth)
    doc.text(disclaimerLines, margin, yPosition)
    yPosition += disclaimerLines.length * 4

    yPosition += 10

    // Footer on all pages
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
            `Lien Professor Assessment Report | Page ${i} of ${totalPages} | Confidential`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        )
    }

    // Generate filename with client name and date
    const date = new Date().toISOString().split('T')[0]
    const filename = `LienProfessor_Assessment_${data.firstName}_${data.lastName}_${date}.pdf`

    // Download the PDF
    doc.save(filename)
}
