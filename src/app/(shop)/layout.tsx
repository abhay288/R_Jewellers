import Navbar from "@/frontend/components/layout/Navbar";
import Footer from "@/frontend/components/layout/Footer";
import CartDrawer from "@/frontend/components/cart/CartDrawer";
import PushNotificationInit from "@/frontend/components/layout/PushNotificationInit";
import LoginPopup from "@/frontend/components/auth/LoginPopup";
import { auth } from "@/auth";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen">
      <PushNotificationInit />
      <LoginPopup isAuthenticated={!!session?.user} />
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
