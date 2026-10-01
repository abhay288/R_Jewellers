import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Memory-based IP cache for rate limiting
const ipCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

const LIMITS = {
  auth: 30,       // login, register, reset password
  checkout: 120,  // checkout, place order, payment create
  api: 300,       // other shop and catalog APIs
  page: 600,      // standard pages
};

export default auth(async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  
  // 1. IP Rate Limiting (Exempt NextAuth internal routes and GET read operations)
  const isAuthApiRoute = pathname.startsWith('/api/auth/');
  const isReadOperation = method === 'GET';
  const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown';

  if (ip !== 'unknown' && !isAuthApiRoute && !isReadOperation) {
    let limit = LIMITS.page;
    if (pathname.startsWith('/api/')) {
      if (
        pathname.startsWith('/api/auth/signup') || 
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
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  // Allow cross-origin resource policy for auth callback routes so browsers accept Set-Cookie on OAuth redirects
  if (isAuthApiRoute) {
    response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  } else {
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  }
  
  // Custom CSP allowing fonts, scripts, Razorpay CDN, Google OAuth, and media resources securely
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://cdn.jsdelivr.net https://checkout.razorpay.com https://cdn.razorpay.com https://*.razorpay.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; img-src 'self' blob: data: https:; media-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://* https://www.google-analytics.com https://www.googletagmanager.com https://*.razorpay.com; frame-src 'self' https://accounts.google.com https://api.razorpay.com https://checkout.razorpay.com https://cdn.razorpay.com https://*;"
  );

  // 3. Protected Routes Logic using req.auth provided by Auth.js wrapper
  const session = (request as any).auth;

  // If authenticated user visits /login or /signup, redirect to /admin if admin, else callbackUrl or '/'
  if (session && (pathname === '/login' || pathname === '/signup')) {
    const userRole = (session.user as any)?.role;
    const defaultTarget = userRole === 'admin' ? '/admin' : '/';
    const rawCallbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    const target = rawCallbackUrl && rawCallbackUrl !== '/' && !rawCallbackUrl.startsWith('/login') && !rawCallbackUrl.startsWith('/signup') ? rawCallbackUrl : defaultTarget;
    return NextResponse.redirect(new URL(target, request.url));
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

  // Protect user dashboard/profile/checkout
  if (
    pathname.startsWith('/profile') || 
    pathname.startsWith('/account') || 
    pathname.startsWith('/checkout') || 
    pathname.startsWith('/dashboard') || 
    (pathname.startsWith('/api/shop/') && !pathname.startsWith('/api/shop/products') && !pathname.startsWith('/api/shop/search'))
  ) {
    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png (favicons)
     * - api/auth (NextAuth internal authentication endpoints)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png|.*\\.).*)',
  ],
};
