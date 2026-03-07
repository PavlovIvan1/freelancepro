import { createSession, hashPassword, setSessionCookie } from '@/lib/auth'
import {
  createSubscription,
  createUser,
  getUserByEmail,
  seedPaymentPlans
} from '@/lib/db/json-db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Seed payment plans if needed
    await seedPaymentPlans()
    
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Имя, email и пароль обязательны' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    const id = 'u_' + Math.random().toString(36).slice(2, 11)
    const passwordHash = hashPassword(password)
    const now = new Date().toISOString()

    // Create user
    await createUser({
      id,
      email,
      name,
      password: passwordHash,
      subscriptionId: null,
      subscriptionPlan: 'free',
      subscriptionExpiresAt: null,
      createdAt: now,
      updatedAt: now
    })

    // Create free subscription
    const subscriptionId = 'sub_' + Math.random().toString(36).slice(2, 11)
    await createSubscription({
      id: subscriptionId,
      userId: id,
      planId: 'free',
      status: 'active',
      startDate: now,
      endDate: null,
      createdAt: now
    })

    // Create session
    const token = createSession(id)
    
    const response = NextResponse.json(
      { 
        success: true, 
        user: { id, email, name, planId: 'free' }
      },
      { status: 201 }
    )

    response.headers.set('Set-Cookie', setSessionCookie(token))

    return response
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    )
  }
}
