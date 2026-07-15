import { NextResponse } from 'next/server';
import { AddressService } from '@/backend/services/AddressService';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();
    
    const resolvedParams = await params;
    const addressService = new AddressService();
    const updatedAddress = await addressService.updateAddress(session.user.id, resolvedParams.id, body);
    
    return NextResponse.json(updatedAddress);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const resolvedParams = await params;
    const addressService = new AddressService();
    await addressService.deleteAddress(session.user.id, resolvedParams.id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
