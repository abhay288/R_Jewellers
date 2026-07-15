import { NextResponse } from 'next/server';
import { AddressService } from '@/backend/services/AddressService';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const addressService = new AddressService();
    const addresses = await addressService.getUserAddresses(session.user.id);
    
    return NextResponse.json(addresses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();
    
    const addressService = new AddressService();
    const newAddress = await addressService.createAddress(session.user.id, body);
    
    return NextResponse.json(newAddress, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
