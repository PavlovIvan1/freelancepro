'use client'

import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { BarChart3, FolderKanban, LayoutDashboard, LogOut, User, Users } from 'lucide-react'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/',          label: 'Главная',   icon: LayoutDashboard },
  { href: '/projects',  label: 'Проекты',   icon: FolderKanban },
  { href: '/analytics', label: 'Аналитика', icon: BarChart3 },
  { href: '/clients',   label: 'Клиенты',   icon: Users },
  { href: '/profile',   label: 'Профиль',   icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-52 flex-col bg-background border-r border-border">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <span className="text-foreground font-bold text-lg tracking-tight">Freelio</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <a
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                isActive
                  ? 'bg-foreground text-background font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </a>
          )
        })}
      </nav>

      {/* User & Logout */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold text-background">
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-foreground truncate">{user?.name || 'Пользователь'}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email || ''}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>
    </aside>
  )
}
