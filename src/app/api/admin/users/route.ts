import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import User from '@/backend/models/User';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const provider = searchParams.get('provider') || 'all'; // all | google | credentials
    const role = searchParams.get('role') || 'all'; // all | user | admin
    const status = searchParams.get('status') || 'all'; // all | active | locked
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();

    // Build Mongo Query Filter
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (provider !== 'all') {
      filter.providers = provider;
    }

    if (role !== 'all') {
      filter.role = role;
    }

    const now = new Date();

    if (status === 'locked') {
      filter.lockUntil = { $gt: now };
    } else if (status === 'active') {
      filter.$or = filter.$or
        ? filter.$or
        : undefined;
      filter.$and = [
        { $or: [{ lockUntil: { $exists: false } }, { lockUntil: null }, { lockUntil: { $lte: now } }] },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, totalCount, totalGoogleUsers, totalCredentialsUsers, totalLockedUsers] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
      User.countDocuments({ providers: 'google' }),
      User.countDocuments({ providers: 'credentials' }),
      User.countDocuments({ lockUntil: { $gt: now } }),
    ]);

    const totalUsersAll = await User.countDocuments();

    return NextResponse.json({
      success: true,
      users: users.map((u: any) => ({
        id: u._id.toString(),
        name: u.name || 'N/A',
        email: u.email,
        phone: u.phone || 'N/A',
        role: u.role || 'user',
        image: u.image || null,
        providers: u.providers || [],
        failedLoginAttempts: u.failedLoginAttempts || 0,
        isLocked: !!(u.lockUntil && new Date(u.lockUntil) > now),
        lockUntil: u.lockUntil || null,
        createdAt: u.createdAt,
      })),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats: {
        totalUsers: totalUsersAll,
        googleUsers: totalGoogleUsers,
        credentialsUsers: totalCredentialsUsers,
        lockedUsers: totalLockedUsers,
      },
    });
  } catch (error: any) {
    console.error('[GET /api/admin/users Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
