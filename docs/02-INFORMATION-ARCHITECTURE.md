# 02 — Information Architecture

Status: **Living**
Last reviewed: 2026-07-22

Scope note: Phase 1 ships exactly five routes, matching the five `gotg/v1`
endpoints defined in `04-API-CONTRACT.md`. Phase 2 routes are specified here so
navigation and redirect planning account for them, but they are not built in
Phase 1 and have no endpoint yet.

---

## 1. Sitemap

```
/                               Home                    [Phase 1]
├── /menu                       Menu                    [Phase 1]
├── /events                     Events                  [Phase 1]
│   └── /events/[slug]          Event detail            [Phase 1]
├── /about                      About                   [Phase 1]
├── /contact                    Contact & Hours         [Phase 1]
│
├── /catering                   Catering                [Phase 2 — DP-05]
├── /private-events             Private Events          [Phase 2 — DP-06]
├── /gift-cards                 Gift Cards              [Phase 2 — DP-07]
│
├── /privacy-policy             Privacy Policy          [Phase 1 — legal]
├── /accessibility              Accessibility Statement [Phase 1 — legal]
│
├── /sitemap.xml                Generated               [Phase 1]
├── /robots.txt                 Generated               [Phase 1]
└── /404                        Not Found               [Phase 1]
```

Depth is capped at two levels. No page in Phase 1 is more than one click from
the primary navigation.

`/events/[slug]` is rendered from data already present in the `/events` endpoint
payload; it issues no additional request. See `04-API-CONTRACT.md` §5.3.

---

## 2. Page Specifications

### 2.1 Home

| Property | Value |
|---|---|
| Slug | `/` |
| Endpoint | `GET /wp-json/gotg/v1/home` |
| Purpose | Answer "what is this place, is it open, and what do they serve" in under five seconds; route the visitor to Menu. |
| Primary CTA | **View Menu** → `/menu` |
| Secondary CTAs | Call (`tel:8058422947`), Get Directions |
| Audience priority | Golfers (1), local diners (2) |
| Revalidate | 3600s, tag `home` |

Content blocks, in render order:

| # | Block | Component | Data source | Notes |
|---|---|---|---|---|
| 1 | Header / primary nav | `SiteHeader` | `_global.navigation.primary` | Sticky on scroll |
| 2 | Hero | `Hero` | `home.hero` (page block) | Full-bleed image, wordmark, tagline, primary CTA. Priority-loaded image. |
| 3 | Open-now status bar | `HoursStatus` | `_global.hours` | Client Component — computes open/closed from local time. See `06-COMPONENT-SPEC.md`. |
| 4 | Intro / positioning | `TextSection` | `home.intro` (page block) | Two to three sentences. American classics + smoked BBQ. |
| 5 | Featured menu items | `FeaturedMenuRow` | `home.featuredItems` (`gotg_menu_item` where `isFeatured` = true) | Max 6 items. Links to `/menu`. |
| 6 | Upcoming events | `EventsPreview` | `home.upcomingEvents` (next 3 `gotg_event`) | Hidden entirely if array is empty. |
| 7 | About teaser | `SplitFeature` | `home.aboutTeaser` (page block) | Mark and Marco. Links to `/about`. |
| 8 | Instagram feed | `InstagramFeed` | Third-party — see `09-INTEGRATIONS.md` | Client Component, lazy, below fold. Degrades to a profile link on failure. |
| 9 | Location and hours | `LocationCard` | `_global.location`, `_global.hours` | Static map image, address, hours table. |
| 10 | Footer | `SiteFooter` | `_global.navigation.footer`, `_global.social` | — |

---

### 2.2 Menu

| Property | Value |
|---|---|
| Slug | `/menu` |
| Endpoint | `GET /wp-json/gotg/v1/menu` |
| Purpose | Present the complete menu, filterable by daypart, with accurate prices. |
| Primary CTA | Call to order / reserve (`tel:8058422947`) — subject to DP-04, DP-08 |
| Audience priority | Golfers (1), local diners (2) |
| Revalidate | 3600s, tag `menu` |

| # | Block | Component | Data source | Notes |
|---|---|---|---|---|
| 1 | Header | `SiteHeader` | `_global.navigation.primary` | — |
| 2 | Page intro | `PageHeader` | `menu.title`, `menu.intro` | H1 lives here. |
| 3 | Daypart filter | `DaypartFilter` | `menu.dayparts` | Client Component. URL state via `?daypart=`. Defaults to the current daypart based on local time. |
| 4 | Section jump nav | `SectionNav` | `menu.sections[].title` | Sticky below header at `md`+. Anchor links. |
| 5 | Menu sections | `MenuSection` × n | `menu.sections` (`gotg_menu_section` terms) | Ordered by term `menuOrder`. |
| 6 | Menu items | `MenuCard` × n | `menu.sections[].items` (`gotg_menu_item`) | — |
| 7 | Dietary legend | `DietaryLegend` | `menu.dietaryTags` (`gotg_dietary` terms) | Omitted if no item carries a tag. |
| 8 | Menu disclaimer | `TextSection` | `menu.disclaimer` | Allergen and price-change notice. Subject to DP-22. |
| 9 | Footer | `SiteFooter` | `_global` | — |

Constraint: the menu is one page. Per-section pages are rejected — golfers on
cellular should not pay a navigation round trip to find a sandwich.

---

### 2.3 Events

| Property | Value |
|---|---|
| Slug | `/events` |
| Endpoint | `GET /wp-json/gotg/v1/events` |
| Purpose | List upcoming live music and special events with date, time, and performer. |
| Primary CTA | Add to Calendar (`.ics` download) |
| Audience priority | Event-goers (3) |
| Revalidate | 900s, tag `events` |

| # | Block | Component | Data source | Notes |
|---|---|---|---|---|
| 1 | Header | `SiteHeader` | `_global` | — |
| 2 | Page intro | `PageHeader` | `events.title`, `events.intro` | States the standing Fri/Sat 6–9pm programme. |
| 3 | Recurring programme card | `RecurringProgrammeCard` | `events.recurring` | Standing weekly live music. Not an event record. |
| 4 | Upcoming events list | `EventCard` × n | `events.upcoming` | Empty state: "No dated events scheduled — live music continues every Friday and Saturday, 6–9pm." |
| 5 | Past events | — | — | **Not rendered.** Past events are excluded server-side. |
| 6 | Footer | `SiteFooter` | `_global` | — |

### 2.4 Event Detail

| Property | Value |
|---|---|
| Slug | `/events/[slug]` |
| Endpoint | None — derived from `/wp-json/gotg/v1/events` payload |
| Purpose | Indexable, shareable page per dated event; carries `Event` JSON-LD. |
| Primary CTA | Add to Calendar |
| Revalidate | 900s, tag `events` |

| # | Block | Component | Data source |
|---|---|---|---|
| 1 | Header | `SiteHeader` | `_global` |
| 2 | Event hero | `EventHero` | `events.upcoming[n]` matched by `slug` |
| 3 | Description | `RichText` | `event.description` |
| 4 | Add to calendar | `AddToCalendar` | `event` date fields |
| 5 | Location | `LocationCard` | `_global.location` |
| 6 | Other upcoming events | `EventsPreview` | remaining `events.upcoming` |
| 7 | Footer | `SiteFooter` | `_global` |

`generateStaticParams` reads the events endpoint and emits one route per
upcoming event. A slug not present returns `notFound()`.

---

### 2.5 About

| Property | Value |
|---|---|
| Slug | `/about` |
| Endpoint | `GET /wp-json/gotg/v1/about` |
| Purpose | Establish credibility: the owners, the smoker, the course setting. |
| Primary CTA | **View Menu** → `/menu` |
| Audience priority | Local diners (2) |
| Revalidate | 86400s, tag `about` |

| # | Block | Component | Data source | Notes |
|---|---|---|---|---|
| 1 | Header | `SiteHeader` | `_global` | — |
| 2 | Page header | `PageHeader` | `about.title`, `about.intro` | — |
| 3 | Story | `RichText` | `about.blocks[]` of type `text` | — |
| 4 | Owner profiles | `PersonCard` × 2 | `about.people` | Mark (golfer), Marco (BBQ chef). Copy is `[NEEDS CLIENT INPUT]`. |
| 5 | Gallery | `Gallery` | `about.blocks[]` of type `gallery` | Subject to DP-11, DP-12. |
| 6 | CTA band | `CtaBand` | `about.cta` | To `/menu`. |
| 7 | Footer | `SiteFooter` | `_global` | — |

---

### 2.6 Contact

| Property | Value |
|---|---|
| Slug | `/contact` |
| Endpoint | `GET /wp-json/gotg/v1/contact` |
| Purpose | Phone, address, hours, directions, and a general enquiry form. |
| Primary CTA | Call (`tel:8058422947`) |
| Audience priority | All |
| Revalidate | 86400s, tag `contact` |

| # | Block | Component | Data source | Notes |
|---|---|---|---|---|
| 1 | Header | `SiteHeader` | `_global` | — |
| 2 | Page header | `PageHeader` | `contact.title`, `contact.intro` | — |
| 3 | Contact details | `ContactDetails` | `_global.location`, `_global.phone`, `_global.email` | Phone is a `tel:` link on all breakpoints. |
| 4 | Hours table | `HoursTable` | `_global.hours` | Marks today's row. |
| 5 | Map | `MapEmbed` | `_global.location.mapUrl` | Static image + link out. Not an iframe by default — see `09-INTEGRATIONS.md`. |
| 6 | Enquiry form | `ContactForm` | Form vendor — `09-INTEGRATIONS.md` | Subject to DP-18. |
| 7 | Social links | `SocialLinks` | `_global.social` | — |
| 8 | Footer | `SiteFooter` | `_global` | — |

---

### 2.7 Legal Pages

| Slug | Purpose | Data source | Notes |
|---|---|---|---|
| `/privacy-policy` | Required by GA4 use and CCPA | Hardcoded MDX in the frontend repo | `[NEEDS CLIENT INPUT]` — client legal review required before launch |
| `/accessibility` | Public accessibility statement, conformance level, contact for issues | Hardcoded MDX | Drafted by build team |

Legal pages are hardcoded rather than CMS-managed: they change under legal
review, not editorial workflow, and version control is the appropriate audit
trail.

---

### 2.8 Phase 2 Pages

Not built in Phase 1. Listed so navigation and redirects can anticipate them.

| Slug | Purpose | Blocking decision |
|---|---|---|
| `/catering` | Catering packages, minimums, lead time, enquiry form | DP-05 |
| `/private-events` | Buyout and banquet capacity, packages | DP-06 |
| `/gift-cards` | Purchase or redemption path | DP-07 |

---

## 3. Navigation Structure

### 3.1 Primary Navigation (desktop, `md` and up)

| Order | Label | Target | Notes |
|---|---|---|---|
| 1 | Menu | `/menu` | — |
| 2 | Events | `/events` | — |
| 3 | About | `/about` | — |
| 4 | Contact | `/contact` | — |
| — | *(logo)* | `/` | Left-aligned wordmark, not a labelled nav item |
| CTA | Call 805-842-2947 | `tel:8058422947` | Right-aligned, `Button` variant `primary` |

Maximum five text items. Adding Phase 2 pages requires either replacing an item
or introducing a grouped dropdown; the dropdown is the fallback and its
accessibility contract is specified in `06-COMPONENT-SPEC.md` §`NavDropdown`.

Source: `_global.navigation.primary`. Editable in Site Settings — see
`03-CONTENT-MODEL.md`.

### 3.2 Mobile Navigation (below `md`)

| Element | Behaviour |
|---|---|
| Trigger | Hamburger button, `aria-expanded`, `aria-controls` |
| Panel | Full-screen overlay, `role="dialog"`, `aria-modal="true"` |
| Contents | Same four primary items, stacked, ≥48px touch targets |
| Persistent CTA | Fixed bottom bar with **Call** and **Menu**, visible on all mobile routes |
| Focus | Trapped inside panel while open; returns to trigger on close |
| Dismissal | Escape key, backdrop click, close button, route change |

The persistent bottom call bar exists because journey J1 (on-course, one-handed,
bright sunlight) is the highest-priority journey.

### 3.3 Footer Navigation

Four columns at `lg`, stacked at `sm`.

| Column | Contents | Source |
|---|---|---|
| 1 | Wordmark, tagline "Smoke your birdie", one-line description | `_global.site` |
| 2 | Explore: Menu, Events, About, Contact | `_global.navigation.footer` |
| 3 | Visit: address, phone (`tel:`), hours summary, Get Directions | `_global.location`, `_global.hours` |
| 4 | Follow: Instagram, plus other channels if supplied | `_global.social` |
| Bottom bar | © {year} {legalName} · Privacy Policy · Accessibility | `_global.site`, hardcoded links |

`[ASSUMPTION] Only Instagram is confirmed. Facebook, Yelp, and Google Business
Profile links are modelled but empty until supplied.`

### 3.4 Utility Navigation

| Element | Location | Behaviour |
|---|---|---|
| Skip to content | First focusable element in the DOM | Visually hidden until focused; targets `#main-content` |
| Open/Closed status | Header, right of nav at `md`+; below header on mobile | Live text: "Open until 9pm" / "Closed — opens 6am" |
| Breadcrumbs | `/events/[slug]` only | `Home / Events / {event title}`, with `BreadcrumbList` JSON-LD |

No search. Five pages do not warrant a search index, and a search box competes
with the Menu CTA for attention.

---

## 4. Redirect Map — Squarespace to New Site

All redirects are HTTP **301 (permanent)**, implemented in `next.config.ts`
`redirects()`. Redirects are matched case-insensitively; Squarespace URLs are
lowercase by convention.

### 4.1 Known existing URLs

| Squarespace path | New path | Status | Notes |
|---|---|---|---|
| `/` | `/` | 301 (domain-level) | Handled by DNS cutover, not a path redirect |
| `/home` | `/` | 301 | Squarespace often exposes both |
| `/events` | `/events` | 301 | Same slug |
| `/menu` | `/menu` | 301 | Same slug |
| `/about` | `/about` | 301 | Same slug |
| `/contact` | `/contact` | 301 | Same slug |

### 4.2 Squarespace platform paths

Squarespace generates additional routes that may have been indexed. These are
redirected defensively.

| Squarespace path | New path | Status |
|---|---|---|
| `/config` | `/` | 301 |
| `/index` | `/` | 301 |
| `/s/:path*` | `/` | 301 |
| `/blog` | `/` | 301 |
| `/blog/:slug` | `/` | 301 |
| `/shop` | `/` | 301 |
| `/gallery` | `/about` | 301 |
| `/gift-cards` | `/contact` | 301 (until Phase 2 ships `/gift-cards`) |
| `/reservations` | `/contact` | 301 (pending DP-04) |
| `/order` | `/menu` | 301 (pending DP-08) |
| `/catering` | `/contact` | 301 (until Phase 2 ships `/catering`) |
| `/private-events` | `/contact` | 301 (until Phase 2) |
| `/directions` | `/contact` | 301 |
| `/hours` | `/contact` | 301 |
| `/menus` | `/menu` | 301 |
| `/food` | `/menu` | 301 |
| `/lunch` | `/menu?daypart=lunch` | 301 |
| `/breakfast` | `/menu?daypart=breakfast` | 301 |
| `/dinner` | `/menu?daypart=dinner` | 301 |
| `/live-music` | `/events` | 301 |
| `/music` | `/events` | 301 |
| `/calendar` | `/events` | 301 |

`[ASSUMPTION] §4.2 paths are defensive. The authoritative list must come from a
Google Search Console export of indexed URLs plus a Screaming Frog crawl of the
Squarespace site, both performed before cutover. Task T-CD-02 in
11-PROJECT-PLAN.md. Any path not in this table falls through to the 404 page,
which must be monitored in Search Console for the first 90 days after cutover.`

### 4.3 Implementation

```ts
// frontend/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/index', destination: '/', permanent: true },
      { source: '/config', destination: '/', permanent: true },
      { source: '/s/:path*', destination: '/', permanent: true },
      { source: '/blog', destination: '/', permanent: true },
      { source: '/blog/:slug', destination: '/', permanent: true },
      { source: '/shop', destination: '/', permanent: true },
      { source: '/gallery', destination: '/about', permanent: true },
      { source: '/gift-cards', destination: '/contact', permanent: true },
      { source: '/reservations', destination: '/contact', permanent: true },
      { source: '/order', destination: '/menu', permanent: true },
      { source: '/catering', destination: '/contact', permanent: true },
      { source: '/private-events', destination: '/contact', permanent: true },
      { source: '/directions', destination: '/contact', permanent: true },
      { source: '/hours', destination: '/contact', permanent: true },
      { source: '/menus', destination: '/menu', permanent: true },
      { source: '/food', destination: '/menu', permanent: true },
      { source: '/lunch', destination: '/menu?daypart=lunch', permanent: true },
      {
        source: '/breakfast',
        destination: '/menu?daypart=breakfast',
        permanent: true,
      },
      { source: '/dinner', destination: '/menu?daypart=dinner', permanent: true },
      { source: '/live-music', destination: '/events', permanent: true },
      { source: '/music', destination: '/events', permanent: true },
      { source: '/calendar', destination: '/events', permanent: true },
    ];
  },
};

export default nextConfig;
```

When Phase 2 ships `/catering`, `/private-events`, or `/gift-cards`, the
corresponding redirect entry must be **removed** in the same PR that adds the
route. A redirect that shadows a real page is a silent 301 loop risk.

---

## 5. URL Conventions

| Rule | Detail |
|---|---|
| Case | Lowercase only |
| Word separator | Hyphen |
| Trailing slash | None. `trailingSlash: false` (Next.js default). |
| Query parameters | Used only for UI state that must be shareable: `?daypart=` on `/menu`. Never for content identity. |
| Canonical | Absolute, `https://{PRODUCTION_DOMAIN}{pathname}`, query parameters stripped. See `08-PERFORMANCE-SEO-A11Y.md`. |
| Nesting depth | Maximum two segments |
| Date in URL | Not used for events — event slugs are stable and human-readable |

`[NEEDS CLIENT INPUT] Production domain is unresolved — DP-14. All absolute URLs
in this document set use the placeholder {PRODUCTION_DOMAIN}.`
