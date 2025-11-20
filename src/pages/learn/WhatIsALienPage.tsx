import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ArrowRight, BookOpen, CheckCircle, AlertTriangle, Scale, Clock, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

export function WhatIsALienPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 transition-colors">
            {/* Hero Section */}
            <section className="py-8 md:py-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 text-white p-10 shadow-2xl shadow-brand-900/30">
                        <div className="flex items-center gap-3 mb-6">
                            <BookOpen className="h-8 w-8" />
                            <Badge variant="secondary" className="text-brand-700">
                                Educational Resource
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            What is a Texas Construction Lien?
                        </h1>
                        <p className="text-xl text-brand-100 max-w-3xl">
                            A mechanics lien (also called a construction lien) is a legal tool that protects contractors,
                            subcontractors, and suppliers who haven't been paid for their work on a construction project.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">

                {/* Quick Answer Section */}
                <Card className="mb-8 border-brand-200 bg-brand-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-brand-600" />
                            Quick Answer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg text-slate-700 leading-relaxed">
                            A <strong>Construction Lien</strong> (formally called a "Mechanic's and Materialman's Lien" in Texas)
                            is a legal claim filed against a property when someone who provided labor, materials, or equipment
                            for that property hasn't been paid. It creates a "cloud" on the property's title, making it difficult
                            or impossible for the owner to sell or refinance until the debt is paid.
                        </p>
                    </CardContent>
                </Card>

                {/* Who Can File Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <Scale className="h-8 w-8 text-brand-600" />
                        Who Can File a Mechanics Lien in Texas?
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Primary Claimants</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                                        <span><strong>General Contractors</strong> - Hired directly by property owner</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                                        <span><strong>Subcontractors</strong> - Hired by general contractor</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                                        <span><strong>Material Suppliers</strong> - Provided building materials</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                                        <span><strong>Equipment Lessors</strong> - Rented equipment for the project</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Design Professionals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                                        <span><strong>Architects</strong> - Design and planning services</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                                        <span><strong>Engineers</strong> - Structural and site engineering</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                                        <span><strong>Surveyors</strong> - Land surveying services</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                                        <span><strong>Designers</strong> - Interior or landscape design</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        How Does a Mechanics Lien Work?
                    </h2>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">1</div>
                                    Creates a Cloud on the Property Title
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    When you file a mechanics lien with the county clerk's office, it becomes attached to the
                                    property's title. This public record notifies anyone who searches the title that there's
                                    an unpaid debt claim against the property.
                                </p>
                                <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-brand-600">
                                    <p className="text-sm text-slate-600 italic">
                                        <strong>Real-world impact:</strong> Lenders typically will not approve a loan or refinance
                                        on a property with a mechanics lien filed against it. This gives you significant leverage
                                        to negotiate payment.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">2</div>
                                    Blocks Sale or Refinancing
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    Property owners cannot sell or refinance their property with a mechanics lien attached to the title.
                                    This creates immediate pressure to resolve the unpaid debt, especially on new construction or
                                    development projects where the owner needs to secure financing.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">3</div>
                                    Enforced Through Foreclosure
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    If the debt remains unpaid, you can file a lawsuit to <strong>foreclose on the property</strong>
                                    and force its sale to satisfy the debt. This is the ultimate enforcement mechanism, though most
                                    disputes are resolved before reaching this stage.
                                </p>
                                <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                                    <p className="text-sm text-slate-600">
                                        <AlertTriangle className="h-4 w-4 inline mr-1 text-amber-600" />
                                        <strong>Important:</strong> You must file the foreclosure lawsuit within the statutory deadline
                                        (typically 1-2 years depending on project type) or your lien rights will expire.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-brand-600" />
                        What Are the Benefits of Filing a Lien?
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-success-200 bg-success-50">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-success-600" />
                                    Powerful Negotiation Tool
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-slate-700">
                                The mere threat of filing a lien often motivates payment. Once filed, it creates immediate
                                pressure on the property owner to resolve the debt quickly.
                            </CardContent>
                        </Card>

                        <Card className="border-success-200 bg-success-50">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-success-600" />
                                    Protects Your Rights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-slate-700">
                                Filing a lien establishes your legal claim to payment and preserves your right to foreclose
                                if necessary. Without it, you're just another creditor.
                            </CardContent>
                        </Card>

                        <Card className="border-success-200 bg-success-50">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-success-600" />
                                    Priority Over Other Debts
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-slate-700">
                                Mechanics liens often have priority over other claims against the property, including some
                                mortgages, depending on when they were filed and the specific circumstances.
                            </CardContent>
                        </Card>

                        <Card className="border-success-200 bg-success-50">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-success-600" />
                                    Attorney Fees Recovery
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-slate-700">
                                Under Texas law, if you prevail in a lien foreclosure lawsuit, you can often recover your
                                attorney fees in addition to the principal debt, interest, and court costs.
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Legal Basis Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        What Laws Control Texas Mechanics Liens?
                    </h2>

                    <Card className="bg-slate-50">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900 mb-2">Texas Property Code, Chapter 53</h3>
                                    <p className="text-slate-700">
                                        The primary statute governing mechanics liens in Texas. It sets out the requirements for filing,
                                        deadlines, notice procedures, and enforcement mechanisms.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900 mb-2">Texas Prompt Payment Act</h3>
                                    <p className="text-slate-700">
                                        Additional protections for contractors and subcontractors, including penalties for late payment
                                        and provisions for interest on unpaid amounts.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900 mb-2">Trust Fund Statutes</h3>
                                    <p className="text-slate-700">
                                        Texas law treats construction funds as "trust funds" that must be used to pay subcontractors
                                        and suppliers before being diverted to other purposes.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Timing Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <Clock className="h-8 w-8 text-brand-600" />
                        When Should You File a Lien?
                    </h2>

                    <Card className="border-amber-200 bg-amber-50 mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                                Time is Critical
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                Texas has <strong>strict deadlines</strong> for filing mechanics liens. Missing these deadlines
                                means you lose your lien rights forever. The deadlines vary based on:
                            </p>
                            <ul className="space-y-2 ml-6">
                                <li className="flex items-start gap-2">
                                    <span className="text-brand-600 font-bold mt-1">•</span>
                                    <span>Whether the property is residential or commercial</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand-600 font-bold mt-1">•</span>
                                    <span>Who hired you (owner, general contractor, or subcontractor)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand-600 font-bold mt-1">•</span>
                                    <span>When you last provided labor or materials</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand-600 font-bold mt-1">•</span>
                                    <span>When the project was completed</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Residential Projects</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 mb-3">
                                    Lien must be filed by the <strong>15th day of the 3rd month</strong> after your last work or delivery.
                                </p>
                                <p className="text-sm text-slate-600 italic">
                                    Example: Last work on January 20th → Deadline is April 15th
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Commercial Projects</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 mb-3">
                                    Lien must be filed by the <strong>15th day of the 4th month</strong> after your last work or delivery.
                                </p>
                                <p className="text-sm text-slate-600 italic">
                                    Example: Last work on January 20th → Deadline is May 15th
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Real World Example */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        Real-World Example
                    </h2>

                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900 mb-2">The Scenario</h3>
                                    <p className="text-slate-700 leading-relaxed">
                                        Rodriguez Electric, a subcontractor, completed electrical work on a commercial office building
                                        on March 15, 2024. They were hired by ABC General Contractors, who was hired by the property
                                        owner. The invoice for $50,000 was due April 15, 2024, but ABC has not paid despite multiple
                                        requests.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900 mb-2">The Solution</h3>
                                    <ol className="space-y-3 ml-6">
                                        <li className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">1</span>
                                            <span className="text-slate-700">
                                                Rodriguez should have sent a <strong>Pre-Lien Notice</strong> by April 15th (2nd month after first work)
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">2</span>
                                            <span className="text-slate-700">
                                                They can file a <strong>Mechanics Lien</strong> by July 15th (4th month after last work)
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">3</span>
                                            <span className="text-slate-700">
                                                Once filed, the lien creates immediate pressure on the property owner to pay
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">4</span>
                                            <span className="text-slate-700">
                                                If still unpaid, they can file a <strong>foreclosure lawsuit</strong> within 2 years
                                            </span>
                                        </li>
                                    </ol>
                                </div>

                                <div className="bg-white p-4 rounded-lg border border-blue-200 mt-4">
                                    <p className="text-sm text-slate-600">
                                        <strong className="text-success-600">Result:</strong> In most cases like this, the property owner
                                        pays the subcontractor directly once the lien is filed, and deducts that amount from what they
                                        owe the general contractor. The mechanics lien protects Rodriguez's right to payment even though
                                        they didn't have a direct contract with the owner.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Common Mistakes */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-amber-600" />
                        Common Mistakes to Avoid
                    </h2>

                    <div className="space-y-4">
                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-lg text-red-700">❌ Waiting Too Long to File</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700">
                                    Missing the filing deadline is the #1 mistake. Once the deadline passes, you lose your
                                    lien rights forever. Don't wait for "just one more payment promise."
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-lg text-red-700">❌ Not Sending Preliminary Notice</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700">
                                    If you weren't hired directly by the property owner, you MUST send a preliminary notice
                                    to preserve your lien rights. Skipping this step invalidates your lien.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-lg text-red-700">❌ Using Generic Internet Forms</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700">
                                    Free "fill-in-the-blank" forms from the internet are often not Texas-specific and miss
                                    critical language that strengthens your claim. Use attorney-drafted forms or consult a professional.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-lg text-red-700">❌ Filing the Lien but Not Following Through</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700">
                                    A filed lien without a foreclosure lawsuit (if payment isn't made) is just an empty threat.
                                    You must be prepared to file suit before your lien expires or it becomes worthless.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Next Steps CTA */}
                <section className="mt-16">
                    <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
                        <CardContent className="p-8 text-center">
                            <h2 className="text-3xl font-bold mb-4">
                                Ready to Protect Your Payment Rights?
                            </h2>
                            <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
                                Take our free assessment to discover exactly what liens you can file and get the
                                professional forms you need to secure payment.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="text-lg px-8 py-4"
                                    asChild
                                >
                                    <Link to="/assessment">
                                        Start Free Assessment
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-lg px-8 py-4 bg-white/10 hover:bg-white/20 text-white border-white/30"
                                    asChild
                                >
                                    <Link to="/kits">
                                        View Lien Kits
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Related Articles */}
                <section className="mt-12">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Related Articles</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-lg">What is a Pre-Lien Notice?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 mb-4">
                                    Learn about the preliminary notice requirement and when you must send it.
                                </p>
                                <Link to="/learn/pre-lien-notice" className="text-brand-600 font-medium text-sm hover:underline">
                                    Read More →
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-lg">Commercial vs. Residential</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 mb-4">
                                    Understand how lien requirements differ between property types.
                                </p>
                                <Link to="/learn/commercial-vs-residential" className="text-brand-600 font-medium text-sm hover:underline">
                                    Read More →
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-lg">Filing Deadlines</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 mb-4">
                                    Calculate your specific deadlines and avoid missing critical dates.
                                </p>
                                <Link to="/learn/deadlines" className="text-brand-600 font-medium text-sm hover:underline">
                                    Read More →
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </div>
    )
}
