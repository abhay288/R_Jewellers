import ReturnDetailsClient from './ReturnDetailsClient';

export const metadata = {
  title: 'Return Details | Radhika Jewellers',
  description: 'View return request details.',
};

export default async function ReturnDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ReturnDetailsClient returnId={resolvedParams.id} />;
}
