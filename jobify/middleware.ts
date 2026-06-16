import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const protectedPaths = [
    '/dashboard',
    '/jobs',
    '/saved',
    '/email',
    '/subscription',
    '/account',
    '/onboarding'
  ];

  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  const isAuthPath = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/jobs/:path*',
    '/saved/:path*',
    '/email/:path*',
    '/subscription/:path*',
    '/account/:path*',
    '/onboarding/:path*',
    '/login',
    '/signup'
  ],
};
