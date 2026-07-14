import { NextResponse } from 'next/server';
import connectDB from '@/shared/lib/mongodb';
import User from '@/backend/models/User';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const email = "admin@radhikajewellers.com";
    const password = "Admin@123";
    
    const existingUser = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (existingUser) {
      existingUser.password = hashedPassword;
      existingUser.role = 'admin';
      existingUser.providers = ['credentials'];
      await existingUser.save();
      return NextResponse.json({ success: true, message: "Admin user updated." });
    } else {
      await User.create({
        name: "Admin User",
        email: email,
        password: hashedPassword,
        role: 'admin',
        providers: ['credentials']
      });
      return NextResponse.json({ success: true, message: "Admin user created." });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
