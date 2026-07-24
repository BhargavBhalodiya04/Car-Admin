'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(username: string, password: string) {
  // Support environment variables with secure fallback values
  const STATIC_ID = process.env.ADMIN_USERNAME || 'bb151120'
  const STATIC_PASS = process.env.ADMIN_PASSWORD || 'bb1511200@'

  console.log(`loginAction: username=${username}`)

  if (username === STATIC_ID && password === STATIC_PASS) {
    console.log('loginAction: Success, setting secure cookie and redirecting...')
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'authorized', {
      path: '/',
      httpOnly: true, // Secure against XSS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
    redirect('/')
  }

  console.log('loginAction: Failed credentials')
  return { success: false, error: 'Invalid Security ID or Access Code.' }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/login')
}
