import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import AdminOrderDetailsClient from './AdminOrderDetailsClient';
import dbConnect from '@/shared/lib/mongodb';
import { OrderService } from '@/backend/services/OrderService';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/orders');
  }

  await dbConnect();
  
  const resolvedParams = await params;
  const orderService = new OrderService();
  // Call without userId to get it as Admin
  const order = await orderService.getOrderById(resolvedParams.id);

  if (!order) {
    return notFound();
  }

  const serializedOrder = JSON.parse(JSON.stringify(order));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AdminOrderDetailsClient initialOrder={serializedOrder} />
    </div>
  );
}
