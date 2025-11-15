import { cn } from "@/lib/utils"
import { HTMLAttributes, forwardRef } from "react"
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react"

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'info' | 'success' | 'warning' | 'danger'
    dismissible?: boolean
    onDismiss?: () => void
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = 'info', dismissible, onDismiss, children, ...props }, ref) => {
        const baseStyles = "relative rounded-lg border p-4"

        const variants = {
            info: "bg-blue-50 border-blue-200 text-blue-800",
            success: "bg-success-50 border-success-200 text-success-800",
            warning: "bg-warning-50 border-warning-200 text-warning-800",
            danger: "bg-danger-50 border-danger-200 text-danger-800",
        }

        const icons = {
            info: Info,
            success: CheckCircle,
            warning: AlertTriangle,
            danger: XCircle,
        }

        const Icon = icons[variant]

        return (
            <div
                ref={ref}
                className={cn(baseStyles, variants[variant], className)}
                {...props}
            >
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="ml-3 flex-1">
                        {children}
                    </div>
                    {dismissible && (
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    type="button"
                                    onClick={onDismiss}
                                    className="inline-flex rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
)
Alert.displayName = "Alert"

const AlertTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h5
            ref={ref}
            className={cn("mb-1 font-medium leading-none tracking-tight", className)}
            {...props}
        />
    )
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("text-sm [&_p]:leading-relaxed", className)}
            {...props}
        />
    )
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
