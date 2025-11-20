import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ArrowRight, Users, CheckCircle, XCircle, FileText, Hammer, Wrench, HardHat } from 'lucide-react'
import { Link } from 'react-router-dom'

export function WhoCanFilePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 transition-colors">
            {/* Hero Section */}
            <section className="py-8 md:py-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 text-white p-10 shadow-2xl shadow-brand-900/30">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="h-8 w-8" />
                            <Badge variant="secondary" className="text-brand-700">
                                Eligibility Guide
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Who Can File a Texas Mechanics Lien?
                        </h1>
                        <p className="text-xl text-brand-100 max-w-3xl">
                            Understanding who has the legal right to file a construction lien in Texas,
                            and what qualifies labor or materials for lien protection.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-8">

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
                            In Texas, anyone who provides <strong>labor, materials, or equipment</strong> that improves
                            real property can file a mechanics lien if they are not paid. This includes general contractors,
                            subcontractors, suppliers, equipment rental companies, architects, engineers, and surveyors.
                        </p>
                    </CardContent>
                </Card>

                {/* Eligible Parties */}
                <section>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        Parties Who Can File a Lien
                    </h2>

                    <div className="grid gap-4">
                        {[
                            {
                                icon: HardHat,
                                title: 'General Contractors',
                                description: 'Prime contractors hired directly by the property owner to manage construction projects.',
                                notes: 'No preliminary notice required when hired by owner.'
                            },
                            {
                                icon: Wrench,
                                title: 'Subcontractors',
                                description: 'Contractors hired by the general contractor or another subcontractor to perform specialized work.',
                                notes: 'Must serve preliminary notice by the 15th day of the 2nd month after first providing labor/materials.'
                            },
                            {
                                icon: Hammer,
                                title: 'Laborers',
                                description: 'Individual workers who provide direct labor on the construction project.',
                                notes: 'Same notice requirements as subcontractors.'
                            },
                            {
                                icon: FileText,
                                title: 'Material Suppliers',
                                description: 'Companies that supply materials incorporated into the project (lumber, concrete, steel, etc.).',
                                notes: 'Must serve preliminary notice; applies to materials actually used in construction.'
                            },
                            {
                                icon: FileText,
                                title: 'Equipment Rental Companies',
                                description: 'Businesses that rent equipment used for construction work on the property.',
                                notes: 'Rental must be for equipment used on-site; preliminary notice required.'
                            },
                            {
                                icon: FileText,
                                title: 'Design Professionals',
                                description: 'Architects, engineers, surveyors, and landscape architects who provide plans and designs.',
                                notes: 'Only if services directly relate to the improvement of the property.'
                            },
                        ].map((party) => {
                            const Icon = party.icon
                            return (
                                <Card key={party.title} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3">
                                            <div className="p-2 bg-brand-100 rounded-lg">
                                                <Icon className="h-5 w-5 text-brand-600" />
                                            </div>
                                            {party.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <p className="text-slate-700">{party.description}</p>
                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                            <p className="text-sm text-blue-900">
                                                <strong>Important:</strong> {party.notes}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </section>

                {/* What Cannot Be Liened */}
                <section>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        Who <span className="text-red-600">Cannot</span> File a Lien
                    </h2>

                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {[
                                    {
                                        title: 'Parties Without a Direct Contractual Relationship',
                                        description: 'If you have no agreement (written or implied) with anyone on the project chain, you cannot file a lien.'
                                    },
                                    {
                                        title: 'Suppliers of Materials NOT Used',
                                        description: 'Materials must be incorporated into the property. If materials were ordered but never delivered or used, they don\'t qualify.'
                                    },
                                    {
                                        title: 'Off-Site Fabrication (Generally)',
                                        description: 'Work performed entirely off-site may not qualify unless it was custom-fabricated for the specific project and later installed.'
                                    },
                                    {
                                        title: 'Service Providers Not Improving Property',
                                        description: 'Temporary services (security guards, porta-potty rental, office supplies) typically don\'t improve the property and cannot be liened.'
                                    },
                                ].map((item, index) => (
                                    <div key={index} className="flex gap-3">
                                        <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{item.title}</h3>
                                            <p className="text-slate-700 text-sm mt-1">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Key Requirements */}
                <section>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        Key Requirements to File a Valid Lien
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            {
                                title: 'Proper Contract',
                                description: 'You must have a valid contract (written or oral) with someone in the chain of contracts.'
                            },
                            {
                                title: 'Unpaid for Work',
                                description: 'You must not have been paid for labor or materials you provided to improve the property.'
                            },
                            {
                                title: 'Timely Preliminary Notice',
                                description: 'If not hired by the owner, you must serve a preliminary notice by the statutory deadline.'
                            },
                            {
                                title: 'Proper Property Description',
                                description: 'Your lien must accurately describe the property where the work was performed.'
                            },
                        ].map((req) => (
                            <Card key={req.title}>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        {req.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-700">{req.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Texas Law Reference */}
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-6 w-6 text-slate-600" />
                            Legal Authority
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-slate-700">
                            The right to file a mechanics lien in Texas is governed by <strong>Chapter 53 of the Texas Property Code</strong>,
                            specifically sections 53.021 through 53.259.
                        </p>
                        <p className="text-sm text-slate-600">
                            <strong>Texas Property Code § 53.021(a)</strong> states: "A person has a lien if the person labors,
                            furnishes labor, or furnishes material for construction or repair of improvements on real property under
                            a contract with the owner of the property, the trustee of the owner, an agent of the owner or trustee,
                            or an original contractor."
                        </p>
                    </CardContent>
                </Card>

                {/* CTA Section */}
                <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
                    <CardContent className="pt-6 text-center">
                        <h3 className="text-2xl font-bold mb-4">
                            Find Out Your Lien Rights
                        </h3>
                        <p className="text-brand-100 mb-6 max-w-2xl mx-auto">
                            Every project is different. Take our assessment to get personalized guidance on your
                            specific situation, including whether you can file a lien and what steps you need to take.
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
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link to="/learn/what-is-a-lien">
                            <Card className="hover:shadow-lg transition-shadow h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">What is a Mechanics Lien?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 text-sm">
                                        Learn the basics of construction liens and how they protect your right to payment.
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/learn/preliminary-notice">
                            <Card className="hover:shadow-lg transition-shadow h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">What is a Pre-Lien Notice?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 text-sm">
                                        Understand the critical preliminary notice requirement and how to serve it properly.
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
