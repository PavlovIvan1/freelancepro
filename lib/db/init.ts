import { sql } from 'drizzle-orm'
import { db } from './neon'

// Create tables - with error handling for each table
export async function initializeDatabase() {
  console.log('Creating database tables...')
  
  // Create users table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(20) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        subscription_id VARCHAR(20),
        subscription_plan VARCHAR(20) DEFAULT 'free',
        subscription_expires_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    console.log('Users table created')
  } catch (e) {
    console.log('Users table error (may already exist):', e)
  }
  
  // Create subscriptions table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(20) PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL REFERENCES users(id),
        plan_id VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        start_date TIMESTAMP NOT NULL DEFAULT NOW(),
        end_date TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    console.log('Subscriptions table created')
  } catch (e) {
    console.log('Subscriptions table error:', e)
  }
  
  // Create clients table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(20) PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    console.log('Clients table created')
  } catch (e) {
    console.log('Clients table error:', e)
  }
  
  // Create projects table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(20) PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL REFERENCES users(id),
        client_id VARCHAR(20) REFERENCES clients(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active',
        budget DECIMAL(10, 2) DEFAULT 0,
        deadline TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    console.log('Projects table created')
  } catch (e) {
    console.log('Projects table error:', e)
  }
  
  // Create tasks table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(20) PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL REFERENCES users(id),
        project_id VARCHAR(20) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'todo',
        priority VARCHAR(20) DEFAULT 'medium',
        due_date TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    console.log('Tasks table created')
  } catch (e) {
    console.log('Tasks table error:', e)
  }
  
  // Create payment_plans table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payment_plans (
        id VARCHAR(20) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        interval VARCHAR(20) DEFAULT 'month',
        features TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 1
      )
    `)
    console.log('Payment_plans table created')
  } catch (e) {
    console.log('Payment_plans table error:', e)
  }
  
  // Create payments table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(20) PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL REFERENCES users(id),
        subscription_id VARCHAR(20),
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'RUB',
        status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        external_id VARCHAR(100),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    console.log('Payments table created')
  } catch (e) {
    console.log('Payments table error:', e)
  }
  
  // Create monthly_earnings table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS monthly_earnings (
        id VARCHAR(20) PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL REFERENCES users(id),
        month VARCHAR(2) NOT NULL,
        year INTEGER NOT NULL,
        amount DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, month, year)
      )
    `)
    console.log('Monthly_earnings table created')
  } catch (e) {
    console.log('Monthly_earnings table error:', e)
  }
  
  // Create indexes
  try {
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)`)
    console.log('Indexes created')
  } catch (e) {
    console.log('Index error:', e)
  }
  
  console.log('Database tables creation complete')
}

// Seed payment plans
export async function seedPaymentPlans() {
  try {
    // Check if plans already exist
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM payment_plans`)
    const count = result[0]?.rows?.[0]?.count || 0
    
    if (Number(count) > 0) {
      console.log('Payment plans already seeded')
      return
    }

    // Insert payment plans
    await db.execute(sql`
      INSERT INTO payment_plans (id, name, price, interval, features, is_active, sort_order) VALUES
      ('free', 'Free', 0, 'month', '["До 5 проектов", "До 10 задач", "Базовая аналитика"]', true, 1),
      ('pro', 'Pro', 490, 'month', '["Безлимитные проекты", "Безлимитные задачи", "Расширенная аналитика", "Экспорт данных"]', true, 2),
      ('business', 'Business', 1490, 'month', '["Всё из Pro", "Приоритетная поддержка", "Интеграции с API", "Белый лейбл"]', true, 3)
    `)

    console.log('Payment plans seeded successfully')
  } catch (error) {
    console.error('Error seeding payment plans:', error)
  }
}
