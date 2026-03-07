import { initializeDatabase, seedPaymentPlans } from '@/lib/db/init'
import { NextResponse } from 'next/server'

// This route initializes the database on first request
export async function GET() {
  try {
    await initializeDatabase()
    await seedPaymentPlans()
    return NextResponse.json({ success: true, message: 'Database initialized' })
  } catch (error) {
    console.error('Error initializing database:', error)
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 })
  }
}
