import { NextResponse } from 'next/server';
import connectDB from '@/shared/lib/mongodb';
import User from '@/backend/models/User';
import bcrypt from 'bcryptjs';
import { NotificationService } from '@/backend/services/NotificationService';
import { EmailService } from '@/backend/services/EmailService';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json();
    if (!firstName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const name = `${firstName} ${lastName}`.trim();

    const user = await User.create({
      name,
      email,
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
        `${name} (${email}) has registered a new account.`,
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
    console.error('Signup Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
