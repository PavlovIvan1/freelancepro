import { and, eq } from 'drizzle-orm'
import { db, schema } from './neon'

// Types
type User = typeof schema.users.$inferSelect
type NewUser = typeof schema.users.$inferInsert
type Subscription = typeof schema.subscriptions.$inferSelect
type NewSubscription = typeof schema.subscriptions.$inferInsert
type Client = typeof schema.clients.$inferSelect
type NewClient = typeof schema.clients.$inferInsert
type Project = typeof schema.projects.$inferSelect
type NewProject = typeof schema.projects.$inferInsert
type Task = typeof schema.tasks.$inferSelect
type NewTask = typeof schema.tasks.$inferInsert
type PaymentPlan = typeof schema.paymentPlans.$inferSelect
type NewPaymentPlan = typeof schema.paymentPlans.$inferInsert
type Payment = typeof schema.payments.$inferSelect
type NewPayment = typeof schema.payments.$inferInsert
type MonthlyEarning = typeof schema.monthlyEarnings.$inferSelect
type NewMonthlyEarning = typeof schema.monthlyEarnings.$inferInsert

// ==================== USER OPERATIONS ====================

export async function createUser(user: NewUser): Promise<User> {
  const [created] = await db.insert(schema.users).values(user).returning()
  return created
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email))
  return user
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id))
  return user
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  const [updated] = await db
    .update(schema.users)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(schema.users.id, id))
    .returning()
  return updated
}

// ==================== SUBSCRIPTION OPERATIONS ====================

export async function createSubscription(subscription: NewSubscription): Promise<Subscription> {
  const [created] = await db.insert(schema.subscriptions).values(subscription).returning()
  return created
}

export async function getSubscriptionById(id: string): Promise<Subscription | undefined> {
  const [subscription] = await db.select().from(schema.subscriptions).where(eq(schema.subscriptions.id, id))
  return subscription
}

export async function getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
  const [subscription] = await db.select().from(schema.subscriptions).where(eq(schema.subscriptions.userId, userId))
  return subscription
}

// ==================== CLIENT OPERATIONS ====================

export async function createClient(client: NewClient): Promise<Client> {
  const [created] = await db.insert(schema.clients).values(client).returning()
  return created
}

export async function getClientsByUserId(userId: string): Promise<Client[]> {
  return db.select().from(schema.clients).where(eq(schema.clients.userId, userId))
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const [client] = await db.select().from(schema.clients).where(eq(schema.clients.id, id))
  return client
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
  const [updated] = await db
    .update(schema.clients)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(schema.clients.id, id))
    .returning()
  return updated
}

export async function deleteClient(id: string): Promise<boolean> {
  const result = await db.delete(schema.clients).where(eq(schema.clients.id, id))
  return true
}

// ==================== PROJECT OPERATIONS ====================

export async function createProject(project: NewProject): Promise<Project> {
  const [created] = await db.insert(schema.projects).values(project).returning()
  return created
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  return db.select().from(schema.projects).where(eq(schema.projects.userId, userId))
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, id))
  return project
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
  const [updated] = await db
    .update(schema.projects)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(schema.projects.id, id))
    .returning()
  return updated
}

export async function deleteProject(id: string): Promise<boolean> {
  // Delete related tasks first
  await db.delete(schema.tasks).where(eq(schema.tasks.projectId, id))
  // Delete project
  await db.delete(schema.projects).where(eq(schema.projects.id, id))
  return true
}

// ==================== TASK OPERATIONS ====================

export async function createTask(task: NewTask): Promise<Task> {
  const [created] = await db.insert(schema.tasks).values(task).returning()
  return created
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  return db.select().from(schema.tasks).where(eq(schema.tasks.projectId, projectId))
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id))
  return task
}

export async function getTasksByUserId(userId: string): Promise<Task[]> {
  return db.select().from(schema.tasks).where(eq(schema.tasks.userId, userId))
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
  const [updated] = await db
    .update(schema.tasks)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(schema.tasks.id, id))
    .returning()
  return updated
}

export async function deleteTask(id: string): Promise<boolean> {
  await db.delete(schema.tasks).where(eq(schema.tasks.id, id))
  return true
}

// ==================== PAYMENT PLAN OPERATIONS ====================

export async function getPaymentPlans(): Promise<PaymentPlan[]> {
  return db.select().from(schema.paymentPlans).where(eq(schema.paymentPlans.isActive, true)).orderBy(schema.paymentPlans.sortOrder)
}

export async function createPaymentPlan(plan: NewPaymentPlan): Promise<PaymentPlan> {
  const [created] = await db.insert(schema.paymentPlans).values(plan).returning()
  return created
}

export async function seedPaymentPlans(): Promise<void> {
  const existingPlans = await db.select().from(schema.paymentPlans)
  
  if (existingPlans.length === 0) {
    await db.insert(schema.paymentPlans).values([
      {
        id: 'free',
        name: 'Free',
        price: '0',
        interval: 'month',
        features: JSON.stringify(['До 5 проектов', 'До 10 задач', 'Базовая аналитика']),
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'pro',
        name: 'Pro',
        price: '490',
        interval: 'month',
        features: JSON.stringify(['Безлимитные проекты', 'Безлимитные задачи', 'Расширенная аналитика', 'Экспорт данных']),
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'business',
        name: 'Business',
        price: '1490',
        interval: 'month',
        features: JSON.stringify(['Всё из Pro', 'Приоритетная поддержка', 'Интеграции с API', 'Белый лейбл']),
        isActive: true,
        sortOrder: 3
      }
    ])
  }
}

// ==================== PAYMENT OPERATIONS ====================

export async function createPayment(payment: NewPayment): Promise<Payment> {
  const [created] = await db.insert(schema.payments).values(payment).returning()
  return created
}

export async function getPaymentsByUserId(userId: string): Promise<Payment[]> {
  return db.select().from(schema.payments).where(eq(schema.payments.userId, userId))
}

// ==================== MONTHLY EARNINGS OPERATIONS ====================

export async function createMonthlyEarning(earning: NewMonthlyEarning): Promise<MonthlyEarning> {
  const [created] = await db.insert(schema.monthlyEarnings).values(earning).returning()
  return created
}

export async function getMonthlyEarningsByUserId(userId: string): Promise<MonthlyEarning[]> {
  return db.select().from(schema.monthlyEarnings).where(eq(schema.monthlyEarnings.userId, userId))
}

export async function updateMonthlyEarning(
  userId: string, 
  month: string, 
  year: number, 
  amount: number
): Promise<MonthlyEarning> {
  const existing = await db
    .select()
    .from(schema.monthlyEarnings)
    .where(and(
      eq(schema.monthlyEarnings.userId, userId),
      eq(schema.monthlyEarnings.month, month),
      eq(schema.monthlyEarnings.year, year)
    ))
  
  if (existing.length > 0) {
    const [updated] = await db
      .update(schema.monthlyEarnings)
      .set({ amount: amount.toString() })
      .where(eq(schema.monthlyEarnings.id, existing[0].id))
      .returning()
    return updated
  }
  
  return createMonthlyEarning({
    id: crypto.randomUUID(),
    userId,
    month,
    year,
    amount: amount.toString(),
    createdAt: new Date()
  })
}

// ==================== DATABASE INITIALIZATION ====================

export async function initializeDatabase(): Promise<void> {
  // For Neon PostgreSQL, tables are created automatically via migrations
  // This function can be used for any additional setup if needed
  console.log('Database initialized (PostgreSQL Neon)')
}
