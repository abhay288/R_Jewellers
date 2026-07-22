import { NextResponse } from 'next/server';
import connectDB from '@/shared/lib/mongodb';
import User from '@/backend/models/User';
import bcrypt from 'bcryptjs';
import { NotificationService } from '@/backend/services/NotificationService';
import { EmailService } from '@/backend/services/EmailService';
import { z } from 'zod';

const signupSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().max(50).default(''),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  phone: z.string().trim().min(10, 'Contact number must be at least 10 digits').max(20, 'Contact number is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export async function POST(request: Request) {
  try {
    const rawData = await request.json();
    
    // 1. Zod validation & input sanitization
    const validated = signupSchema.parse(rawData);

    await connectDB();
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    // 2. Hash password with cost factor 12
    const hashedPassword = await bcrypt.hash(validated.password, 12);
    const name = `${validated.firstName} ${validated.lastName}`.trim();

    const user = await User.create({
      name,
      email: validated.email,
      phone: validated.phone,
      password: hashedPassword,
      role: 'user',
      providers: ['credentials'],
    });

    // Send Welcome Email
    try {
      const emailService = new EmailService();
      await emailService.sendWelcomeEmail(user.email, user.name);
    } catch (emailErr) {
      console.error('Failed to send welcome email:', emailErr);
    }

    // Notify admins about the new customer
    try {
      const notificationService = new NotificationService();
      await notificationService.sendAdminPushNotification(
        'New Customer Registered',
        `${name} (${validated.email}) has registered a new account.`,
        '/admin'
      );
    } catch (pushErr) {
      console.error('Failed to send admin push notification on signup:', pushErr);
    }

    return NextResponse.json(
      { 
        success: true, 
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email 
        } 
      }, 
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
