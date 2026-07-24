import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import AdminOrdersClient from './AdminOrdersClient';
import dbConnect from '@/shared/lib/mongodb';
import { OrderService } from '@/backend/services/OrderService';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth();
  
  // Basic admin check (Assuming session.user.role exists, or hardcoded for now)
  if (!session?.user) {
    redirect('/admin/login');
  }

  await dbConnect();
  
  const resolvedSearchParams = await searchParams;
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page, 10) : 1;
  const statusFilter = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : 'All';
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '';

  const orderService = new OrderService();
  const { orders, total, pages } = await orderService.getAdminOrders(page, 15, search, statusFilter);

  const serializedOrders = JSON.parse(JSON.stringify(orders));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">Order Management</h1>
        <p className="text-xs text-muted-foreground mt-1">View, track, and manage all customer orders in real time.</p>
      </div>
      
      <AdminOrdersClient 
        initialOrders={serializedOrders} 
        totalPages={pages} 
        currentPage={page} 
        currentStatus={statusFilter} 
        currentSearch={search}
      />
    </div>
  );
}
