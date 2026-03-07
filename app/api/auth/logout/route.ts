import { clearSessionCookie } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.headers.set('Set-Cookie', clearSessionCookie())
  return response
}
