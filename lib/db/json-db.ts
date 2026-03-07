import { promises as fs } from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data');

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

interface Database {
  users: User[];
  subscriptions: Subscription[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  paymentPlans: PaymentPlan[];
  payments: Payment[];
  monthlyEarnings: MonthlyEarning[];
}

let db: Database | null = null;

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DB_PATH, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

export async function loadDatabase(): Promise<Database> {
  if (db) return db;
  
  await ensureDataDir();
  
  const dbFile = path.join(DB_PATH, 'database.json');
  
  try {
    const data = await fs.readFile(dbFile, 'utf-8');
    db = JSON.parse(data);
  } catch (error) {
    // Create empty database if file doesn't exist
    db = {
      users: [],
      subscriptions: [],
      clients: [],
      projects: [],
      tasks: [],
      paymentPlans: [],
      payments: [],
      monthlyEarnings: []
    };
    await saveDatabase();
  }
  
  return db!;
}

export async function saveDatabase(): Promise<void> {
  if (!db) return;
  
  await ensureDataDir();
  
  const dbFile = path.join(DB_PATH, 'database.json');
  await fs.writeFile(dbFile, JSON.stringify(db, null, 2));
}

// User operations
export async function createUser(user: User): Promise<User> {
  const database = await loadDatabase();
  database.users.push(user);
  await saveDatabase();
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const database = await loadDatabase();
  return database.users.find(u => u.email === email);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const database = await loadDatabase();
  return database.users.find(u => u.id === id);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  const database = await loadDatabase();
  const index = database.users.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  
  database.users[index] = { ...database.users[index], ...updates, updatedAt: new Date().toISOString() };
  await saveDatabase();
  return database.users[index];
}

// Subscription operations
export async function createSubscription(subscription: Subscription): Promise<Subscription> {
  const database = await loadDatabase();
  database.subscriptions.push(subscription);
  await saveDatabase();
  return subscription;
}

export async function getSubscriptionById(id: string): Promise<Subscription | undefined> {
  const database = await loadDatabase();
  return database.subscriptions.find(s => s.id === id);
}

export async function getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
  const database = await loadDatabase();
  return database.subscriptions.find(s => s.userId === userId);
}

// Client operations
export async function createClient(client: Client): Promise<Client> {
  const database = await loadDatabase();
  database.clients.push(client);
  await saveDatabase();
  return client;
}

export async function getClientsByUserId(userId: string): Promise<Client[]> {
  const database = await loadDatabase();
  return database.clients.filter(c => c.userId === userId);
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const database = await loadDatabase();
  return database.clients.find(c => c.id === id);
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
  const database = await loadDatabase();
  const index = database.clients.findIndex(c => c.id === id);
  if (index === -1) return undefined;
  
  database.clients[index] = { ...database.clients[index], ...updates, updatedAt: new Date().toISOString() };
  await saveDatabase();
  return database.clients[index];
}

export async function deleteClient(id: string): Promise<boolean> {
  const database = await loadDatabase();
  const index = database.clients.findIndex(c => c.id === id);
  if (index === -1) return false;
  
  database.clients.splice(index, 1);
  await saveDatabase();
  return true;
}

// Project operations
export async function createProject(project: Project): Promise<Project> {
  const database = await loadDatabase();
  database.projects.push(project);
  await saveDatabase();
  return project;
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  const database = await loadDatabase();
  return database.projects.filter(p => p.userId === userId);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const database = await loadDatabase();
  return database.projects.find(p => p.id === id);
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
  const database = await loadDatabase();
  const index = database.projects.findIndex(p => p.id === id);
  if (index === -1) return undefined;
  
  database.projects[index] = { ...database.projects[index], ...updates, updatedAt: new Date().toISOString() };
  await saveDatabase();
  return database.projects[index];
}

export async function deleteProject(id: string): Promise<boolean> {
  const database = await loadDatabase();
  const index = database.projects.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  database.projects.splice(index, 1);
  // Also delete related tasks
  database.tasks = database.tasks.filter(t => t.projectId !== id);
  await saveDatabase();
  return true;
}

// Task operations
export async function createTask(task: Task): Promise<Task> {
  const database = await loadDatabase();
  database.tasks.push(task);
  await saveDatabase();
  return task;
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  const database = await loadDatabase();
  return database.tasks.filter(t => t.projectId === projectId);
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const database = await loadDatabase();
  return database.tasks.find(t => t.id === id);
}

export async function getTasksByUserId(userId: string): Promise<Task[]> {
  const database = await loadDatabase();
  return database.tasks.filter(t => t.userId === userId);
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
  const database = await loadDatabase();
  const index = database.tasks.findIndex(t => t.id === id);
  if (index === -1) return undefined;
  
  database.tasks[index] = { ...database.tasks[index], ...updates, updatedAt: new Date().toISOString() };
  await saveDatabase();
  return database.tasks[index];
}

export async function deleteTask(id: string): Promise<boolean> {
  const database = await loadDatabase();
  const index = database.tasks.findIndex(t => t.id === id);
  if (index === -1) return false;
  
  database.tasks.splice(index, 1);
  await saveDatabase();
  return true;
}

// Payment Plan operations
export async function getPaymentPlans(): Promise<PaymentPlan[]> {
  const database = await loadDatabase();
  return database.paymentPlans.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createPaymentPlan(plan: PaymentPlan): Promise<PaymentPlan> {
  const database = await loadDatabase();
  database.paymentPlans.push(plan);
  await saveDatabase();
  return plan;
}

export async function seedPaymentPlans(): Promise<void> {
  const database = await loadDatabase();
  
  if (database.paymentPlans.length === 0) {
    database.paymentPlans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: JSON.stringify(['До 5 проектов', 'До 10 задач', 'Базовая аналитика']),
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 490,
        interval: 'month',
        features: JSON.stringify(['Безлимитные проекты', 'Безлимитные задачи', 'Расширенная аналитика', 'Экспорт данных']),
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'business',
        name: 'Business',
        price: 1490,
        interval: 'month',
        features: JSON.stringify(['Всё из Pro', 'Приоритетная поддержка', 'Интеграции с API', 'Белый лейбл']),
        isActive: true,
        sortOrder: 3
      }
    ];
    await saveDatabase();
  }
}

// Payment operations
export async function createPayment(payment: Payment): Promise<Payment> {
  const database = await loadDatabase();
  database.payments.push(payment);
  await saveDatabase();
  return payment;
}

export async function getPaymentsByUserId(userId: string): Promise<Payment[]> {
  const database = await loadDatabase();
  return database.payments.filter(p => p.userId === userId);
}

// Monthly Earnings operations
export async function createMonthlyEarning(earning: MonthlyEarning): Promise<MonthlyEarning> {
  const database = await loadDatabase();
  database.monthlyEarnings.push(earning);
  await saveDatabase();
  return earning;
}

export async function getMonthlyEarningsByUserId(userId: string): Promise<MonthlyEarning[]> {
  const database = await loadDatabase();
  return database.monthlyEarnings.filter(e => e.userId === userId);
}

export async function updateMonthlyEarning(userId: string, month: string, year: number, amount: number): Promise<MonthlyEarning> {
  const database = await loadDatabase();
  const index = database.monthlyEarnings.findIndex(
    e => e.userId === userId && e.month === month && e.year === year
  );
  
  if (index !== -1) {
    database.monthlyEarnings[index].amount = amount;
    await saveDatabase();
    return database.monthlyEarnings[index];
  }
  
  return await createMonthlyEarning({
    id: crypto.randomUUID(),
    userId,
    month,
    year,
    amount,
    createdAt: new Date().toISOString()
  });
}

// Initialize database on module load
loadDatabase();
