import { getUserId } from '@/lib/auth'
import {
  createSubscription,
  getPaymentPlans,
  getSubscriptionByUserId,
  getUserById,
  updateUser
} from '@/lib/db/json-db'
import { NextResponse } from 'next/server'

// GET current subscription
export async function GET(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const subscription = await getSubscriptionByUserId(userId)
    const user = await getUserById(userId)
    const plans = await getPaymentPlans()
    
    if (!subscription) {
      // Return free plan
      return NextResponse.json({
        subscription: {
          planId: 'free',
          planName: 'Free',
          status: 'active',
          price: 0,
          features: ['До 5 проектов', 'Базовая аналитика', 'До 10 клиентов']
        }
      })
    }

    const plan = plans.find(p => p.id === subscription.planId)
    return NextResponse.json({
      subscription: {
        ...subscription,
        planName: plan?.name || 'Unknown',
        price: plan?.price || 0,
        features: plan ? JSON.parse(plan.features) : []
      }
    })
  } catch (error) {
    console.error('Error getting subscription:', error)
    return NextResponse.json({ error: 'Ошибка получения подписки' }, { status: 500 })
  }
}

// POST create/update subscription
export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, period } = body

    // Get plan
    const plans = await getPaymentPlans()
    const plan = plans.find(p => p.id === planId)

    if (!plan) {
      return NextResponse.json({ error: 'Тариф не найден' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const subscriptionPeriod = period || 'month'
    const monthsToAdd = subscriptionPeriod === 'year' ? 12 : 1
    const expiresAt = new Date(Date.now() + monthsToAdd * 30 * 24 * 60 * 60 * 1000).toISOString()

    // Get existing subscription
    const existingSub = await getSubscriptionByUserId(userId)
    
    if (existingSub) {
      // Update existing subscription
      // For simplicity, just update user's plan directly
      await updateUser(userId, {
        subscriptionPlan: planId,
        subscriptionPeriod,
        subscriptionExpiresAt: expiresAt
      })
    } else {
      // Create new subscription
      const subscriptionId = 'sub_' + Math.random().toString(36).slice(2, 11)
      await createSubscription({
        id: subscriptionId,
        userId,
        planId,
        status: 'active',
        startDate: now,
        endDate: expiresAt,
        createdAt: now
      })

      // Update user
      await updateUser(userId, {
        subscriptionId,
        subscriptionPlan: planId,
        subscriptionPeriod,
        subscriptionExpiresAt: expiresAt
      })
    }

    return NextResponse.json({
      success: true,
      subscription: {
        planId,
        planName: plan.name,
        status: 'active',
        period: subscriptionPeriod,
        expiresAt
      }
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Ошибка обновления подписки' }, { status: 500 })
  }
}
