-- Migration: Create tables for FreelancePro PostgreSQL (Neon)

-- Users table
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
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL REFERENCES users(id),
    plan_id VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Clients table
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
);

-- Projects table
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
);

-- Tasks table
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
);

-- Payment Plans table
CREATE TABLE IF NOT EXISTS payment_plans (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    interval VARCHAR(20) DEFAULT 'month',
    features TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 1
);

-- Payments table
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
);

-- Monthly Earnings table
CREATE TABLE IF NOT EXISTS monthly_earnings (
    id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL REFERENCES users(id),
    month VARCHAR(2) NOT NULL,
    year INTEGER NOT NULL,
    amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, month, year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_earnings_user_id ON monthly_earnings(user_id);

-- Insert default payment plans
INSERT INTO payment_plans (id, name, price, interval, features, is_active, sort_order) VALUES
('free', 'Free', 0, 'month', '["До 5 проектов", "До 10 задач", "Базовая аналитика"]', true, 1),
('pro', 'Pro', 490, 'month', '["Безлимитные проекты", "Безлимитные задачи", "Расширенная аналитика", "Экспорт данных"]', true, 2),
('business', 'Business', 1490, 'month', '["Всё из Pro", "Приоритетная поддержка", "Интеграции с API", "Белый лейбл"]', true, 3)
ON CONFLICT (id) DO NOTHING;
