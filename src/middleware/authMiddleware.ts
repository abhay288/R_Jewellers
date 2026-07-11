import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const withAuth = (handler: any) => {
  return auth(async (req: any, ctx: any) => {
    if (!req.auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, ctx);
  });
};

export const withRole = (role: string, handler: any) => {
  return auth(async (req: any, ctx: any) => {
    if (!req.auth || req.auth.user.role !== role) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return handler(req, ctx);
  });
};
