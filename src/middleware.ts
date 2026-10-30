import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected staff routes
const STAFF_ROUTES = [
  '/dashboard',
  '/patients',
  '/appointments',
  '/odontogram',
  '/treatment-plans',
  '/finance',
  '/inventory',
  '/insurance',
  '/labs',
  '/attendance',
  '/staff',
  '/reports',
  '/settings',
  '/audit'
];

// Protected patient routes
const PATIENT_ROUTES = [
  '/portal'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('delight_smile_token')?.value;

  // 1. Check Staff Protected Routes
  const isStaffRoute = STAFF_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
  if (isStaffRoute) {
    if (!authCookie) {
      const loginUrl = new URL('/staff/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Check Patient Protected Routes
  const isPatientRoute = PATIENT_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
  if (isPatientRoute) {
    if (!authCookie) {
      const loginUrl = new URL('/patient/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect internal API routes (except public auth & public slot availability)
  if (pathname.startsWith('/api/')) {
    const isPublicApi = 
      pathname === '/api/auth/login' ||
      pathname === '/api/auth/register' ||
      pathname === '/api/appointments/available-slots';

    if (!isPublicApi) {
      const authHeader = request.headers.get('authorization');
      if (!authCookie && !authHeader) {
        return NextResponse.json(
          { error: 'UNAUTHORIZED', message: 'Authentication required to access protected clinical API.' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/patients/:path*',
    '/appointments/:path*',
    '/odontogram/:path*',
    '/treatment-plans/:path*',
    '/finance/:path*',
    '/inventory/:path*',
    '/insurance/:path*',
    '/labs/:path*',
    '/attendance/:path*',
    '/staff/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/audit/:path*',
    '/portal/:path*',
    '/api/:path*'
  ]
};
