import { initDb } from '@/lib/db/db'
import { createPayment, getUserById, updateUser } from '@/lib/db/json-db'
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
      const period = payment.metadata?.period || 'month'
      
      if (userId) {
        // Get current user to check existing subscription
        const currentUser = await getUserById(userId)
        
        // Determine days to add based on period
        const daysToAdd = period === 'year' ? 365 : 30
        
        let newExpiresAt: Date
        
        if (currentUser?.subscriptionExpiresAt) {
          // Check if current subscription is still valid
          const currentExpires = new Date(currentUser.subscriptionExpiresAt)
          const now = new Date()
          
          if (currentExpires > now) {
            // Extend from current expiry date
            currentExpires.setDate(currentExpires.getDate() + daysToAdd)
            newExpiresAt = currentExpires
          } else {
            // Start fresh from now
            newExpiresAt = new Date()
            newExpiresAt.setDate(newExpiresAt.getDate() + daysToAdd)
          }
        } else {
          // No existing subscription, start from now
          newExpiresAt = new Date()
          newExpiresAt.setDate(newExpiresAt.getDate() + daysToAdd)
        }
        
        // Update user's subscription
        await updateUser(userId, {
          subscriptionPlan: planId,
          subscriptionExpiresAt: newExpiresAt.toISOString()
        })
        
        // Create payment record
        await createPayment({
          id: 'pay_' + Math.random().toString(36).slice(2, 11),
          userId,
          amount: parseFloat(payment.amount.value),
          currency: payment.amount.currency,
          status: 'completed',
          paymentMethod: 'bank_card',
          externalId: payment.id,
          createdAt: new Date().toISOString()
        })
        
        console.log(`Payment succeeded for user ${userId}, plan: ${planId}, period: ${period}, expires: ${newExpiresAt.toISOString()}`)
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
