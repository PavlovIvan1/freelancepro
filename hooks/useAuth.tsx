'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  planId: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const AUTH_STORAGE_KEY = 'freelio_auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load auth from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      } catch (e) {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user))
      } else {
        setUser(null)
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      throw new Error(data.error || 'Ошибка входа')
    }
    
    setUser(data.user)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user))
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      throw new Error(data.error || 'Ошибка регистрации')
    }
    
    setUser(data.user)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user))
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
