import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/logs', '/photos', '/feedback', '/profile', '/cheat-meals']
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  // Check for token in cookies (set by client-side code if needed)
  const token = request.cookies.get('access_token')?.value

  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Note: We can't access localStorage in middleware (server-side)
  // So we'll let the client-side handle auth checks
  // Only redirect auth routes if they have a cookie token
  if (isAuthRoute && token) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // For protected routes, let client-side handle redirects
  // This allows localStorage-based auth to work
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
