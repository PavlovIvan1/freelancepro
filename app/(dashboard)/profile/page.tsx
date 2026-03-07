'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Check, CreditCard, Crown, User } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PaymentPlan {
  id: string
  name: string
  price: number
  currency: string
  features: string[]
  interval: string
}

interface UserData {
  name: string
  email: string
  company: string
  phone: string
}

const YOOKASSA_CONFIG = {
  shopId: 'demo_shop_id',
  secretKey: 'demo_secret_key',
}

const plans: PaymentPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'RUB',
    features: ['До 5 проектов', 'Базовая аналитика', 'До 10 клиентов', 'Шаблоны задач'],
    interval: 'месяц',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 490,
    currency: 'RUB',
    features: ['Безлимитные проекты', 'Расширенная аналитика', 'Безлимитные клиенты', 'Экспорт в PDF/Excel', 'Напоминания', 'Поддержка'],
    interval: 'месяц',
  },
]

export default function ProfilePage() {
  const [currentPlan, setCurrentPlan] = useState<PaymentPlan | null>(plans[0])
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null)
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select')
  const [isLoading, setIsLoading] = useState(false)

  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    company: '',
    phone: '',
  })

  // Load user data from API
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserData(prev => ({
            ...prev,
            name: data.user.name || '',
            email: data.user.email || '',
          }))
        }
      })
      .catch(console.error)
  }, [])

  const handlePayment = async (plan: PaymentPlan) => {
    if (plan.price === 0) return
    setSelectedPlan(plan)
    setIsPaymentDialogOpen(true)
    setPaymentStep('select')
  }

  const processYooKassaPayment = async () => {
    if (!selectedPlan) return
    setPaymentStep('processing')
    setIsLoading(true)

    console.log('Processing YooKassa payment:', {
      amount: selectedPlan.price,
      currency: selectedPlan.currency,
      description: `Оплата тарифа ${selectedPlan.name}`,
      shopId: YOOKASSA_CONFIG.shopId,
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    // Actually update subscription in database
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan.id })
      })
      
      if (res.ok) {
        setCurrentPlan(selectedPlan)
      }
    } catch (error) {
      console.error('Failed to update subscription:', error)
    }

    setPaymentStep('success')
    setIsLoading(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Профиль</h1>
        <p className="text-muted-foreground mt-1">Управление аккаунтом и подпиской</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle className="text-lg">Текущий тариф: {currentPlan?.name}</CardTitle>
              <CardDescription>
                {currentPlan?.price === 0 ? 'Бесплатный план' : `${currentPlan?.price} ₽/${currentPlan?.interval}`}
              </CardDescription>
            </div>
          </div>
          <Badge variant={currentPlan?.id !== 'free' ? 'default' : 'secondary'}>
            {currentPlan?.id === 'free' ? 'Бесплатный' : 'Активен'}
          </Badge>
        </CardHeader>
        {currentPlan?.id !== 'pro' && (
          <CardContent>
            <Button 
              variant={currentPlan?.id === 'free' ? 'default' : 'outline'}
              onClick={() => {
                handlePayment(plans[1]!)
              }}
            >
              {currentPlan?.id === 'free' ? 'Перейти на Pro' : 'Перейти на Pro'}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={currentPlan?.id === plan.id ? 'border-primary' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {currentPlan?.id === plan.id && (
                  <Badge variant="secondary">Текущий</Badge>
                )}
              </div>
              <div className="text-3xl font-bold mt-2">
                {plan.price === 0 ? '0' : plan.price} ₽
                <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <Check className="h-4 w-4 mr-2 text-green-500 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              {currentPlan?.id !== plan.id && (
                <Button 
                  variant={plan.id === 'pro' ? 'default' : 'outline'} 
                  className="w-full"
                  onClick={() => handlePayment(plan)}
                  disabled={plan.price === 0}
                >
                  {plan.price === 0 ? 'Текущий' : 'Выбрать'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* User Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Информация о пользователе</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input 
                id="name" 
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Компания</Label>
              <Input 
                id="company" 
                value={userData.company}
                onChange={(e) => setUserData({...userData, company: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input 
                id="phone" 
                value={userData.phone}
                onChange={(e) => setUserData({...userData, phone: e.target.value})}
              />
            </div>
          </div>
          <Button className="mt-4">Сохранить изменения</Button>
        </CardContent>
      </Card>

      {/* YooKassa Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {paymentStep === 'select' && `Оплата тарифа ${selectedPlan?.name}`}
              {paymentStep === 'processing' && 'Обработка платежа...'}
              {paymentStep === 'success' && 'Платёж успешен!'}
            </DialogTitle>
            <DialogDescription>
              {paymentStep === 'select' && 'Демо-режим ЮKassa'}
              {paymentStep === 'processing' && 'Пожалуйста, подождите'}
              {paymentStep === 'success' && 'Ваш тариф активирован'}
            </DialogDescription>
          </DialogHeader>

          {paymentStep === 'select' && selectedPlan && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Тариф:</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-muted-foreground">К оплате:</span>
                  <span className="text-2xl font-bold">{selectedPlan.price} ₽</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Оплата через ЮKassa</span>
                </div>
                
                <div className="space-y-2">
                  <Label>Номер карты</Label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Срок действия</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input placeholder="123" />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 border rounded-lg">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium">Демо-режим</p>
                    <p>Это тестовый платёж. Деньги не списываются.</p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={processYooKassaPayment}
                disabled={isLoading}
              >
                {isLoading ? 'Обработка...' : `Оплатить ${selectedPlan.price} ₽`}
              </Button>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Имитация оплаты...</p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="flex flex-col items-center py-8">
              <div className="h-16 w-16 rounded-full flex items-center justify-center mb-4 border-2 border-green-500">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Оплата прошла!</h3>
              <p className="text-muted-foreground text-center mb-6">
                Тариф {selectedPlan?.name} активирован
              </p>
              <Button onClick={() => setIsPaymentDialogOpen(false)}>
                Вернуться в профиль
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
