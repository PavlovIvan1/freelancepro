import { getUserId } from '@/lib/auth'
import { getPaymentPlans } from '@/lib/db/json-db'
import { createPayment } from '@/lib/yookassa'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const { planId } = body

    // Get payment plans
    const plans = await getPaymentPlans()
    const plan = plans.find(p => p.id === planId)

    if (!plan) {
      return NextResponse.json({ error: 'Тариф не найден' }, { status: 400 })
    }

    if (plan.price === 0) {
      return NextResponse.json({ error: 'Бесплатный тариф не требует оплаты' }, { status: 400 })
    }

    const returnUrl = `${process.env.YOOKASSA_RETURN_URL}?planId=${planId}`
    
    // Create YooKassa payment
    const payment = await createPayment({
      amount: Number(plan.price),
      description: `Оплата тарифа "${plan.name}" - FreelancePro`,
      userId,
      planId,
      returnUrl
    })

    // Return payment URL for redirect
    return NextResponse.json({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Ошибка при создании платежа' }, { status: 500 })
  }
}
