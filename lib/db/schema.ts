import { boolean, decimal, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

// Users table
export const users = pgTable('users', {
  id: varchar('id', { length: 20 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  subscriptionId: varchar('subscription_id', { length: 100 }),
  subscriptionPlan: varchar('subscription_plan', { length: 20 }).default('free'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: varchar('id', { length: 20 }).primaryKey(),
  userId: varchar('user_id', { length: 20 }).references(() => users.id).notNull(),
  planId: varchar('plan_id', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).default('active'),
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Clients table
export const clients = pgTable('clients', {
  id: varchar('id', { length: 20 }).primaryKey(),
  userId: varchar('user_id', { length: 20 }).references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Projects table
export const projects = pgTable('projects', {
  id: varchar('id', { length: 20 }).primaryKey(),
  userId: varchar('user_id', { length: 20 }).references(() => users.id).notNull(),
  clientId: varchar('client_id', { length: 20 }).references(() => clients.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('active'),
  budget: decimal('budget', { precision: 10, scale: 2 }).default('0'),
  deadline: timestamp('deadline'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tasks table
export const tasks = pgTable('tasks', {
  id: varchar('id', { length: 20 }).primaryKey(),
  userId: varchar('user_id', { length: 20 }).references(() => users.id).notNull(),
  projectId: varchar('project_id', { length: 20 }).references(() => projects.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('todo'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Payment Plans table
export const paymentPlans = pgTable('payment_plans', {
  id: varchar('id', { length: 20 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  interval: varchar('interval', { length: 20 }).default('month'),
  features: text('features'), // JSON string
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(1),
})

// Payments table
export const payments = pgTable('payments', {
  id: varchar('id', { length: 20 }).primaryKey(),
  userId: varchar('user_id', { length: 20 }).references(() => users.id).notNull(),
  subscriptionId: varchar('subscription_id', { length: 100 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('RUB'),
  status: varchar('status', { length: 20 }).default('pending'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  externalId: varchar('external_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Monthly Earnings table
export const monthlyEarnings = pgTable('monthly_earnings', {
  id: varchar('id', { length: 20 }).primaryKey(),
  userId: varchar('user_id', { length: 20 }).references(() => users.id).notNull(),
  month: varchar('month', { length: 2 }).notNull(),
  year: integer('year').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
export type PaymentPlan = typeof paymentPlans.$inferSelect
export type NewPaymentPlan = typeof paymentPlans.$inferInsert
export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
export type MonthlyEarning = typeof monthlyEarnings.$inferSelect
export type NewMonthlyEarning = typeof monthlyEarnings.$inferInsert
