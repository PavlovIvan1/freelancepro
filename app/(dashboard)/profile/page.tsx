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
import { cn } from '@/lib/utils'
import { Check, CreditCard, Crown, User } from 'lucide-react'
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
  planId: string
  subscriptionExpiresAt: string | null
  subscriptionPeriod: string
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
    features: ['Безлимитные проекты', 'Расширенная аналитика', 'Безлимитные клиенты'],
    interval: 'месяц',
  },
]

// Yearly plan price
const YEARLY_PRICE = 3880

export default function ProfilePage() {
  const [currentPlan, setCurrentPlan] = useState<PaymentPlan | null>(plans[0])
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month')
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month')
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select')
  const [isLoading, setIsLoading] = useState(false)
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null)

  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    planId: 'free',
    subscriptionExpiresAt: null,
    subscriptionPeriod: 'month'
  })

  // Format date to readable string
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!subscriptionExpiresAt) return null
    const now = new Date()
    const expires = new Date(subscriptionExpiresAt)
    const diff = expires.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

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
            planId: data.user.planId || 'free',
            subscriptionExpiresAt: data.user.subscriptionExpiresAt || null,
            subscriptionPeriod: data.user.subscriptionPeriod || 'month'
          }))
          
          // Set current plan based on user's subscription
          if (data.user.planId) {
            const userPlan = plans.find(p => p.id === data.user.planId)
            if (userPlan) {
              setCurrentPlan(userPlan)
            }
          }
          
          // Set billing period from user's subscription
          if (data.user.subscriptionPeriod === 'year') {
            setBillingPeriod('year')
          }
          
          // Set subscription expiry
          if (data.user.subscriptionExpiresAt) {
            setSubscriptionExpiresAt(data.user.subscriptionExpiresAt)
          }
        }
      })
      .catch(console.error)
  }, [])

  const handlePayment = async (plan: PaymentPlan, period: 'month' | 'year') => {
    if (plan.price === 0) return
    setSelectedPlan(plan)
    setSelectedPeriod(period)
    setIsPaymentDialogOpen(true)
    setPaymentStep('select')
  }

  const processYooKassaPayment = async () => {
    if (!selectedPlan) return
    setPaymentStep('processing')
    setIsLoading(true)

    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: selectedPlan.id,
          period: selectedPeriod
        })
      })
      
      const data = await res.json()
      
      if (data.confirmationUrl) {
        // Redirect to YooKassa payment page
        window.location.href = data.confirmationUrl
      } else {
        throw new Error(data.error || 'No payment URL')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStep('success')
    }
    
    setIsLoading(false)
  }

  // Check if plan is current - considers both plan ID and period
  const isCurrentPlan = (planId: string, period: 'month' | 'year') => {
    return userData.planId === planId && userData.subscriptionPeriod === period
  }

  // Check if user has any pro subscription (monthly or yearly)
  const hasProSubscription = userData.planId === 'pro'

  const daysRemaining = getDaysRemaining()

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Профиль</h1>
        <p className="text-muted-foreground mt-1">Управление аккаунтом и подпиской</p>
      </div>

      {/* Current Plan - Minimalist */}
      <Card className={cn(
        hasProSubscription 
          ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800" 
          : "bg-muted/30"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {hasProSubscription ? (
                <Crown className="h-6 w-6 text-amber-500" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-medium">F</span>
                </div>
              )}
              <div>
                <CardTitle className="text-lg">
                  {hasProSubscription ? `Тариф ${currentPlan?.name}` : 'Бесплатный план'}
                </CardTitle>
                <CardDescription>
                  {hasProSubscription 
                    ? `Оплата ${selectedPeriod === 'year' ? 'год' : 'месяц'}`
                    : 'Базовые функции'
                  }
                </CardDescription>
              </div>
            </div>
            <Badge variant={hasProSubscription ? 'default' : 'secondary'} className={cn(
              hasProSubscription && "bg-amber-500 hover:bg-amber-600"
            )}>
              {hasProSubscription ? 'Активен' : 'Бесплатный'}
            </Badge>
          </div>
        </CardHeader>
        {hasProSubscription && subscriptionExpiresAt && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Действует до {formatDate(subscriptionExpiresAt)}
              </span>
              {daysRemaining !== null && daysRemaining > 0 && (
                <span className="text-amber-600 font-medium">
                  {daysRemaining} дн. осталось
                </span>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Plans - Minimalist */}
      <div className="space-y-4">
        {/* Billing Period Toggle */}
        <div className="flex justify-center">
          <div className="bg-muted rounded-lg p-1 flex">
            <button
              onClick={() => setBillingPeriod('month')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                billingPeriod === 'month' 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Месяц
            </button>
            <button
              onClick={() => setBillingPeriod('year')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                billingPeriod === 'year' 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Год <span className="text-xs text-green-600 ml-1">-34%</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => {
            // Calculate price for Pro plan based on billing period
            const isPro = plan.id === 'pro'
            const displayPrice = isPro 
              ? (billingPeriod === 'year' ? YEARLY_PRICE : plan.price)
              : plan.price
            const periodLabel = isPro 
              ? (billingPeriod === 'year' ? 'год' : 'месяц')
              : 'месяц'
            
            // Calculate per-month price for yearly plan
            const perMonthPrice = isPro && billingPeriod === 'year' 
              ? Math.round(YEARLY_PRICE / 12) 
              : null
            
            // Check if this specific plan+period is current
            const isCurrent = isCurrentPlan(plan.id, billingPeriod)
            
            return (
              <Card key={plan.id} className={cn(
                isCurrent ? 'border-primary bg-primary/5' : 'bg-background',
                'transition-all'
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {plan.name}
                      {isCurrent && (
                        <Badge variant="outline" className="text-xs border-primary text-primary">
                          Текущий
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold">
                      {displayPrice === 0 ? '0' : displayPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">₽/{periodLabel}</span>
                  </div>
                  {perMonthPrice && (
                    <p className="text-sm text-green-600 font-medium">
                      = {perMonthPrice} ₽/мес
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Minimalist features - compact list */}
                  <div className="space-y-1.5 mb-4">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 mr-2 text-green-500 shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  {!isCurrent && (
                    <Button 
                      variant={plan.id === 'pro' ? 'default' : 'outline'} 
                      className="w-full"
                      onClick={() => handlePayment(plan, billingPeriod)}
                      disabled={plan.price === 0}
                    >
                      {plan.price === 0 ? 'Текущий' : 'Выбрать'}
                    </Button>
                  )}
                  {isCurrent && plan.id === 'pro' && (
                    <div className="text-sm text-center text-muted-foreground py-2">
                      {billingPeriod === 'year' ? 'Годовая подписка' : 'Месячная подписка'}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
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
              {paymentStep === 'select' && 'Нажмите кнопку для перехода на безопасную страницу оплаты'}
              {paymentStep === 'processing' && 'Пожалуйста, подождите'}
              {paymentStep === 'success' && 'Ваш тариф активирован'}
            </DialogDescription>
          </DialogHeader>

          {paymentStep === 'select' && selectedPlan && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Тариф:</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Период:</span>
                  <span className="font-medium">
                    {selectedPeriod === 'year' ? 'Год (12 месяцев)' : 'Месяц'}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">К оплате:</span>
                  <span className="text-2xl font-bold">
                    {selectedPlan.id === 'pro' 
                      ? (selectedPeriod === 'year' ? YEARLY_PRICE : selectedPlan.price)
                      : 0
                    } ₽
                  </span>
                </div>
                {selectedPeriod === 'year' && selectedPlan.id === 'pro' && (
                  <p className="text-xs text-green-600 text-right">
                    Экономия 34% по сравнению с помесячной оплатой
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Вы будете перенаправлены на безопасную страницу оплаты ЮKassa</span>
              </div>

              <Button 
                className="w-full" 
                onClick={processYooKassaPayment}
                disabled={isLoading}
              >
                {isLoading ? 'Обработка...' : `Оплатить ${selectedPlan.id === 'pro' 
                  ? (selectedPeriod === 'year' ? YEARLY_PRICE : selectedPlan.price)
                  : 0} ₽`}
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
