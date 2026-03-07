'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.name.trim()) e.name = 'Введите имя'
    if (!form.email.includes('@')) e.email = 'Некорректный email'
    if (form.password.length < 6) e.password = 'Минимум 6 символов'
    if (form.password !== form.confirm) e.confirm = 'Пароли не совпадают'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    setServerError('')

    try {
      await register(form.name, form.email, form.password)
      router.push('/')
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Ошибка регистрации')
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
          <p className="text-sm text-muted-foreground">Создайте аккаунт фрилансера</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {serverError && (
            <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              placeholder="Иван Иванов"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={cn(errors.name && 'border-destructive focus-visible:ring-destructive')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ivan@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Минимум 6 символов"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={cn(errors.password && 'border-destructive focus-visible:ring-destructive')}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm">Подтвердите пароль</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Повторите пароль"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className={cn(errors.confirm && 'border-destructive focus-visible:ring-destructive')}
            />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>

          <Button type="submit" className="w-full mt-1" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-foreground font-medium hover:underline underline-offset-4">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
