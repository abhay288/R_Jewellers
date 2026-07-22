import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import User from '@/backend/models/User';
import { z } from 'zod';

const patchSchema = z.object({
  action: z.enum(['update_role', 'unlock', 'update_details']),
  role: z.enum(['user', 'admin']).optional(),
  name: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().max(20).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const validated = patchSchema.parse(body);

    await connectDB();
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Safety check: Prevent admin from demoting themselves
    if (
      validated.action === 'update_role' &&
      validated.role === 'user' &&
      (session.user.id === id || session.user.email?.toLowerCase() === targetUser.email.toLowerCase())
    ) {
      return NextResponse.json(
        { error: 'Self-demotion is restricted to prevent loss of admin access.' },
        { status: 400 }
      );
    }

    let updateFields: any = {};

    if (validated.action === 'update_role') {
      if (!validated.role) {
        return NextResponse.json({ error: 'Role is required for role update' }, { status: 400 });
      }
      updateFields.role = validated.role;
    } else if (validated.action === 'unlock') {
      updateFields.failedLoginAttempts = 0;
      updateFields.lockUntil = null;
    } else if (validated.action === 'update_details') {
      if (validated.name !== undefined) updateFields.name = validated.name;
      if (validated.phone !== undefined) updateFields.phone = validated.phone;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      message: `User action '${validated.action}' executed successfully.`,
      user: updatedUser,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }
    console.error('[PATCH /api/admin/users/[id] Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectDB();
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Safety check: Prevent admin from deleting themselves
    if (
      session.user.id === id ||
      session.user.email?.toLowerCase() === targetUser.email.toLowerCase()
    ) {
      return NextResponse.json(
        { error: 'You cannot delete your own admin account.' },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error: any) {
    console.error('[DELETE /api/admin/users/[id] Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
