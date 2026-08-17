import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Grill on the Green',
  description: 'American classics and slow-smoked barbecue in Simi Valley.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <html lang="en">
      <head>
        {/*
         * Only the two faces that render above the fold are preloaded: Corbert
         * Compact for the navigation and page headings, Rilley for the hero
         * heading and its script eyebrow. Carla Sans sets overlines only and is
         * left to the normal stylesheet-driven fetch. Both are woff2 and both
         * are metric-matched (styles/fonts.css), so `swap` cannot shift layout.
         */}
        <link
          rel="preload"
          href="/fonts/CorbertCompact-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Rilley.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
