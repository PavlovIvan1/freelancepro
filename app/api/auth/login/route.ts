import { createSession, setSessionCookie, verifyPassword } from '@/lib/auth'
import { getUserByEmail, seedPaymentPlans } from '@/lib/db/json-db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Seed payment plans if needed
    await seedPaymentPlans()
    
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    // Find user
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      )
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      )
    }

    // Create session
    const token = createSession(user.id)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planId: user.subscriptionPlan,
      }
    })

    response.headers.set('Set-Cookie', setSessionCookie(token))

    return response
  } catch (error) {
    console.error('Error logging in:', error)
    return NextResponse.json(
      { error: 'Ошибка при входе' },
      { status: 500 }
    )
  }
}
