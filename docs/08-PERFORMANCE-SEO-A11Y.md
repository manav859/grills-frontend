# 08 — Performance, SEO, Accessibility

Status: **Living**
Last reviewed: 2026-07-22

---

## 1. Performance Budgets

Measured at the 75th percentile on a simulated Moto G Power over a 4G
connection (Lighthouse mobile preset), and on real-user data via Vercel
Analytics once traffic exists. Mobile is the governing target — the primary
audience is on a phone, outdoors, on cellular.

### 1.1 Core Web Vitals

| Metric | Target | Failure threshold | Enforcement |
|---|---|---|---|
| Largest Contentful Paint | ≤ 2.0s | > 2.5s | Lighthouse CI, blocks merge |
| Interaction to Next Paint | ≤ 150ms | > 200ms | Lighthouse CI + RUM |
| Cumulative Layout Shift | ≤ 0.02 | > 0.05 | Lighthouse CI, blocks merge |
| Time to First Byte | ≤ 300ms | > 600ms | Vercel Analytics |
| First Contentful Paint | ≤ 1.2s | > 1.8s | Lighthouse CI |
| Total Blocking Time | ≤ 150ms | > 300ms | Lighthouse CI |
| Speed Index | ≤ 2.5s | > 3.4s | Lighthouse CI |

TTFB is achievable because every route is statically generated and served from
Vercel's edge. A TTFB above 600ms indicates a route accidentally became dynamic
— treat it as a defect, not a tuning problem.

### 1.2 Byte budgets per route

Compressed transfer size, first visit, cold cache.

| Route | JS (first-party) | JS (total incl. framework) | CSS | Fonts | Images | HTML | Total |
|---|---|---|---|---|---|---|---|
| `/` | ≤ 25 KB | ≤ 110 KB | ≤ 14 KB | ≤ 65 KB | ≤ 320 KB | ≤ 22 KB | ≤ 530 KB |
| `/menu` | ≤ 20 KB | ≤ 105 KB | ≤ 14 KB | ≤ 65 KB | ≤ 200 KB | ≤ 45 KB | ≤ 430 KB |
| `/events` | ≤ 18 KB | ≤ 103 KB | ≤ 14 KB | ≤ 65 KB | ≤ 180 KB | ≤ 18 KB | ≤ 380 KB |
| `/events/[slug]` | ≤ 20 KB | ≤ 105 KB | ≤ 14 KB | ≤ 65 KB | ≤ 220 KB | ≤ 14 KB | ≤ 420 KB |
| `/about` | ≤ 15 KB | ≤ 100 KB | ≤ 14 KB | ≤ 65 KB | ≤ 380 KB | ≤ 16 KB | ≤ 480 KB |
| `/contact` | ≤ 28 KB | ≤ 113 KB | ≤ 14 KB | ≤ 65 KB | ≤ 120 KB | ≤ 15 KB | ≤ 350 KB |

Notes:
- `/menu` carries the largest HTML because the entire menu is server-rendered in
  one document. At 300 items this is ~45 KB gzipped and remains within budget —
  see `03-CONTENT-MODEL.md` §14.
- `/contact` carries the largest first-party JS because of `ContactForm`.
- Image budgets count what loads before and immediately after the fold.
  Below-fold images are lazy and excluded.
- The Instagram feed is excluded from these budgets because it loads only on
  intersection. Its own ceiling is 150 KB; exceeding it degrades to the link-out
  fallback.

### 1.3 Budget enforcement

```yaml
# frontend/.github/workflows/lighthouse.yml — assertion excerpt
assertions:
  categories:performance: ["error", { "minScore": 0.9 }]
  categories:accessibility: ["error", { "minScore": 0.95 }]
  categories:seo: ["error", { "minScore": 1 }]
  categories:best-practices: ["error", { "minScore": 0.95 }]
  largest-contentful-paint: ["error", { "maxNumericValue": 2500 }]
  cumulative-layout-shift: ["error", { "maxNumericValue": 0.05 }]
  total-blocking-time: ["error", { "maxNumericValue": 300 }]
  resource-summary:script:size: ["error", { "maxNumericValue": 120000 }]
  resource-summary:stylesheet:size: ["error", { "maxNumericValue": 16000 }]
  resource-summary:font:size: ["error", { "maxNumericValue": 70000 }]
  unused-javascript: ["warn", { "maxNumericValue": 40000 }]
```

`@next/bundle-analyzer` runs on every PR; the workflow comments the per-route
first-load JS delta. A regression above 5 KB requires justification in the PR
description.

---

## 2. Image Strategy

### 2.1 Formats

| Priority | Format | Served to |
|---|---|---|
| 1 | AVIF | Browsers advertising `image/avif` |
| 2 | WebP | Browsers advertising `image/webp` |
| 3 | JPEG / PNG | Everything else |

```ts
// frontend/next.config.ts — images excerpt
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1600, 1920, 2400],
    imageSizes: [96, 128, 192, 256, 384],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.example.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};
```

`deviceSizes` includes 360 and 420 because the primary audience is on a phone;
Next.js's defaults start at 640 and would over-serve every mobile visitor.

`[NEEDS CLIENT INPUT] The `hostname` value is a placeholder until the production
CMS domain is resolved — DP-14.`

### 2.2 Responsive `sizes` per usage

Every `Image` usage declares `sizes`. An omitted `sizes` on a `fill` image
downloads the largest candidate on every device.

| Usage | `sizes` |
|---|---|
| Hero background | `100vw` |
| Split feature | `(min-width: 1024px) 50vw, 100vw` |
| Menu card thumbnail | `(min-width: 768px) 96px, 100vw` |
| Featured item card | `(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw` |
| Event card, list | `(min-width: 768px) 33vw, 100vw` |
| Event card, preview | `(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw` |
| Event hero | `100vw` |
| Gallery grid item | `(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw` |
| Person portrait | `(min-width: 640px) 320px, 60vw` |
| Section banner | `(min-width: 1280px) 1280px, 100vw` |
| Static map | `(min-width: 768px) 50vw, 100vw` |

### 2.3 Priority loading

| Rule | Detail |
|---|---|
| Exactly one `priority` image per route | The LCP element. On `/` it is the hero background; on `/events/[slug]` it is the event hero; on `/menu`, `/about`, and `/contact` no image is above the fold, so none is prioritised. |
| Everything else | `loading="lazy"` (the Next.js default) |
| Preconnect | `<link rel="preconnect">` to the CMS image origin in the root layout |
| Never `priority` on a lazy list | Prioritising a below-fold image delays the real LCP element |

### 2.4 Placeholders

`blurDataUrl` is generated in PHP at upload time and stored as attachment meta
`_gotg_blur_data_url`. It is a 20px-wide JPEG encoded as a data URI, capped at
1.2 KB. Images without a stored blur render against `--color-surface-sunken`
with no placeholder — a solid colour is preferable to a runtime-generated blur,
which would cost a request.

```php
<?php
/**
 * Generates and stores a low-quality placeholder for an uploaded image.
 *
 * @param array $metadata      Attachment metadata.
 * @param int   $attachment_id Attachment ID.
 * @return array The unmodified metadata.
 */
function gotg_generate_blur_placeholder( $metadata, $attachment_id ) {
	$file = get_attached_file( $attachment_id );

	if ( ! $file || ! file_exists( $file ) ) {
		return $metadata;
	}

	$editor = wp_get_image_editor( $file );

	if ( is_wp_error( $editor ) ) {
		return $metadata;
	}

	$editor->resize( 20, 20, false );
	$editor->set_quality( 40 );

	$temp = wp_tempnam( 'gotg-blur' );
	$saved = $editor->save( $temp, 'image/jpeg' );

	if ( is_wp_error( $saved ) || ! isset( $saved['path'] ) ) {
		return $metadata;
	}

	$contents = file_get_contents( $saved['path'] ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	wp_delete_file( $saved['path'] );

	if ( false === $contents ) {
		return $metadata;
	}

	$data_uri = 'data:image/jpeg;base64,' . base64_encode( $contents ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode

	if ( strlen( $data_uri ) <= 1200 ) {
		update_post_meta( $attachment_id, '_gotg_blur_data_url', $data_uri );
	}

	return $metadata;
}
add_filter( 'wp_generate_attachment_metadata', 'gotg_generate_blur_placeholder', 10, 2 );
```

### 2.5 Layout stability

| Rule | Detail |
|---|---|
| Every image reserves space | `width` and `height` from the API, or `fill` inside a container with a fixed `aspect-ratio` |
| No image without dimensions | The API always returns `width` and `height`; an image lacking them is a backend defect |
| Fonts do not shift text | `size-adjust` on the fallback face — see §3 |
| No content injected above existing content after load | The announcement bar renders server-side, not after hydration |
| Third-party embeds reserve space | The Instagram grid reserves its skeleton height before loading |

---

## 3. Font Loading

| Decision | Value | Reason |
|---|---|---|
| Hosting | Self-hosted in `public/fonts/` | No third-party connection, no `fonts.googleapis.com` round trip, no privacy exposure |
| Format | WOFF2 only | Universally supported by the browsers in scope |
| Subset | Latin, `unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215` | Menu and event copy is English |
| Weights loaded | Inter 400, 500, 600; Bitter 600, 700 | Five files, ~62 KB total |
| `font-display` | `swap` | Text is readable immediately; the audience is outdoors and time-pressured |
| Preload | Inter 400 and Bitter 700 only | These render above the fold on every route |
| Variable fonts | Not used | Static subsets at five weights are smaller than two variable files here |

Fallback metric matching eliminates the swap-induced layout shift:

```css
/* frontend/src/styles/globals.css — font faces */
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-latin-400-normal.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F,
    U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215;
}

@font-face {
  font-family: "Inter Fallback";
  src: local("Arial");
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22.4%;
  line-gap-override: 0%;
}

@font-face {
  font-family: "Bitter";
  src: url("/fonts/bitter-latin-700-normal.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F,
    U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215;
}

@font-face {
  font-family: "Bitter Fallback";
  src: local("Georgia");
  size-adjust: 100%;
  ascent-override: 92%;
  descent-override: 24%;
  line-gap-override: 0%;
}
```

The stacks in `05-DESIGN-SYSTEM.md` §2.1 are amended in implementation to insert
the matched fallback: `"Inter", "Inter Fallback", -apple-system, …` and
`"Bitter", "Bitter Fallback", Georgia, …`.

`[ASSUMPTION] The override percentages above are computed for Arial and Georgia
as the local fallbacks. Recompute with `fontkit` if either family changes —
DP-10.`

Preload tags in the root layout:

```tsx
<link
  rel="preload"
  href="/fonts/inter-latin-400-normal.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
<link
  rel="preload"
  href="/fonts/bitter-latin-700-normal.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

---

## 4. SEO

### 4.1 Metadata per template

Titles are built from `_global.seoDefaults.titleTemplate` (`%s | Grill on the
Green`), with the page's `seo.title` substituted for `%s`. A page supplying its
own `seo.title` that already contains the brand name is used verbatim.

| Route | Title source | Description source | Canonical | Index |
|---|---|---|---|---|
| `/` | `seo.title`, template not applied (the home title is complete on its own) | `seo.description` → `_global.seoDefaults.description` | `https://{domain}/` | Yes |
| `/menu` | `seo.title` → "Menu", templated | `seo.description` → default | `https://{domain}/menu` | Yes |
| `/events` | `seo.title` → "Events", templated | `seo.description` → default | `https://{domain}/events` | Yes |
| `/events/[slug]` | `event.seo.title` → `event.title`, templated | `event.seo.description` → `event.summary` | `https://{domain}/events/{slug}` | Yes |
| `/about` | `seo.title` → "About", templated | `seo.description` → default | `https://{domain}/about` | Yes |
| `/contact` | `seo.title` → "Contact", templated | `seo.description` → default | `https://{domain}/contact` | Yes |
| `/privacy-policy` | Static | Static | Self | Yes |
| `/accessibility` | Static | Static | Self | Yes |
| `/404` | "Page not found" | Static | None | No — `noindex` |
| Preview routes | Inherited | Inherited | None | No — `noindex, nofollow` |

Canonical rules:
- Always absolute, always `https`, always the production domain, never the
  Vercel preview domain.
- Query parameters are stripped. `/menu?daypart=lunch` canonicalises to
  `/menu`.
- No trailing slash.
- `seo.canonical` from the CMS overrides the computed value when set.
- Preview deployments emit `noindex, nofollow` via a
  `VERCEL_ENV !== 'production'` check, so a preview URL can never be indexed.

### 4.2 Metadata builder

```ts
// frontend/src/lib/seo.ts
import type { Metadata } from 'next';
import type { GlobalData, SeoFields } from '@/types/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';

export function buildMetadata(
  seo: SeoFields,
  global: GlobalData,
  pathname: string
): Metadata {
  const canonical = seo.canonical ?? `${SITE_URL}${pathname === '/' ? '' : pathname}`;
  const description = seo.description || global.seoDefaults.description;
  const image = seo.ogImage ?? global.seoDefaults.ogImage;
  const shouldIndex = IS_PRODUCTION && !seo.noindex;

  return {
    metadataBase: new URL(SITE_URL),
    title: seo.title,
    description,
    alternates: { canonical },
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
      googleBot: {
        index: shouldIndex,
        follow: shouldIndex,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      siteName: global.site.name,
      title: seo.title,
      description,
      url: canonical,
      locale: 'en_US',
      images: [
        {
          url: image.src,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description,
      images: [image.src],
    },
  };
}
```

### 4.3 Sitemap

```ts
// frontend/src/app/sitemap.ts
import type { MetadataRoute } from 'next';
import { fetchEndpoint } from '@/lib/api';
import type { EventsResponse } from '@/types/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/menu`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/events`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${SITE_URL}/accessibility`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
  ];

  const events = await fetchEndpoint<EventsResponse>('events', 'events', 900);

  const eventEntries: MetadataRoute.Sitemap = events.upcoming.map((event) => ({
    url: `${SITE_URL}/events/${event.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...eventEntries];
}
```

### 4.4 Robots

```ts
// frontend/src/app/robots.ts
import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
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
```

The WordPress origin serves its own `robots.txt` disallowing everything, so
`cms.{domain}` is never indexed and never competes with the frontend.

### 4.5 Structured data

Required types and their placement:

| Type | Route | Source |
|---|---|---|
| `Restaurant` (extends `LocalBusiness` and `FoodEstablishment`) | `/`, `/contact` | `_global` |
| `OpeningHoursSpecification` | Nested in `Restaurant` | `_global.hours` |
| `Menu` + `MenuSection` + `MenuItem` | `/menu` | `MenuResponse.sections` |
| `Event` | `/events` (as an array), `/events/[slug]` (single) | `EventsResponse.upcoming` |
| `BreadcrumbList` | `/events/[slug]` | Route |
| `WebSite` | `/` | `_global.site` |

All JSON-LD is generated by typed builders in `frontend/src/lib/json-ld.ts` and
emitted in a single `<script type="application/ld+json">` per page.

#### Restaurant + OpeningHoursSpecification

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": "https://example.com/#restaurant",
  "name": "Grill on the Green",
  "legalName": "Grill on the Green LLC",
  "url": "https://example.com",
  "telephone": "+1-805-842-2947",
  "email": "hello@example.com",
  "priceRange": "$$",
  "servesCuisine": ["American", "Barbecue"],
  "acceptsReservations": "False",
  "currenciesAccepted": "USD",
  "image": [
    "https://cms.example.com/wp-content/uploads/2026/07/gotg-og.jpg"
  ],
  "logo": "https://cms.example.com/wp-content/uploads/2026/07/gotg-logo.svg",
  "description": "American classics and slow-smoked barbecue on Simi Hills Golf Course. Breakfast, lunch, and dinner, seven days a week.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "5031 Alamo Street",
    "addressLocality": "Simi Valley",
    "addressRegion": "CA",
    "postalCode": "93063",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 34.263611,
    "longitude": -118.735278
  },
  "hasMap": "https://maps.google.com/?cid=0000000000000000000",
  "sameAs": [
    "https://www.instagram.com/grillonthegreen_simi/"
  ],
  "hasMenu": "https://example.com/menu",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "https://schema.org/Monday",
        "https://schema.org/Tuesday",
        "https://schema.org/Wednesday",
        "https://schema.org/Thursday",
        "https://schema.org/Friday",
        "https://schema.org/Saturday",
        "https://schema.org/Sunday"
      ],
      "opens": "06:00",
      "closes": "21:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "validFrom": "2026-11-26",
      "validThrough": "2026-11-26",
      "opens": "00:00",
      "closes": "00:00"
    }
  ]
}
```

Consecutive days sharing identical hours are collapsed into one specification
object. Exceptions from `_global.hours.exceptions` emit `validFrom`/
`validThrough` entries; a closed day is expressed as `opens` and `closes` both
`00:00`.

`acceptsReservations` is `"False"` until DP-04 resolves. It is emitted rather
than omitted because Google displays a reservation affordance when the property
is absent and ambiguous.

#### LocalBusiness

`Restaurant` is a subtype of `LocalBusiness`, so a separate `LocalBusiness`
node is not emitted — two nodes describing the same entity compete. Where a
generic `LocalBusiness` is referenced elsewhere in this document set, the
`Restaurant` node above satisfies it.

#### WebSite

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://example.com/#website",
  "url": "https://example.com",
  "name": "Grill on the Green",
  "description": "American classics and slow-smoked barbecue on Simi Hills Golf Course.",
  "publisher": { "@id": "https://example.com/#restaurant" },
  "inLanguage": "en-US"
}
```

No `SearchAction` is emitted — the site has no search.

#### Menu, MenuSection, MenuItem

```json
{
  "@context": "https://schema.org",
  "@type": "Menu",
  "@id": "https://example.com/menu#menu",
  "name": "Grill on the Green Menu",
  "url": "https://example.com/menu",
  "inLanguage": "en-US",
  "provider": { "@id": "https://example.com/#restaurant" },
  "hasMenuSection": [
    {
      "@type": "MenuSection",
      "name": "From the Smoker",
      "description": "Oak-smoked daily. When it's gone, it's gone.",
      "hasMenuItem": [
        {
          "@type": "MenuItem",
          "name": "Brisket Plate",
          "description": "Twelve hours over oak, sliced to order, with two sides and pickles.",
          "image": "https://cms.example.com/wp-content/uploads/2026/07/brisket-800.jpg",
          "offers": [
            {
              "@type": "Offer",
              "name": "half pound",
              "price": "24.00",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          ],
          "suitableForDiet": []
        },
        {
          "@type": "MenuItem",
          "name": "St. Louis Ribs",
          "description": "Dry rubbed, glazed at the end, finished on the grill.",
          "offers": [
            {
              "@type": "Offer",
              "name": "half rack",
              "price": "29.00",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            {
              "@type": "Offer",
              "name": "full rack",
              "price": "46.00",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          ],
          "suitableForDiet": []
        }
      ]
    },
    {
      "@type": "MenuSection",
      "name": "Breakfast",
      "hasMenuItem": [
        {
          "@type": "MenuItem",
          "name": "The Tee Time",
          "description": "Two eggs any style, breakfast potatoes, choice of bacon or sausage, toast.",
          "offers": [
            {
              "@type": "Offer",
              "price": "13.50",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          ],
          "suitableForDiet": []
        }
      ]
    }
  ]
}
```

`offers` is **always an array**, mirroring `MenuItem.priceVariants` in
`04-API-CONTRACT.md` §2.1. schema.org permits either a single `Offer` or a list;
emitting a list unconditionally means one code path and no shape change when an
item gains a second variant.

`Offer.name` carries the variant `label` and is omitted when the label is absent,
matching ADR-0022's treatment of empty optional values.

`suitableForDiet` maps `gotg_dietary` slugs to schema.org `RestrictedDiet`
values:

| `gotg_dietary` slug | schema.org value |
|---|---|
| `vegetarian` | `https://schema.org/VegetarianDiet` |
| `vegan` | `https://schema.org/VeganDiet` |
| `gluten-free` | `https://schema.org/GlutenFreeDiet` |
| `contains-nuts` | *(no equivalent — omitted)* |
| `spicy` | *(no equivalent — omitted)* |

Tags with no schema equivalent are omitted from `suitableForDiet` rather than
forced into an approximate value. Emitting `LowLactoseDiet` for "Contains Nuts"
would be a false claim.

`price` is emitted as a two-decimal string per schema.org convention, even
though the API delivers a number.

#### Event

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "@id": "https://example.com/events/the-canyon-band-aug-15#event",
  "name": "The Canyon Band",
  "description": "Country covers and originals on the patio.",
  "url": "https://example.com/events/the-canyon-band-aug-15",
  "startDate": "2026-08-15T18:00:00-07:00",
  "endDate": "2026-08-15T21:00:00-07:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "image": [
    "https://cms.example.com/wp-content/uploads/2026/07/canyon-band-800.jpg"
  ],
  "performer": {
    "@type": "MusicGroup",
    "name": "The Canyon Band",
    "sameAs": "https://www.instagram.com/thecanyonband/"
  },
  "organizer": { "@id": "https://example.com/#restaurant" },
  "location": {
    "@type": "Place",
    "name": "Grill on the Green",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "5031 Alamo Street",
      "addressLocality": "Simi Valley",
      "addressRegion": "CA",
      "postalCode": "93063",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 34.263611,
      "longitude": -118.735278
    }
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/events/the-canyon-band-aug-15",
    "validFrom": "2026-07-22T00:00:00-07:00"
  },
  "isAccessibleForFree": true
}
```

`performer` is `MusicGroup` when `eventType === 'live_music'` and
`performerName` is present; otherwise `performer` is omitted. When `isTicketed`
is true, `offers.price` is `coverCharge` and `offers.url` is `ticketUrl`.

#### BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Events",
      "item": "https://example.com/events"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "The Canyon Band"
    }
  ]
}
```

The final item omits `item` — it is the current page.

### 4.6 Structured data validation

| Check | Tool | When |
|---|---|---|
| Syntax and required properties | `schema-dts` types in `lib/json-ld.ts` | Compile time |
| Google eligibility | Rich Results Test | Before launch, and after any schema change |
| Live monitoring | Search Console → Enhancements | Weekly for 90 days post-launch |

---

## 5. Accessibility

Conformance target: **WCAG 2.1 Level AA**, all pages, all breakpoints.

### 5.1 Checklist scoped to this build

Each row names where it is satisfied and how it is verified.

#### Perceivable

| SC | Requirement | Where it applies here | Verification |
|---|---|---|---|
| 1.1.1 Non-text Content | Every image has appropriate alt text; decorative images use `alt=""` | `Image` primitive; CMS enforces alt on upload | axe, manual |
| 1.2.x Time-based Media | No audio or video in Phase 1 | — | n/a |
| 1.3.1 Info and Relationships | Headings, lists, tables, and form labels are marked up semantically | `HoursTable` uses `<th scope="row">`; `MenuCard` tags use `<ul>`; `DietaryLegend` uses `<dl>` | axe, manual |
| 1.3.2 Meaningful Sequence | DOM order matches visual order; `SplitLayout` swaps sides with CSS `order`, not DOM order | `SplitLayout` | Manual, CSS-disabled reading |
| 1.3.3 Sensory Characteristics | No instruction refers to shape, position, or colour alone | Copy review | Manual |
| 1.3.4 Orientation | No orientation lock | Global | Manual |
| 1.3.5 Identify Input Purpose | `autoComplete` on name, email, tel | `ContactForm` | Manual |
| 1.4.1 Use of Colour | Dietary badges carry text; `HoursStatus` carries text; active nav item is also bold | `Badge`, `HoursStatus`, `PrimaryNav` | Manual, greyscale check |
| 1.4.3 Contrast (Minimum) | 4.5:1 body, 3:1 large text and UI | All tokens in `05-DESIGN-SYSTEM.md` §1 | `pnpm test:contrast`, axe |
| 1.4.4 Resize Text | 200% zoom without loss of content or function | All routes | Manual at 320px × 256% |
| 1.4.5 Images of Text | Only the logo wordmark, which is exempt as a logotype | `SiteHeader` | Manual |
| 1.4.10 Reflow | No horizontal scroll at 320px width / 400% zoom | All routes | Manual, Playwright viewport test |
| 1.4.11 Non-text Contrast | 3:1 for input borders, focus ring, icon buttons | `--color-border-interactive`, `--color-focus-ring` | `pnpm test:contrast` |
| 1.4.12 Text Spacing | No clipping when line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em, paragraph spacing 2em are forced | All routes | Manual bookmarklet |
| 1.4.13 Content on Hover or Focus | `NavDropdown` is dismissible with Escape, hoverable, and persistent | `NavDropdown` | Manual |

#### Operable

| SC | Requirement | Where it applies here | Verification |
|---|---|---|---|
| 2.1.1 Keyboard | Every function is keyboard-operable | `MobileNav`, `DaypartFilter`, `Gallery` carousel, `ContactForm` | Manual keyboard pass |
| 2.1.2 No Keyboard Trap | Focus can always leave; the mobile nav trap is intentional and escapable | `MobileNav` | Manual |
| 2.1.4 Character Key Shortcuts | None implemented | — | n/a |
| 2.2.1 Timing Adjustable | No time limits | — | n/a |
| 2.2.2 Pause, Stop, Hide | No auto-advancing carousel, no auto-playing motion | `Gallery` | Manual |
| 2.3.1 Three Flashes | Nothing flashes | — | Manual |
| 2.4.1 Bypass Blocks | `SkipLink` as the first focusable element | `PageShell` | Manual |
| 2.4.2 Page Titled | Unique, descriptive `<title>` on every route | `generateMetadata` | axe |
| 2.4.3 Focus Order | Focus order matches visual order at every breakpoint | All routes | Manual |
| 2.4.4 Link Purpose | Link text states the destination; no bare "read more" | Copy and component review | Manual |
| 2.4.5 Multiple Ways | Primary nav plus footer nav plus in-page `SectionNav` | Global | Manual |
| 2.4.6 Headings and Labels | Headings describe their section; labels describe their field | All | Manual |
| 2.4.7 Focus Visible | Global focus ring, never removed | `05-DESIGN-SYSTEM.md` §9 | axe, manual |
| 2.5.1 Pointer Gestures | Carousel swipe has button equivalents | `Gallery` | Manual |
| 2.5.2 Pointer Cancellation | No action fires on pointer-down | Global | Manual |
| 2.5.3 Label in Name | Visible label text is contained in the accessible name | `Button`, `LinkButton`, `IconButton` | axe |
| 2.5.4 Motion Actuation | No motion-triggered functionality | — | n/a |

#### Understandable

| SC | Requirement | Where it applies here | Verification |
|---|---|---|---|
| 3.1.1 Language of Page | `<html lang="en-US">` | Root layout | axe |
| 3.1.2 Language of Parts | No foreign-language passages expected; if menu items use non-English names, wrap in `lang` | `MenuCard` | Manual, content review |
| 3.2.1 On Focus | Focus never triggers navigation or a context change | Global | Manual |
| 3.2.2 On Input | `DaypartFilter` changes content but not context, and announces the change | `DaypartFilter` | Manual |
| 3.2.3 Consistent Navigation | Identical nav order on every page | `SiteHeader`, `SiteFooter` | Manual |
| 3.2.4 Consistent Identification | The same icon and label mean the same thing everywhere | Global | Manual |
| 3.3.1 Error Identification | Errors are identified in text, per field and in a summary | `ContactForm` | Manual |
| 3.3.2 Labels or Instructions | Persistent visible labels; format hints where a format is required | `Field` | Manual |
| 3.3.3 Error Suggestion | Error text states the fix | `ContactForm` | Manual |
| 3.3.4 Error Prevention | Not applicable — no legal, financial, or data-modifying submission | — | n/a |

#### Robust

| SC | Requirement | Where it applies here | Verification |
|---|---|---|---|
| 4.1.2 Name, Role, Value | Custom widgets expose correct roles and states | `MobileNav`, `NavDropdown`, `Gallery` carousel, `DaypartFilter` | axe, screen reader |
| 4.1.3 Status Messages | Form results, filter results, and hours status use live regions without moving focus | `ContactForm`, `DaypartFilter`, `HoursStatus` | Screen reader |

4.1.1 Parsing is obsolete in WCAG 2.1 errata and is not tested.

### 5.2 Keyboard navigation requirements

Global tab order, mobile:

```
SkipLink → AnnouncementBar link → AnnouncementBar dismiss → Logo →
MobileNav trigger → [main content in DOM order] → Footer links →
MobileCtaBar Call → MobileCtaBar Menu
```

Global tab order, desktop:

```
SkipLink → AnnouncementBar link → AnnouncementBar dismiss → Logo →
Primary nav items (in order) → Header CTA → [main content in DOM order] →
Footer links
```

`MobileCtaBar` is last in the DOM despite being visually pinned to the bottom,
so it does not interrupt the content tab sequence.

Per-component keyboard maps are specified in `06-COMPONENT-SPEC.md`. No
component introduces a shortcut key.

### 5.3 Testing protocol

| Layer | Tool | Scope | Gate |
|---|---|---|---|
| Static | `eslint-plugin-jsx-a11y` (strict) | Every `.tsx` file | Pre-commit and CI; blocks merge |
| Automated runtime | `@axe-core/playwright` | All 8 routes × 3 viewports (375, 768, 1440) | CI; zero critical or serious violations blocks merge |
| Lighthouse | Lighthouse CI | All routes | Accessibility score ≥ 95 blocks merge |
| Keyboard | Manual | All routes, both breakpoints | Pre-launch, and per PR touching interactive components |
| Screen reader | Manual | Home, Menu, Events, Contact | Pre-launch |
| Zoom / reflow | Manual | All routes at 320px and 400% | Pre-launch |
| Colour | `pnpm test:contrast` + greyscale review | Token pairs and all rendered pages | CI + pre-launch |

Screen-reader matrix:

| Reader | Browser | Platform | Priority |
|---|---|---|---|
| VoiceOver | Safari | iOS | 1 — the largest share of this audience |
| NVDA | Firefox | Windows | 2 |
| VoiceOver | Safari | macOS | 3 |
| TalkBack | Chrome | Android | 4 |

Automated tooling catches roughly 30–40% of issues. The manual passes in the
table above are mandatory before launch and are not substitutable by tooling.

```ts
// frontend/e2e/a11y.spec.ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = [
  '/',
  '/menu',
  '/events',
  '/about',
  '/contact',
  '/privacy-policy',
  '/accessibility',
] as const;

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

for (const route of ROUTES) {
  for (const viewport of VIEWPORTS) {
    test(`${route} has no a11y violations at ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const blocking = results.violations.filter(
        (violation) => violation.impact === 'critical' || violation.impact === 'serious'
      );

      expect(blocking).toEqual([]);
    });
  }
}
```

### 5.4 Accessibility statement

`/accessibility` is published at launch and states: the conformance target
(WCAG 2.1 AA), the date of the most recent audit, known limitations, and a
contact route for reporting a barrier (phone and email). It is reviewed
annually.

`[NEEDS CLIENT INPUT] The reporting contact email — DP-18.`
