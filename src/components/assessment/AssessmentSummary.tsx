// =====================================================
// Assessment Summary Component
// Shows results, recommended kits, and next steps
// =====================================================

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { KitCard } from '@/components/ui/SpecializedCards'
import type { AssessmentResult } from '@/types/assessment'
import { setAssessmentCookie, clearAssessmentCookie } from '@/lib/assessmentCookie'
import {
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    Clock,
    FileText,
    ArrowRight,
    Download,
    Calendar,
    RotateCcw,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface AssessmentSummaryProps {
    result: AssessmentResult
    onStartOver: () => void
}

export function AssessmentSummary({ result, onStartOver }: AssessmentSummaryProps) {
    const navigate = useNavigate()

    // Set cookie when results are displayed
    useEffect(() => {
        setAssessmentCookie({
            completed: true,
            completedAt: new Date().toISOString(),
            score: result.score,
            recommendedKitId: result.recommendedKits[0]?.kit.id,
        })
    }, [result])

    const urgencyConfig = {
        low: {
            icon: CheckCircle,
            color: 'text-success-600',
            bgColor: 'bg-success-50',
            borderColor: 'border-success-200',
            label: 'Good Standing',
            message: 'Your situation is stable. Take proactive steps to protect your rights.',
        },
        standard: {
            icon: Clock,
            color: 'text-warning-600',
            bgColor: 'bg-warning-50',
            borderColor: 'border-warning-200',
            label: 'Action Recommended',
            message: 'You should take action soon to ensure your lien rights are protected.',
        },
        high: {
            icon: AlertTriangle,
            color: 'text-danger-600',
            bgColor: 'bg-danger-50',
            borderColor: 'border-danger-200',
            label: 'Action Required',
            message: 'Your payment is overdue. Take action immediately to preserve your rights.',
        },
        critical: {
            icon: AlertCircle,
            color: 'text-danger-700',
            bgColor: 'bg-danger-100',
            borderColor: 'border-danger-300',
            label: 'URGENT ACTION REQUIRED',
            message: '⚠️ Critical deadlines approaching! You must act immediately.',
        },
    }

    const config = urgencyConfig[result.urgencyLevel]
    const UrgencyIcon = config.icon

    const handlePurchaseKit = (kitId: string) => {
        // Navigate to kit details page to show more information before purchase
        navigate(`/kits/${kitId}`)
    }

    const handlePurchaseAll = () => {
        const kitIds = result.recommendedKits.map(rk => rk.kit.id).join(',')
        // For multiple kits, go directly to checkout
        navigate(`/checkout?kits=${kitIds}`)
    }

    const handleRetakeAssessment = () => {
        clearAssessmentCookie()
        onStartOver()
    }

    return (
        <div className="max-w-5xl mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    Your Assessment Results
                </h1>
                <p className="text-lg text-slate-600">
                    Based on your answers, here's what we recommend
                </p>
            </div>

            {/* Urgency Alert */}
            <Alert className={`${config.bgColor} ${config.borderColor}`}>
                <UrgencyIcon className={`h-5 w-5 ${config.color}`} />
                <AlertTitle className={config.color}>
                    {config.label}
                </AlertTitle>
                <AlertDescription className="text-slate-700">
                    {config.message}
                </AlertDescription>
            </Alert>

            {/* Warnings */}
            {result.warnings && result.warnings.length > 0 && (
                <div className="space-y-2">
                    {result.warnings.map((warning, idx) => (
                        <Alert key={idx} variant="warning">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{warning}</AlertDescription>
                        </Alert>
                    ))}
                </div>
            )}

            {/* Score Card */}
            <Card variant="elevated">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                Assessment Score
                            </h3>
                            <p className="text-sm text-slate-600">
                                Based on documentation, timing, and compliance
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-brand-600 mb-1">
                                {result.score}
                            </div>
                            <div className="text-sm text-slate-500">out of 100</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Explanation */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-brand-600" />
                        Your Situation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-700 leading-relaxed">{result.explanation}</p>
                </CardContent>
            </Card>

            {/* Critical Deadlines */}
            {result.identifiedDeadlines.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-warning-600" />
                            Critical Deadlines
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {result.identifiedDeadlines.map((deadline, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start justify-between p-4 border border-slate-200 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h4 className="font-semibold text-slate-900">
                                                {deadline.title}
                                            </h4>
                                            <Badge
                                                variant={
                                                    deadline.priority === 'critical'
                                                        ? 'destructive'
                                                        : deadline.priority === 'high'
                                                            ? 'warning'
                                                            : 'default'
                                                }
                                            >
                                                {deadline.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">
                                            {deadline.description}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Calculated from: {deadline.calculatedFrom}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 ml-4 text-right">
                                        <div
                                            className={`text-2xl font-bold ${deadline.daysFromNow < 15
                                                ? 'text-danger-600'
                                                : deadline.daysFromNow < 30
                                                    ? 'text-warning-600'
                                                    : 'text-slate-900'
                                                }`}
                                        >
                                            {deadline.daysFromNow}
                                        </div>
                                        <div className="text-xs text-slate-500">days</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recommended Kits */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Recommended Lien Kits
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {result.recommendedKits.map((recommended) => (
                        <div key={recommended.kit.id} className="relative">
                            {recommended.priority === 'primary' && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                    <Badge variant="primary" className="bg-brand-600 text-white">
                                        Recommended
                                    </Badge>
                                </div>
                            )}
                            <KitCard
                                title={recommended.kit.name}
                                description={recommended.kit.description || ''}
                                price={recommended.kit.price_cents / 100}
                                features={recommended.kit.features || []}
                                popular={recommended.kit.is_popular}
                                onSelect={() => handlePurchaseKit(recommended.kit.id)}
                            />
                            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-700">
                                    <strong>Why we recommend this:</strong> {recommended.reason}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Match score: {recommended.matchScore}%
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {result.recommendedKits.length > 1 && (
                    <div className="text-center">
                        <Button size="lg" onClick={handlePurchaseAll}>
                            Purchase All Recommended Kits
                        </Button>
                    </div>
                )}
            </div>

            {/* Required Documents */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-brand-600" />
                        Required Documents
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-600 mb-4">
                        You'll need to gather these documents to complete your lien filing:
                    </p>
                    <div className="space-y-2">
                        {result.requiredDocuments.map((doc, idx) => (
                            <div
                                key={idx}
                                className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg"
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    {doc.required ? (
                                        <AlertCircle className="h-5 w-5 text-danger-600" />
                                    ) : (
                                        <CheckCircle className="h-5 w-5 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium text-slate-900">{doc.name}</span>
                                        {doc.required && (
                                            <Badge variant="destructive" className="text-xs">
                                                Required
                                            </Badge>
                                        )}
                                        {doc.included && (
                                            <Badge variant="success" className="text-xs">
                                                Included in Kit
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">{doc.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <ArrowRight className="mr-2 h-5 w-5 text-success-600" />
                        Next Steps
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-3">
                        {result.nextSteps.map((step, idx) => (
                            <li key={idx} className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
                                    {idx + 1}
                                </div>
                                <p className="text-slate-700 flex-1">{step}</p>
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <Button variant="secondary" onClick={handleRetakeAssessment} className="flex items-center">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retake Assessment
                </Button>

                <div className="flex items-center space-x-3">
                    <Button variant="secondary" className="flex items-center">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF Report
                    </Button>

                    {result.recommendedKits.length > 0 && (
                        <Button
                            size="lg"
                            onClick={() => handlePurchaseKit(result.recommendedKits[0].kit.id)}
                            className="flex items-center"
                        >
                            Continue to Purchase
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 text-center">
                    <strong>Important:</strong> This assessment provides general guidance based on Texas lien law.
                    It does not constitute legal advice. For specific legal guidance regarding your situation,
                    please consult with a qualified construction law attorney.
                </p>
            </div>
        </div>
    )
}
