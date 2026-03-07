import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_sh9wM4HOEqGW@ep-super-rain-admuwf8m-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  }
})
