import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Authentication disabled as per user request
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
