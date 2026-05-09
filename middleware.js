import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;
  const normalizedPathname = pathname !== '/' ? pathname.replace(/\/$/, '') : pathname;

  const publicRoutes = ['/auth/login', '/auth/register', '/auth/error'];

  if (publicRoutes.includes(normalizedPathname)) {
    if (!token) {
      return NextResponse.next();
    }

    const dashboardPath =
      token.role === 'student'
        ? '/dashboards/student'
        : token.role === 'teacher'
        ? '/dashboards/teacher'
        : token.role === 'admin'
        ? '/dashboards/admin'
        : '/';

    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  if (normalizedPathname === '/') {
    if (!token) {
      return NextResponse.next();
    }

    const dashboardPath =
      token.role === 'student'
        ? '/dashboards/student'
        : token.role === 'teacher'
        ? '/dashboards/teacher'
        : token.role === 'admin'
        ? '/dashboards/admin'
        : '/';

    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Protect all other routes
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-based route protection
  if (normalizedPathname.startsWith('/dashboards/student') && token.role !== 'student') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (normalizedPathname.startsWith('/dashboards/teacher') && token.role !== 'teacher') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (normalizedPathname.startsWith('/dashboards/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

    return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
