import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import OrderDetailsClient from './OrderDetailsClient';
import dbConnect from '@/shared/lib/mongodb';
import { OrderService } from '@/backend/services/OrderService';

export const dynamic = 'force-dynamic';

export default async function CustomerOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return notFound();
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
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <OrderDetailsClient initialOrder={serializedOrder} />
    </div>
  );
}
