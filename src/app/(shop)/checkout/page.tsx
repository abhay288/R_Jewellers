import CheckoutClient from './CheckoutClient';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const session = await auth();
  
  return <CheckoutClient session={session} />;
}
