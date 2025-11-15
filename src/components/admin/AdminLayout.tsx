import { Link, useLocation } from 'react-router-dom'
import { useAdminAuth } from '@/hooks/useAdminAuth'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Submissions', href: '/admin/submissions', icon: '📋' },
  { name: 'Deadlines', href: '/admin/deadlines', icon: '⏰' },
  { name: 'Users', href: '/admin/users', icon: '👥' },
  { name: 'Activity Log', href: '/admin/activity', icon: '📝' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const { user, role } = useAdminAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/admin" className="text-xl font-bold text-gray-900">
                  Lien Professor Admin
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user?.email}</span>
                <span className="ml-2 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                  {role}
                </span>
              </div>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Exit Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        {children}
      </main>
    </div>
  )
}
