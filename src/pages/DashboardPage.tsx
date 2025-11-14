import { AppShell } from "@/components/layout/AppShell"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert"
import { DeadlineCard, FormCard, KitCard } from "@/components/ui/SpecializedCards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Bell, FileText, Home, Package, Settings, Users } from "lucide-react"

// Mock data
const deadlines = [
  {
    title: "Preliminary Notice Filing",
    date: "November 20, 2025",
    daysRemaining: 6,
    priority: "urgent" as const,
    description: "ABC Construction project - residential lien",
  },
  {
    title: "Mechanic's Lien Deadline",
    date: "December 15, 2025", 
    daysRemaining: 31,
    priority: "high" as const,
    description: "XYZ Commercial build - final deadline",
  },
]

const recentForms = [
  {
    title: "Texas Mechanics Lien Affidavit",
    description: "Commercial project lien filing for ABC Corp",
    progress: 75,
    status: "in-progress" as const,
    lastModified: "2 hours ago",
  },
  {
    title: "Preliminary Notice",
    description: "Residential renovation notice",
    progress: 100,
    status: "completed" as const,
    lastModified: "Yesterday",
  },
]

function DashboardSidebar() {
  const navigation = [
    { name: 'Dashboard', icon: Home, current: true },
    { name: 'Assessment', icon: FileText, current: false },
    { name: 'Lien Kits', icon: Package, current: false },
    { name: 'My Forms', icon: FileText, current: false },
    { name: 'Deadlines', icon: Bell, current: false },
    { name: 'Profile', icon: Users, current: false },
    { name: 'Settings', icon: Settings, current: false },
  ]

  return (
    <nav className="space-y-2 py-6">
      {navigation.map((item) => (
        <a
          key={item.name}
          href="#"
          className={`
            group flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${item.current 
              ? 'bg-brand-50 text-brand-700 border-r-2 border-brand-600' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }
          `}
        >
          <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
          {item.name}
        </a>
      ))}
    </nav>
  )
}

function DashboardHeader() {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-slate-900">Lien Professor</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-brand-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">JD</span>
          </div>
          <span className="text-sm font-medium text-slate-700">John Doe</span>
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  return (
    <AppShell
      header={<DashboardHeader />}
      sidebar={<DashboardSidebar />}
    >
      <div className="p-6 space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Dashboard"
          subtitle="Monitor your lien deadlines, forms, and project status"
          actions={
            <Button>
              Start New Assessment
            </Button>
          }
        />

        {/* Urgent Deadline Alert */}
        <Alert variant="warning" className="max-w-4xl">
          <AlertTitle>Upcoming Deadline Alert</AlertTitle>
          <AlertDescription>
            You have 1 urgent deadline in the next 7 days. Review your deadlines below to stay compliant.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Active Projects</p>
                      <p className="text-3xl font-bold text-slate-900">12</p>
                    </div>
                    <div className="h-12 w-12 bg-brand-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-brand-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card variant="elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Pending Deadlines</p>
                      <p className="text-3xl font-bold text-slate-900">3</p>
                    </div>
                    <div className="h-12 w-12 bg-warning-100 rounded-lg flex items-center justify-center">
                      <Bell className="h-6 w-6 text-warning-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card variant="elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Completed Forms</p>
                      <p className="text-3xl font-bold text-slate-900">28</p>
                    </div>
                    <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-success-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Forms */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Recent Forms</h2>
                <Button variant="secondary">View All Forms</Button>
              </div>
              <div className="space-y-4">
                {recentForms.map((form, index) => (
                  <FormCard
                    key={index}
                    title={form.title}
                    description={form.description}
                    progress={form.progress}
                    status={form.status}
                    lastModified={form.lastModified}
                    onContinue={() => console.log('Continue form:', form.title)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Upcoming Deadlines */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Deadlines</h3>
              <div className="space-y-4">
                {deadlines.map((deadline, index) => (
                  <DeadlineCard
                    key={index}
                    title={deadline.title}
                    date={deadline.date}
                    daysRemaining={deadline.daysRemaining}
                    priority={deadline.priority}
                    description={deadline.description}
                    onAction={() => console.log('View deadline:', deadline.title)}
                  />
                ))}
              </div>
            </div>

            {/* Recommended Kit */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommended for You</h3>
              <KitCard
                title="Texas Residential Lien Kit"
                description="Complete package for residential construction liens"
                price={199}
                features={[
                  "Preliminary Notice templates",
                  "Mechanics Lien forms",
                  "Affidavit templates",
                  "Filing instructions"
                ]}
                popular
                onSelect={() => console.log('Select kit')}
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
