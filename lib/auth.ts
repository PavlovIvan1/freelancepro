import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

// Base64 encode without Buffer
function base64Encode(str: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(str)
  }
  return Buffer.from(str).toString('base64')
}

function base64Decode(str: string): string {
  if (typeof atob !== 'undefined') {
    return atob(str)
  }
  return Buffer.from(str, 'base64').toString('utf-8')
}

// Password hashing with bcrypt
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
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

// Get session data from token
export function getSession(token: string): { userId: string; expires: number } | null {
  try {
    const decoded = base64Decode(token)
    const data = JSON.parse(decoded)
    if (data.expires && Date.now() > data.expires) {
      return null
    }
    return data
  } catch {
    return null
  }
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
export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  
  const session = getSession(token)
  return session?.userId || null
}

// Create session
export function createSession(userId: string): string {
  const token = base64Encode(JSON.stringify({ 
    userId, 
    expires: Date.now() + 30 * 24 * 60 * 60 * 1000 
  }))
  return token
}
