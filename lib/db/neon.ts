import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_sh9wM4HOEqGW@ep-super-rain-admuwf8m-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

// Create the Neon connection
const sql = neon(connectionString)

// Create the Drizzle instance with schema
export const db = drizzle(sql, { schema })

export default db
export { schema }

