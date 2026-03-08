'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { Sidebar } from '@/components/sidebar'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, User } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar only - hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 min-h-screen w-full md:ml-60 pb-16 md:pb-0">
          {/* Mobile Header with profile */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-foreground">Freelio</span>
            <div className="relative group">
              <button className="flex items-center gap-2 p-1.5 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity">
                <User className="w-4 h-4" />
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Пользователь'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти
                </button>
              </div>
            </div>
          </header>

          {children}
        </main>

        {/* Mobile bottom navigation only - hidden on desktop */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border md:hidden">
          <div className="flex justify-around py-2">
            <a 
              href="/" 
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${isActive('/') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span>Главная</span>
            </a>
            <a 
              href="/projects" 
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${isActive('/projects') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
              <span>Проекты</span>
            </a>
            <a 
              href="/analytics" 
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${isActive('/analytics') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span>Аналитика</span>
            </a>
            <a 
              href="/clients" 
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${isActive('/clients') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <span>Клиенты</span>
            </a>
          </div>
        </nav>
      </div>
    </AuthGuard>
  )
}
