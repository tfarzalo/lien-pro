import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface AppShellProps {
    children: ReactNode
    header?: ReactNode
    sidebar?: ReactNode
    className?: string
}

export function AppShell({ children, header, sidebar, className }: AppShellProps) {
    return (
        <div className={cn("min-h-screen bg-slate-50", className)}>
            {/* Header */}
            {header && (
                <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                    {header}
                </header>
            )}

            <div className="flex">
                {/* Sidebar */}
                {sidebar && (
                    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col lg:pt-16">
                        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-slate-200 px-6 pb-4">
                            {sidebar}
                        </div>
                    </aside>
                )}

                {/* Main content */}
                <main className={cn(
                    "flex-1 min-h-screen",
                    sidebar ? "lg:pl-72" : "",
                    header ? "pt-16" : ""
                )}>
                    {children}
                </main>
            </div>
        </div>
    )
}
