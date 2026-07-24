export async function loginAction(username: string, password: string) {
  // Support environment variables with fallback values
  const STATIC_ID = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'bb151120'
  const STATIC_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'bb1511200@'

  console.log(`loginAction: username=${username}`)

  if (username === STATIC_ID && password === STATIC_PASS) {
    if (typeof window !== 'undefined') {
      document.cookie = "admin_session=authorized; path=/; max-age=86400; SameSite=Lax"
    }
    return { success: true }
  }

  return { success: false, error: 'Invalid Security ID or Access Code.' }
}

export async function logoutAction() {
  if (typeof window !== 'undefined') {
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
  }
}
