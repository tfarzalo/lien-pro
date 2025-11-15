import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface PageHeaderProps {
    title: string
    subtitle?: string
    actions?: ReactNode
    breadcrumbs?: ReactNode
    className?: string
}

export function PageHeader({
    title,
    subtitle,
    actions,
    breadcrumbs,
    className
}: PageHeaderProps) {
    return (
        <div className={cn("bg-white border-b border-slate-200", className)}>
            <div className="px-4 sm:px-6 lg:px-8 py-6">
                {breadcrumbs && (
                    <nav className="mb-4">
                        {breadcrumbs}
                    </nav>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-display-lg text-slate-900">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-2 text-legal-body">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {actions && (
                        <div className="flex items-center space-x-3">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
