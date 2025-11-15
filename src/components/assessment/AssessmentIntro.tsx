// =====================================================
// Assessment Intro Component
// =====================================================

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CheckCircle, Clock, Shield, FileText } from 'lucide-react'

interface AssessmentIntroProps {
    onStart: () => void
}

export function AssessmentIntro({ onStart }: AssessmentIntroProps) {
    return (
        <div className="max-w-4xl mx-auto py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">
                    Texas Construction Lien Assessment
                </h1>
                <p className="text-xl text-slate-600">
                    Get personalized recommendations for protecting your payment rights
                </p>
            </div>

            <Card variant="elevated" className="mb-8">
                <CardHeader>
                    <CardTitle>What You'll Get</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-success-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    Personalized Kit Recommendation
                                </h3>
                                <p className="text-sm text-slate-600">
                                    Get the exact lien kit that matches your project type and situation
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <Clock className="h-6 w-6 text-warning-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    Critical Deadline Identification
                                </h3>
                                <p className="text-sm text-slate-600">
                                    Know exactly when you need to file your preliminary notice and lien
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <Shield className="h-6 w-6 text-brand-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    Risk Assessment
                                </h3>
                                <p className="text-sm text-slate-600">
                                    Understand the urgency of your situation and required actions
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <FileText className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    Document Checklist
                                </h3>
                                <p className="text-sm text-slate-600">
                                    Complete list of documents you'll need to file your lien
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-8">
                <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">How It Works</h3>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
                                1
                            </div>
                            <p className="text-slate-700">
                                Answer 10-15 questions about your project and payment situation
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
                                2
                            </div>
                            <p className="text-slate-700">
                                Our system analyzes your answers using Texas lien law
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
                                3
                            </div>
                            <p className="text-slate-700">
                                Get your personalized report with kit recommendations and next steps
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
                                4
                            </div>
                            <p className="text-slate-700">
                                Purchase your kit and start protecting your payment rights
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center">
                <Button size="lg" onClick={onStart} className="px-8">
                    Start Assessment
                </Button>
                <p className="mt-4 text-sm text-slate-500">
                    Takes about 5 minutes • Your answers are saved automatically
                </p>
            </div>

            <div className="mt-12 p-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 text-center">
                    <strong>Note:</strong> This assessment is designed for Texas construction projects only.
                    Results are based on general Texas lien law and do not constitute legal advice.
                    Consult with an attorney for specific legal guidance.
                </p>
            </div>
        </div>
    )
}
