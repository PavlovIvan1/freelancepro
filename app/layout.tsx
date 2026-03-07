import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { AuthProvider } from '@/hooks/useAuth'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Freelio — Дашборд фрилансера',
  description: 'Управляйте проектами, клиентами и доходами в одном месте.',
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
