import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/seo';

/*
 * Robots — 08-PERFORMANCE-SEO-A11Y.md §4.4. Non-production deploys (previews and
 * local dev, VERCEL_ENV !== 'production') disallow everything so a preview URL
 * can never be indexed. Production allows crawling except the control routes,
 * and points at the sitemap. The WordPress origin serves its own blocking
 * robots.txt, so cms.{domain} never competes with the frontend.
 */

const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';

export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/preview', '/preview/exit', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
