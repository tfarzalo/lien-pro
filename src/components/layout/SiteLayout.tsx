import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { SiteFooter } from '@/components/lienProfessor/FAQAndFooter'

export function SiteLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors flex flex-col">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <SiteFooter />
        </div>
    )
}
