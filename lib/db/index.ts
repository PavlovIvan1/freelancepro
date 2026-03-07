import fs from 'fs'
import path from 'path'
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js'

let db: SqlJsDatabase | null = null
let initialized = false

const dbPath = path.join(process.cwd(), 'freelancepro.db')

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (db && initialized) return db

  // Initialize SQL.js
  const SQL = await initSqlJs()
  
  // Try to load existing database
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  initialized = true
  return db
}

export function saveDatabase() {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  }
}

export default db
