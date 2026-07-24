import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import OrderDetailsClient from '@/app/(shop)/profile/orders/[id]/OrderDetailsClient';
import dbConnect from '@/shared/lib/mongodb';
import { OrderService } from '@/backend/services/OrderService';

export const dynamic = 'force-dynamic';

export default async function AccountOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/account/orders');
  }

  await dbConnect();
  
  const resolvedParams = await params;
  const orderService = new OrderService();
  const order = await orderService.getOrderById(resolvedParams.id, session.user.id);

  if (!order) {
    return notFound();
  }

  const serializedOrder = JSON.parse(JSON.stringify(order));

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <OrderDetailsClient initialOrder={serializedOrder} />
    </div>
  );
}
