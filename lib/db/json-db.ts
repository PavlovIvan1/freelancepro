// PostgreSQL Database Layer - Simple version for Neon
import { eq, sql } from 'drizzle-orm'
import { db, schema } from './neon'

// Helper to convert any date-like to ISO string
function toISO(value: any): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

// ==================== USER OPERATIONS ====================

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  subscriptionId: string | null;
  subscriptionPlan: string;
  subscriptionExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function createUser(user: User): Promise<User> {
  const [created] = await db.insert(schema.users).values({
    id: user.id,
    email: user.email,
    password: user.password,
    name: user.name,
    subscriptionId: user.subscriptionId,
    subscriptionPlan: user.subscriptionPlan || 'free',
    subscriptionExpiresAt: user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  }).returning()
  
  return {
    ...created,
    subscriptionId: created.subscriptionId || null,
    subscriptionPlan: created.subscriptionPlan || 'free',
    subscriptionExpiresAt: toISO(created.subscriptionExpiresAt),
    createdAt: toISO(created.createdAt),
    updatedAt: toISO(created.updatedAt),
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email))
  if (!user) return undefined
  return {
    ...user,
    subscriptionId: user.subscriptionId || null,
    subscriptionPlan: user.subscriptionPlan || 'free',
    subscriptionExpiresAt: toISO(user.subscriptionExpiresAt),
    createdAt: toISO(user.createdAt),
    updatedAt: toISO(user.updatedAt),
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id))
  if (!user) return undefined
  return {
    ...user,
    subscriptionId: user.subscriptionId || null,
    subscriptionPlan: user.subscriptionPlan || 'free',
    subscriptionExpiresAt: toISO(user.subscriptionExpiresAt),
    createdAt: toISO(user.createdAt),
    updatedAt: toISO(user.updatedAt),
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  const updateData: any = { ...updates }
  if (updates.subscriptionExpiresAt) {
    updateData.subscriptionExpiresAt = new Date(updates.subscriptionExpiresAt)
  }
  updateData.updatedAt = new Date()
  
  const [updated] = await db
    .update(schema.users)
    .set(updateData)
    .where(eq(schema.users.id, id))
    .returning()
  
  if (!updated) return undefined
  return {
    ...updated,
    subscriptionId: updated.subscriptionId || null,
    subscriptionPlan: updated.subscriptionPlan || 'free',
    subscriptionExpiresAt: toISO(updated.subscriptionExpiresAt),
    createdAt: toISO(updated.createdAt),
    updatedAt: toISO(updated.updatedAt),
  }
}

// ==================== SUBSCRIPTION OPERATIONS ====================

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export async function createSubscription(subscription: Subscription): Promise<Subscription> {
  const [created] = await db.insert(schema.subscriptions).values({
    id: subscription.id,
    userId: subscription.userId,
    planId: subscription.planId,
    status: subscription.status || 'active',
    startDate: new Date(subscription.startDate),
    endDate: subscription.endDate ? new Date(subscription.endDate) : null,
    createdAt: new Date(subscription.createdAt),
  }).returning()
  
  return {
    ...created,
    startDate: toISO(created.startDate),
    endDate: toISO(created.endDate),
    createdAt: toISO(created.createdAt),
  }
}

export async function getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
  const [sub] = await db.select().from(schema.subscriptions).where(eq(schema.subscriptions.userId, userId))
  if (!sub) return undefined
  return {
    ...sub,
    startDate: toISO(sub.startDate),
    endDate: toISO(sub.endDate),
    createdAt: toISO(sub.createdAt),
  }
}

// ==================== CLIENT OPERATIONS ====================

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export async function createClient(client: Client): Promise<Client> {
  const [created] = await db.insert(schema.clients).values({
    id: client.id,
    userId: client.userId,
    name: client.name,
    email: client.email || '',
    phone: client.phone || '',
    company: client.company || '',
    notes: client.notes || '',
    createdAt: new Date(client.createdAt),
    updatedAt: new Date(client.updatedAt),
  }).returning()
  
  return {
    ...created,
    createdAt: toISO(created.createdAt),
    updatedAt: toISO(created.updatedAt),
  }
}

export async function getClientsByUserId(userId: string): Promise<Client[]> {
  const clients = await db.select().from(schema.clients).where(eq(schema.clients.userId, userId))
  return clients.map(c => ({
    ...c,
    createdAt: toISO(c.createdAt),
    updatedAt: toISO(c.updatedAt),
  }))
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const [client] = await db.select().from(schema.clients).where(eq(schema.clients.id, id))
  if (!client) return undefined
  return {
    ...client,
    createdAt: toISO(client.createdAt),
    updatedAt: toISO(client.updatedAt),
  }
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
  const [updated] = await db
    .update(schema.clients)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(schema.clients.id, id))
    .returning()
  
  if (!updated) return undefined
  return {
    ...updated,
    createdAt: toISO(updated.createdAt),
    updatedAt: toISO(updated.updatedAt),
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  await db.delete(schema.clients).where(eq(schema.clients.id, id))
  return true
}

// ==================== PROJECT OPERATIONS ====================

export interface Project {
  id: string;
  userId: string;
  clientId: string | null;
  name: string;
  description: string;
  status: string;
  budget: number;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function createProject(project: Project): Promise<Project> {
  const [created] = await db.insert(schema.projects).values({
    id: project.id,
    userId: project.userId,
    clientId: project.clientId,
    name: project.name,
    description: project.description || '',
    status: project.status || 'active',
    budget: String(project.budget || 0),
    deadline: project.deadline ? new Date(project.deadline) : null,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
  }).returning()
  
  return {
    ...created,
    budget: Number(created.budget) || 0,
    deadline: toISO(created.deadline),
    createdAt: toISO(created.createdAt),
    updatedAt: toISO(created.updatedAt),
  }
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  const projects = await db.select().from(schema.projects).where(eq(schema.projects.userId, userId))
  return projects.map(p => ({
    ...p,
    budget: Number(p.budget) || 0,
    deadline: toISO(p.deadline),
    createdAt: toISO(p.createdAt),
    updatedAt: toISO(p.updatedAt),
  }))
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, id))
  if (!project) return undefined
  return {
    ...project,
    budget: Number(project.budget) || 0,
    deadline: toISO(project.deadline),
    createdAt: toISO(project.createdAt),
    updatedAt: toISO(project.updatedAt),
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
  const updateData: any = { ...updates }
  if (updates.budget) updateData.budget = String(updates.budget)
  if (updates.deadline) updateData.deadline = new Date(updates.deadline)
  updateData.updatedAt = new Date()
  
  const [updated] = await db
    .update(schema.projects)
    .set(updateData)
    .where(eq(schema.projects.id, id))
    .returning()
  
  if (!updated) return undefined
  return {
    ...updated,
    budget: Number(updated.budget) || 0,
    deadline: toISO(updated.deadline),
    createdAt: toISO(updated.createdAt),
    updatedAt: toISO(updated.updatedAt),
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  await db.delete(schema.tasks).where(eq(schema.tasks.projectId, id))
  await db.delete(schema.projects).where(eq(schema.projects.id, id))
  return true
}

// ==================== TASK OPERATIONS ====================

export interface Task {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function createTask(task: Task): Promise<Task> {
  const [created] = await db.insert(schema.tasks).values({
    id: task.id,
    userId: task.userId,
    projectId: task.projectId,
    title: task.title,
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority || 'medium',
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  }).returning()
  
  return {
    ...created,
    dueDate: toISO(created.dueDate),
    createdAt: toISO(created.createdAt),
    updatedAt: toISO(created.updatedAt),
  }
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  const tasks = await db.select().from(schema.tasks).where(eq(schema.tasks.projectId, projectId))
  return tasks.map(t => ({
    ...t,
    dueDate: toISO(t.dueDate),
    createdAt: toISO(t.createdAt),
    updatedAt: toISO(t.updatedAt),
  }))
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id))
  if (!task) return undefined
  return {
    ...task,
    dueDate: toISO(task.dueDate),
    createdAt: toISO(task.createdAt),
    updatedAt: toISO(task.updatedAt),
  }
}

export async function getTasksByUserId(userId: string): Promise<Task[]> {
  const tasks = await db.select().from(schema.tasks).where(eq(schema.tasks.userId, userId))
  return tasks.map(t => ({
    ...t,
    dueDate: toISO(t.dueDate),
    createdAt: toISO(t.createdAt),
    updatedAt: toISO(t.updatedAt),
  }))
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
  const updateData: any = { ...updates }
  if (updates.dueDate) updateData.dueDate = new Date(updates.dueDate)
  updateData.updatedAt = new Date()
  
  const [updated] = await db
    .update(schema.tasks)
    .set(updateData)
    .where(eq(schema.tasks.id, id))
    .returning()
  
  if (!updated) return undefined
  return {
    ...updated,
    dueDate: toISO(updated.dueDate),
    createdAt: toISO(updated.createdAt),
    updatedAt: toISO(updated.updatedAt),
  }
}

export async function deleteTask(id: string): Promise<boolean> {
  await db.delete(schema.tasks).where(eq(schema.tasks.id, id))
  return true
}

// ==================== PAYMENT PLAN OPERATIONS ====================

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string;
  isActive: boolean;
  sortOrder: number;
}

export async function getPaymentPlans(): Promise<PaymentPlan[]> {
  const plans = await db.select().from(schema.paymentPlans).where(eq(schema.paymentPlans.isActive, true))
  return plans.map(p => ({
    ...p,
    price: Number(p.price) || 0,
    isActive: Boolean(p.isActive),
  }))
}

export async function createPaymentPlan(plan: PaymentPlan): Promise<PaymentPlan> {
  const [created] = await db.insert(schema.paymentPlans).values({
    id: plan.id,
    name: plan.name,
    price: String(plan.price),
    interval: plan.interval || 'month',
    features: plan.features,
    isActive: plan.isActive !== false,
    sortOrder: plan.sortOrder || 1,
  }).returning()
  
  return {
    ...created,
    price: Number(created.price) || 0,
    isActive: Boolean(created.isActive),
  }
}

export async function seedPaymentPlans(): Promise<void> {
  try {
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM payment_plans`)
    const count = result[0]?.rows?.[0]?.count || 0
    
    if (Number(count) > 0) {
      return
    }

    await db.execute(sql`
      INSERT INTO payment_plans (id, name, price, interval, features, is_active, sort_order) VALUES
      ('free', 'Free', 0, 'month', '["До 5 проектов", "До 10 задач", "Базовая аналитика"]', true, 1),
      ('pro', 'Pro', 490, 'month', '["Безлимитные проекты", "Безлимитные задачи", "Расширенная аналитика", "Экспорт данных"]', true, 2),
      ('business', 'Business', 1490, 'month', '["Всё из Pro", "Приоритетная поддержка", "Интеграции с API", "Белый лейбл"]', true, 3)
    `)
  } catch (e) {
    console.log('Seed payment plans error (may already exist):', e)
  }
}

// ==================== PAYMENT OPERATIONS ====================

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string | null;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  externalId: string | null;
  createdAt: string;
}

export async function createPayment(payment: Payment): Promise<Payment> {
  const [created] = await db.insert(schema.payments).values({
    id: payment.id,
    userId: payment.userId,
    subscriptionId: payment.subscriptionId,
    amount: String(payment.amount),
    currency: payment.currency || 'RUB',
    status: payment.status || 'pending',
    paymentMethod: payment.paymentMethod || 'bank_card',
    externalId: payment.externalId,
    createdAt: new Date(payment.createdAt),
  }).returning()
  
  return {
    ...created,
    amount: Number(created.amount) || 0,
    createdAt: toISO(created.createdAt),
  }
}

export async function getPaymentsByUserId(userId: string): Promise<Payment[]> {
  const payments = await db.select().from(schema.payments).where(eq(schema.payments.userId, userId))
  return payments.map(p => ({
    ...p,
    amount: Number(p.amount) || 0,
    createdAt: toISO(p.createdAt),
  }))
}

// ==================== MONTHLY EARNINGS ====================

export interface MonthlyEarning {
  id: string;
  userId: string;
  month: string;
  year: number;
  amount: number;
  createdAt: string;
}

export async function createMonthlyEarning(earning: MonthlyEarning): Promise<MonthlyEarning> {
  const [created] = await db.insert(schema.monthlyEarnings).values({
    id: earning.id,
    userId: earning.userId,
    month: earning.month,
    year: earning.year,
    amount: String(earning.amount),
    createdAt: new Date(earning.createdAt),
  }).returning()
  
  return {
    ...created,
    amount: Number(created.amount) || 0,
    createdAt: toISO(created.createdAt),
  }
}

export async function getMonthlyEarningsByUserId(userId: string): Promise<MonthlyEarning[]> {
  const earnings = await db.select().from(schema.monthlyEarnings).where(eq(schema.monthlyEarnings.userId, userId))
  return earnings.map(e => ({
    ...e,
    amount: Number(e.amount) || 0,
    createdAt: toISO(e.createdAt),
  }))
}

export async function updateMonthlyEarning(userId: string, month: string, year: number, amount: number): Promise<MonthlyEarning> {
  const existing = await db.select().from(schema.monthlyEarnings).where(
    eq(schema.monthlyEarnings.userId, userId)
  )
  
  const existingFiltered = existing.filter(e => e.month === month && e.year === year)
  
  if (existingFiltered.length > 0) {
    const [updated] = await db
      .update(schema.monthlyEarnings)
      .set({ amount: String(amount) })
      .where(eq(schema.monthlyEarnings.id, existingFiltered[0].id))
      .returning()
    
    return {
      ...updated,
      amount: Number(updated.amount) || 0,
      createdAt: toISO(updated.createdAt),
    }
  }
  
  return createMonthlyEarning({
    id: crypto.randomUUID(),
    userId,
    month,
    year,
    amount,
    createdAt: new Date().toISOString()
  })
}

// ==================== INITIALIZATION ====================

export async function loadDatabase(): Promise<any> {
  return {}
}

export async function saveDatabase(): Promise<void> {
  // No-op for PostgreSQL
}
