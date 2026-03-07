import { createSession, hashPassword, setSessionCookie } from '@/lib/auth'
import { initializeDatabase } from '@/lib/db/init'
import {
  createSubscription,
  createUser,
  getUserByEmail,
  seedPaymentPlans
} from '@/lib/db/json-db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('Starting registration...')
    
    // Initialize database first (create tables if not exists)
    await initializeDatabase()
    console.log('Database initialized')
    
    // Seed payment plans if needed
    await seedPaymentPlans()
    console.log('Payment plans seeded')
    
    const body = await request.json()
    const { name, email, password } = body
    console.log('Received:', { name, email })

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
    console.log('User does not exist, creating new user')

    const id = 'u_' + Math.random().toString(36).slice(2, 11)
    console.log('Hashing password...')
    const passwordHash = await hashPassword(password)
    console.log('Password hashed')
    const now = new Date().toISOString()

    // Create user
    console.log('Creating user in DB...')
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
    console.log('User created')

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
    console.log('Subscription created')

    // Create session
    const token = createSession(id)
    console.log('Session created')
    
    const response = NextResponse.json(
      { 
        success: true, 
        user: { id, email, name, planId: 'free' }
      },
      { status: 201 }
    )

    response.headers.set('Set-Cookie', setSessionCookie(token))

    console.log('Registration complete!')
    return response
  } catch (error) {
    console.error('Error registering user:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Ошибка при регистрации: ' + errorMessage },
      { status: 500 }
    )
  }
}
