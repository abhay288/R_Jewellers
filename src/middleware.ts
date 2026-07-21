import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Memory-based IP cache for rate limiting (ephemeral on serverless but highly effective locally)
const ipCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

const LIMITS = {
  auth: 5,        // login, register, reset password
  checkout: 10,   // checkout, contact message, returns
  api: 60,        // other shop and catalog APIs
  page: 120,      // standard pages
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. IP Rate Limiting
  const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown';
  if (ip !== 'unknown') {
    let limit = LIMITS.page;
    if (pathname.startsWith('/api/')) {
      if (
        pathname.startsWith('/api/auth/signup') || 
        pathname.startsWith('/api/auth/signin') || 
        pathname.includes('forgot-password')
      ) {
        limit = LIMITS.auth;
      } else if (
        pathname.startsWith('/api/shop/checkout') || 
        pathname.startsWith('/api/shop/contact') || 
        pathname.startsWith('/api/admin/returns/')
      ) {
        limit = LIMITS.checkout;
      } else {
        limit = LIMITS.api;
      }
    }

    const now = Date.now();
    const clientData = ipCache.get(ip);

    if (!clientData) {
      ipCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else if (now > clientData.resetTime) {
      ipCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else {
      clientData.count += 1;
      if (clientData.count > limit) {
        console.warn(`Rate limit exceeded for IP: ${ip} on route: ${pathname}`);
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
          );
        }
        return new NextResponse('429 Too Many Requests', { status: 429 });
      }
    }
  }

  const response = NextResponse.next();

  // 2. Add Security Headers (OWASP Recommended)
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Custom CSP allowing fonts, scripts, and media resources securely
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://cdn.jsdelivr.net https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https:; media-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://*;"
  );

  // 3. Protected Routes Logic
  let session = null;
  // Skip calling auth() on NextAuth API routes to prevent consuming the request body
  if (!pathname.startsWith('/api/auth')) {
    try {
      session = await auth();
    } catch (err) {
      console.error('NextAuth session error in middleware:', err);
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const user = session?.user as any;
    if (!user || user.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
      }
      return new NextResponse('403 Forbidden - Admin access required', { status: 403 });
    }
  }

  // Protect user dashboard/profile
  if (
    pathname.startsWith('/profile') || 
    pathname.startsWith('/account') || 
    pathname.startsWith('/checkout') || 
    pathname.startsWith('/dashboard') || 
    (pathname.startsWith('/api/shop/') && !pathname.startsWith('/api/shop/products'))
  ) {
    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png (favicons)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.).*)',
  ],
};
