import { initDb } from '@/lib/db/db'
import { createPayment, updateUser } from '@/lib/db/json-db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Initialize database
    await initDb()
    
    const body = await request.json()
    console.log('Webhook received:', JSON.stringify(body))
    
    const event = body.event
    
    if (event === 'payment.succeeded') {
      const payment = body.object
      
      const userId = payment.metadata?.userId
      const planId = payment.metadata?.planId
      
      if (userId) {
        // Calculate subscription expiry (30 days)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)
        
        // Update user's subscription
        await updateUser(userId, {
          subscriptionPlan: planId,
          subscriptionId: payment.id,
          subscriptionExpiresAt: expiresAt.toISOString()
        })
        
        // Create payment record
        await createPayment({
          id: 'pay_' + Math.random().toString(36).slice(2, 11),
          userId,
          subscriptionId: payment.id,
          amount: parseFloat(payment.amount.value),
          currency: payment.amount.currency,
          status: 'completed',
          paymentMethod: 'bank_card',
          externalId: payment.id,
          createdAt: new Date().toISOString()
        })
        
        console.log(`Payment succeeded for user ${userId}, plan: ${planId}`)
      }
    } else if (event === 'payment.canceled') {
      const payment = body.object
      const userId = payment.metadata?.userId
      
      if (userId) {
        console.log(`Payment canceled for user ${userId}`)
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 })
  }
}
