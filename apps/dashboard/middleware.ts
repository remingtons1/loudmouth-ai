import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip auth for login page and API login route
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/api/auth') {
    return NextResponse.next()
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('loudmouth_auth')

  if (!authCookie || authCookie.value !== process.env.DASHBOARD_PASSWORD) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
