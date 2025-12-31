import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define role-based route access
const roleRoutes: Record<string, string[]> = {
  ADMIN: [
    '/dashboard',
    '/dashboard/admin',
    '/dashboard/settings',
  ],
  HOD: [
    '/dashboard',
    '/dashboard/hod',
    '/dashboard/settings',
  ],
  FACULTY: [
    '/dashboard',
    '/dashboard/faculty',
    '/dashboard/mentor',
    '/dashboard/settings',
  ],
  STUDENT: [
    '/dashboard',
    '/dashboard/student',
    '/dashboard/mentee',
    '/dashboard/settings',
  ],
}

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public routes
  if (publicRoutes.some(route => pathname === route)) {
    return NextResponse.next()
  }
  
  // Check for authentication token in cookies
  const token = request.cookies.get('token')?.value
  
  // If no token and trying to access protected route, redirect to login
  if (!token && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // If token exists but on login page, redirect to dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // For protected routes, we'll do role checking on the client side
  // because we can't decode JWT without the secret in middleware
  // The server will validate the token and role when API calls are made
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
