import { getUserId } from '@/lib/auth'
import { initDb } from '@/lib/db/db'
import { getPaymentPlans } from '@/lib/db/json-db'
import { createPayment } from '@/lib/yookassa'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('Creating payment...')
    
    // Initialize database
    await initDb()
    
    const userId = await getUserId()
    console.log('User ID:', userId)
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const { planId } = body
    console.log('Plan ID:', planId)

    // Get payment plans
    const plans = await getPaymentPlans()
    console.log('Plans:', plans)
    
    const plan = plans.find(p => p.id === planId)

    if (!plan) {
      return NextResponse.json({ error: 'Тариф не найден' }, { status: 400 })
    }

    if (plan.price === 0) {
      return NextResponse.json({ error: 'Бесплатный тариф не требует оплаты' }, { status: 400 })
    }

    const returnUrl = `${process.env.YOOKASSA_RETURN_URL || 'https://freelancepro-one.vercel.app/profile'}?planId=${planId}`
    console.log('Return URL:', returnUrl)
    
    // Create YooKassa payment
    console.log('Creating YooKassa payment with:', {
      amount: Number(plan.price),
      description: `Оплата тарифа "${plan.name}" - FreelancePro`,
      userId,
      planId,
      returnUrl
    })
    
    const payment = await createPayment({
      amount: Number(plan.price),
      description: `Оплата тарифа "${plan.name}" - FreelancePro`,
      userId,
      planId,
      returnUrl
    })
    
    console.log('Payment created:', payment)

    // Return payment URL for redirect
    return NextResponse.json({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Ошибка при создании платежа: ' + (error as Error).message }, { status: 500 })
  }
}
