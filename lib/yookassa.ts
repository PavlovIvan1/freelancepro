import { YooKassa } from 'yookassa'

const shopId = process.env.YOOKASSA_SHOP_ID || ''
const secretKey = process.env.YOOKASSA_SECRET_KEY || ''

// Create YooKassa instance
export const yookassa = new YooKassa({
  shopId,
  secretKey,
  debug: true, // Enable debug mode for test payments
})

// Payment Create Request
export interface CreatePaymentParams {
  amount: number
  description: string
  userId: string
  planId: string
  returnUrl: string
}

// Create payment
export async function createPayment(params: CreatePaymentParams) {
  const { amount, description, userId, planId, returnUrl } = params

  const payment = await yookassa.createPayment({
    amount: {
      value: amount.toFixed(2),
      currency: 'RUB',
    },
    description,
    metadata: {
      userId,
      planId,
    },
    payment_method_data: {
      type: 'bank_card',
    },
    confirmation: {
      type: 'redirect',
      return_url: returnUrl,
    },
    capture: true,
  })

  return payment
}

// Get payment status
export async function getPayment(paymentId: string) {
  return yookassa.getPayment(paymentId)
}
