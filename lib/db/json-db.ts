// PostgreSQL Database Layer
// This file provides the same interface as the JSON database but uses PostgreSQL via Drizzle ORM

import * as db from './db'
import { initializeDatabase } from './db'

// Types - matching the original JSON interface
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

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

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

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string | null;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  externalId: string | null;
  createdAt: string;
}

export interface MonthlyEarning {
  id: string;
  userId: string;
  month: string;
  year: number;
  amount: number;
  createdAt: string;
}

// ==================== USER OPERATIONS ====================

export async function createUser(user: User): Promise<User> {
  const created = await db.createUser(user)
  return {
    ...created,
    subscriptionId: created.subscriptionId || null,
    subscriptionPlan: created.subscriptionPlan || 'free',
    subscriptionExpiresAt: created.subscriptionExpiresAt?.toISOString() || null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString()
  } as User
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const user = await db.getUserByEmail(email)
  if (!user) return undefined
  return {
    ...user,
    subscriptionId: user.subscriptionId || null,
    subscriptionPlan: user.subscriptionPlan || 'free',
    subscriptionExpiresAt: user.subscriptionExpiresAt?.toISOString() || null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  } as User
}

export async function getUserById(id: string): Promise<User | undefined> {
  const user = await db.getUserById(id)
  if (!user) return undefined
  return {
    ...user,
    subscriptionId: user.subscriptionId || null,
    subscriptionPlan: user.subscriptionPlan || 'free',
    subscriptionExpiresAt: user.subscriptionExpiresAt?.toISOString() || null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  } as User
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  const updated = await db.updateUser(id, updates as any)
  if (!updated) return undefined
  return {
    ...updated,
    subscriptionId: updated.subscriptionId || null,
    subscriptionPlan: updated.subscriptionPlan || 'free',
    subscriptionExpiresAt: updated.subscriptionExpiresAt?.toISOString() || null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString()
  } as User
}

// ==================== SUBSCRIPTION OPERATIONS ====================

export async function createSubscription(subscription: Subscription): Promise<Subscription> {
  const created = await db.createSubscription(subscription as any)
  return {
    ...created,
    startDate: created.startDate.toISOString(),
    endDate: created.endDate?.toISOString() || null,
    createdAt: created.createdAt.toISOString()
  } as Subscription
}

export async function getSubscriptionById(id: string): Promise<Subscription | undefined> {
  const sub = await db.getSubscriptionById(id)
  if (!sub) return undefined
  return {
    ...sub,
    startDate: sub.startDate.toISOString(),
    endDate: sub.endDate?.toISOString() || null,
    createdAt: sub.createdAt.toISOString()
  } as Subscription
}

export async function getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
  const sub = await db.getSubscriptionByUserId(userId)
  if (!sub) return undefined
  return {
    ...sub,
    startDate: sub.startDate.toISOString(),
    endDate: sub.endDate?.toISOString() || null,
    createdAt: sub.createdAt.toISOString()
  } as Subscription
}

// ==================== CLIENT OPERATIONS ====================

export async function createClient(client: Client): Promise<Client> {
  const created = await db.createClient(client as any)
  return {
    ...created,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString()
  } as Client
}

export async function getClientsByUserId(userId: string): Promise<Client[]> {
  const clients = await db.getClientsByUserId(userId)
  return clients.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString()
  })) as Client[]
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const client = await db.getClientById(id)
  if (!client) return undefined
  return {
    ...client,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString()
  } as Client
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
  const updated = await db.updateClient(id, updates as any)
  if (!updated) return undefined
  return {
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString()
  } as Client
}

export async function deleteClient(id: string): Promise<boolean> {
  return db.deleteClient(id)
}

// ==================== PROJECT OPERATIONS ====================

export async function createProject(project: Project): Promise<Project> {
  const created = await db.createProject({
    ...project,
    budget: project.budget.toString()
  } as any)
  return {
    ...created,
    budget: Number(created.budget),
    deadline: created.deadline?.toISOString() || null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString()
  } as Project
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  const projects = await db.getProjectsByUserId(userId)
  return projects.map(p => ({
    ...p,
    budget: Number(p.budget),
    deadline: p.deadline?.toISOString() || null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString()
  })) as Project[]
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const project = await db.getProjectById(id)
  if (!project) return undefined
  return {
    ...project,
    budget: Number(project.budget),
    deadline: project.deadline?.toISOString() || null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  } as Project
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
  const updated = await db.updateProject(id, {
    ...updates,
    budget: updates.budget?.toString()
  } as any)
  if (!updated) return undefined
  return {
    ...updated,
    budget: Number(updated.budget),
    deadline: updated.deadline?.toISOString() || null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString()
  } as Project
}

export async function deleteProject(id: string): Promise<boolean> {
  return db.deleteProject(id)
}

// ==================== TASK OPERATIONS ====================

export async function createTask(task: Task): Promise<Task> {
  const created = await db.createTask(task as any)
  return {
    ...created,
    dueDate: created.dueDate?.toISOString() || null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString()
  } as Task
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  const tasks = await db.getTasksByProjectId(projectId)
  return tasks.map(t => ({
    ...t,
    dueDate: t.dueDate?.toISOString() || null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString()
  })) as Task[]
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const task = await db.getTaskById(id)
  if (!task) return undefined
  return {
    ...task,
    dueDate: task.dueDate?.toISOString() || null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  } as Task
}

export async function getTasksByUserId(userId: string): Promise<Task[]> {
  const tasks = await db.getTasksByUserId(userId)
  return tasks.map(t => ({
    ...t,
    dueDate: t.dueDate?.toISOString() || null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString()
  })) as Task[]
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
  const updated = await db.updateTask(id, updates as any)
  if (!updated) return undefined
  return {
    ...updated,
    dueDate: updated.dueDate?.toISOString() || null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString()
  } as Task
}

export async function deleteTask(id: string): Promise<boolean> {
  return db.deleteTask(id)
}

// ==================== PAYMENT PLAN OPERATIONS ====================

export async function getPaymentPlans(): Promise<PaymentPlan[]> {
  const plans = await db.getPaymentPlans()
  return plans.map(p => ({
    ...p,
    price: Number(p.price),
    isActive: Boolean(p.isActive)
  })) as PaymentPlan[]
}

export async function createPaymentPlan(plan: PaymentPlan): Promise<PaymentPlan> {
  const created = await db.createPaymentPlan({
    ...plan,
    price: plan.price.toString(),
    features: plan.features
  } as any)
  return {
    ...created,
    price: Number(created.price),
    isActive: Boolean(created.isActive)
  } as PaymentPlan
}

export async function seedPaymentPlans(): Promise<void> {
  return db.seedPaymentPlans()
}

// ==================== PAYMENT OPERATIONS ====================

export async function createPayment(payment: Payment): Promise<Payment> {
  const created = await db.createPayment({
    ...payment,
    amount: payment.amount.toString()
  } as any)
  return {
    ...created,
    amount: Number(created.amount),
    createdAt: created.createdAt.toISOString()
  } as Payment
}

export async function getPaymentsByUserId(userId: string): Promise<Payment[]> {
  const payments = await db.getPaymentsByUserId(userId)
  return payments.map(p => ({
    ...p,
    amount: Number(p.amount),
    createdAt: p.createdAt.toISOString()
  })) as Payment[]
}

// ==================== MONTHLY EARNINGS OPERATIONS ====================

export async function createMonthlyEarning(earning: MonthlyEarning): Promise<MonthlyEarning> {
  const created = await db.createMonthlyEarning({
    ...earning,
    amount: earning.amount.toString()
  } as any)
  return {
    ...created,
    amount: Number(created.amount),
    createdAt: created.createdAt.toISOString()
  } as MonthlyEarning
}

export async function getMonthlyEarningsByUserId(userId: string): Promise<MonthlyEarning[]> {
  const earnings = await db.getMonthlyEarningsByUserId(userId)
  return earnings.map(e => ({
    ...e,
    amount: Number(e.amount),
    createdAt: e.createdAt.toISOString()
  })) as MonthlyEarning[]
}

export async function updateMonthlyEarning(userId: string, month: string, year: number, amount: number): Promise<MonthlyEarning> {
  const updated = await db.updateMonthlyEarning(userId, month, year, amount)
  return {
    ...updated,
    amount: Number(updated.amount),
    createdAt: updated.createdAt.toISOString()
  } as MonthlyEarning
}

// ==================== DATABASE INITIALIZATION ====================

export async function loadDatabase(): Promise<any> {
  // Test connection to PostgreSQL
  await initializeDatabase()
  return {}
}

export async function saveDatabase(): Promise<void> {
  // For PostgreSQL, data is saved automatically after each operation
}

// Initialize database on module load
loadDatabase()
