import { COOKIE_NAME, getSession } from '@/lib/auth'
import { initDb } from '@/lib/db/db'
import { getUserById } from '@/lib/db/json-db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Initialize database
    await initDb()
    const cookieHeader = request.headers.get('Cookie') || ''
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=')
        return [key, v.join('=')]
      })
    )
    
    const token = cookies[COOKIE_NAME]
    
    if (!token) {
      return NextResponse.json({ user: null })
    }

    const session = getSession(token)
    
    if (!session) {
      return NextResponse.json({ user: null })
    }

    // Get userId from session object
    const userId = session.userId
    
    if (!userId) {
      return NextResponse.json({ user: null })
    }

    const user = await getUserById(userId)

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planId: user.subscriptionPlan,
        subscriptionExpiresAt: user.subscriptionExpiresAt || null
      }
    })
  } catch (error) {
    console.error('Error getting current user:', error)
    return NextResponse.json({ user: null })
  }
}
