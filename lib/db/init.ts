import { getDatabase, saveDatabase } from './index'

// Create tables
export async function initializeDatabase() {
  const db = await getDatabase()

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      planId TEXT NOT NULL DEFAULT 'free',
      planExpiresAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `)

  // Subscriptions table
  db.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      planId TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      startedAt TEXT NOT NULL,
      expiresAt TEXT,
      autoRenew INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // Clients table
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      company TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // Projects table
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      clientId TEXT NOT NULL,
      budget REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'active',
      description TEXT,
      startDate TEXT NOT NULL,
      endDate TEXT,
      notes TEXT DEFAULT '',
      earnedAmount REAL DEFAULT 0,
      category TEXT,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (clientId) REFERENCES clients(id)
    )
  `)

  // Tasks table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    )
  `)

  // Monthly earnings table
  db.run(`
    CREATE TABLE IF NOT EXISTS monthly_earnings (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      month TEXT NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // Payments table
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      projectId TEXT,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'RUB',
      status TEXT NOT NULL DEFAULT 'pending',
      method TEXT NOT NULL DEFAULT 'card',
      description TEXT,
      yookassaPaymentId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
    )
  `)

  // Payment plans table
  db.run(`
    CREATE TABLE IF NOT EXISTS payment_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'RUB',
      features TEXT NOT NULL,
      interval TEXT NOT NULL DEFAULT 'monthly',
      isActive INTEGER NOT NULL DEFAULT 1
    )
  `)

  saveDatabase()
  console.log('Database tables created successfully')
}

// Seed payment plans
export async function seedPaymentPlans() {
  const db = await getDatabase()
  
  const result = db.exec('SELECT COUNT(*) as count FROM payment_plans')
  const count = result[0]?.values[0]?.[0] as number || 0
  
  if (count > 0) {
    console.log('Payment plans already seeded')
    return
  }

  const paymentPlans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'RUB',
      features: JSON.stringify(['До 5 проектов', 'Базовая аналитика', 'До 10 клиентов', 'Шаблоны задач']),
      interval: 'monthly',
      isActive: 1,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 490,
      currency: 'RUB',
      features: JSON.stringify(['Безлимитные проекты', 'Расширенная аналитика', 'Безлимитные клиенты', 'Экспорт в PDF/Excel', 'Напоминания', 'Поддержка']),
      interval: 'monthly',
      isActive: 1,
    },
    {
      id: 'business',
      name: 'Business',
      price: 1490,
      currency: 'RUB',
      features: JSON.stringify(['Всё из Pro', 'Командная работа', 'API доступ', 'Интеграции', 'Брендирование', 'Менеджер']),
      interval: 'monthly',
      isActive: 1,
    },
  ]

  for (const plan of paymentPlans) {
    db.run(`
      INSERT INTO payment_plans (id, name, price, currency, features, interval, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [plan.id, plan.name, plan.price, plan.currency, plan.features, plan.interval, plan.isActive])
  }

  saveDatabase()
  console.log('Payment plans seeded successfully')
}

// Initialize and seed on import
initializeDatabase()
seedPaymentPlans()
