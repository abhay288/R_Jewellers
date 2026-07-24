import AdminReturnDetailsClient from './AdminReturnDetailsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Return Details | Admin Dashboard',
};

export default async function AdminReturnDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <AdminReturnDetailsClient returnId={resolvedParams.id} />;
}
