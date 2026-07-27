'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash } from 'node:crypto'

const SECURE_COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 8,
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export async function loginAction(username: string, password: string) {
  const validUsername = process.env.ADMIN_USERNAME
  const validPassword = process.env.ADMIN_PASSWORD

  if (!validUsername || !validPassword) {
    return { success: false, error: 'Authentication system not configured.' }
  }

  const inputHash = createHash('sha256').update(username + ':' + password).digest('hex')
  const validHash = createHash('sha256').update(validUsername + ':' + validPassword).digest('hex')

  if (!constantTimeEqual(inputHash, validHash)) {
    return { success: false, error: 'Invalid Security ID or Access Code.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', 'authorized', SECURE_COOKIE_OPTIONS)
  redirect('/')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/login')
}
