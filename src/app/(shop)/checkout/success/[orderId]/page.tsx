import Link from 'next/link';
import { CheckCircle2, ChevronRight, Truck, Package, MapPin } from 'lucide-react';
import { OrderService } from '@/backend/services/OrderService';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return notFound();
  }

  await dbConnect();
  const resolvedParams = await params;
  const orderService = new OrderService();
  const order: any = await orderService.getOrderById(resolvedParams.orderId, session.user.id);

  if (!order) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <h1 className="text-5xl font-playfair font-bold mb-4">Thank You!</h1>
        <p className="text-muted-foreground text-lg mb-8">Your order has been placed successfully.</p>

        <div className="bg-secondary/10 border border-border rounded-3xl p-8 text-left mb-12 shadow-xl shadow-black/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/50 pb-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Order ID</p>
              <p className="text-2xl font-bold">{order.orderId}</p>
            </div>
            <div className="mt-4 md:mt-0 text-left md:text-right">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Order Date</p>
              <p className="text-lg font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium text-lg mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2 text-primary" /> Delivery Address</h3>
              <div className="text-muted-foreground">
                <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.houseNo}, {order.shippingAddress.street}</p>
                <p>{order.shippingAddress.area}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p className="mt-2">Mobile: {order.shippingAddress.phone}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4 flex items-center"><Package className="w-5 h-5 mr-2 text-primary" /> Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">Cash on Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount to Pay</span>
                  <span className="font-bold text-primary text-lg">₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between mt-4">
                  <span className="text-muted-foreground">Estimated Delivery</span>
                  <span className="font-medium text-green-600">3-5 Business Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/shop" className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-full uppercase tracking-wider text-sm font-medium hover:opacity-90 transition-opacity">
            Continue Shopping
          </Link>
          <Link href="/profile/orders" className="w-full sm:w-auto py-4 px-8 border border-border rounded-full font-medium hover:bg-secondary transition-colors text-sm uppercase tracking-wider">
            View My Orders
          </Link>
        </div>

      </div>
    </div>
  );
}
