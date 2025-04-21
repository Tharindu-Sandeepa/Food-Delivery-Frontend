import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { useAuth } from '@/lib/hooks/useAuth';

export function middleware(request: NextRequest) {
  const { user } = useAuth();
  const { pathname } = request.nextUrl;

  // Admin routes
  if (pathname.startsWith('/admin') && user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Restaurant routes
  if (pathname.startsWith('/restaurant') && user?.role !== 'restaurant') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Delivery routes
  if (pathname.startsWith('/delivery') && user?.role !== 'delivery') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Customer routes (if you have specific customer-only areas)
  if (pathname.startsWith('/customer') && user?.role !== 'customer') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

// Specify the paths to protect
export const config = {
  matcher: [
    '/admin/:path*',
    '/restaurant/:path*',
    '/delivery/:path*',
    '/customer/:path*'
  ],
};