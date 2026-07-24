'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(username: string, password: string) {
  const STATIC_ID = 'bb151120'
  const STATIC_PASS = 'bb1511200@'

  console.log(`loginAction: username=${username}, password=${password}`)

  if (username === STATIC_ID && password === STATIC_PASS) {
    console.log('loginAction: Success, setting cookie and redirecting...')
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'authorized', {
      path: '/',
      httpOnly: false,
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
