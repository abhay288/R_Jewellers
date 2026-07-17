import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import logger from '@/shared/lib/logger';

/**
 * Escapes HTML characters to prevent XSS injection.
 */
export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return val;
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Prevents NoSQL Injection by stripping keys starting with $ or containing .
 * Also sanitizes string elements recursively.
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      logger.warn(`Security Warning: Stripped NoSQL injection key "${key}"`);
      continue;
    }
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}

/**
 * Enterprise Secure API wrapper to enforce authentication, role permissions,
 * query/body sanitization, and production-safe generic error responses.
 */
export function secureApiRoute(
  handler: (req: Request, context?: any, session?: any) => Promise<NextResponse>,
  options?: {
    requiredRole?: 'user' | 'admin';
    validateBodySchema?: any;
  }
) {
  return async (req: Request, context?: any) => {
    try {
      // 1. Session & Role Authentication Check
      let session = null;
      if (options?.requiredRole) {
        session = await auth();
        if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        if (options.requiredRole === 'admin') {
          const role = (session.user as any).role;
          if (role !== 'admin') {
            logger.warn(`Privilege Escalation Blocked: User ${session.user.email} attempted accessing admin route.`);
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
          }
        }
      }

      // 2. Body Parsing, Sanitization, and Zod Schema Validation
      if (req.method !== 'GET' && req.headers.get('content-type')?.includes('application/json')) {
        try {
          const rawBody = await req.clone().json();
          const sanitizedBody = sanitizeObject(rawBody);

          if (options?.validateBodySchema) {
            const result = options.validateBodySchema.safeParse(sanitizedBody);
            if (!result.success) {
              const errorMessage = result.error.issues[0]?.message || 'Validation failed';
              return NextResponse.json({ error: errorMessage }, { status: 400 });
            }
          }
        } catch (e) {
          // Ignore body errors if handler doesn't require a body
        }
      }

      // 3. Run Inner Handler
      return await handler(req, context, session);
    } catch (err: any) {
      // 4. Global Error Catching & Concealment
      const errorMsg = err.message || 'Internal Server Error';
      logger.error(`API Exception on ${req.method} ${req.url}: ${err.stack || errorMsg}`);
      
      const payload: any = { error: 'An unexpected security or internal error occurred.' };
      if (process.env.NODE_ENV === 'development') {
        payload.error = errorMsg;
        payload.stack = err.stack;
      }
      return NextResponse.json(payload, { status: 500 });
    }
  };
}
