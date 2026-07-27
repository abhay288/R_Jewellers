import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.radhikajewellers.store';

  return {
    rules: [
      // --- Standard search engine crawlers ---
      {
        userAgent: '*',
        allow: [
          '/',
          '/shop',
          '/shop/',
          '/product/',
          '/about',
          '/about/',
          '/faq',
          '/faq/',
          '/contact',
          '/contact/',
          '/shipping',
          '/shipping/',
          '/returns',
          '/returns/',
          '/privacy',
          '/terms',
          '/cancellation',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/checkout/',
          '/account/',
          '/profile/',
          '/dashboard/',
          '/login',
          '/signup',
          '/offline',
          '/_next/',
        ],
      },

      // --- OpenAI / ChatGPT ---
      {
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/shop/',
          '/product/',
          '/about',
          '/faq',
          '/contact',
          '/shipping',
          '/returns',
        ],
        disallow: ['/admin/', '/api/', '/checkout/', '/account/'],
      },

      // --- Google AI / Gemini ---
      {
        userAgent: 'Google-Extended',
        allow: [
          '/',
          '/shop/',
          '/product/',
          '/about',
          '/faq',
          '/contact',
        ],
        disallow: ['/admin/', '/api/', '/checkout/', '/account/'],
      },

      // --- Anthropic / Claude ---
      {
        userAgent: 'anthropic-ai',
        allow: [
          '/',
          '/shop/',
          '/product/',
          '/about',
          '/faq',
          '/contact',
        ],
        disallow: ['/admin/', '/api/', '/checkout/', '/account/'],
      },

      // --- ClaudeBot (Anthropic crawler) ---
      {
        userAgent: 'ClaudeBot',
        allow: [
          '/',
          '/shop/',
          '/product/',
          '/about',
          '/faq',
          '/contact',
        ],
        disallow: ['/admin/', '/api/', '/checkout/', '/account/'],
      },

      // --- Perplexity AI ---
      {
        userAgent: 'PerplexityBot',
        allow: [
          '/',
          '/shop/',
          '/product/',
          '/about',
          '/faq',
          '/contact',
        ],
        disallow: ['/admin/', '/api/', '/checkout/', '/account/'],
      },

      // --- Meta AI ---
      {
        userAgent: 'meta-externalagent',
        allow: [
          '/',
          '/shop/',
          '/product/',
          '/about',
          '/faq',
          '/contact',
        ],
        disallow: ['/admin/', '/api/', '/checkout/', '/account/'],
      },

      // --- Cohere AI ---
      {
        userAgent: 'cohere-ai',
        allow: ['/', '/shop/', '/product/', '/about', '/faq', '/contact'],
        disallow: ['/admin/', '/api/', '/checkout/', '/account/'],
      },

      // --- Common Crawl (powers many AI training datasets) ---
      {
        userAgent: 'CCBot',
        allow: ['/', '/shop/', '/product/', '/about', '/faq', '/contact'],
        disallow: ['/admin/', '/api/', '/checkout/', '/account/'],
      },

      // --- Apple AI / Applebot ---
      {
        userAgent: 'Applebot-Extended',
        allow: ['/', '/shop/', '/product/', '/about', '/faq', '/contact'],
        disallow: ['/admin/', '/api/', '/checkout/', '/account/'],
      },

      // --- Bing AI / Copilot (Microsoft) ---
      {
        userAgent: 'bingbot',
        allow: [
          '/',
          '/shop/',
          '/product/',
          '/about',
          '/faq',
          '/contact',
          '/shipping',
          '/returns',
        ],
        disallow: ['/admin/', '/api/', '/checkout/', '/account/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
