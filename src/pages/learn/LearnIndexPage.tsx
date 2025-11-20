import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
    BookOpen,
    ArrowRight,
    FileText,
    Bell,
    Home,
    Building2,
    Clock,
    CheckCircle,
    DollarSign,
    Scale
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function LearnIndexPage() {
    const categories = [
        {
            title: 'Getting Started',
            description: 'Essential knowledge about Texas construction liens',
            icon: BookOpen,
            color: 'blue',
            articles: [
                {
                    path: '/learn/what-is-a-lien',
                    title: 'What is a Mechanics Lien?',
                    description: 'Learn the basics of construction liens and how they protect your right to payment',
                    icon: BookOpen,
                    readTime: '5 min read',
                    featured: false,
                    comingSoon: false
                },
                {
                    path: '/learn/who-can-file',
                    title: 'Who Can File a Lien?',
                    description: 'Understand who has the legal right to file a lien and what qualifies',
                    icon: FileText,
                    readTime: '6 min read',
                    featured: false,
                    comingSoon: false
                },
                {
                    path: '/learn/preliminary-notice',
                    title: 'What is a Pre-Lien Notice?',
                    description: 'Critical information about the preliminary notice requirement',
                    icon: Bell,
                    readTime: '7 min read',
                    featured: true,
                    comingSoon: false
                },
            ]
        },
        {
            title: 'Property Types',
            description: 'Understanding different property classifications',
            icon: Building2,
            color: 'purple',
            articles: [
                {
                    path: '/learn/residential-vs-commercial',
                    title: 'Residential vs. Commercial',
                    description: 'Key differences in requirements based on property type',
                    icon: Home,
                    readTime: '8 min read',
                    featured: true,
                    comingSoon: false
                },
            ]
        },
        {
            title: 'Process & Deadlines',
            description: 'Timeline and procedural requirements',
            icon: Clock,
            color: 'orange',
            articles: [
                {
                    path: '/learn/deadlines',
                    title: 'Critical Deadlines',
                    description: 'Complete guide to Texas lien deadlines and timeline',
                    icon: Clock,
                    readTime: '6 min read',
                    featured: false,
                    comingSoon: true
                },
                {
                    path: '/learn/filing-process',
                    title: 'Filing Process Overview',
                    description: 'Step-by-step guide to filing a mechanics lien',
                    icon: CheckCircle,
                    readTime: '10 min read',
                    featured: false,
                    comingSoon: true
                },
                {
                    path: '/learn/enforcement',
                    title: 'Enforcement & Foreclosure',
                    description: 'How to enforce your lien rights through legal action',
                    icon: Scale,
                    readTime: '8 min read',
                    featured: false,
                    comingSoon: true
                },
            ]
        },
        {
            title: 'Special Topics',
            description: 'Advanced topics and special situations',
            icon: DollarSign,
            color: 'green',
            articles: [
                {
                    path: '/learn/payment-bonds',
                    title: 'Payment Bond Claims',
                    description: 'Alternative to liens for public projects',
                    icon: DollarSign,
                    readTime: '7 min read',
                    featured: false,
                    comingSoon: true
                },
            ]
        }
    ]

    const colorClasses = {
        blue: 'border-blue-300 bg-blue-50 text-blue-900',
        purple: 'border-purple-300 bg-purple-50 text-purple-900',
        orange: 'border-orange-300 bg-orange-50 text-orange-900',
        green: 'border-green-300 bg-green-50 text-green-900',
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50/60 to-white dark:from-slate-900 dark:to-slate-950 transition-colors">
            {/* Hero Section */}
            <section className="py-8 md:py-10 mb-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-600/15 via-brand-600/5 to-transparent blur-3xl rounded-[3rem]" aria-hidden />
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_40px_120px_rgba(4,47,73,0.35)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700" />
                        <div className="relative text-white p-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <BookOpen className="h-10 w-10" />
                                <Badge variant="secondary" className="text-brand-700 text-sm bg-white/90">
                                    Education Center
                                </Badge>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold">
                                Texas Lien Law Learning Center
                            </h1>
                            <p className="text-xl text-brand-100 max-w-3xl">
                                Everything you need to know about Texas mechanics liens, preliminary notices,
                                deadlines, and construction payment rights. Written in plain English.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button size="lg" variant="secondary" asChild>
                                    <Link to="/assessment" className="inline-flex items-center gap-2">
                                        Start Your Assessment
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                                    asChild
                                >
                                    <Link to="/learn/what-is-a-lien">
                                        Start Learning
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-14">
                {/* Categories */}
                {categories.map((category) => {
                    const CategoryIcon = category.icon
                    return (
                        <section key={category.title} className="mb-10">
                            <div className={`rounded-lg border-2 p-6 mb-5 ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <CategoryIcon className="h-6 w-6" />
                                    <h2 className="text-2xl font-bold">{category.title}</h2>
                                </div>
                                <p className="text-sm opacity-90">{category.description}</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {category.articles.map((article) => {
                                    const ArticleIcon = article.icon
                                    return (
                                        <Card
                                            key={article.path}
                                            className={`hover:shadow-lg transition-all ${article.featured ? 'ring-2 ring-brand-400' : ''} ${article.comingSoon ? 'opacity-60' : ''}`}
                                        >
                                            <CardHeader className="border-none p-0 mb-3">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="p-2 bg-brand-100 rounded-lg">
                                                        <ArticleIcon className="h-5 w-5 text-brand-600" />
                                                    </div>
                                                    <div className="flex flex-col gap-1 items-end">
                                                        {article.featured && (
                                                            <Badge className="bg-brand-600">Must Read</Badge>
                                                        )}
                                                        {article.comingSoon && (
                                                            <Badge variant="secondary">Coming Soon</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <CardTitle className="text-lg leading-tight">
                                                    {article.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <p className="text-slate-600 text-sm leading-relaxed">
                                                    {article.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-500">{article.readTime}</span>
                                                    {!article.comingSoon ? (
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link to={article.path} className="inline-flex items-center gap-1">
                                                                Read More
                                                                <ArrowRight className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Coming Soon</span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </section>
                    )
                })}

                {/* CTA Section */}
                <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white mt-12">
                    <CardContent className="py-12 text-center">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-90" />
                        <h3 className="text-3xl font-bold mb-4">
                            Ready to Protect Your Payment Rights?
                        </h3>
                        <p className="text-brand-100 mb-8 max-w-2xl mx-auto text-lg">
                            Our guided assessment will walk you through your specific situation and
                            provide personalized deadlines, forms, and instructions.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button size="lg" variant="secondary" asChild>
                                <Link to="/assessment" className="inline-flex items-center gap-2">
                                    Start Your Free Assessment
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30" asChild>
                                <Link to="/kits">
                                    View Lien Kits
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Legal Disclaimer */}
                <Card className="mt-8 bg-slate-50 border-slate-200">
                    <CardContent className="pt-6">
                        <p className="text-xs text-slate-600 leading-relaxed">
                            <strong>Legal Disclaimer:</strong> The information provided in this learning center
                            is for educational purposes only and does not constitute legal advice. Texas lien law
                            is complex and the requirements vary depending on your specific situation. While we
                            strive for accuracy, this content should not be relied upon as a substitute for
                            consultation with a qualified construction attorney. The Lien Professor app and its
                            content are sponsored by Lovein Ribman, P.C., a Texas law firm specializing in
                            construction payment disputes.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
