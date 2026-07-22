# 01 — Tech Stack

Status: **Living**
Last reviewed: 2026-07-22

Decisions marked **DECIDED — DO NOT RE-EVALUATE** are settled. The alternative
column for those rows records why the road not taken was rejected; it is not an
invitation to reopen the choice. Reopening requires a superseding ADR in
`12-GLOSSARY-DECISIONS.md`.

---

## 1. Stack Summary

| Layer | Choice | Status | Named alternative | Why not chosen |
|---|---|---|---|---|
| Frontend framework | Next.js 15 (App Router) | DECIDED | Astro 5 | Weaker incremental/on-demand revalidation story and no first-class Server Component data model for the preview flow |
| Language | TypeScript 5.6+, `strict` | DECIDED | JavaScript + JSDoc | Response shapes are hand-maintained; the compiler is the only enforcement mechanism available |
| Rendering strategy | Static generation + ISR, on-demand revalidation | DECIDED | Full SSR per request | Menu and hours change daily at most; per-request rendering wastes TTFB budget |
| WordPress data layer | Custom REST routes, namespace `gotg/v1` | DECIDED | WPGraphQL | Adds a plugin dependency, a schema surface, and query-cost risk for a five-page site with fixed payloads |
| CMS | WordPress 6.7+ (headless) | DECIDED | Sanity / Payload | Client familiarity and existing Studio environment; no migration budget |
| Field engine | Native `register_post_meta()` + hand-built meta boxes | DECIDED | ACF PRO | Recurring licence the client will not fund; the frontend never touches the fields layer, so the authoring mechanism is a backend implementation detail — see ADR-0025 |
| Styling | Tailwind CSS 4 + CSS custom properties | Recommended | CSS Modules + vanilla-extract | Token-to-utility mapping in `05-DESIGN-SYSTEM.md` is direct; smaller authored CSS surface |
| Package manager | pnpm 9 | Recommended | npm | Faster installs, strict node_modules prevents phantom dependencies |
| Node runtime | Node 22 LTS | Recommended | Node 20 LTS | 22 is LTS through 2027; matches Vercel default |
| Frontend hosting | Vercel (Pro) | Recommended — **budget approval required** | Netlify | ISR and on-demand revalidation are first-party on Vercel; Netlify equivalent requires adapter configuration |
| WordPress hosting | WP Engine or Kinsta, managed tier | Recommended — **budget approval required** | Self-managed VPS (DigitalOcean + SpinupWP) | Lower monthly cost but transfers backup, patching, and uptime responsibility to the build team |
| Database (staging/prod) | MySQL 8.0 (managed by host) | DECIDED | PostgreSQL | WordPress core does not support it |
| Database (local) | SQLite via Studio `sqlite-database-integration` | DECIDED (pre-existing) | Local MySQL via Docker | Studio provides SQLite with zero setup; parity risk is documented and mitigated — see `10-ENVIRONMENTS-DEPLOYMENT.md` §7 |
| Media pipeline | WordPress uploads → Next.js `<Image>` with remote loader | Recommended | Cloudinary | Adds a vendor and a monthly cost for transformations Next.js already performs |
| Forms | Formspark or Resend-backed Next.js Server Action | Pending — see `09-INTEGRATIONS.md` | Gravity Forms on WordPress | Requires exposing a second WordPress surface and a second licence |
| Analytics | GA4 + Vercel Analytics | Recommended | Plausible | Client likely already holds GA4 property (DP-17); GA4 integrates with Google Business Profile reporting |
| Error tracking | Sentry (free tier) | Recommended | Vercel logs only | No aggregation, no release tracking, no source-mapped stack traces |
| CI | GitHub Actions | Recommended | Vercel-only checks | Backend repo also needs lint/PHPCS; one CI system for both repos |

---

## 2. Frontend Framework and Rendering Strategy

### 2.1 Framework

Next.js 15, App Router, TypeScript, React Server Components.

### 2.2 Rendering mode per route

| Route | Mode | `revalidate` | On-demand revalidation tag | Rationale |
|---|---|---|---|---|
| `/` | Static + ISR | 3600 | `home` | Hero, featured items, next events. Changes on publish. |
| `/menu` | Static + ISR | 3600 | `menu` | Prices change infrequently but must be correct within an hour of edit. |
| `/events` | Static + ISR | 900 | `events` | Time-sensitive; an event that has passed must drop off promptly. |
| `/about` | Static + ISR | 86400 | `about` | Near-static content. |
| `/contact` | Static + ISR | 86400 | `contact` | Hours and phone; changed rarely, but must be correct — on-demand tag covers urgency. |
| `/api/revalidate` | Dynamic (Route Handler) | — | — | Receives WordPress webhook. This is the **only** permitted Next.js route handler. |
| `/preview` | Dynamic, `no-store` | — | — | Draft access; never cached. |

Rule 7 of the data-layer decision prohibits Next.js route handlers that proxy
WordPress. `/api/revalidate` and `/preview` are not proxies — they are control
endpoints — and are therefore permitted. No other `/api/*` route may be created.

### 2.3 Data fetching location

All WordPress reads happen in Server Components (or in `generateMetadata`) via
`fetch()`. No `useEffect` fetching. No client-side data libraries (no SWR, no
TanStack Query, no Apollo). Client Components receive data as serialisable props.

---

## 3. WordPress Data Layer

**DECIDED: custom REST routes under `gotg/v1`. WPGraphQL is not installed.**

Full contract in `04-API-CONTRACT.md`. Recorded as ADR-0003.

### 3.1 Recorded tradeoffs of this choice

These are accepted costs, not open questions.

| Tradeoff | Detail | Accepted mitigation |
|---|---|---|
| Hand-written PHP per endpoint vs. a generic query layer | Five endpoints are five hand-written PHP shaper functions. A generic layer (WPGraphQL, or `/wp/v2` + client composition) would need no per-page code. | Five pages is a small, bounded surface. Shared shaper helpers (`gotg_shape_menu_item()`, `gotg_shape_event()`, `gotg_build_global()`) prevent duplication. A sixth page costs roughly 0.5 developer-days of backend work. |
| No generated types; manual TS interface maintenance | Nothing derives `types/api.ts` from PHP. Drift between PHP output and TypeScript interfaces is invisible to the compiler. | Contract tests: a CI job hits each endpoint on staging and validates the response against a Zod schema generated from the same interfaces. See §3.2. Risk registered as R-04 in `11-PROJECT-PLAN.md`. |
| Adding a frontend field requires a backend change and deploy | A frontend developer cannot add a field to a card without a PHP edit, a backend PR, and a WordPress deploy. Two repos, two review cycles. | Batch field additions per phase. Backend deploys are cheap (rsync/Git deploy of mu-plugins, no build step). Accepted in exchange for a payload the frontend cannot over-fetch. |
| `_global` duplication across payloads | Every endpoint repeats site settings, navigation, hours, and SEO defaults — roughly 2–4 KB of the payload. | Payloads are fetched at build/revalidation time, not per user request, so the duplication costs build bandwidth, not user bandwidth. Gzip reduces the repeated block to a few hundred bytes on the wire. A separate `_global` fetch would add a second round trip per page build and reintroduce composition, which rule 2 prohibits. |

### 3.2 Type-sync verification step

Required, runs in CI on both repos and on every staging deploy:

1. `frontend/src/types/api.ts` holds the hand-written interfaces (source of truth
   is `04-API-CONTRACT.md`).
2. `frontend/src/types/api.schema.ts` holds a Zod schema per top-level response,
   hand-maintained alongside the interface, with
   `z.infer<typeof HomeResponseSchema>` asserted assignable to `HomeResponse`
   via a `satisfies` type test. A mismatch between the two is a compile error.
3. `pnpm test:contract` fetches each `gotg/v1` endpoint from the staging
   WordPress and parses it with the Zod schema in `.strict()` mode. Unknown keys
   and missing keys both fail.
4. The job fails the PR. It does not warn.

This makes drift a build failure rather than a runtime `undefined`.

---

## 4. Required WordPress Plugins

**The plugin list is deliberately near-empty.** Three plugins run on production,
none of them commercial. Every project-specific behaviour is code in
`mu-plugins/`, which cannot be deactivated, cannot lapse, and is version
controlled.

| Plugin | Purpose | Licence tier | Cost | Approval |
|---|---|---|---|---|
| `sqlite-database-integration` | SQLite driver — **local only**, provided by Studio | Free (WordPress.org) | $0 | Local only; must not be active on staging or production |
| Redis Object Cache | Object caching on staging/production | Free | $0 (host must provide Redis) | Host-dependent |
| Safe SVG | Sanitised SVG upload for the logo | Free | $0 | — |
| WP Migrate (Lite) or WP-CLI `db export` | Content transfer between environments | Lite free | $0 | Optional; WP-CLI suffices |
| **Advanced Custom Fields (PRO or free)** | **NOT installed.** Fields are native post meta with hand-built meta boxes. | — | — | Rejected — see §4.1 and ADR-0025 |
| Meta Box, Carbon Fields, Pods | **NOT installed.** Same reasoning as ACF. | — | — | Rejected — ADR-0025 |
| Yoast SEO | **NOT installed.** Metadata is authored in `_gotg_seo_*` post meta and rendered by Next.js. | — | — | Rejected — see §4.2 |
| WPGraphQL | **PROHIBITED.** See ADR-0003. | — | — | Rejected |
| Any caching plugin producing HTML (WP Super Cache, W3TC page cache) | **PROHIBITED.** WordPress renders no HTML in this project; page caches interfere with REST responses. | — | — | Rejected |

### 4.1 Why no custom-fields plugin

Fields are registered with `register_post_meta()` and `register_term_meta()` in
`mu-plugins/`; admin editing is hand-built with `add_meta_box()`. Full
specification in `03-CONTENT-MODEL.md`; decision recorded as ADR-0025.

| Alternative | Cost | Why not chosen |
|---|---|---|
| **ACF PRO 6.x** | ~$49/yr per site, or ~$249/yr agency | A recurring cost the client will not fund. Also a hard dependency: a lapsed licence or a removed plugin takes the entire authoring layer with it. |
| **ACF free** | $0 | No Repeater field. The price model requires repeating rows (`03-CONTENT-MODEL.md` §3.4), and hours, navigation, and the page builder all repeat. The free tier cannot express this content model. |
| **Meta Box** | Free core, ~$99/yr for the repeater and builder extensions | The features actually needed here sit behind the paid extensions, so it lands in the same place as ACF PRO with less client familiarity. |
| **Carbon Fields** | $0, MIT, Composer-installed | Genuinely free and capable, but it is a small-maintainer dependency with a narrow contributor base, and it would still put a third-party abstraction between the schema and the database for a nine-object model. |

The decisive point is that **the frontend never touches the fields layer.** It
consumes JSON from `gotg/v1`; the response shapes in `04-API-CONTRACT.md` are
identical whichever mechanism stores the data. The authoring mechanism is a
backend implementation detail, so it should be chosen on cost, dependency risk,
and control — not on developer convenience.

Recorded tradeoff, stated plainly:

| Dimension | Native meta | ACF PRO |
|---|---|---|
| Recurring cost | $0 | ~$49–249/yr |
| Plugin dependencies | Zero | One, commercial, load-bearing |
| Build cost | **+4.5 developer-days** — meta registration, six meta boxes, the repeater component and its JS, media wiring, roles | Baseline |
| Ongoing maintenance | Project code, reviewed and tested like the rest | Vendor updates, licence renewal |
| Admin polish at launch | Lower — plain WordPress form controls | Higher — a mature, designed UI |
| Control over admin markup | Total, including accessibility | Constrained by the vendor's output |
| Data portability | Plain post meta, readable by any code | Plain post meta, but field *definitions* live in the plugin |

Higher build cost is real and is budgeted, not waved away — see the Phase 1 tasks
in `11-PROJECT-PLAN.md`. The offset is zero recurring cost, zero dependency risk,
and full control of admin accessibility.

### 4.2 Why no SEO plugin

Yoast and RankMath generate `<head>` output for a WordPress theme that does not
exist here. Their REST exposure of computed metadata is incidental and version-
fragile. Metadata is instead explicit post meta (`_gotg_seo_title`,
`_gotg_seo_description`, `_gotg_seo_image_id`, `_gotg_seo_noindex`,
`_gotg_seo_canonical`; see `03-CONTENT-MODEL.md` §10.1) surfaced through
`gotg/v1` and rendered by Next.js `generateMetadata`. Alternative considered:
Yoast + `yoast-seo-rest-api` head endpoint — rejected because it returns a
rendered HTML string, violating data layer rule 4 (no raw dumps, camelCase
shaped fields).

---

## 5. Hosting

### 5.1 Frontend — Vercel Pro

| Requirement | Vercel Pro | Netlify (alternative) |
|---|---|---|
| ISR with `revalidate` | Native | Requires `@netlify/plugin-nextjs` adapter |
| On-demand revalidation by tag | Native (`revalidateTag`) | Supported, adapter-mediated |
| Preview deploys per PR | Yes | Yes |
| Image optimisation | Built in, counted against plan quota | Netlify Image CDN |
| Cost | ~$20/user/month | ~$19/member/month |

**Recommendation: Vercel Pro. Requires client budget approval (DP-16).**
The Hobby tier is not viable: it prohibits commercial use.

### 5.2 WordPress — managed WordPress host

| Criterion | Requirement |
|---|---|
| PHP | 8.2 or 8.3 |
| Database | MySQL 8.0 or MariaDB 10.6+ |
| Object cache | Redis available |
| Staging environment | One-click, with database push/pull |
| Automated backups | Daily minimum, 30-day retention |
| SSL | Included, auto-renewing |
| WAF / brute-force protection | Included (WordPress admin is publicly reachable) |

**Recommendation: WP Engine Startup or Kinsta Starter (~$20–35/month).**
Requires client budget approval (DP-16).
Alternative: DigitalOcean droplet + SpinupWP (~$12/month + $12/month SpinupWP) —
not chosen because it makes the build team responsible for security patching and
uptime with no contracted support path.

WordPress serves JSON only. It is never the origin for a user-facing page.

---

## 6. Image and Media Pipeline

| Stage | Mechanism |
|---|---|
| Upload | WordPress Media Library on the WordPress host |
| Storage | Host filesystem (`wp-content/uploads/`), backed up by host |
| Registered sizes | `gotg_thumb` 96×96 crop, `gotg_card` 800×600 crop, `gotg_hero` 2400×1350 crop, plus WordPress `full`. Registered in mu-plugins. |
| Delivery | Next.js `<Image>` with `remotePatterns` allowing the WordPress host |
| Formats served | AVIF, then WebP, then original — configured in `next.config.ts` `images.formats` |
| Placeholder | `blurDataURL` — a base64 LQIP generated in PHP at upload and returned in the API payload as `image.blurDataUrl` |
| Alt text | Required. Sourced from WordPress attachment alt field, surfaced as `image.alt`. Empty alt is permitted only for decorative images and must be explicit. |

Alternative considered: Cloudinary or imgix. Not chosen — adds ~$30–99/month and
a second media source of truth for transformations Next.js Image already
performs at Vercel's edge.

`[ASSUMPTION] The WordPress host permits hotlinking from Vercel's image
optimiser. Verify before launch; if blocked, add a signed-URL loader.`

---

## 7. Caching and Revalidation

Chosen approach: **time-based ISR as a floor, on-demand tag revalidation as the
primary freshness mechanism.** Both are active. Neither alone is sufficient —
time-based alone is too slow for a price correction; on-demand alone fails
silently if a webhook is lost.

### 7.1 Fetch configuration (frontend)

```ts
// frontend/src/lib/api.ts
const WP_API_BASE = process.env.WP_API_BASE_URL;

export async function fetchEndpoint<T>(
  path: string,
  tag: string,
  revalidate: number
): Promise<T> {
  if (!WP_API_BASE) {
    throw new Error('WP_API_BASE_URL is not set');
  }

  const response = await fetch(`${WP_API_BASE}/wp-json/gotg/v1/${path}`, {
    next: { tags: [tag], revalidate },
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `gotg/v1/${path} responded ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as T;
}
```

### 7.2 On-demand trigger (WordPress)

WordPress fires a webhook to Vercel on `save_post`, `before_delete_post`,
`wp_trash_post`, the `gotg_menu_section` and `gotg_dietary` term hooks, and
`update_option_gotg_site_settings`. Full implementation in
`10-ENVIRONMENTS-DEPLOYMENT.md` §6.

Tag mapping:

| WordPress change | Tags revalidated |
|---|---|
| `gotg_menu_item` saved/deleted | `menu`, `home` |
| `gotg_event` saved/deleted | `events`, `home` |
| `gotg_location` saved | `contact`, `home` |
| Page `about` saved | `about` |
| Page `contact` saved | `contact` |
| Page `home` saved | `home` |
| Site Settings options saved | `home`, `menu`, `events`, `about`, `contact` |
| Taxonomy term edited (`gotg_menu_section`, `gotg_dietary`) | `menu`, `home` |

Site Settings feeds `_global`, which is present in every payload — hence the
full invalidation. This is the operational cost of `_global` duplication noted
in §3.1 and is acceptable because settings changes are rare.

---

## 8. Environment Topology

| Environment | Frontend | WordPress | Database | Purpose |
|---|---|---|---|---|
| Local | `localhost:3000` (Next dev) | Studio site, `http://localhost:<studio-port>` | SQLite | Development |
| Preview | Vercel per-PR deploy | Staging WordPress | MySQL (staging) | PR review |
| Staging | `staging.<domain>` | `cms-staging.<domain>` | MySQL (staging) | Client UAT, contract tests |
| Production | `<domain>` | `cms.<domain>` | MySQL (production) | Live |

Full matrix, URLs, and access control in `10-ENVIRONMENTS-DEPLOYMENT.md`.

---

## 9. Frontend Tooling

| Concern | Choice | Config location |
|---|---|---|
| Package manager | pnpm 9, `packageManager` field pinned in `package.json` | `frontend/package.json` |
| Node version | 22 LTS, pinned via `.nvmrc` and `engines` | `frontend/.nvmrc` |
| TypeScript | 5.6+, `strict: true` plus the additional flags in §9.1 | `frontend/tsconfig.json` |
| Linting | ESLint 9 flat config, `next/core-web-vitals`, `@typescript-eslint` strict-type-checked, `jsx-a11y` | `frontend/eslint.config.mjs` |
| Formatting | Prettier 3 + `prettier-plugin-tailwindcss` | `frontend/.prettierrc` |
| Unit tests | Vitest | `frontend/vitest.config.ts` |
| E2E / a11y | Playwright + `@axe-core/playwright` | `frontend/playwright.config.ts` |
| Git hooks | Husky + lint-staged | `frontend/.husky/` |

### 9.1 TypeScript posture

`strict: true` is the floor, not the target. Required additional flags:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowUnreachableCode": false,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "incremental": true,
    "verbatimModuleSyntax": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] },
    "baseUrl": "."
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are non-negotiable:
API payloads contain optional fields and arrays that may be empty, and these two
flags are what force the empty-state handling required by `04-API-CONTRACT.md`.

---

## 10. Backend Tooling

| Concern | Choice |
|---|---|
| PHP version target | 8.2 (matches staging/production minimum) |
| Coding standard | WordPress Coding Standards via PHP_CodeSniffer (`phpcs`) |
| Static analysis | PHPStan level 5 with `szepeviktor/phpstan-wordpress` |
| Field definitions | `register_post_meta()` and `register_term_meta()` in `mu-plugins/gotg/meta.php`. No JSON sync, no database-stored definitions. |
| Admin UI | `add_meta_box()` with hand-written markup; one vanilla-JS file for repeaters, one for the block builder. No build step for admin assets. |
| CLI | WP-CLI for migrations, exports, and search-replace |

---

## 11. Choices Requiring Client Budget Approval

| Item | Estimated cost | Blocking |
|---|---|---|
| Vercel Pro | ~$20/month | Production launch |
| Managed WordPress hosting | ~$20–35/month | Staging setup |
| Sentry | $0 (free tier likely sufficient at this traffic) | No |
| Form/email delivery vendor | $0–20/month — see `09-INTEGRATIONS.md` | Contact form launch |
| Photography | `[NEEDS CLIENT INPUT]` — see DP-12 | Design quality ceiling |

**There is no software licence cost.** Every plugin in §4 is free, and the fields
layer is project code. The former ACF PRO line (~$49/yr, and a hard blocker on
the content model) is removed by ADR-0025.

Total recurring floor, excluding photography and forms: **~$40–55/month, with no
annual licence.** `[ASSUMPTION] Domain registration and email hosting are
existing client costs, unchanged by this project.`
