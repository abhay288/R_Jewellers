import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Radhika Jewellers',
    short_name: 'Radhika',
    description: 'Premium designer luxury artificial jewellery.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#8c765c',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
