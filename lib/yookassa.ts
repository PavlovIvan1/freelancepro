// YooKassa configuration
const shopId = process.env.YOOKASSA_SHOP_ID || ''
const secretKey = process.env.YOOKASSA_SECRET_KEY || ''

// Base64 encode without Buffer (for edge compatibility)
function basicAuth(username: string, password: string): string {
  const credentials = `${username}:${password}`
  const encoded = btoa(credentials)
  return encoded
}

// Payment Create Request
export interface CreatePaymentParams {
  amount: number
  description: string
  userId: string
  planId: string
  returnUrl: string
}

// Create payment using YooKassa API directly
export async function createPayment(params: CreatePaymentParams) {
  const { amount, description, userId, planId, returnUrl } = params

  const paymentData = {
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
  }

  // Make API request to YooKassa
  const response = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': crypto.randomUUID(),
      'Authorization': `Basic ${basicAuth(shopId, secretKey)}`,
    },
    body: JSON.stringify(paymentData),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('YooKassa error:', error)
    throw new Error('Failed to create payment')
  }

  return await response.json()
}

// Get payment status
export async function getPayment(paymentId: string) {
  const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth(shopId, secretKey)}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get payment')
  }

  return await response.json()
}
