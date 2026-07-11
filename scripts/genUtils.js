const fs = require('fs');
const path = require('path');

const middlewareDir = path.join(process.cwd(), 'src', 'middleware');
const utilsDir = path.join(process.cwd(), 'src', 'utils');

if (!fs.existsSync(middlewareDir)) fs.mkdirSync(middlewareDir, { recursive: true });
if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true });

// Middleware
const authMw = `import { NextResponse } from 'next/server';\nimport { auth } from '@/auth';\n\nexport const withAuth = (handler: any) => {\n  return auth(async (req: any, ctx: any) => {\n    if (!req.auth) {\n      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });\n    }\n    return handler(req, ctx);\n  });\n};\n\nexport const withRole = (role: string, handler: any) => {\n  return auth(async (req: any, ctx: any) => {\n    if (!req.auth || req.auth.user.role !== role) {\n      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });\n    }\n    return handler(req, ctx);\n  });\n};\n`;
fs.writeFileSync(path.join(middlewareDir, 'authMiddleware.ts'), authMw);

const errorMw = `import { NextResponse } from 'next/server';\n\nexport const errorHandler = (err: any) => {\n  console.error(err);\n  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });\n};\n`;
fs.writeFileSync(path.join(middlewareDir, 'errorMiddleware.ts'), errorMw);

const loggerMw = `export const requestLogger = (req: Request) => {\n  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);\n};\n`;
fs.writeFileSync(path.join(middlewareDir, 'loggerMiddleware.ts'), loggerMw);

const rateMw = `// Note: Next.js app router generally uses Vercel KV or redis for proper rate limiting.\n// This is a placeholder for memory-based rate limiting.\nexport const rateLimiter = () => {\n  // Implementation would track IP and count requests\n  return true;\n};\n`;
fs.writeFileSync(path.join(middlewareDir, 'rateLimitMiddleware.ts'), rateMw);

// Utilities
const idGen = `export const generateProductId = (lastId?: string): string => {\n  if (!lastId) return 'RJ-000001';\n  const num = parseInt(lastId.replace('RJ-', ''), 10) + 1;\n  return \`RJ-\${num.toString().padStart(6, '0')}\`;\n};\n\nexport const generateOrderId = (): string => {\n  const prefix = 'ORD';\n  const timestamp = Date.now().toString().slice(-6);\n  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');\n  return \`\${prefix}-\${timestamp}\${random}\`;\n};\n`;
fs.writeFileSync(path.join(utilsDir, 'idGenerator.ts'), idGen);

const hashUtil = `import bcrypt from 'bcryptjs';\n\nexport const hashPassword = async (password: string): Promise<string> => {\n  return bcrypt.hash(password, 10);\n};\n\nexport const comparePassword = async (password: string, hash: string): Promise<boolean> => {\n  return bcrypt.compare(password, hash);\n};\n`;
fs.writeFileSync(path.join(utilsDir, 'hash.ts'), hashUtil);

const jwtUtil = `import jwt from 'jsonwebtoken';\n\nexport const signToken = (payload: object, options?: jwt.SignOptions): string => {\n  return jwt.sign(payload, process.env.AUTH_SECRET || 'secret', options);\n};\n\nexport const verifyToken = (token: string): any => {\n  return jwt.verify(token, process.env.AUTH_SECRET || 'secret');\n};\n`;
fs.writeFileSync(path.join(utilsDir, 'jwt.ts'), jwtUtil);

const formatUtil = `import { NextResponse } from 'next/server';\n\nexport const successResponse = (data: any, message = 'Success', status = 200) => {\n  return NextResponse.json({ success: true, message, data }, { status });\n};\n\nexport const errorResponse = (message = 'Error', status = 400, errors?: any) => {\n  return NextResponse.json({ success: false, message, errors }, { status });\n};\n`;
fs.writeFileSync(path.join(utilsDir, 'responseFormatter.ts'), formatUtil);

const slugUtil = `export const generateSlug = (text: string): string => {\n  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');\n};\n`;
fs.writeFileSync(path.join(utilsDir, 'slugify.ts'), slugUtil);

console.log('Middleware and Utils created');
