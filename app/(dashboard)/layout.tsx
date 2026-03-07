import { AuthGuard } from '@/components/AuthGuard'
import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 ml-60 min-h-screen">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
