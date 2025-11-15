import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { cn } from "@/lib/utils"
import { Clock, DollarSign, FileText, Shield } from "lucide-react"

// Kit Card for lien kit products
interface KitCardProps {
    title: string
    description: string
    price: number
    features: string[]
    popular?: boolean
    onSelect?: () => void
    className?: string
}

export function KitCard({
    title,
    description,
    price,
    features,
    popular,
    onSelect,
    className
}: KitCardProps) {
    return (
        <Card
            variant="interactive"
            className={cn(
                "relative",
                popular && "ring-2 ring-brand-500 shadow-medium",
                className
            )}
        >
            {popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="primary" className="bg-brand-600 text-white">
                        Most Popular
                    </Badge>
                </div>
            )}

            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <div className="flex items-center text-brand-600">
                        <DollarSign className="h-5 w-5" />
                        <span className="text-2xl font-bold">{price}</span>
                    </div>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardHeader>

            <CardContent>
                <ul className="space-y-2 mb-6">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-slate-600">
                            <Shield className="h-4 w-4 text-success-600 mr-2 flex-shrink-0" />
                            {feature}
                        </li>
                    ))}
                </ul>

                <Button
                    variant={popular ? "primary" : "secondary"}
                    className="w-full"
                    onClick={onSelect}
                >
                    Select This Kit
                </Button>
            </CardContent>
        </Card>
    )
}

// Deadline Alert Card
interface DeadlineCardProps {
    title: string
    date: string
    daysRemaining: number
    priority: 'low' | 'medium' | 'high' | 'urgent'
    description?: string
    onAction?: () => void
    className?: string
}

export function DeadlineCard({
    title,
    date,
    daysRemaining,
    priority,
    description,
    onAction,
    className
}: DeadlineCardProps) {
    const priorityStyles = {
        low: "border-slate-200 bg-white",
        medium: "border-warning-200 bg-warning-50",
        high: "border-warning-300 bg-warning-100",
        urgent: "border-danger-300 bg-danger-100",
    }

    const priorityTextStyles = {
        low: "text-slate-600",
        medium: "text-warning-800",
        high: "text-warning-900",
        urgent: "text-danger-900",
    }

    return (
        <Card className={cn(priorityStyles[priority], className)}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <Clock className={cn("h-4 w-4", priorityTextStyles[priority])} />
                            <CardTitle className="text-base">{title}</CardTitle>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{date}</p>
                        {description && (
                            <p className="text-sm text-slate-600 mt-2">{description}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className={cn("text-sm font-medium", priorityTextStyles[priority])}>
                            {daysRemaining} days
                        </div>
                        {onAction && (
                            <Button variant="ghost" size="sm" onClick={onAction} className="mt-2">
                                View Details
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Form Progress Card
interface FormCardProps {
    title: string
    description: string
    progress: number
    status: 'draft' | 'in-progress' | 'completed' | 'submitted'
    lastModified?: string
    onContinue?: () => void
    className?: string
}

export function FormCard({
    title,
    description,
    progress,
    status,
    lastModified,
    onContinue,
    className
}: FormCardProps) {
    const statusStyles = {
        draft: "text-slate-600 bg-slate-100",
        'in-progress': "text-warning-700 bg-warning-100",
        completed: "text-success-700 bg-success-100",
        submitted: "text-brand-700 bg-brand-100",
    }

    return (
        <Card variant="interactive" className={className}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-slate-400" />
                            <CardTitle className="text-lg">{title}</CardTitle>
                            <Badge variant="secondary" className={statusStyles[status]}>
                                {status.replace('-', ' ')}
                            </Badge>
                        </div>
                        <CardDescription className="mt-2">{description}</CardDescription>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Progress: {progress}%</span>
                        {lastModified && <span>Last modified: {lastModified}</span>}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {onContinue && (
                    <Button
                        variant={status === 'draft' ? 'primary' : 'secondary'}
                        onClick={onContinue}
                    >
                        {status === 'draft' ? 'Start Form' : 'Continue'}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
