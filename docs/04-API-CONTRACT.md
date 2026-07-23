# 04 — API Contract

Status: **Living — AUTHORITATIVE for response shapes**
Last reviewed: 2026-07-22

This document is the single source of truth for what WordPress returns and what
the frontend expects. `frontend/src/types/api.ts` is a hand-written transcription
of the interfaces here. When the two disagree, this document wins and the
TypeScript file is corrected.

**GraphQL is not used anywhere in this project.** Do not add GraphQL queries,
schemas, or client libraries. See ADR-0003 in `12-GLOSSARY-DECISIONS.md`.

---

## 1. Transport Rules

| Rule | Value |
|---|---|
| Namespace | `gotg/v1` |
| Base URL | `{WP_API_BASE_URL}/wp-json/gotg/v1` |
| Method | `GET` for all content endpoints |
| Content type | `application/json; charset=utf-8` |
| Field naming | `camelCase` — never `snake_case` |
| Registration | `register_rest_route()` on `rest_api_init`, in `wp-content/mu-plugins/` only |
| Authentication | None for published content. Application Password for `?preview=` requests. |
| One request per page | Each endpoint returns everything its page needs. The frontend never composes two responses. |
| No core REST | `/wp/v2/*` is disabled for anonymous users. See §9.3. |
| No raw WP objects | No `rendered`/`raw` wrappers, no `_links`, no `yoast_head`, no internal IDs unless the frontend needs them. |
| Storage is invisible | Fields are native post meta, term meta, and one option (`03-CONTENT-MODEL.md`). No response key mirrors a meta key: `_gotg_is_featured` reaches the frontend as `isFeatured`. Changing the authoring mechanism does not change this contract. |
| Dates | ISO 8601 with explicit offset, e.g. `2026-08-15T18:00:00-07:00` |
| Money | `number` in USD, two-decimal precision, no currency symbol, no string |
| Absent optional values | The key is **omitted**, never `null`, never `""`. Nullable-by-design fields (`recurring`, `announcement`) are explicitly `T \| null` and are always present. |
| Empty collections | `[]`, never omitted |

### 1.1 Endpoint index

| Endpoint | Method | Serves | Frontend route | `revalidate` | Cache tag |
|---|---|---|---|---|---|
| `/gotg/v1/home` | GET | Home page | `/` | 3600 | `home` |
| `/gotg/v1/menu` | GET | Menu page | `/menu` | 3600 | `menu` |
| `/gotg/v1/events` | GET | Events page and all event detail pages | `/events`, `/events/[slug]` | 900 | `events` |
| `/gotg/v1/about` | GET | About page | `/about` | 86400 | `about` |
| `/gotg/v1/contact` | GET | Contact page | `/contact` | 86400 | `contact` |

### 1.2 Query parameters

| Parameter | Applies to | Type | Default | Purpose |
|---|---|---|---|---|
| `preview` | all | `0 \| 1` | `0` | Include draft content. Requires authentication. See §9. |
| `previewId` | all | integer | — | Specific draft post ID to substitute. Requires `preview=1`. |

No other parameters exist. Filtering, sorting, and pagination are performed
server-side by fixed rules, not by client-supplied parameters — the response
shape is the contract, and a client that can reshape it is a second contract.

---

## 2. Shared Types

Transcribe this section verbatim into `frontend/src/types/api.ts`.

```ts
// frontend/src/types/api.ts

export type Daypart = 'breakfast' | 'lunch' | 'dinner';

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type SpiceLevel = 'none' | 'mild' | 'medium' | 'hot';

export type DietaryColor = 'neutral' | 'green' | 'amber' | 'red';

export type EventType =
  | 'live_music'
  | 'special_menu'
  | 'holiday'
  | 'private'
  | 'other';

export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'yelp'
  | 'google'
  | 'tripadvisor'
  | 'youtube';

export interface ImageObject {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl?: string;
}

export interface LinkObject {
  label: string;
  href: string;
  isExternal: boolean;
}

export interface DietaryTag {
  slug: string;
  name: string;
  abbreviation: string;
  color: DietaryColor;
  description: string;
}

export interface PriceVariant {
  label?: string;
  amount: number;
}

export interface MenuItem {
  id: number;
  slug: string;
  name: string;
  priceVariants: PriceVariant[];
  description?: string;
  availability: Daypart[];
  dietaryTags: DietaryTag[];
  isFeatured: boolean;
  spiceLevel: SpiceLevel;
  image?: ImageObject;
}

export interface MenuSection {
  slug: string;
  title: string;
  order: number;
  intro?: string;
  image?: ImageObject;
  items: MenuItem[];
  children: MenuSection[];
}

export interface EventItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  descriptionHtml?: string;
  startDateTime: string;
  endDateTime: string;
  eventType: EventType;
  performerName?: string;
  performerUrl?: string;
  isTicketed: boolean;
  ticketUrl?: string;
  coverCharge?: number;
  isRecurringInstance: boolean;
  image?: ImageObject;
  seo: SeoFields;
}

export interface SeoFields {
  title: string;
  description: string;
  ogImage?: ImageObject;
  noindex: boolean;
  canonical?: string;
}

export interface HoursDay {
  day: Weekday;
  opens: string;
  closes: string;
  isClosed: boolean;
}

export interface HoursException {
  date: string;
  label: string;
  isClosed: boolean;
  opens?: string;
  closes?: string;
}

export interface Hours {
  timezone: string;
  regular: HoursDay[];
  exceptions: HoursException[];
}

export interface Location {
  name: string;
  streetAddress: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  phoneHref: string;
  email?: string;
  directionsUrl: string;
  parkingNote?: string;
}

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  handle?: string;
}

export interface SiteIdentity {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  logo?: ImageObject;
  logoInverse?: ImageObject;
  favicon?: ImageObject;
}

export interface SeoDefaults {
  titleTemplate: string;
  description: string;
  ogImage?: ImageObject;
  sameAs: string[];
  priceRange: string;
  servesCuisine: string[];
}

export interface Navigation {
  primary: LinkObject[];
  footer: LinkObject[];
  headerCta: LinkObject;
}

export interface SiteActions {
  reservationUrl?: string;
  orderingUrl?: string;
  giftCardUrl?: string;
}

export interface Announcement {
  text: string;
  href?: string;
}

export interface GlobalData {
  site: SiteIdentity;
  navigation: Navigation;
  location: Location;
  hours: Hours;
  social: SocialLink[];
  actions: SiteActions;
  announcement: Announcement | null;
  seoDefaults: SeoDefaults;
  generatedAt: string;
}
```

### 2.0 Image fields on `_global` are optional

`SiteIdentity.logo`, `SiteIdentity.logoInverse`, `SiteIdentity.favicon`, and
`SeoDefaults.ogImage` are optional, and are **omitted** when no attachment is
set — the same ADR-0022 rule as every other absent optional value.

They were required in an earlier revision. That was wrong: a freshly installed
site has no media library, so every endpoint emitted a payload that failed its
own contract, and the first thing a developer saw was a Zod failure on four keys
rather than a working site. Nothing can synthesise an `ImageObject` from an
absent attachment, and §7 authorises no error status for "the client has not
uploaded a logo yet" — because it is not an error. Found during REST
verification.

| Field | Frontend behaviour when absent |
|---|---|
| `logo` | `SiteHeader` renders `site.name` as a text wordmark in the brand display face — see `06-COMPONENT-SPEC.md` |
| `logoInverse` | Same, in the inverse colour token |
| `favicon` | No `<link rel="icon">` is emitted; the browser falls back to its default |
| `ogImage` | `seo.ogImage` has no global fallback, so a page without its own image emits no `og:image` |

Setting all four is a launch requirement, not a schema requirement. The
pre-launch checklist in `11-PROJECT-PLAN.md` covers it.

### 2.1 `priceVariants` invariants

`MenuItem.priceVariants` is an **array, never a scalar**, even for an item sold
at a single price. Source: `_gotg_price_variants` — see `03-CONTENT-MODEL.md`
§3.4 for the reasoning.

| Invariant | Rule |
|---|---|
| Length | Always ≥ 1. An item with zero variants is excluded from the payload alongside unavailable items, and logged when `WP_DEBUG` is on. |
| Maximum | 6 |
| Order | Editor order, preserved exactly. Not sorted by amount. |
| `amount` | Always present. `number`, USD, ≤ 2 decimal places. |
| `label` | **Omitted** when empty, per ADR-0022. A single-variant item usually has no label. |
| Rendering | `MenuCard` renders one price row per variant. With a single unlabelled variant it renders exactly as a scalar price would. See `06-COMPONENT-SPEC.md`. |

```json
[{ "amount": 13.5 }]
```

```json
[
  { "label": "half rack", "amount": 29 },
  { "label": "full rack", "amount": 46 }
]
```

There is no `priceNote` field. The former `priceNote` ("per lb", "half rack") is
now a variant `label`, which is the same information in the position that scales
to more than one price.

---

## 3. The `_global` Object

Every endpoint response contains a top-level `_global` key of type `GlobalData`.
Its shape is defined once, above, and is identical across all five endpoints.
Endpoint sections below do not repeat it.

Source: the `gotg_site_settings` option and the `gotg_location` post it
references through `primary_location_id` — see `03-CONTENT-MODEL.md` §5 and §11.

### 3.1 Example `_global` payload

```json
{
  "_global": {
    "site": {
      "name": "Grill on the Green",
      "legalName": "Grill on the Green LLC",
      "tagline": "Smoke your birdie",
      "description": "American classics and slow-smoked barbecue on Simi Hills Golf Course. Breakfast, lunch, and dinner, seven days a week.",
      "logo": {
        "src": "https://cms.example.com/wp-content/uploads/2026/07/gotg-logo.svg",
        "alt": "Grill on the Green",
        "width": 480,
        "height": 160
      },
      "logoInverse": {
        "src": "https://cms.example.com/wp-content/uploads/2026/07/gotg-logo-white.svg",
        "alt": "Grill on the Green",
        "width": 480,
        "height": 160
      },
      "favicon": {
        "src": "https://cms.example.com/wp-content/uploads/2026/07/gotg-icon.png",
        "alt": "Grill on the Green",
        "width": 512,
        "height": 512
      }
    },
    "navigation": {
      "primary": [
        { "label": "Menu", "href": "/menu", "isExternal": false },
        { "label": "Events", "href": "/events", "isExternal": false },
        { "label": "About", "href": "/about", "isExternal": false },
        { "label": "Contact", "href": "/contact", "isExternal": false }
      ],
      "footer": [
        { "label": "Menu", "href": "/menu", "isExternal": false },
        { "label": "Events", "href": "/events", "isExternal": false },
        { "label": "About", "href": "/about", "isExternal": false },
        { "label": "Contact", "href": "/contact", "isExternal": false }
      ],
      "headerCta": {
        "label": "Call 805-842-2947",
        "href": "tel:+18058422947",
        "isExternal": true
      }
    },
    "location": {
      "name": "Grill on the Green",
      "streetAddress": "5031 Alamo Street",
      "addressLine2": "at Simi Hills Golf Course",
      "city": "Simi Valley",
      "state": "CA",
      "postalCode": "93063",
      "country": "US",
      "latitude": 34.263611,
      "longitude": -118.735278,
      "phone": "805-842-2947",
      "phoneHref": "tel:+18058422947",
      "email": "hello@example.com",
      "directionsUrl": "https://maps.google.com/?cid=0000000000000000000",
      "parkingNote": "Free parking in the clubhouse lot. Enter from Alamo Street."
    },
    "hours": {
      "timezone": "America/Los_Angeles",
      "regular": [
        { "day": "monday", "opens": "06:00", "closes": "21:00", "isClosed": false },
        { "day": "tuesday", "opens": "06:00", "closes": "21:00", "isClosed": false },
        { "day": "wednesday", "opens": "06:00", "closes": "21:00", "isClosed": false },
        { "day": "thursday", "opens": "06:00", "closes": "21:00", "isClosed": false },
        { "day": "friday", "opens": "06:00", "closes": "21:00", "isClosed": false },
        { "day": "saturday", "opens": "06:00", "closes": "21:00", "isClosed": false },
        { "day": "sunday", "opens": "06:00", "closes": "21:00", "isClosed": false }
      ],
      "exceptions": [
        {
          "date": "2026-11-26",
          "label": "Thanksgiving",
          "isClosed": true
        },
        {
          "date": "2026-12-24",
          "label": "Christmas Eve",
          "isClosed": false,
          "opens": "06:00",
          "closes": "14:00"
        }
      ]
    },
    "social": [
      {
        "platform": "instagram",
        "url": "https://www.instagram.com/grillonthegreen_simi/",
        "handle": "grillonthegreen_simi"
      }
    ],
    "actions": {},
    "announcement": null,
    "seoDefaults": {
      "titleTemplate": "%s | Grill on the Green",
      "description": "American classics and slow-smoked barbecue on Simi Hills Golf Course in Simi Valley, California. Open daily 6am to 9pm.",
      "ogImage": {
        "src": "https://cms.example.com/wp-content/uploads/2026/07/gotg-og.jpg",
        "alt": "Smoked brisket plate at Grill on the Green",
        "width": 1200,
        "height": 630
      },
      "sameAs": [
        "https://www.instagram.com/grillonthegreen_simi/"
      ],
      "priceRange": "$$",
      "servesCuisine": ["American", "Barbecue"]
    },
    "generatedAt": "2026-07-22T09:14:03-07:00"
  }
}
```

`[ASSUMPTION] The street address, postal code, coordinates, email, legal name,
and Google Maps CID in this example are placeholders. Real values are blocked on
DP-01, DP-02, DP-18. Do not copy them into production content.`

### 3.2 `_global` cost and mitigation

`_global` is roughly 3 KB uncompressed and repeats on every endpoint. It is
fetched at build and revalidation time, not per user request, so it never
reaches a browser as a duplicate. Gzip compresses the repeated block to a few
hundred bytes. Splitting it into its own endpoint would add a second round trip
per page build and reintroduce client-side composition, which is prohibited.
Recorded in `01-TECH-STACK.md` §3.1.

---

## 4. Page Blocks

Blocks are a discriminated union on `type`. Every page's `blocks` array is
ordered exactly as the editor arranged it.

```ts
// frontend/src/types/api.ts (continued)

export interface CtaLink {
  label: string;
  href: string;
  isExternal: boolean;
}

export interface HeroBlock {
  type: 'hero';
  heading: string;
  subheading?: string;
  eyebrow?: string;
  image: ImageObject;
  overlay: number;
  primaryCta: CtaLink;
  secondaryCta?: CtaLink;
}

export interface TextBlock {
  type: 'text';
  heading?: string;
  bodyHtml: string;
  width: 'narrow' | 'wide';
  align: 'left' | 'center';
}

export interface SplitFeatureBlock {
  type: 'split_feature';
  heading: string;
  body: string;
  image: ImageObject;
  imageSide: 'left' | 'right';
  cta?: CtaLink;
}

export interface GalleryBlock {
  type: 'gallery';
  heading?: string;
  images: ImageObject[];
  layout: 'grid' | 'carousel';
}

export interface CtaBandBlock {
  type: 'cta_band';
  heading: string;
  body?: string;
  cta: CtaLink;
  style: 'brand' | 'ink' | 'surface';
}

export interface FeaturedItemsBlock {
  type: 'featured_items';
  heading: string;
  items: MenuItem[];
  cta?: CtaLink;
}

export interface EventsPreviewBlock {
  type: 'events_preview';
  heading: string;
  events: EventItem[];
  cta?: CtaLink;
}

export interface Person {
  name: string;
  role: string;
  bio?: string;
  photo?: ImageObject;
}

export interface PeopleBlock {
  type: 'people';
  heading?: string;
  people: Person[];
}

export interface InstagramFeedBlock {
  type: 'instagram_feed';
  heading: string;
  handle: string;
  count: number;
}

export type PageBlock =
  | HeroBlock
  | TextBlock
  | SplitFeatureBlock
  | GalleryBlock
  | CtaBandBlock
  | FeaturedItemsBlock
  | EventsPreviewBlock
  | PeopleBlock
  | InstagramFeedBlock;
```

`reusable_block` never appears in a response. The shaper resolves it and inlines
the referenced block's own layout object in its place.

Blocks that resolve to nothing are omitted from the array entirely rather than
returned empty:

| Block | Omitted when |
|---|---|
| `featured_items` | `items` would be `[]` |
| `events_preview` | `events` would be `[]` **and** `hide_when_empty` is on |
| `gallery` | `images` would be `[]` |
| `people` | `people` would be `[]` |
| `reusable_block` | the referenced `gotg_block` is missing or unpublished |

---

## 5. Endpoints

**There is no page-level `intro` field.** An earlier revision declared `intro?:
string` on the Menu, Events, About, and Contact responses. Nothing backed it:
`03-CONTENT-MODEL.md` gives a `page` only `_gotg_page_blocks` and the five SEO
keys, so the field could never be populated by any editor action. It has been
removed rather than given a meta key, because the page builder already solves
this — a `text` block placed first is an intro, and it is one mechanism instead
of two that do the same thing. A section-level `MenuSection.intro` does exist and
is backed by `_gotg_intro` term meta; that is a different field.

### 5.1 `GET /wp-json/gotg/v1/home`

Serves: `/`
Cache: `next: { tags: ['home'], revalidate: 3600 }`

```ts
export interface HomeResponse {
  _global: GlobalData;
  seo: SeoFields;
  blocks: PageBlock[];
}
```

Server-side rules:

| Rule | Detail |
|---|---|
| Source page | `page` with slug `home` |
| Block source | `page_blocks` Flexible Content, in editor order |
| `featured_items` in `auto` mode | `gotg_menu_item` where `is_featured` = 1 AND `is_available` = 1, ordered by `menu_order` then title, limit 6 |
| `featured_items` in `manual` mode | The selected item IDs, in the editor's order, filtered to published and available |
| `events_preview` | `gotg_event` where `end_datetime` ≥ now AND `event_type` ≠ `private`, ordered by `start_datetime` ascending, limit = block's `count` |
| Missing `home` page | HTTP 404 with code `gotg_page_not_found` |

Example response (abbreviated to the `blocks` array; `_global` as §3.1):

```json
{
  "_global": { "…": "see section 3.1" },
  "seo": {
    "title": "Grill on the Green | Smoked BBQ in Simi Valley",
    "description": "American classics and slow-smoked barbecue on Simi Hills Golf Course. Open daily 6am to 9pm.",
    "ogImage": {
      "src": "https://cms.example.com/wp-content/uploads/2026/07/hero-brisket.jpg",
      "alt": "Sliced brisket on a wooden board",
      "width": 1200,
      "height": 630
    },
    "noindex": false
  },
  "blocks": [
    {
      "type": "hero",
      "heading": "Slow-smoked, fairway-side",
      "subheading": "Breakfast through dinner, seven days a week.",
      "eyebrow": "Smoke your birdie",
      "image": {
        "src": "https://cms.example.com/wp-content/uploads/2026/07/hero-2400.jpg",
        "alt": "Brisket resting on the smoker at sunset",
        "width": 2400,
        "height": 1350,
        "blurDataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAJABADASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAYHCP/EACIQAAEEAgIBBQAAAAAAAAAAAAECAwQRAAUSITEGE0FRcf/EABUBAQEAAAAAAAAAAAAAAAAAAAME/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEhEhMf/aAAwDAQACEQMRAD8Ap9d6i2Ov0LEZuFHfabQEha1KBUB1eBWZ2vmSJ+wclSCkuOKtQSKA+B9DGMYVbGz/2Q=="
      },
      "overlay": 40,
      "primaryCta": { "label": "View Menu", "href": "/menu", "isExternal": false },
      "secondaryCta": {
        "label": "Call 805-842-2947",
        "href": "tel:+18058422947",
        "isExternal": true
      }
    },
    {
      "type": "text",
      "heading": "American classics, Texas patience",
      "bodyHtml": "<p>Marco runs the smoker from four in the morning. Mark runs the course. Between them there is brisket, ribs, and a breakfast that starts before the first tee time.</p>",
      "width": "narrow",
      "align": "center"
    },
    {
      "type": "featured_items",
      "heading": "Off the smoker",
      "items": [
        {
          "id": 412,
          "slug": "brisket-plate",
          "name": "Brisket Plate",
          "priceVariants": [{ "label": "half pound", "amount": 24 }],
          "description": "Twelve hours over oak, sliced to order, with two sides and pickles.",
          "availability": ["lunch", "dinner"],
          "dietaryTags": [],
          "isFeatured": true,
          "spiceLevel": "none",
          "image": {
            "src": "https://cms.example.com/wp-content/uploads/2026/07/brisket-800.jpg",
            "alt": "Sliced brisket with pickles and slaw",
            "width": 800,
            "height": 600
          }
        }
      ],
      "cta": { "label": "See the full menu", "href": "/menu", "isExternal": false }
    },
    {
      "type": "events_preview",
      "heading": "What's on",
      "events": [
        {
          "id": 801,
          "slug": "the-canyon-band-aug-15",
          "title": "The Canyon Band",
          "summary": "Country covers and originals on the patio.",
          "startDateTime": "2026-08-15T18:00:00-07:00",
          "endDateTime": "2026-08-15T21:00:00-07:00",
          "eventType": "live_music",
          "performerName": "The Canyon Band",
          "isTicketed": false,
          "isRecurringInstance": true,
          "seo": {
            "title": "The Canyon Band | Grill on the Green",
            "description": "Country covers and originals on the patio.",
            "noindex": false
          }
        }
      ],
      "cta": { "label": "All events", "href": "/events", "isExternal": false }
    },
    {
      "type": "instagram_feed",
      "heading": "From the grill",
      "handle": "grillonthegreen_simi",
      "count": 6
    }
  ]
}
```

Empty states:

| Condition | Behaviour |
|---|---|
| No featured items | `featured_items` block omitted from `blocks` |
| No upcoming events | `events_preview` block omitted from `blocks` |
| `blocks` is `[]` | Frontend renders header, footer, and a minimal fallback hero built from `_global.site`. Not an error. |

---

### 5.2 `GET /wp-json/gotg/v1/menu`

Serves: `/menu`
Cache: `next: { tags: ['menu'], revalidate: 3600 }`

```ts
export interface DaypartWindow {
  key: Daypart;
  label: string;
  starts: string;
  ends: string;
}

export interface MenuResponse {
  _global: GlobalData;
  seo: SeoFields;
  title: string;
  blocks: PageBlock[];
  dayparts: DaypartWindow[];
  defaultDaypart: Daypart | 'auto' | 'all';
  sections: MenuSection[];
  dietaryTags: DietaryTag[];
  showDietaryLegend: boolean;
  disclaimer: string;
}
```

Server-side rules:

| Rule | Detail |
|---|---|
| Section source | `gotg_menu_section` terms where `_gotg_is_hidden` is falsy, ordered by `_gotg_display_order` ascending then name ascending |
| Nesting | Two levels maximum. Child sections appear in the parent's `children` array and never at top level. |
| Item source | `gotg_menu_item`, status `publish`, `_gotg_is_available` truthy, holding the section term |
| Item order | `menu_order` ascending, then title ascending |
| Meta reads | `update_meta_cache()` is called once for the full item ID set before any `get_post_meta()` call, so the whole menu costs one meta query |
| Empty sections | A section with zero items is **excluded** from `sections` |
| `dietaryTags` | Only terms actually assigned to at least one returned item |
| Items with no section | Excluded. Logged via `error_log()` when `WP_DEBUG` is on. |
| Items with no price variants | Excluded, and logged. An item with no price is a content error, not an empty state. |
| Item limit | None. See `03-CONTENT-MODEL.md` §14. |

Example response:

```json
{
  "_global": { "…": "see section 3.1" },
  "seo": {
    "title": "Menu | Grill on the Green",
    "description": "Breakfast, lunch, and dinner. Smoked brisket, ribs, burgers, and American classics in Simi Valley.",
    "noindex": false
  },
  "title": "Menu",
  "blocks": [],
  "dayparts": [
    { "key": "breakfast", "label": "Breakfast", "starts": "06:00", "ends": "11:00" },
    { "key": "lunch", "label": "Lunch", "starts": "11:00", "ends": "16:00" },
    { "key": "dinner", "label": "Dinner", "starts": "16:00", "ends": "21:00" }
  ],
  "defaultDaypart": "auto",
  "sections": [
    {
      "slug": "bbq",
      "title": "From the Smoker",
      "order": 40,
      "intro": "Oak-smoked daily. When it's gone, it's gone.",
      "items": [
        {
          "id": 412,
          "slug": "brisket-plate",
          "name": "Brisket Plate",
          "priceVariants": [{ "label": "half pound", "amount": 24 }],
          "description": "Twelve hours over oak, sliced to order, with two sides and pickles.",
          "availability": ["lunch", "dinner"],
          "dietaryTags": [],
          "isFeatured": true,
          "spiceLevel": "none",
          "image": {
            "src": "https://cms.example.com/wp-content/uploads/2026/07/brisket-800.jpg",
            "alt": "Sliced brisket with pickles and slaw",
            "width": 800,
            "height": 600
          }
        },
        {
          "id": 415,
          "slug": "st-louis-ribs",
          "name": "St. Louis Ribs",
          "priceVariants": [
            { "label": "half rack", "amount": 29 },
            { "label": "full rack", "amount": 46 }
          ],
          "description": "Dry rubbed, glazed at the end, finished on the grill.",
          "availability": ["dinner"],
          "dietaryTags": [
            {
              "slug": "spicy",
              "name": "Spicy",
              "abbreviation": "SP",
              "color": "amber",
              "description": "Notably hot. Ask for the rub on the side."
            }
          ],
          "isFeatured": false,
          "spiceLevel": "medium"
        }
      ],
      "children": []
    },
    {
      "slug": "breakfast",
      "title": "Breakfast",
      "order": 10,
      "items": [
        {
          "id": 401,
          "slug": "the-tee-time",
          "name": "The Tee Time",
          "priceVariants": [{ "amount": 13.5 }],
          "description": "Two eggs any style, breakfast potatoes, choice of bacon or sausage, toast.",
          "availability": ["breakfast"],
          "dietaryTags": [],
          "isFeatured": false,
          "spiceLevel": "none"
        }
      ],
      "children": []
    }
  ],
  "dietaryTags": [
    {
      "slug": "spicy",
      "name": "Spicy",
      "abbreviation": "SP",
      "color": "amber",
      "description": "Notably hot. Ask for the rub on the side."
    }
  ],
  "showDietaryLegend": true,
  "disclaimer": "Prices and availability change without notice. Please tell your server about any allergies — we cannot guarantee an allergen-free kitchen."
}
```

`MenuResponse` as declared above is the complete shape. Contract tests run Zod
in `.strict()` mode, so any additional key in the PHP output fails the build.

Empty states:

| Condition | Behaviour |
|---|---|
| `sections` is `[]` | Frontend renders the page header, the disclaimer, and a message: "Our menu is being updated. Please call 805-842-2947." Not an error. |
| `dietaryTags` is `[]` | `DietaryLegend` renders nothing regardless of `showDietaryLegend` |
| A section has `intro` absent | Node omitted; no empty paragraph |

---

### 5.3 `GET /wp-json/gotg/v1/events`

Serves: `/events` **and** every `/events/[slug]`
Cache: `next: { tags: ['events'], revalidate: 900 }`

```ts
export interface RecurringProgramme {
  heading: string;
  body: string;
  days: Weekday[];
  starts: string;
  ends: string;
}

export interface EventsResponse {
  _global: GlobalData;
  seo: SeoFields;
  title: string;
  blocks: PageBlock[];
  recurring: RecurringProgramme | null;
  upcoming: EventItem[];
  emptyMessage: string;
}
```

Server-side rules:

| Rule | Detail |
|---|---|
| Inclusion | `gotg_event`, status `publish`, `end_datetime` ≥ current time in `America/Los_Angeles`, `event_type` ≠ `private` |
| Ordering | `start_datetime` ascending |
| Limit | 50. Beyond 50 upcoming events the payload truncates and logs a warning. |
| Past events | Never returned. There is no archive. |
| `recurring` | `null` when `show_recurring` is off |
| Detail pages | `generateStaticParams` maps `upcoming[].slug`. A slug not in the array returns `notFound()` — no per-event request is made. |

Example response:

```json
{
  "_global": { "…": "see section 3.1" },
  "seo": {
    "title": "Events & Live Music | Grill on the Green",
    "description": "Live music every Friday and Saturday from 6pm, plus special events at Grill on the Green in Simi Valley.",
    "noindex": false
  },
  "title": "Events",
  "blocks": [],
  "recurring": {
    "heading": "Live music every Friday & Saturday",
    "body": "Local acts on the patio from 6 to 9pm. No cover, no reservation needed — arrive early for a table by the fire pit.",
    "days": ["friday", "saturday"],
    "starts": "18:00",
    "ends": "21:00"
  },
  "upcoming": [
    {
      "id": 801,
      "slug": "the-canyon-band-aug-15",
      "title": "The Canyon Band",
      "summary": "Country covers and originals on the patio.",
      "descriptionHtml": "<p>The Canyon Band return for a three-hour set of country covers and originals. Kitchen serves until 9pm.</p>",
      "startDateTime": "2026-08-15T18:00:00-07:00",
      "endDateTime": "2026-08-15T21:00:00-07:00",
      "eventType": "live_music",
      "performerName": "The Canyon Band",
      "performerUrl": "https://www.instagram.com/thecanyonband/",
      "isTicketed": false,
      "isRecurringInstance": true,
      "image": {
        "src": "https://cms.example.com/wp-content/uploads/2026/07/canyon-band-800.jpg",
        "alt": "Four musicians playing on an outdoor patio at dusk",
        "width": 800,
        "height": 600
      },
      "seo": {
        "title": "The Canyon Band | Grill on the Green",
        "description": "Country covers and originals on the patio.",
        "noindex": false
      }
    },
    {
      "id": 806,
      "slug": "labor-day-pig-roast",
      "title": "Labor Day Pig Roast",
      "summary": "Whole hog, all afternoon, until it runs out.",
      "descriptionHtml": "<p>Marco puts a whole hog on at midnight. Service starts at noon and runs until the hog is gone. Ticket includes a plate and two sides.</p>",
      "startDateTime": "2026-09-07T12:00:00-07:00",
      "endDateTime": "2026-09-07T18:00:00-07:00",
      "eventType": "special_menu",
      "isTicketed": true,
      "ticketUrl": "https://www.eventbrite.com/e/000000000000",
      "coverCharge": 45,
      "isRecurringInstance": false,
      "seo": {
        "title": "Labor Day Pig Roast | Grill on the Green",
        "description": "Whole hog, all afternoon, until it runs out.",
        "noindex": false
      }
    }
  ],
  "emptyMessage": "No dated events scheduled right now — live music continues every Friday and Saturday, 6–9pm."
}
```

Empty states:

| Condition | Behaviour |
|---|---|
| `upcoming` is `[]` and `recurring` is set | Render the recurring card, then `emptyMessage` |
| `upcoming` is `[]` and `recurring` is `null` | Render `emptyMessage` and a link to `/contact` |
| Event has no `image` | `EventCard` renders text-only; no reserved image space |
| Event has no `descriptionHtml` | Detail page renders `summary` in its place |

---

### 5.4 `GET /wp-json/gotg/v1/about`

Serves: `/about`
Cache: `next: { tags: ['about'], revalidate: 86400 }`

```ts
export interface AboutResponse {
  _global: GlobalData;
  seo: SeoFields;
  title: string;
  blocks: PageBlock[];
}
```

Example response:

```json
{
  "_global": { "…": "see section 3.1" },
  "seo": {
    "title": "About | Grill on the Green",
    "description": "Mark runs the course, Marco runs the smoker. The story behind Grill on the Green in Simi Valley.",
    "noindex": false
  },
  "title": "About",
  "blocks": [
    {
      "type": "text",
      "heading": "How it started",
      "bodyHtml": "<p>Grill on the Green sits at the eighteenth hole of Simi Hills Golf Course. It began as a snack window and grew into a full kitchen when Marco brought his smoker over from a catering trailer.</p>",
      "width": "narrow",
      "align": "left"
    },
    {
      "type": "people",
      "heading": "Who's here",
      "people": [
        {
          "name": "Mark",
          "role": "Co-owner",
          "bio": "Plays the course most mornings before service. Handles the front of house and the golf side of the business.",
          "photo": {
            "src": "https://cms.example.com/wp-content/uploads/2026/07/mark-800.jpg",
            "alt": "Mark standing beside the eighteenth green",
            "width": 800,
            "height": 800
          }
        },
        {
          "name": "Marco",
          "role": "Co-owner and pitmaster",
          "bio": "Runs the smoker from four in the morning. Oak, salt, pepper, patience.",
          "photo": {
            "src": "https://cms.example.com/wp-content/uploads/2026/07/marco-800.jpg",
            "alt": "Marco tending an offset smoker",
            "width": 800,
            "height": 800
          }
        }
      ]
    },
    {
      "type": "cta_band",
      "heading": "Come hungry",
      "body": "Breakfast starts at 6am. The smoker starts earlier.",
      "cta": { "label": "View Menu", "href": "/menu", "isExternal": false },
      "style": "brand"
    }
  ]
}
```

`[NEEDS CLIENT INPUT] Biography copy for Mark and Marco is placeholder. Real copy
must come from the client — see DP-03 and the content plan in
11-PROJECT-PLAN.md.`

---

### 5.5 `GET /wp-json/gotg/v1/contact`

Serves: `/contact`
Cache: `next: { tags: ['contact'], revalidate: 86400 }`

```ts
export interface ContactResponse {
  _global: GlobalData;
  seo: SeoFields;
  title: string;
  blocks: PageBlock[];
  formEnabled: boolean;
  formSubjects: string[];
}
```

`formSubjects` populates the enquiry form's subject select. It is derived
server-side from a fixed list plus whichever of `actions.reservationUrl`,
`orderingUrl`, and `giftCardUrl` are unset — if the client has no reservation
platform, "Reservation enquiry" appears as a form subject instead.

Example response:

```json
{
  "_global": { "…": "see section 3.1" },
  "seo": {
    "title": "Contact & Hours | Grill on the Green",
    "description": "Call 805-842-2947. Open daily 6am to 9pm at Simi Hills Golf Course, Simi Valley, California.",
    "noindex": false
  },
  "title": "Contact",
  "blocks": [
    {
      "type": "cta_band",
      "heading": "Planning something bigger?",
      "body": "Tell us the date and the headcount and we will come back to you within one business day.",
      "cta": {
        "label": "Call 805-842-2947",
        "href": "tel:+18058422947",
        "isExternal": true
      },
      "style": "surface"
    }
  ],
  "formEnabled": true,
  "formSubjects": [
    "General enquiry",
    "Catering",
    "Private event",
    "Reservation enquiry",
    "Feedback"
  ]
}
```

Empty states:

| Condition | Behaviour |
|---|---|
| `formEnabled` is `false` | Form omitted; the phone and email block is rendered at full width instead |
| `_global.location.email` absent | Email row omitted from `ContactDetails` |
| `_global.location.parkingNote` absent | Node omitted |

---

## 6. Server-Side Shaping Rules

### 6.1 Image shaping

Every image is emitted through one helper. It returns `undefined` when the
attachment is missing, so a deleted image never produces a broken `src`.

```php
<?php
/**
 * Shapes an attachment into the API image object.
 *
 * @param int    $attachment_id Attachment post ID.
 * @param string $size          Registered image size.
 * @return array|null Image object, or null when the attachment is unavailable.
 */
function gotg_shape_image( $attachment_id, $size = 'gotg_card' ) {
	$attachment_id = (int) $attachment_id;

	if ( $attachment_id <= 0 ) {
		return null;
	}

	$src = wp_get_attachment_image_src( $attachment_id, $size );

	if ( false === $src ) {
		return null;
	}

	$alt = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );

	$image = array(
		'src'    => $src[0],
		'alt'    => is_string( $alt ) ? $alt : '',
		'width'  => (int) $src[1],
		'height' => (int) $src[2],
	);

	$blur = get_post_meta( $attachment_id, '_gotg_blur_data_url', true );

	if ( is_string( $blur ) && '' !== $blur ) {
		$image['blurDataUrl'] = $blur;
	}

	return $image;
}
```

### 6.2 HTML sanitisation

Fields ending in `Html` are the only fields containing markup. They pass through
`wp_kses()` with this exact allow-list before being returned:

```php
<?php
/**
 * Returns the allowed HTML tag set for API rich text fields.
 *
 * @return array Allowed tags and attributes for wp_kses().
 */
function gotg_allowed_html() {
	return array(
		'p'      => array(),
		'br'     => array(),
		'strong' => array(),
		'em'     => array(),
		'ul'     => array(),
		'ol'     => array(),
		'li'     => array(),
		'h3'     => array( 'id' => true ),
		'a'      => array(
			'href'   => true,
			'title'  => true,
			'rel'    => true,
			'target' => true,
		),
	);
}
```

The frontend renders these with `dangerouslySetInnerHTML` **only** inside the
`RichText` component, which is the single permitted use of that API in the
codebase. See `07-CODING-STANDARDS.md` §6.

### 6.3 Meta reading and shaping

Meta keys never reach the frontend. Each shaper names its output keys literally,
so the `_gotg_*` → camelCase mapping in `03-CONTENT-MODEL.md` §0.3 is auditable
by reading the function.

```php
<?php
/**
 * Shapes a menu item post into the API menu item object.
 *
 * Call update_meta_cache() for the full ID set before invoking this in a loop.
 *
 * @param WP_Post $post Menu item post.
 * @return array|null Shaped item, or null when the item must be excluded.
 */
function gotg_shape_menu_item( WP_Post $post ) {
	if ( ! get_post_meta( $post->ID, '_gotg_is_available', true ) ) {
		return null;
	}

	$variants = gotg_shape_price_variants(
		get_post_meta( $post->ID, '_gotg_price_variants', true )
	);

	if ( empty( $variants ) ) {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				sprintf( 'gotg: menu item %d has no price variants; excluded.', $post->ID )
			);
		}

		return null;
	}

	$item = array(
		'id'            => (int) $post->ID,
		'slug'          => (string) $post->post_name,
		'name'          => (string) get_the_title( $post ),
		'priceVariants' => $variants,
		'availability'  => gotg_shape_availability( $post->ID ),
		'dietaryTags'   => gotg_shape_dietary_tags( $post->ID ),
		'isFeatured'    => (bool) get_post_meta( $post->ID, '_gotg_is_featured', true ),
		'spiceLevel'    => gotg_shape_spice_level( $post->ID ),
	);

	$description = (string) get_post_meta( $post->ID, '_gotg_description', true );

	if ( '' !== $description ) {
		$item['description'] = $description;
	}

	$image = gotg_shape_image( get_post_thumbnail_id( $post->ID ), 'gotg_card' );

	if ( null !== $image ) {
		$item['image'] = $image;
	}

	return $item;
}

/**
 * Shapes stored price variants into the API array.
 *
 * Drops rows with a non-positive amount and omits empty labels per ADR-0022.
 *
 * @param mixed $stored Raw _gotg_price_variants meta value.
 * @return array List of shaped variant objects.
 */
function gotg_shape_price_variants( $stored ) {
	if ( ! is_array( $stored ) ) {
		return array();
	}

	$shaped = array();

	foreach ( $stored as $row ) {
		if ( ! is_array( $row ) || ! isset( $row['amount'] ) ) {
			continue;
		}

		$amount = round( (float) $row['amount'], 2 );

		if ( $amount < 0 ) {
			continue;
		}

		$variant = array( 'amount' => $amount );
		$label   = isset( $row['label'] ) ? trim( (string) $row['label'] ) : '';

		if ( '' !== $label ) {
			$variant['label'] = $label;
		}

		$shaped[] = $variant;
	}

	return $shaped;
}
```

The `if ( '' !== $description )` pattern is how ADR-0022 is implemented: an empty
optional value produces an absent key, not `""` and not `null`. Every optional
field in every shaper follows it.

### 6.4 Route registration pattern

Every endpoint follows this shape. No route logic lives in the theme.

```php
<?php
/**
 * Registers the gotg/v1 content routes.
 *
 * @return void
 */
function gotg_register_rest_routes() {
	$routes = array(
		'home'    => 'gotg_rest_home',
		'menu'    => 'gotg_rest_menu',
		'events'  => 'gotg_rest_events',
		'about'   => 'gotg_rest_about',
		'contact' => 'gotg_rest_contact',
	);

	foreach ( $routes as $slug => $callback ) {
		register_rest_route(
			'gotg/v1',
			'/' . $slug,
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => $callback,
				'permission_callback' => 'gotg_rest_permission',
				'args'                => array(
					'preview'   => array(
						'type'              => 'boolean',
						'default'           => false,
						'sanitize_callback' => 'rest_sanitize_boolean',
					),
					'previewId' => array(
						'type'              => 'integer',
						'required'          => false,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);
	}
}
add_action( 'rest_api_init', 'gotg_register_rest_routes' );

/**
 * Allows anonymous reads, but requires edit capability for preview requests.
 *
 * @param WP_REST_Request $request Incoming request.
 * @return bool|WP_Error True when permitted, WP_Error otherwise.
 */
function gotg_rest_permission( WP_REST_Request $request ) {
	if ( ! $request->get_param( 'preview' ) ) {
		return true;
	}

	if ( current_user_can( 'edit_posts' ) ) {
		return true;
	}

	return new WP_Error(
		'gotg_preview_forbidden',
		__( 'Preview requires an authenticated editor.', 'gotg' ),
		array( 'status' => 401 )
	);
}
```

---

## 7. Error Contract

All errors use the WordPress REST error envelope.

```ts
export interface ApiError {
  code: string;
  message: string;
  data: { status: number };
}
```

| HTTP | `code` | Cause | Frontend behaviour |
|---|---|---|---|
| 404 | `gotg_page_not_found` | The backing `page` post is missing or unpublished | Build fails loudly. This is a configuration error, not a user-facing 404. |
| 500 | `gotg_missing_primary_location` | Site Settings has no primary location | Build fails. Deployment blocked. |
| 500 | `gotg_settings_unavailable` | The `gotg_site_settings` option is missing or holds no usable data | Build fails. |
| 401 | `gotg_preview_forbidden` | `preview=1` without an authenticated editor | Preview route returns 401 and clears the draft cookie |
| 503 | *(host-level)* | WordPress is down or unreachable | See §7.1 |

### 7.1 Frontend failure behaviour

| Situation | Behaviour |
|---|---|
| Build-time fetch fails | The build fails. A broken build is preferable to deploying a site with missing content. |
| ISR revalidation fetch fails | Next.js serves the last successful static render and retries on the next request. The user sees stale-but-correct content. This is the primary resilience mechanism. |
| Runtime fetch on a dynamic route fails | `error.tsx` boundary renders a message with the phone number and a retry action. |
| Response parses but fails the Zod schema in development | Throws with the Zod issue path. In production the schema is not run at request time; contract tests cover it pre-deploy. See `01-TECH-STACK.md` §3.2. |

Consequence: WordPress can be offline for hours without the public site
degrading, because no user request ever reaches WordPress. This is the main
operational argument for the static-plus-ISR strategy.

---

## 8. Cache and Revalidation Policy

| Endpoint | `revalidate` | Tag | On-demand triggers |
|---|---|---|---|
| `home` | 3600 | `home` | `home` page save; any `gotg_menu_item` save/delete; any `gotg_event` save/delete; Site Settings save |
| `menu` | 3600 | `menu` | `menu` page save; any `gotg_menu_item` save/delete; `gotg_menu_section` or `gotg_dietary` term change; Site Settings save |
| `events` | 900 | `events` | `events` page save; any `gotg_event` save/delete; Site Settings save |
| `about` | 86400 | `about` | `about` page save; referenced `gotg_block` save; Site Settings save |
| `contact` | 86400 | `contact` | `contact` page save; `gotg_location` save; Site Settings save |

Both mechanisms are active. Time-based revalidation is the safety net for a lost
webhook; on-demand revalidation is the mechanism editors experience. An editor
who saves a price sees it live within seconds; if the webhook fails silently,
the same change appears within the hour.

Webhook implementation: `10-ENVIRONMENTS-DEPLOYMENT.md` §6.

---

## 9. Preview and Draft Access

### 9.1 Flow

1. An editor clicks **Preview** in `wp-admin`. WordPress redirects to
   `{FRONTEND_URL}/preview?secret={PREVIEW_SECRET}&path=/menu&id=412`.
2. `frontend/src/app/preview/route.ts` validates `secret` against
   `PREVIEW_SECRET`. A mismatch returns 401 with no further detail.
3. On success it calls `draftMode().enable()` and redirects to `path`.
4. Page components read `draftMode().isEnabled`. When enabled, `fetchEndpoint`
   appends `?preview=1&previewId={id}`, sets `cache: 'no-store'`, and adds an
   `Authorization: Basic` header built from `WP_PREVIEW_USER` and
   `WP_PREVIEW_APP_PASSWORD`.
5. WordPress `gotg_rest_permission` authenticates the Application Password and
   the shaper substitutes the draft revision for the published post.
6. `frontend/src/app/preview/exit/route.ts` calls `draftMode().disable()`.

### 9.2 Preview route handler

```ts
// frontend/src/app/preview/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

const ALLOWED_PATHS = new Set(['/', '/menu', '/events', '/about', '/contact']);

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const path = searchParams.get('path') ?? '/';

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid preview token', { status: 401 });
  }

  const isAllowed =
    ALLOWED_PATHS.has(path) || /^\/events\/[a-z0-9-]+$/.test(path);

  if (!isAllowed) {
    return new Response('Invalid preview path', { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(path);
}
```

The `ALLOWED_PATHS` check exists because an unvalidated `path` parameter feeding
`redirect()` is an open-redirect vulnerability.

### 9.3 Locking down core REST

Anonymous access to `/wp/v2/*` is denied so the shaped contract is the only
public surface.

```php
<?php
/**
 * Denies anonymous access to core REST namespaces.
 *
 * The gotg/v1 namespace remains public; wp/v2 and oembed require authentication.
 *
 * @param WP_Error|null|true $result Existing authentication result.
 * @return WP_Error|null|true
 */
function gotg_restrict_core_rest( $result ) {
	if ( ! empty( $result ) ) {
		return $result;
	}

	$route = isset( $GLOBALS['wp']->query_vars['rest_route'] )
		? (string) $GLOBALS['wp']->query_vars['rest_route']
		: '';

	if ( 0 === strpos( $route, '/gotg/v1' ) ) {
		return $result;
	}

	if ( is_user_logged_in() ) {
		return $result;
	}

	return new WP_Error(
		'gotg_rest_forbidden',
		__( 'This API is not publicly available.', 'gotg' ),
		array( 'status' => 401 )
	);
}
add_filter( 'rest_authentication_errors', 'gotg_restrict_core_rest' );
```

---

## 10. Type-Sync Verification

`frontend/src/types/api.ts` is hand-written. Nothing generates it. The guard
against drift is the contract test described in `01-TECH-STACK.md` §3.2:

1. `frontend/src/types/api.schema.ts` declares a Zod schema per top-level
   response, in `.strict()` mode.
2. A compile-time assertion binds each schema to its interface:
   ```ts
   import type { z } from 'zod';
   import type { HomeResponse } from './api';
   import { HomeResponseSchema } from './api.schema';

   type SchemaMatchesInterface = z.infer<typeof HomeResponseSchema> extends HomeResponse
     ? HomeResponse extends z.infer<typeof HomeResponseSchema>
       ? true
       : never
     : never;

   export const homeSchemaIsExact: SchemaMatchesInterface = true;
   ```
   If the schema and the interface diverge, `homeSchemaIsExact` fails to
   type-check.
3. `pnpm test:contract` fetches all five endpoints from staging and parses each
   response with its schema. Extra keys and missing keys both fail the run.
4. The job runs on every PR in both repositories and on every staging deploy.

Registered as risk R-04 in `11-PROJECT-PLAN.md`.
