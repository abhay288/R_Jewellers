import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add Security Headers (similar to Helmet)
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https://*; frame-src 'self' https://*;"
  );

  // Example Protected Routes Logic
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Type casting because we appended role in auth.ts
    const user = session.user as any;
    if (user.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
      }
      return new NextResponse('403 Forbidden - Admin access required', { status: 403 });
    }
  }

  // Protect user dashboard/profile
  if (pathname.startsWith('/profile') || pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)',
  ],
};
