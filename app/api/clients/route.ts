import { getUserId } from '@/lib/auth'
import { initDb } from '@/lib/db/db'
import {
  createClient,
  getClientsByUserId,
  getUserById
} from '@/lib/db/json-db'
import { NextResponse } from 'next/server'

// Plan limits
const PLAN_LIMITS = {
  free: { projects: 5, clients: 10 },
  pro: { projects: Infinity, clients: Infinity },
}

// GET /api/clients - Get all clients for current user
export async function GET() {
  try {
    // Initialize database
    await initDb()
    
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const clients = await getClientsByUserId(userId)
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

// POST /api/clients - Create a new client
export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const plan = user.subscriptionPlan || 'free'
    const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
    
    // Check client limit
    const existingClients = await getClientsByUserId(userId)
    if (existingClients.length >= limits.clients) {
      return NextResponse.json({ 
        error: `Лимит клиентов исчерпан. Ваш тариф "${plan === 'free' ? 'Бесплатный' : 'Pro'}" позволяет добавить до ${limits.clients === Infinity ? 'неограниченно' : limits.clients} клиентов.`,
        limitReached: true,
        limitType: 'clients'
      }, { status: 403 })
    }
    
    const body = await request.json()
    const { name, email, company, phone, notes } = body

    const id = 'c_' + Math.random().toString(36).slice(2, 11)
    const now = new Date().toISOString()

    const client = await createClient({
      id,
      userId,
      name,
      email: email || '',
      phone: phone || '',
      company: company || '',
      notes: notes || '',
      createdAt: now,
      updatedAt: now
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
