import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import OrdersClient from './OrdersClient';
import dbConnect from '@/shared/lib/mongodb';
import { OrderService } from '@/backend/services/OrderService';

export const dynamic = 'force-dynamic';

export default async function CustomerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return notFound();
  }

  await dbConnect();
  
  const resolvedSearchParams = await searchParams;
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page, 10) : 1;
  const statusFilter = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : 'All';

  const orderService = new OrderService();
  const { orders, total, pages } = await orderService.getUserOrders(session.user.id, page, 10, statusFilter);

  const serializedOrders = JSON.parse(JSON.stringify(orders));

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <h1 className="text-4xl font-playfair font-bold mb-8">My Orders</h1>
      <OrdersClient 
        initialOrders={serializedOrders} 
        totalPages={pages} 
        currentPage={page} 
        currentStatus={statusFilter} 
      />
    </div>
  );
}
