"use client";

import Script from 'next/script';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
      <div id="swagger-ui"></div>
      <Script 
        src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="afterInteractive"
        onLoad={() => {
          // @ts-ignore
          if (window.SwaggerUIBundle) {
            // @ts-ignore
            window.SwaggerUIBundle({
              url: '/api/docs',
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                // @ts-ignore
                window.SwaggerUIBundle.presets.apis,
              ],
              layout: "BaseLayout"
            });
          }
        }}
      />
    </div>
  );
}
