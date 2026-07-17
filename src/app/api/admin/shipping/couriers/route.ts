import { NextResponse } from 'next/server';
import { ShiprocketService } from '@/backend/services/ShiprocketService';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const deliveryPincode = searchParams.get('deliveryPincode');
    const weight = Number(searchParams.get('weight') || 0.5);
    const isCod = searchParams.get('isCod') === 'true';
    const orderValue = Number(searchParams.get('orderValue') || 0);

    if (!deliveryPincode) {
      return NextResponse.json({ error: 'deliveryPincode is required' }, { status: 400 });
    }

    const shiprocketService = new ShiprocketService();
    const couriers = await shiprocketService.fetchCouriers(
      deliveryPincode,
      weight,
      isCod,
      orderValue
    );

    return NextResponse.json({ couriers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
