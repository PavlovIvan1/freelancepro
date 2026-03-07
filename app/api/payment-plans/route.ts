import { initDb } from '@/lib/db/db'
import { getPaymentPlans, seedPaymentPlans } from '@/lib/db/json-db'
import { NextResponse } from 'next/server'

// GET /api/payment-plans - Get all payment plans
export async function GET() {
  try {
    // Initialize database
    await initDb()
    
    // Ensure plans are seeded
    await seedPaymentPlans()
    
    const plans = await getPaymentPlans()
    
    const parsedPlans = plans.map((plan) => ({
      ...plan,
      features: JSON.parse(plan.features),
      isActive: Boolean(plan.isActive)
    }))

    return NextResponse.json(parsedPlans)
  } catch (error) {
    console.error('Error fetching payment plans:', error)
    return NextResponse.json({ error: 'Failed to fetch payment plans' }, { status: 500 })
  }
}
