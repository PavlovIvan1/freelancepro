'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(form.email, form.password)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">
        {/* Logo */}
        <div className="flex flex-col gap-1">
          <Link href="/" className="text-xl font-bold text-foreground tracking-tight">Freelio</Link>
          <p className="text-sm text-muted-foreground">Войдите в аккаунт</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ivan@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ваш пароль"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full mt-1" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-muted-foreground">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-foreground font-medium hover:underline underline-offset-4">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
