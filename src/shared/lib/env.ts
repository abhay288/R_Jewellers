import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXTAUTH_SECRET: z.string().min(16, 'NEXTAUTH_SECRET or AUTH_SECRET must be set for security').optional(),
  AUTH_SECRET: z.string().min(16).optional(),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required for database connection').optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('[Environment Security Error] Missing or invalid environment configuration:');
    result.error.issues.forEach(issue => {
      console.error(` - ${issue.path.join('.')}: ${issue.message}`);
    });
  }
  return result.success;
}

// Auto-validate on module import in server environment
if (typeof window === 'undefined') {
  validateEnv();
}
