import { cn } from "@/lib/utils"
import { HTMLAttributes, forwardRef } from "react"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'interactive'
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
        const baseStyles = "bg-white rounded-xl border"

        const variants = {
            default: "border-slate-200",
            elevated: "border-slate-200 shadow-soft",
            interactive: "border-slate-200 shadow-soft hover:shadow-medium transition-shadow cursor-pointer",
        }

        const paddings = {
            none: "",
            sm: "p-4",
            md: "p-6",
            lg: "p-8",
        }

        return (
            <div
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    paddings[padding],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("pb-4 mb-4", className)}
            {...props}
        />
    )
)
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn("text-lg font-semibold text-slate-900", className)}
            {...props}
        />
    )
)
CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn("text-sm text-slate-600 mt-1", className)}
            {...props}
        />
    )
)
CardDescription.displayName = "CardDescription"

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("", className)} {...props} />
    )
)
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("border-t border-slate-200 pt-4 mt-4", className)}
            {...props}
        />
    )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
