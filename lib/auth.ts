// Simple password hashing (in production, use bcrypt or argon2)
// Using simple SHA-256 for demo purposes

export function hashPassword(password: string): string {
  // Simple hash for demo - in production use proper bcrypt
  const salt = 'freelio_salt_2024'
  let hash = 0
  const str = password + salt
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(16, '0')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// Simple session token generation
export function generateToken(): string {
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Session storage (in production, use database or Redis)
const sessions = new Map<string, { userId: string; expiresAt: number }>()

export function createSession(userId: string): string {
  const token = generateToken()
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  sessions.set(token, { userId, expiresAt })
  return token
}

export function getSession(token: string): string | null {
  const session = sessions.get(token)
  if (!session) return null
  if (Date.now() > session.expiresAt) {
    sessions.delete(token)
    return null
  }
  return session.userId
}

export function deleteSession(token: string): void {
  sessions.delete(token)
}

// Cookie helpers
export const COOKIE_NAME = 'freelio_session'

export function setSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

// Get user ID from request cookies
import { cookies } from 'next/headers'

export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return getSession(token)
}
