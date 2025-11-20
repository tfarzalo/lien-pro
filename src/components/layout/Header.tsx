import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MainNav } from './MainNav'
import { UserNav } from './UserNav'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { siteConfig } from '@/config/site'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

export function Header() {
  const { user, loading } = useAuth()
  const location = useLocation()

  const navItems = useMemo(() => {
    return siteConfig.headerNav.filter((item) => {
      if (item.audience === 'authenticated') {
        return Boolean(user)
      }
      if (item.audience === 'guest') {
        return !user
      }
      return true
    })
  }, [user])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <MainNav items={navItems} activePath={location.pathname} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          {loading ? (
            <div className="h-9 w-28 animate-pulse rounded-md bg-slate-200" />
          ) : user ? (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" asChild className="hidden md:inline-flex">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <UserNav />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex flex-col text-right leading-tight">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Returning user?
                </span>
                <span className="text-sm text-slate-600">
                  Access your portal
                </span>
              </div>
              <Button variant="ghost" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/assessment">Start Assessment</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
