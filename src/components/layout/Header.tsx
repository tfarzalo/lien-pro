import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { 
  NavigationMenu, 
  NavigationMenuList, 
  NavigationMenuItem, 
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent
} from '@/components/ui/navigation-menu'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { BookOpen, FileText, Bell, Home, Building2 } from 'lucide-react'

export function Header() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Lien Professor</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-3 py-2 text-sm font-medium">
                  Learn
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <li>
                      <Link
                        to="/learn/what-is-a-lien"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="h-4 w-4" />
                          <div className="text-sm font-medium leading-none">What is a Mechanics Lien?</div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Learn the basics of construction liens
                        </p>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/learn/who-can-file"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4" />
                          <div className="text-sm font-medium leading-none">Who Can File a Lien?</div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Eligible parties and requirements
                        </p>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/learn/preliminary-notice"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Bell className="h-4 w-4" />
                          <div className="text-sm font-medium leading-none">Pre-Lien Notice</div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Critical preliminary notice requirements
                        </p>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/learn/residential-vs-commercial"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex gap-1">
                            <Home className="h-4 w-4" />
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-medium leading-none">Residential vs Commercial</div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Key differences in requirements
                        </p>
                      </Link>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/assessment" className="px-3 py-2 text-sm font-medium">
                    Assessment
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/kits" className="px-3 py-2 text-sm font-medium">
                    Lien Kits
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              {user && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/dashboard" className="px-3 py-2 text-sm font-medium">
                      Dashboard
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            {user ? (
              <Button variant="ghost" onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/login">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
