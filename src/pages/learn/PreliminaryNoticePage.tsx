import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ArrowRight, Bell, AlertTriangle, CheckCircle, Clock, Send, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PreliminaryNoticePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 transition-colors">
            {/* Hero Section */}
            <section className="py-8 md:py-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 text-white p-10 shadow-2xl shadow-brand-900/30">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="h-8 w-8" />
                            <Badge variant="secondary" className="text-brand-700">
                                Critical Requirement
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            What is a Pre-Lien Notice?
                        </h1>
                        <p className="text-xl text-brand-100 max-w-3xl">
                            A preliminary notice (also called a pre-lien notice) is a required document that
                            preserves your right to file a mechanics lien in Texas. Missing this deadline can
                            cost you your lien rights entirely.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-8">

                {/* Critical Warning */}
                <Card className="border-red-300 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-bold text-red-900 mb-2">
                                    Don't Skip This Step!
                                </h3>
                                <p className="text-red-800 leading-relaxed">
                                    Failing to serve a proper preliminary notice by the deadline will <strong>destroy your right
                                        to file a lien</strong>, even if you are owed thousands of dollars. This is the #1 mistake
                                    contractors make.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Answer */}
                <Card className="border-brand-200 bg-brand-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-brand-600" />
                            Quick Answer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg text-slate-700 leading-relaxed">
                            A <strong>preliminary notice</strong> is a written document sent to the property owner
                            (and general contractor, if applicable) informing them that you are providing labor or
                            materials to their property and that you have the right to file a lien if not paid.
                            It must be served by the <strong>15th day of the second month</strong> after you first
                            provide labor or materials.
                        </p>
                    </CardContent>
                </Card>

                {/* Who Must Serve */}
                <section>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        Who Must Serve a Preliminary Notice?
                    </h2>

                    <div className="space-y-4">
                        <Card className="border-green-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-900">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                    Required For:
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {[
                                        'Subcontractors hired by the general contractor',
                                        'Sub-subcontractors hired by other subcontractors',
                                        'Material suppliers who don\'t have a direct contract with the owner',
                                        'Equipment rental companies hired by the GC or subcontractors',
                                    ].map((item, index) => (
                                        <li key={index} className="flex gap-3 items-start">
                                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-slate-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-blue-200 bg-blue-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-900">
                                    <AlertTriangle className="h-6 w-6 text-blue-600" />
                                    NOT Required For:
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {[
                                        'General contractors hired directly by the property owner',
                                        'Anyone with a direct contract with the property owner',
                                        'Residential projects (different rules apply - see below)',
                                    ].map((item, index) => (
                                        <li key={index} className="flex gap-3 items-start">
                                            <span className="text-slate-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                                    <p className="text-sm text-blue-900">
                                        <strong>Pro Tip:</strong> Even if you're not required to send a preliminary notice
                                        (like a GC hired by the owner), it can still be strategic to send a payment demand
                                        letter that serves a similar purpose.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Deadline */}
                <section>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        Critical Deadline
                    </h2>

                    <Card className="border-orange-300 bg-orange-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-900">
                                <Clock className="h-6 w-6 text-orange-600" />
                                Deadline: 15th of the Second Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-700 leading-relaxed">
                                You must serve your preliminary notice by the <strong>15th day of the second calendar month</strong>
                                after you <strong>first</strong> furnish labor or materials to the project.
                            </p>

                            <div className="bg-white rounded-lg border border-orange-200 p-4">
                                <h4 className="font-semibold text-slate-900 mb-3">Example Calculation:</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">First Work Performed:</span>
                                        <span className="text-brand-600 font-semibold">January 20, 2024</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">Month 1:</span>
                                        <span>January</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium">Month 2:</span>
                                        <span>February</span>
                                    </div>
                                    <div className="flex justify-between pt-2">
                                        <span className="font-medium">Preliminary Notice Deadline:</span>
                                        <span className="text-red-600 font-bold">February 15, 2024</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-orange-200 p-4">
                                <h4 className="font-semibold text-slate-900 mb-2">⚠️ Important Notes:</h4>
                                <ul className="space-y-2 text-sm text-slate-700">
                                    <li className="flex gap-2">
                                        <span>•</span>
                                        <span>The deadline is based on when you <strong>first</strong> provided work, not when you finished or when payment is due.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span>•</span>
                                        <span>If the 15th falls on a weekend or holiday, the deadline extends to the next business day.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span>•</span>
                                        <span>It's best practice to send the notice as soon as you start work to avoid missing the deadline.</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* What to Include */}
                <section>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        What Must Be Included in the Notice
                    </h2>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-brand-600" />
                                Required Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    {
                                        title: '1. Your Business Information',
                                        items: [
                                            'Your company name',
                                            'Your business address',
                                            'Contact information'
                                        ]
                                    },
                                    {
                                        title: '2. Description of Work',
                                        items: [
                                            'Type of labor or materials provided',
                                            'General description of your work',
                                            'Approximate value (not required but helpful)'
                                        ]
                                    },
                                    {
                                        title: '3. Project Information',
                                        items: [
                                            'Property address where work is being performed',
                                            'Name of the person or company who hired you',
                                            'If known, the general contractor\'s name'
                                        ]
                                    },
                                    {
                                        title: '4. Legal Statement',
                                        items: [
                                            'Statement that you have the right to file a lien',
                                            'Reference to Texas Property Code (recommended)',
                                            'Clear indication this is a preliminary notice'
                                        ]
                                    },
                                ].map((section) => (
                                    <div key={section.title} className="border-l-4 border-brand-400 pl-4">
                                        <h4 className="font-semibold text-slate-900 mb-2">{section.title}</h4>
                                        <ul className="space-y-1">
                                            {section.items.map((item, index) => (
                                                <li key={index} className="text-slate-700 text-sm flex gap-2">
                                                    <CheckCircle className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* How to Serve */}
                <section>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        How to Properly Serve the Notice
                    </h2>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-6 w-6 text-brand-600" />
                                Delivery Methods
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-700">
                                Texas law accepts several methods of serving preliminary notices:
                            </p>

                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    {
                                        method: 'Certified Mail',
                                        recommended: true,
                                        description: 'Return receipt requested. Provides proof of delivery and date received.',
                                        tip: 'MOST RECOMMENDED - Creates clear proof of service.'
                                    },
                                    {
                                        method: 'Registered Mail',
                                        recommended: true,
                                        description: 'Similar to certified mail. Provides tracking and delivery confirmation.',
                                        tip: 'Also provides strong proof of delivery.'
                                    },
                                    {
                                        method: 'Personal Delivery',
                                        recommended: false,
                                        description: 'Hand delivery with signed receipt.',
                                        tip: 'Must get written acknowledgment of receipt.'
                                    },
                                    {
                                        method: 'Regular Mail',
                                        recommended: false,
                                        description: 'Standard USPS mail.',
                                        tip: 'NOT RECOMMENDED - No proof of delivery if contested.'
                                    },
                                ].map((delivery) => (
                                    <Card key={delivery.method} className={delivery.recommended ? 'border-green-300 bg-green-50' : 'border-slate-200'}>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center justify-between">
                                                {delivery.method}
                                                {delivery.recommended && (
                                                    <Badge className="bg-green-600">Recommended</Badge>
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <p className="text-sm text-slate-700">{delivery.description}</p>
                                            <div className="bg-white rounded p-2 border">
                                                <p className="text-xs text-slate-600">
                                                    <strong>Tip:</strong> {delivery.tip}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                <h4 className="font-semibold text-blue-900 mb-2">Who Should Receive the Notice?</h4>
                                <ul className="space-y-2 text-sm text-blue-900">
                                    <li className="flex gap-2">
                                        <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                        <span><strong>The Property Owner</strong> - Always required</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                        <span><strong>The General Contractor</strong> - If you were not hired by the owner</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Residential vs Commercial */}
                <section>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        Special Rules for Residential Projects
                    </h2>

                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="pt-6 space-y-3">
                            <p className="text-slate-700 leading-relaxed">
                                <strong>Residential homestead properties</strong> have additional notice requirements:
                            </p>
                            <ul className="space-y-2">
                                {[
                                    'Different statutory notice form must be used',
                                    'Notice must include specific consumer warnings',
                                    'Stricter timing requirements may apply',
                                    'Additional constitutional lien filing requirements',
                                ].map((item, index) => (
                                    <li key={index} className="flex gap-3 items-start">
                                        <AlertTriangle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button variant="outline" asChild className="mt-4">
                                <Link to="/learn/residential-vs-commercial">
                                    Learn About Residential vs. Commercial →
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>

                {/* CTA Section */}
                <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
                    <CardContent className="pt-6 text-center">
                        <h3 className="text-2xl font-bold mb-4">
                            Get Your Custom Preliminary Notice
                        </h3>
                        <p className="text-brand-100 mb-6 max-w-2xl mx-auto">
                            Our assessment will calculate your exact deadline and generate a legally compliant
                            preliminary notice tailored to your specific project.
                        </p>
                        <Button size="lg" variant="secondary" asChild>
                            <Link to="/assessment" className="inline-flex items-center gap-2">
                                Start Your Assessment
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Related Articles */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Related Articles</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <Link to="/learn/deadlines">
                            <Card className="hover:shadow-lg transition-shadow h-full">
                                <CardHeader>
                                    <CardTitle className="text-base">Critical Deadlines</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 text-sm">
                                        All important deadlines for Texas lien rights.
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/learn/filing-process">
                            <Card className="hover:shadow-lg transition-shadow h-full">
                                <CardHeader>
                                    <CardTitle className="text-base">Filing Process</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 text-sm">
                                        Step-by-step guide to filing a lien.
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/learn/residential-vs-commercial">
                            <Card className="hover:shadow-lg transition-shadow h-full">
                                <CardHeader>
                                    <CardTitle className="text-base">Residential vs Commercial</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 text-sm">
                                        Key differences in lien requirements.
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    )
}
