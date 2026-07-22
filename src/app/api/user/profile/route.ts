import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import User from '@/backend/models/User';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const query = session.user.id
      ? { _id: session.user.id }
      : { email: session.user.email?.toLowerCase().trim() };

    const user = await User.findOne(query).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const nameParts = (user.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name || '',
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        providers: user.providers || [],
      },
    });
  } catch (error: any) {
    console.error('[GET /api/user/profile Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().max(50).optional().default(''),
  phone: z.string().trim().max(20).optional().default(''),
});

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateProfileSchema.parse(body);

    await connectDB();
    const query = session.user.id
      ? { _id: session.user.id }
      : { email: session.user.email?.toLowerCase().trim() };

    const fullName = `${validated.firstName} ${validated.lastName}`.trim();

    const updatedUser = await User.findOneAndUpdate(
      query,
      {
        $set: {
          name: fullName,
          phone: validated.phone,
        },
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const nameParts = (updatedUser.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name || '',
        firstName,
        lastName,
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        role: updatedUser.role || 'user',
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }
    console.error('[PUT /api/user/profile Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
