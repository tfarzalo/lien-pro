import { Link, Outlet, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import {
    BookOpen,
    FileText,
    Clock,
    Home,
    Building2,
    AlertCircle,
    Scale,
    CheckCircle,
    DollarSign
} from 'lucide-react'

const learnNavItems = [
    {
        title: 'Getting Started',
        items: [
            {
                path: '/learn/what-is-a-lien',
                label: 'What is a Mechanics Lien?',
                icon: BookOpen,
                description: 'Learn the basics of construction liens'
            },
            {
                path: '/learn/who-can-file',
                label: 'Who Can File a Lien?',
                icon: FileText,
                description: 'Eligible parties and requirements'
            },
            {
                path: '/learn/preliminary-notice',
                label: 'What is a Pre-Lien Notice?',
                icon: AlertCircle,
                description: 'Understanding preliminary notices'
            },
        ]
    },
    {
        title: 'Property Types',
        items: [
            {
                path: '/learn/residential-vs-commercial',
                label: 'Residential vs. Commercial',
                icon: Building2,
                description: 'Key differences and requirements'
            },
            {
                path: '/learn/residential-liens',
                label: 'Residential Project Liens',
                icon: Home,
                description: 'Special rules for homestead properties'
            },
        ]
    },
    {
        title: 'Process & Deadlines',
        items: [
            {
                path: '/learn/deadlines',
                label: 'Critical Deadlines',
                icon: Clock,
                description: 'Timeline and deadline calculator'
            },
            {
                path: '/learn/filing-process',
                label: 'Filing Process Overview',
                icon: CheckCircle,
                description: 'Step-by-step guide'
            },
            {
                path: '/learn/enforcement',
                label: 'Enforcement & Foreclosure',
                icon: Scale,
                description: 'Enforcing your lien rights'
            },
        ]
    },
    {
        title: 'Special Topics',
        items: [
            {
                path: '/learn/payment-bonds',
                label: 'Payment Bond Claims',
                icon: DollarSign,
                description: 'Public project alternatives'
            },
        ]
    }
]

export function LearnLayout() {
    const location = useLocation()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-foreground transition-colors">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:col-span-3">
                        <div className="sticky top-20">
                            <Card className="p-4">
                                <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                                    <BookOpen className="h-5 w-5 text-brand-600" />
                                    <h2 className="font-semibold text-lg">Learning Center</h2>
                                </div>

                                <nav className="space-y-6">
                                    {learnNavItems.map((section) => (
                                        <div key={section.title}>
                                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                {section.title}
                                            </h3>
                                            <ul className="space-y-1">
                                                {section.items.map((item) => {
                                                    const Icon = item.icon
                                                    const isActive = location.pathname === item.path

                                                    return (
                                                        <li key={item.path}>
                                                            <Link
                                                                to={item.path}
                                                                className={`
                                  flex items-start gap-3 p-2 rounded-lg transition-colors
                                  ${isActive
                                                                        ? 'bg-brand-50 text-brand-700 font-medium'
                                                                        : 'text-slate-700 hover:bg-slate-100'
                                                                    }
                                `}
                                                            >
                                                                <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm">{item.label}</div>
                                                                    {!isActive && (
                                                                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                                            {item.description}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Link>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    ))}
                                </nav>

                                {/* CTA Card */}
                                <Card className="mt-6 p-4 bg-gradient-to-br from-brand-50 to-brand-100 border-brand-200">
                                    <h3 className="font-semibold text-sm mb-2">Need Help Now?</h3>
                                    <p className="text-xs text-slate-600 mb-3">
                                        Start your assessment to get personalized guidance for your project.
                                    </p>
                                    <Link
                                        to="/assessment"
                                        className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Start Assessment
                                    </Link>
                                </Card>
                            </Card>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-9">
                        <div className="max-w-5xl mx-auto w-full">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
