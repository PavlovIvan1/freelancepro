// Database types

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'
export type Priority = 'low' | 'medium' | 'high'
export type ProjectStatus = 'active' | 'completed' | 'paused' | 'cancelled'

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  createdAt: string
}

export interface Project {
  id: string
  userId: string
  name: string
  clientId: string
  budget: number
  currency: string
  status: ProjectStatus
  description?: string
  startDate: string
  endDate?: string
  notes: string
  earnedAmount: number
  category?: string
}

export interface Client {
  id: string
  userId: string
  name: string
  email?: string
  company?: string
}

export interface MonthlyEarning {
  id: string
  month: string
  amount: number
}

// User types
export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  role: UserRole
  planId: string
  planExpiresAt: string | null
  createdAt: string
  updatedAt: string
}

// Subscription types
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial'

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  startedAt: string
  expiresAt: string | null
  autoRenew: boolean
}

// Payment types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'card' | 'bank_transfer' | 'crypto' | 'paypal'

export interface Payment {
  id: string
  userId: string
  projectId?: string
  amount: number
  currency: string
  status: PaymentStatus
  method: PaymentMethod
  description?: string
  yookassaPaymentId?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentPlan {
  id: string
  name: string
  price: number
  currency: string
  features: string[]
  interval: 'monthly' | 'yearly' | 'one-time'
  isActive: boolean
}
