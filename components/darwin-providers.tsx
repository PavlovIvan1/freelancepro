'use client'

// Darwin UI Providers
import { AuthProvider } from '@/hooks/useAuth'
import { AlertProvider, OverlayProvider, ToastProvider } from '@pikoloo/darwin-ui'

export function DarwinProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <OverlayProvider>
        <AlertProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AlertProvider>
      </OverlayProvider>
    </AuthProvider>
  )
}
