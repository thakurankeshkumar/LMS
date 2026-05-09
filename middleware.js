import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/error', '/'];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Protect all other routes
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-based route protection
  if (pathname.startsWith('/dashboards/student') && token.role !== 'student') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/dashboards/teacher') && token.role !== 'teacher') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/dashboards/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
