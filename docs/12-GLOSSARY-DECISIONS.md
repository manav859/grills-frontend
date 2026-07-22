# 12 — Glossary and Decision Record

Status: **Living — append only for ADRs**
Last reviewed: 2026-07-22

ADRs are never edited after acceptance except to change `Status` to
`Superseded` and add a pointer to the superseding record. Correcting an accepted
decision means writing a new ADR, not rewriting history.

---

## Part 1 — Glossary

### 1.1 Project-specific

| Term | Definition |
|---|---|
| **GOTG** | Grill on the Green. The `gotg_` prefix on every WordPress-registered object derives from this. |
| **Backend repo** | `C:\Users\manav\Studio\grills` — the headless WordPress install. Governed by `AGENTS.md`. |
| **Frontend repo** | `D:\work\grills` — contains `/frontend` (Next.js) and `/docs`. |
| **Studio** | WordPress Studio, Automattic's local WordPress development application. Provides the local site and its SQLite database. |
| **Daypart** | A service period: `breakfast`, `lunch`, or `dinner`. A menu item declares which dayparts it is served in. |
| **Standing programme** | The recurring Friday and Saturday live music, 6–9pm. Modelled as configuration in Site Settings, not as repeated `gotg_event` records. |
| **Recurring instance** | A single dated `gotg_event` that is one night of the standing programme, flagged by `is_recurring_instance`. |
| **86'd** | Restaurant term for an item that has run out. Modelled as `is_available = false`, which excludes the item from the API payload without deleting it. |
| **Shaper** | A PHP function that converts WordPress objects into the exact camelCase response shape defined in `04-API-CONTRACT.md`. Named `gotg_shape_*`. |
| **`_global`** | The object present in every `gotg/v1` response carrying site settings, navigation, hours, location, social links, and SEO defaults. |
| **Page block** | One entry in the `_gotg_page_blocks` array. Reaches the API as a discriminated-union member keyed on `type`. |
| **Reusable block** | A `gotg_block` post referenced from a page. Resolved and inlined server-side; never visible as such in the API. |
| **Contract test** | A CI job that fetches every live endpoint from staging and validates the response against a strict Zod schema. The only automated guard against PHP/TypeScript drift. |
| **Decisions Pending (DP-nn)** | An unanswered client question tracked in `00-PROJECT-BRIEF.md` §8. Blocks specific work. |
| **`[ASSUMPTION]`** | An inline marker on a statement the build team made without client confirmation. |
| **`[NEEDS CLIENT INPUT]`** | An inline marker on information only the client can supply. |
| **Cutover** | The DNS switch from Squarespace to Vercel. Runbook in `10-ENVIRONMENTS-DEPLOYMENT.md` §9. |

### 1.2 WordPress

| Term | Definition |
|---|---|
| **Headless WordPress** | WordPress used as a content API only, rendering no public HTML. Here it serves `gotg/v1` JSON and nothing else. |
| **CPT** | Custom Post Type. A content type registered beyond WordPress's built-in posts and pages. |
| **Taxonomy** | A classification system for posts. Hierarchical (like categories) or flat (like tags). |
| **mu-plugins** | Must-Use plugins. PHP in `wp-content/mu-plugins/` that loads automatically and cannot be deactivated. All registration and API code lives here per `AGENTS.md`. |
| **Post meta** | A key–value pair attached to a post, stored in `wp_postmeta`. Every custom field in this project is post meta or term meta. Registered with `register_post_meta()`. |
| **Term meta** | The same, attached to a taxonomy term and stored in `wp_termmeta`. Used for menu section order and dietary tag display data. |
| **Protected meta** | Meta whose key begins with an underscore. WordPress hides it from the built-in Custom Fields panel and refuses generic access without an explicit `auth_callback`. Every meta key here is protected — hence the `_gotg_` prefix. |
| **Meta box** | A panel on a post edit screen, registered with `add_meta_box()`. This project's meta boxes are hand-written: nonce, labelled inputs, capability check, sanitization, validation. |
| **Meta box contract** | The seven mandatory save-handler steps and the render rules in `03-CONTENT-MODEL.md` §2. Implemented once in a shared helper, not per box. |
| **Repeater** | A field storing an array of rows under one meta key, edited by the project's vanilla-JS repeater component. Used for price variants, hours, hours exceptions, navigation, people, and social links. Not a plugin feature — see ADR-0025. |
| **Price variant** | One row of `_gotg_price_variants`: a `label` and an `amount`. Every menu item has at least one. A single-priced item has one row with an empty label. |
| **Options page** | The Site Settings admin screen, registered with `add_menu_page()` and backed by the single `gotg_site_settings` option through the Settings API. |
| **Page builder** | The `_gotg_page_blocks` meta field plus its block-builder meta box. Stores an ordered array of block entries, each keyed by `type`. |
| **ACF** | Advanced Custom Fields. A commercial custom-fields plugin. **Not used on this project** — see ADR-0025. The term appears only in superseded ADR-0009 and in rejected-alternative tables. |
| **`register_rest_route`** | The WordPress function that registers a custom REST endpoint. |
| **WXR** | WordPress eXtended RSS. WordPress's XML export format. Engine-agnostic, which matters for the SQLite/MySQL boundary. |
| **WP-CLI** | The WordPress command-line interface. |
| **Application Password** | A per-user credential for authenticating API requests without the main account password. Used for preview access. |
| **`wp_kses`** | WordPress's HTML sanitiser. Strips everything outside an explicit allow-list. |

### 1.3 Frontend

| Term | Definition |
|---|---|
| **Next.js App Router** | Next.js's file-system router built on React Server Components. |
| **RSC / Server Component** | A React component rendered on the server that ships no JavaScript to the browser. The default here. |
| **Client Component** | A component marked `'use client'`, hydrated in the browser. Permitted only for the twelve components in the register in `06-COMPONENT-SPEC.md` §0. |
| **Server Action** | An async server-side function callable from a form or a client component. Used for contact form submission. |
| **SSG** | Static Site Generation. HTML produced at build time. |
| **ISR** | Incremental Static Regeneration. A statically generated page that regenerates in the background after a set interval. |
| **On-demand revalidation** | Invalidating a cached page immediately via `revalidateTag()`, triggered here by a WordPress save hook. |
| **Cache tag** | A string label attached to a `fetch` so `revalidateTag()` can invalidate everything carrying it. Five exist: `home`, `menu`, `events`, `about`, `contact`. |
| **Draft mode** | Next.js's mechanism for bypassing the cache to render unpublished content. |
| **Hydration** | The browser attaching React event handlers to server-rendered HTML. A hydration mismatch occurs when the client's first render differs from the server's HTML. |
| **Discriminated union** | A TypeScript union whose members are distinguished by a shared literal field. `PageBlock` uses `type`. |
| **Zod** | A TypeScript-first schema validation library. Used for contract tests, environment validation, and form validation. |
| **Tailwind CSS** | A utility-first CSS framework. Version 4 reads its theme from CSS custom properties. |
| **Design token** | A named design value (`--color-brand-primary`) used in place of a literal. Every value in the UI resolves to one. |

### 1.4 Performance, SEO, accessibility

| Term | Definition |
|---|---|
| **LCP** | Largest Contentful Paint. Time until the largest visible element renders. Target ≤ 2.0s. |
| **INP** | Interaction to Next Paint. Responsiveness to user input. Target ≤ 150ms. Replaced FID in 2024. |
| **CLS** | Cumulative Layout Shift. Visual stability. Target ≤ 0.02. |
| **TTFB** | Time to First Byte. Target ≤ 300ms. |
| **Core Web Vitals** | Google's LCP, INP, and CLS set, used as a ranking signal. |
| **AVIF / WebP** | Modern image formats. AVIF is smaller; WebP has broader support. Both are served ahead of JPEG. |
| **LQIP** | Low-Quality Image Placeholder. A tiny blurred image shown while the real one loads. Generated in PHP as `blurDataUrl`. |
| **`sizes`** | An HTML attribute telling the browser how wide an image will render, so it downloads the right candidate. Mandatory on every image here. |
| **JSON-LD** | JavaScript Object Notation for Linked Data. The structured-data format Google prefers. |
| **schema.org** | The structured-data vocabulary. `Restaurant`, `Menu`, `Event`, and `OpeningHoursSpecification` are used here. |
| **Canonical URL** | The authoritative URL for a page, declared to prevent duplicate-content dilution. |
| **WCAG 2.1 AA** | Web Content Accessibility Guidelines, Level AA. The conformance target. |
| **axe** | An automated accessibility testing engine. Run in CI via Playwright. |
| **Focus trap** | Confining keyboard focus within an open modal. Required in `MobileNav`. |
| **Live region** | An element whose changes are announced by screen readers without moving focus. Used for form results and filter changes. |
| **Skip link** | A link letting keyboard users bypass navigation. The first focusable element on every page. |

### 1.5 Infrastructure

| Term | Definition |
|---|---|
| **Vercel** | The frontend hosting platform. Provides edge delivery, ISR, and per-PR preview deployments. |
| **SQLite** | A file-based database. Used locally via Studio's `sqlite-database-integration` plugin. Not used on staging or production. |
| **MySQL / MariaDB** | The relational database WordPress supports in production. Required for staging and production here. |
| **`utf8mb4`** | The MySQL character set supporting the full Unicode range including emoji. Required; `utf8` (3-byte) corrupts emoji. |
| **TTL** | Time To Live. How long a DNS record may be cached. Lowered to 300s before cutover. |
| **SPF / DKIM / DMARC** | Email authentication DNS records. Must be preserved through cutover and extended for Resend. |
| **Object cache** | A persistent cache (Redis here) for WordPress database query results. |
| **Preview deployment** | A Vercel build per pull request, at a unique URL, always `noindex`. |

---

## Part 2 — Architecture Decision Records

| ID | Title | Status | Date |
|---|---|---|---|
| ADR-0001 | Headless WordPress rather than a traditional WordPress theme | Accepted | 2026-07-22 |
| ADR-0002 | Next.js App Router with TypeScript as the frontend | Accepted | 2026-07-22 |
| ADR-0003 | Custom REST endpoints under `gotg/v1` instead of WPGraphQL or core REST | Accepted | 2026-07-22 |
| ADR-0004 | One request per page with an embedded `_global` object | Accepted | 2026-07-22 |
| ADR-0005 | Hand-maintained TypeScript interfaces guarded by contract tests | Accepted | 2026-07-22 |
| ADR-0006 | Two-repository split | Accepted | 2026-07-22 |
| ADR-0007 | SQLite for local development via WordPress Studio | Accepted | 2026-07-22 |
| ADR-0008 | Static generation with ISR plus on-demand revalidation | Accepted | 2026-07-22 |
| ADR-0009 | ACF PRO as the field engine | **Superseded by ADR-0025** | 2026-07-22 |
| ADR-0010 | No SEO plugin; metadata as explicit CMS fields | Accepted | 2026-07-22 |
| ADR-0011 | Events as a first-party post type | Accepted | 2026-07-22 |
| ADR-0012 | Standing live music as configuration, not repeated event records | Accepted | 2026-07-22 |
| ADR-0013 | Single-page menu with client-side daypart filtering | Accepted | 2026-07-22 |
| ADR-0014 | Persistent mobile call bar as a permanent UI element | Accepted | 2026-07-22 |
| ADR-0015 | Tailwind CSS 4 with CSS custom properties as the token layer | Accepted | 2026-07-22 |
| ADR-0016 | Self-hosted subsetted fonts, no webfont for the script wordmark | Accepted | 2026-07-22 |
| ADR-0017 | Server Components by default; a closed client-component register | Accepted | 2026-07-22 |
| ADR-0018 | Third-party integrations must degrade, never break a page | Accepted | 2026-07-22 |
| ADR-0019 | Static map image instead of an interactive map embed | Accepted | 2026-07-22 |
| ADR-0020 | Phone-only reservations for Phase 1 | Proposed | 2026-07-22 |
| ADR-0021 | Vercel Pro plus managed WordPress hosting | Proposed | 2026-07-22 |
| ADR-0022 | Absent optional fields are omitted, never null | Accepted | 2026-07-22 |
| ADR-0023 | Pacific time is authoritative for all dates and times | Accepted | 2026-07-22 |
| ADR-0024 | `AGENTS.md` Rule 3 superseded from GraphQL to REST | Accepted | 2026-07-22 |
| ADR-0025 | Native post meta instead of a custom-fields plugin | Accepted | 2026-07-22 |
| ADR-0026 | Phased admin UI; custom interface deferred to Phase 2 | Accepted | 2026-07-22 |

---

### ADR-0001 — Headless WordPress rather than a traditional WordPress theme

**Date:** 2026-07-22
**Status:** Accepted

**Context.** The client needs a CMS they or their staff can operate. WordPress is
the most widely understood option and a WordPress Studio site already exists. The
question is whether WordPress also renders the public site.

**Decision.** WordPress serves JSON only. It renders no public HTML. A separate
Next.js application renders every page.

**Consequences.**
- Positive: page delivery is decoupled from WordPress uptime and PHP performance;
  WordPress can be down for hours with no visitor impact.
- Positive: the frontend is a modern TypeScript codebase with real type safety.
- Positive: WordPress plugin vulnerabilities cannot execute in the public
  rendering path.
- Negative: two codebases, two deployments, two CI pipelines.
- Negative: editors lose the WordPress live preview unless preview mode is built
  explicitly — it is, see `04-API-CONTRACT.md` §9.
- Negative: any WordPress plugin that works by filtering front-end output is
  useless here.

**Alternatives considered.**
1. *Traditional WordPress theme.* Rejected — ties page performance to PHP
   rendering and shared hosting, and makes the frontend a jQuery-and-template
   codebase.
2. *A different headless CMS (Sanity, Payload).* Rejected — no client
   familiarity, a Studio site already exists, and no migration budget.
3. *A static site with content in Markdown.* Rejected — restaurant staff cannot
   edit a menu price in git.

---

### ADR-0002 — Next.js App Router with TypeScript as the frontend

**Date:** 2026-07-22
**Status:** Accepted

**Context.** ADR-0001 requires a separate frontend. It must be statically
generated, revalidate on content change, support draft preview, and be typed.

**Decision.** Next.js 15 App Router, TypeScript in strict mode, React Server
Components, deployed on Vercel.

**Consequences.**
- Positive: static generation, ISR, on-demand revalidation, and image
  optimisation are first-party rather than assembled.
- Positive: Server Components mean most of the site ships zero JavaScript.
- Positive: `draftMode()` gives a preview mechanism without a bespoke build.
- Negative: strong coupling to Vercel; another host requires an adapter.
- Negative: the App Router's server/client boundary is a genuine learning curve
  and a source of subtle bugs — mitigated by the closed client register in
  ADR-0017.

**Alternatives considered.**
1. *Astro 5.* Rejected — weaker incremental and on-demand revalidation story;
   preview mode would be bespoke.
2. *Nuxt.* Rejected — no Vue expertise on this project.
3. *Next.js Pages Router.* Rejected — Server Components eliminate the client
   JavaScript that Pages Router would ship for static content.

---

### ADR-0003 — Custom REST endpoints under `gotg/v1` instead of WPGraphQL or core REST

**Date:** 2026-07-22
**Status:** Accepted

**Context.** The frontend needs data from WordPress. Three options exist:
WPGraphQL, WordPress core REST (`/wp/v2/*`), or hand-written custom REST routes.
The site has five pages whose data requirements are known, fixed, and unlikely to
change shape often.

**Decision.** Five custom REST routes under the namespace `gotg/v1`, one per
page, registered with `register_rest_route()` on `rest_api_init` from
`mu-plugins/`. Each returns a complete, pre-shaped, camelCase payload. WPGraphQL
is not installed and GraphQL appears nowhere in the codebase or documentation.
Core REST (`/wp/v2/*`) is locked to authenticated users only.

**Consequences.**
- Positive: the response shape *is* the contract. The frontend cannot over-fetch
  and cannot compose, because there is nothing to compose.
- Positive: one HTTP request per page render.
- Positive: no plugin dependency for the data layer, no GraphQL schema surface,
  no query-cost or introspection concerns.
- Positive: payloads are readable JSON that a human can diff.
- Negative: a new page costs backend PHP work — roughly 0.5 developer-days.
- Negative: adding a field to a component requires a backend change, a backend
  PR, and a deploy before the frontend can use it.
- Negative: no schema introspection and no generated types — addressed by
  ADR-0005.
- Negative: `_global` is duplicated across five payloads. Since payloads are
  fetched at build and revalidation time rather than per user request, the cost
  is build bandwidth, not user bandwidth, and gzip reduces the repeated block to
  a few hundred bytes.

**Alternatives considered.**
1. *WPGraphQL.* Rejected — introduces a substantial plugin dependency and a
   schema surface for a five-page site with fixed payloads. Its main advantage,
   letting clients request arbitrary field selections, is a liability here: the
   entire point of this contract is that the frontend cannot choose. It also adds
   query-depth and cost-analysis concerns, and its resolvers must still be
   configured per field for ACF data via WPGraphQL for ACF.
2. *WordPress core REST (`/wp/v2/*`).* Rejected — returns raw WordPress objects
   with `rendered`/`raw` wrappers, snake_case keys, `_links`, and internal IDs.
   Building the home page would require four or five requests plus client-side
   composition, violating the one-request rule. Shaping it would mean filtering
   core responses, which is more fragile than writing the response directly.
3. *A single `/gotg/v1/page?slug=` endpoint with a switch.* Rejected — one
   function returning five different shapes cannot be typed cleanly at either
   end, and per-endpoint cache tags become awkward.

---

### ADR-0004 — One request per page with an embedded `_global` object

**Date:** 2026-07-22
**Status:** Accepted

**Context.** Every page needs site settings, navigation, hours, location, social
links, and SEO defaults. This data could be a sixth endpoint fetched alongside
each page endpoint, or embedded in every page payload.

**Decision.** Every `gotg/v1` response includes a top-level `_global` object.
There is no separate globals endpoint. The frontend performs exactly one fetch
per page.

**Consequences.**
- Positive: one round trip per page build. No composition logic anywhere in the
  frontend.
- Positive: a page's data is atomically consistent — navigation and content come
  from the same read.
- Negative: roughly 3 KB of duplication per payload.
- Negative: a Site Settings change invalidates all five cache tags. Acceptable
  because settings change rarely.

**Alternatives considered.**
1. *A separate `/gotg/v1/global` endpoint.* Rejected — adds a second round trip
   per page build and reintroduces client composition, which ADR-0003 exists to
   eliminate.
2. *Globals in the Next.js root layout only.* Rejected — the root layout would
   still need to fetch, producing the same second request, and page-level
   components could not access location or hours without prop drilling from a
   layout.

---

### ADR-0005 — Hand-maintained TypeScript interfaces guarded by contract tests

**Date:** 2026-07-22
**Status:** Accepted

**Context.** ADR-0003 rules out schema introspection, so nothing can generate
TypeScript types from the PHP that produces the responses. A field renamed in
PHP would become `undefined` in the UI with no compile-time signal.

**Decision.** `frontend/src/types/api.ts` is hand-written from
`04-API-CONTRACT.md`, which is the single source of truth. Drift is caught by a
mandatory CI contract test: a Zod schema per response in `.strict()` mode,
bound to its interface by a compile-time exactness assertion, run against live
staging endpoints on every PR in both repositories.

**Consequences.**
- Positive: types are readable, hand-shaped, and free of generated noise.
- Positive: `.strict()` catches both extra and missing keys, so an unannounced
  PHP change fails the build rather than reaching production.
- Negative: three artefacts must be updated together for every field change — the
  document, the interface, and the Zod schema.
- Negative: the contract test requires staging to be reachable. If staging is
  down the job fails; it is never skipped, because a skipped contract test
  removes the only automated guard.
- Registered as risk R-04 in `11-PROJECT-PLAN.md`.

**Alternatives considered.**
1. *WPGraphQL plus GraphQL Code Generator.* Rejected with ADR-0003.
2. *Generating TypeScript from PHP annotations.* Rejected — no mature tooling;
   building it would cost more than the discipline it replaces.
3. *Runtime Zod parsing on every request in production.* Rejected — a parsing
   cost on every render for a problem that pre-deploy testing catches. Zod runs
   in development and in CI, not in the production render path.

---

### ADR-0006 — Two-repository split

**Date:** 2026-07-22
**Status:** Accepted (pre-existing, recorded retrospectively)

**Context.** The WordPress site lives at `C:\Users\manav\Studio\grills` because
WordPress Studio requires that location. The frontend and documentation live at
`D:\work\grills`, on a different drive.

**Decision.** Two git repositories. The backend tracks only
`wp-content/mu-plugins/` and `wp-content/themes/gotg-headless/`. The frontend
repository holds `/frontend` and `/docs`. Both are opened together through the
multi-root workspace `D:\work\grills\grills.code-workspace`.

**Consequences.**
- Positive: each repository has one deployment target and one CI pipeline.
- Positive: WordPress core, plugins, and uploads stay untracked and are
  reproducible.
- Positive: the frontend history is not polluted by WordPress noise.
- Negative: an API contract change requires coordinated PRs in two repositories,
  merged backend-first (`10-ENVIRONMENTS-DEPLOYMENT.md` §7.5).
- Negative: `docs/` lives in the frontend repository but is authoritative for the
  backend, so `AGENTS.md` must reference an absolute path across drives.
- Negative: opening only one root makes cross-repository verification impossible.
  `AGENTS.md` prohibits it.

**Alternatives considered.**
1. *A monorepo.* Rejected — WordPress Studio requires its own directory
   location, and moving the Studio site into a monorepo would break Studio's
   site management.
2. *Documentation in its own third repository.* Rejected — three repositories for
   a five-page site, and documentation would drift further from the code it
   describes.

---

### ADR-0007 — SQLite for local development via WordPress Studio

**Date:** 2026-07-22
**Status:** Accepted (pre-existing, recorded retrospectively)

**Context.** WordPress Studio provisions local sites with SQLite through the
`sqlite-database-integration` plugin. This is Studio's default and requires no
setup. Staging and production must use MySQL, because that is what WordPress
supports in production and what every managed host provides.

**Decision.** Keep SQLite locally. Use MySQL 8.0 on staging and production.
Accept the divergence and manage it through explicit controls.

**Consequences.**
- Positive: zero local database setup. A new developer is running in minutes.
- Positive: the local site is disposable and reseedable.
- Negative: **every developer works against a different database engine than the
  one that serves the client.** This is a real defect source, not a formality.
- Negative: no direct SQL dump path between local and the other environments.
  Content moves through WXR export/import or reseeding.
- Negative: raw SQL is banned outright to keep the translation layer's edges out
  of play.

**Mitigations, all mandatory.**
1. No `$wpdb->query`, `$wpdb->get_results`, or `$wpdb->prepare` in
   `mu-plugins/`. Enforced by a PHPCS sniff that blocks CI.
2. All data access through `WP_Query`, `get_posts()`, `get_terms()`,
   `get_post_meta()`, and ACF functions.
3. Contract tests run against staging MySQL, never against local SQLite.
4. Definition of Done requires staging verification. Local verification is
   necessary and not sufficient.
5. Staging on MySQL is provisioned in Phase 0, before feature work.
6. Real content is authored on staging. Local content is disposable seed data.
7. Production and staging databases must be `utf8mb4`; verified at provisioning.

**Escalation trigger.** Three or more staging-only defects traced to engine
divergence within one phase forces reconsideration of local MySQL via Docker,
which would require a superseding ADR.

Full risk analysis: `10-ENVIRONMENTS-DEPLOYMENT.md` §10. Registered as risk R-03.

**Alternatives considered.**
1. *Local MySQL via Docker.* Rejected for now — full engine parity, but it
   abandons Studio's zero-setup benefit and the established environment. Held as
   the documented escape hatch.
2. *Local MySQL via Studio configuration.* Not available in the current Studio
   release at the time of writing.
3. *Developing directly against staging.* Rejected — no offline work, and
   concurrent developers would collide on one database.

---

### ADR-0008 — Static generation with ISR plus on-demand revalidation

**Date:** 2026-07-22
**Status:** Accepted

**Context.** Content changes infrequently but must be correct. A price change
must appear quickly. Rendering per request would waste the TTFB budget and put
WordPress in the path of every visitor.

**Decision.** Every route is statically generated with a time-based `revalidate`
floor, plus on-demand `revalidateTag()` triggered by WordPress save hooks. Both
are active simultaneously.

Values: `home` 3600s, `menu` 3600s, `events` 900s, `about` 86400s,
`contact` 86400s.

**Consequences.**
- Positive: TTFB is edge-served static delivery.
- Positive: WordPress is not in the request path for any visitor.
- Positive: an editor sees a change live within seconds.
- Positive: if the webhook is lost, the time-based floor still corrects the page.
- Positive: if WordPress is down during a revalidation attempt, the last good
  render continues to serve. Stale-but-correct beats an error page.
- Negative: two mechanisms to reason about when debugging staleness.
- Negative: a Site Settings change invalidates all five tags.

**Alternatives considered.**
1. *Time-based ISR alone.* Rejected — up to an hour to correct a wrong price is
   not acceptable.
2. *On-demand revalidation alone.* Rejected — a lost webhook leaves a page stale
   indefinitely with no signal.
3. *Full SSR per request.* Rejected — wastes the TTFB budget and makes WordPress
   uptime a visitor-facing dependency.
4. *A full rebuild per content change.* Rejected — minutes of latency per edit
   and unnecessary build minutes.

---

### ADR-0009 — ACF PRO as the field engine

**Date:** 2026-07-22
**Status:** **Superseded by ADR-0025 (2026-07-22)**

> Superseded before any implementation work began. ACF is not installed in any
> form. Retained unedited as a record of the original reasoning and of what
> changed. Read ADR-0025 for the position in force.

**Context.** The content model needs repeaters (hours, navigation, people),
an options page (Site Settings), a flexible page builder, and relationship
fields. WordPress core provides none of these.

**Decision.** ACF PRO 6.x. Field groups are defined as local JSON committed to
`wp-content/themes/gotg-headless/acf-json/`.

**Consequences.**
- Positive: the entire content model is version-controlled and reviewable as
  JSON.
- Positive: Flexible Content gives editors a real page builder without the block
  editor's complexity.
- Positive: the editor experience is familiar to anyone who has used WordPress.
- Negative: a recurring licence cost, and a hard dependency on a commercial
  plugin.
- Negative: field data is stored as post meta, so complex queries against field
  values are inefficient. Mitigated by keeping ordering and filtering on post
  columns and taxonomy terms rather than on meta.
- Negative: a lapsed licence stops updates. Field definitions survive in
  `acf-json/`, so the schema is not lost. Registered as risk R-14.

**Alternatives considered.**
1. *Meta Box.* Rejected — comparable capability, less client and developer
   familiarity, smaller ecosystem.
2. *Hand-rolled metaboxes with `register_meta`.* Rejected — replicating
   repeaters, flexible content, and an options page would cost more developer-days
   than the licence, and the result would be worse.
3. *Core block editor with custom blocks.* Rejected — block content serialises to
   HTML comments in `post_content`, which is hostile to shaping into a clean JSON
   contract.

---

### ADR-0010 — No SEO plugin; metadata as explicit CMS fields

**Date:** 2026-07-22
**Status:** Accepted

**Context.** SEO plugins generate `<head>` output for a WordPress theme. This
project has no theme output. Metadata must reach the frontend as data.

**Decision.** No Yoast, no RankMath. Metadata is an explicit ACF group
(`gotg_seo`) with five fields, surfaced through `gotg/v1` and rendered by Next.js
`generateMetadata`. Structured data is generated by typed builders in
`frontend/src/lib/json-ld.ts`.

**Consequences.**
- Positive: metadata is typed, testable, and part of the contract.
- Positive: no large plugin, no plugin update risk, no version-fragile REST
  surface.
- Positive: JSON-LD is built from typed data with `schema-dts`, so a malformed
  schema is a compile error.
- Negative: editors lose Yoast's readability and keyword analysis. `[ASSUMPTION]
  Acceptable — the editor is restaurant staff updating prices and events, not an
  SEO practitioner. Confirm against DP-15.`
- Negative: sitemap and robots generation is built rather than provided — roughly
  0.75 developer-days.

**Alternatives considered.**
1. *Yoast plus the `yoast-seo-rest-api` head endpoint.* Rejected — returns a
   rendered HTML string, violating the no-raw-output rule in `04-API-CONTRACT.md`
   §1, and couples the frontend to Yoast's output format.
2. *No metadata fields; derive everything from titles and excerpts.* Rejected —
   removes editorial control over search snippets, which is a stated business
   goal.

---

### ADR-0011 — Events as a first-party post type

**Date:** 2026-07-22
**Status:** Accepted

**Context.** Live music on Friday and Saturday is a fixed cost and filling those
seats is business goal 3. Events need to be indexable, shareable, and carry
`Event` structured data.

**Decision.** A `gotg_event` CPT with the field group in `03-CONTENT-MODEL.md`
§3. Each upcoming event gets a statically generated page at `/events/[slug]`.

**Consequences.**
- Positive: full control over the data model, the structured data, and the
  presentation.
- Positive: event pages are indexable and can rank for "live music simi valley".
- Positive: no vendor and no cost.
- Negative: recurrence is not modelled generically — see ADR-0012.
- Negative: staff must enter each dated event manually.

**Alternatives considered.**
1. *Google Calendar embed.* Rejected — not indexable, not styleable, no
   structured data, poor mobile experience.
2. *The Events Calendar plugin.* Rejected — a large plugin with its own REST
   surface and a data model far beyond what five pages need.
3. *Eventbrite as the source of truth.* Rejected — correct for ticketed events
   only. A Friday music night is not an Eventbrite event.

---

### ADR-0012 — Standing live music as configuration, not repeated event records

**Date:** 2026-07-22
**Status:** Accepted

**Context.** Live music runs every Friday and Saturday, 6–9pm, indefinitely.
Modelling this as `gotg_event` records means creating two records every week
forever.

**Decision.** The standing programme is configuration in Site Settings
(`show_recurring`, `recurring_heading`, `recurring_body`, `recurring_days`,
`recurring_starts`, `recurring_ends`). It renders as a
`RecurringProgrammeCard` above the dated event list. Individual `gotg_event`
records are created only when a specific performer or a special event is worth
naming, and those carry `is_recurring_instance` to mark them as part of the
programme.

**Consequences.**
- Positive: the standing programme never expires and needs no maintenance.
- Positive: staff enter an event only when there is something specific to say.
- Positive: the events page is never empty — the recurring card is always there.
- Negative: the standing programme cannot carry `Event` structured data, because
  schema.org `Event` requires a specific `startDate`. Only named events get
  `Event` JSON-LD. This is correct: an indefinite recurrence is a business
  practice, not an event.
- Negative: two mental models for editors — a standing programme and dated
  events. Mitigated with editor help text on both.

**Alternatives considered.**
1. *Auto-generating 52 weeks of recurring events.* Rejected — pollutes the events
   list with near-identical entries, creates 104 records a year, and produces 104
   thin indexable pages, which is an SEO liability.
2. *A recurrence rule field (RRULE) on `gotg_event`.* Rejected — significant
   implementation cost for a single fixed pattern that changes rarely.

---

### ADR-0013 — Single-page menu with client-side daypart filtering

**Date:** 2026-07-22
**Status:** Accepted

**Context.** The menu spans breakfast, lunch, and dinner across roughly 8–12
sections and 60–100 items. It is the highest-priority page for the
highest-priority audience.

**Decision.** One page at `/menu` containing every item, server-rendered in full.
A `DaypartFilter` client component filters in place using the `?daypart=` search
parameter. No per-daypart or per-section routes.

**Consequences.**
- Positive: a golfer on cellular pays one page load to see everything.
- Positive: the entire menu is in the initial HTML, so it is fully indexable and
  works with JavaScript disabled.
- Positive: browser find-in-page works across the whole menu.
- Positive: `Menu` structured data covers the complete menu in one document.
- Negative: `/menu` carries the largest HTML payload — roughly 45 KB gzipped at
  300 items. Within budget (`08-PERFORMANCE-SEO-A11Y.md` §1.2).
- Negative: filtering must not remove content from the DOM in a way that breaks
  indexing — it does not, because filtering happens after hydration.
- Negative: `?daypart=` variants must canonicalise to `/menu`.

**Alternatives considered.**
1. *Separate `/menu/breakfast`, `/menu/lunch`, `/menu/dinner` routes.* Rejected —
   forces a navigation round trip on the highest-priority journey, and splits
   ranking signal across three thin pages.
2. *Server-side filtering with a full page reload per daypart.* Rejected — a
   round trip for a filter interaction.
3. *A PDF menu.* Rejected — not indexable, not accessible, not mobile-legible.

---

### ADR-0014 — Persistent mobile call bar as a permanent UI element

**Date:** 2026-07-22
**Status:** Accepted

**Context.** The primary audience is on-course golfers, one-handed, in bright
sunlight, deciding whether to eat. The highest-value actions are calling and
seeing the menu.

**Decision.** A fixed bottom bar below `md`, present on every route, with two
equal targets: Call and Menu. It hides on scroll-down and reappears on
scroll-up, and is always visible at the top and bottom of a page.

**Consequences.**
- Positive: the two highest-value actions are always one thumb-reach away.
- Positive: `phone_click` and `menu_view`, two of the tracked success metrics,
  are directly served.
- Negative: 64px of permanent vertical space on mobile. `main` carries matching
  bottom padding so nothing is ever obscured.
- Negative: an additional client component, though a very small one.
- Negative: it must be hidden while `MobileNav` is open, and must remain keyboard
  reachable when scrolled out of view — handled by transform rather than removal.

**Alternatives considered.**
1. *A floating action button.* Rejected — one action, and FABs commonly obscure
   content.
2. *Relying on the header CTA alone.* Rejected — the header scrolls away, and
   reaching the top of a long menu page one-handed is awkward.
3. *No persistent CTA.* Rejected — it discards the clearest advantage available
   for the primary journey.

---

### ADR-0015 — Tailwind CSS 4 with CSS custom properties as the token layer

**Date:** 2026-07-22
**Status:** Accepted

**Context.** The design system defines roughly 120 tokens. They must be usable in
components, overridable at breakpoints, and enforceable so arbitrary values do
not creep in.

**Decision.** Tokens are CSS custom properties in `styles/tokens.css`. Tailwind 4
reads them through `@theme inline` in `styles/theme.css`. Arbitrary Tailwind
values are banned by ESLint.

**Consequences.**
- Positive: one token definition serves both raw CSS and Tailwind utilities.
- Positive: responsive token changes happen in one media query rather than in
  every component.
- Positive: `tailwindcss/no-arbitrary-value` makes token discipline mechanical
  rather than a review burden.
- Positive: a brand palette change (DP-10) is a one-file edit.
- Negative: two files must stay in sync — mitigated because `theme.css` only
  references `tokens.css` variables and never restates values.
- Negative: Tailwind 4's CSS-first configuration is newer and less documented
  than the JavaScript config it replaces.

**Alternatives considered.**
1. *CSS Modules with vanilla-extract.* Rejected — more authored CSS, and no
   equivalent of Tailwind's arbitrary-value lint rule.
2. *Tailwind 3 with a JavaScript config.* Rejected — tokens would live in
   JavaScript and be unavailable to raw CSS without duplication.
3. *Styled-components or Emotion.* Rejected — runtime CSS-in-JS is incompatible
   with the zero-JavaScript goal for Server Components.

---

### ADR-0016 — Self-hosted subsetted fonts; no webfont for the script wordmark

**Date:** 2026-07-22
**Status:** Accepted

**Context.** The brand has a cursive wordmark. Type is a large share of the byte
budget and a common source of layout shift.

**Decision.** Two families (Inter, Bitter), five static weights, Latin subset
only, WOFF2, self-hosted in `public/fonts/`, `font-display: swap`, with
metric-matched local fallbacks. Two files are preloaded. The cursive wordmark is
an SVG asset, never live text.

**Consequences.**
- Positive: no third-party font connection, no privacy exposure, no extra DNS
  and TLS handshake.
- Positive: metric-matched fallbacks eliminate swap-induced layout shift.
- Positive: five subsetted files total roughly 62 KB.
- Positive: the wordmark renders identically everywhere and needs no licence
  investigation for web embedding.
- Negative: font files are committed to the repository.
- Negative: the fallback override percentages must be recomputed if a family
  changes (DP-10).
- Negative: no live text in the script face means it cannot be used for headings.
  This is intended — script faces are illegible below 24px.

**Alternatives considered.**
1. *Google Fonts CDN.* Rejected — a third-party connection, a privacy
   consideration under GDPR-style analysis, and no LCP benefit since 2020 when
   browsers partitioned the shared font cache.
2. *Variable fonts.* Rejected — two variable files exceed five static subsets at
   the weights actually used.
3. *A webfont for the cursive wordmark.* Rejected — unknown licence status
   (DP-10), poor small-size rendering, and a wordmark is a mark rather than text.

---

### ADR-0017 — Server Components by default; a closed client-component register

**Date:** 2026-07-22
**Status:** Accepted

**Context.** The App Router makes `'use client'` a one-line change. Without a
constraint, client components proliferate and the JavaScript budget erodes
invisibly.

**Decision.** Every component is a Server Component unless it appears in the
client-component register in `06-COMPONENT-SPEC.md` §0. That register currently
holds twelve entries, each with a stated justification. Adding to it requires
review.

**Consequences.**
- Positive: the JavaScript budget is defended by an explicit list rather than by
  vigilance.
- Positive: a reviewer can check a `'use client'` addition against a document
  instead of arguing about it.
- Positive: most of the site ships no JavaScript at all.
- Negative: some components are split into a server shell and a small client
  leaf, which is slightly more code — `SiteHeader` is the clearest example.
- Negative: the register must be maintained as a real document, not left to rot.

**Alternatives considered.**
1. *No policy, rely on review.* Rejected — client components accumulate silently
   and the cost appears only in a Lighthouse regression weeks later.
2. *A bundle-size budget alone.* Rejected — catches the symptom late, after the
   architecture has already drifted.

---

### ADR-0018 — Third-party integrations must degrade, never break a page

**Date:** 2026-07-22
**Status:** Accepted

**Context.** The site depends on Instagram, maps, email delivery, and analytics.
Each is outside this project's control.

**Decision.** No integration may prevent a page from rendering. Each has a
defined failure mode producing a useful fallback, documented in the failure
matrix at `09-INTEGRATIONS.md` §13. Third-party data is fetched client-side after
intersection where the vendor's uptime would otherwise affect a build.

**Consequences.**
- Positive: a vendor outage degrades one section rather than taking down a page.
- Positive: a build never fails because Instagram is down.
- Positive: each failure mode is testable, and every row of the matrix is
  verified by deliberately breaking the integration (task T-DO-07).
- Negative: more code — every integration needs an error path and a fallback UI.
- Negative: client-side fetching for Instagram means that section is not in the
  server HTML and is not indexable. Acceptable: a social feed carries no SEO
  value.

**Alternatives considered.**
1. *Server-side fetching for all third-party data.* Rejected — ties the ISR
   revalidation of a page to a third party's uptime. A vendor outage during a
   rebuild would either fail the build or bake an empty section into static HTML
   for an hour.
2. *Vendor embed scripts and iframes.* Rejected — unstyleable, heavy, and they
   set cookies before the user has chosen to engage.

---

### ADR-0019 — Static map image instead of an interactive map embed

**Date:** 2026-07-22
**Status:** Accepted

**Context.** `/contact` needs to show where the restaurant is. A Google Maps
iframe is the conventional choice.

**Decision.** A static map image from the Google Static Maps API, wrapped in a
link to Google Maps directions. The interactive iframe variant of `MapEmbed`
exists in the component spec but is not enabled in Phase 1.

**Consequences.**
- Positive: roughly 40 KB against an iframe's ~900 KB and ~30 requests.
- Positive: no third-party cookie is set before the user chooses to leave.
- Positive: no consent-banner requirement, which is not in scope.
- Positive: it fits the design system, because it is an image rendered through
  the project's own `Image` primitive.
- Negative: users cannot pan or zoom in place. They tap through to Google Maps,
  which is where they want to end up anyway for directions.
- Negative: it requires a Google Cloud project, a billing account, and a
  referrer-restricted API key.

**Alternatives considered.**
1. *Google Maps iframe.* Rejected — ~900 KB, ~30 requests, cookies before
   consent, and unstyleable.
2. *Mapbox static images.* Viable and cookie-free, but the audience's saved
   places and default navigation app are Google. Held as a fallback if Google
   Cloud billing is refused.
3. *No map, address text only.* Rejected — a map is a strong wayfinding signal
   for a venue located inside a golf course.

---

### ADR-0020 — Phone-only reservations for Phase 1

**Date:** 2026-07-22
**Status:** **Proposed** — pending client decision DP-04

**Context.** It is not established whether the restaurant takes reservations at
all. Reservation platforms cost $69–449 per month.

**Decision (proposed).** Phase 1 ships no reservation platform. The phone number
is the reservation path. `gotg_site_settings.reservation_url` exists and is
empty; setting it later reveals a Reserve CTA with no code change. The
`Restaurant` JSON-LD emits `acceptsReservations: "False"` until this resolves.

**Consequences.**
- Positive: no monthly cost, no integration, no vendor.
- Positive: the model is ready — populating one field enables the feature.
- Negative: visitors who prefer booking online must call.
- Negative: `acceptsReservations: "False"` may be factually wrong if the
  restaurant does take phone reservations. It states that *online* reservations
  are not accepted, which is accurate for the site. Revisit when DP-04 resolves.

**Alternatives considered.**
1. *OpenTable* (~$449/mo + $1.50/cover) — disproportionate at this venue's scale.
2. *Tock* (~$69/mo + 2%) — the best value if a platform is wanted. The
   recommendation if DP-04 confirms reservation demand.
3. *A first-party reservation system.* Rejected as an explicit non-goal
   (`00-PROJECT-BRIEF.md` §6).

---

### ADR-0021 — Vercel Pro plus managed WordPress hosting

**Date:** 2026-07-22
**Status:** **Proposed** — pending client budget approval DP-16

**Context.** The frontend needs a host supporting ISR and on-demand revalidation.
WordPress needs a host with MySQL, Redis, staging, backups, and a WAF.

**Decision (proposed).** Vercel Pro (~$20/month) for the frontend. WP Engine
Startup or Kinsta Starter (~$20–35/month) for WordPress. Total floor including
ACF PRO: approximately $45–60/month plus ~$49/year.

**Consequences.**
- Positive: ISR and `revalidateTag` are first-party on Vercel; no adapter
  configuration.
- Positive: managed WordPress covers backups, patching, SSL, and a WAF with a
  contracted support path.
- Positive: per-PR preview deployments come free with the platform.
- Negative: recurring cost requiring client approval — this is on the critical
  path as task T-DO-01.
- Negative: platform lock-in to Vercel for ISR behaviour.
- Negative: Vercel Hobby is not an option; it prohibits commercial use.

**Alternatives considered.**
1. *Netlify* (~$19/member/month) — equivalent cost, but Next.js ISR support is
   adapter-mediated rather than first-party.
2. *Self-managed VPS (DigitalOcean + SpinupWP, ~$24/month total)* — cheaper, but
   it transfers security patching, backups, and uptime responsibility to the
   build team with no contracted support. Roughly 3 developer-days of additional
   setup and an ongoing maintenance liability.
3. *Shared WordPress hosting (~$5/month)* — no Redis, no staging, poor backup
   guarantees, and a shared IP with unknown neighbours.

---

### ADR-0022 — Absent optional fields are omitted, never null

**Date:** 2026-07-22
**Status:** Accepted

**Context.** An optional field with no value can be represented as `null`, as an
empty string, or by omitting the key. TypeScript's `exactOptionalPropertyTypes`
makes the distinction meaningful.

**Decision.** Optional fields are **omitted** from the response when absent.
Empty collections are `[]`, never omitted. Fields that are nullable by design
(`_global.announcement`, `events.recurring`) are typed `T | null` and are always
present with an explicit `null`.

**Consequences.**
- Positive: `field?: string` in TypeScript matches the wire format exactly.
- Positive: `exactOptionalPropertyTypes` forces components to handle absence, so
  the empty-state rules in `06-COMPONENT-SPEC.md` are enforced by the compiler
  rather than by review.
- Positive: payloads are smaller — a menu item with no image, description, or
  tags omits four keys.
- Positive: the difference between "not set" (omitted) and "explicitly nothing"
  (`null`) is preserved and meaningful.
- Negative: PHP shapers must conditionally build arrays rather than always
  assigning, which is slightly more code.
- Negative: `.strict()` Zod schemas must mark these fields `.optional()` rather
  than `.nullable()`, and getting it wrong fails the contract test — which is the
  intended behaviour.

**Alternatives considered.**
1. *Always emit `null`.* Rejected — forces `field: string | null` everywhere,
   loses the not-set/explicitly-empty distinction, and adds bytes.
2. *Always emit empty strings.* Rejected — `""` is falsy but present, which
   invites `if (item.description)` checks that silently pass on whitespace and
   makes it impossible to distinguish "no description" from "empty description".

---

### ADR-0023 — Pacific time is authoritative for all dates and times

**Date:** 2026-07-22
**Status:** Accepted

**Context.** The restaurant is in Simi Valley, California. Events happen at a
specific local time. Visitors may be in any timezone, and a statically generated
page is rendered on a server in an arbitrary timezone.

**Decision.** `America/Los_Angeles` is authoritative. All date and time
formatting explicitly passes `timeZone: 'America/Los_Angeles'` to
`Intl.DateTimeFormat`. API datetimes are ISO 8601 with an explicit offset. The
timezone is carried in the payload as `_global.hours.timezone` rather than
hardcoded in the frontend.

**Consequences.**
- Positive: an event at 6pm Pacific displays as 6pm to every visitor, which is
  correct — the event happens at 6pm Pacific regardless of who is reading.
- Positive: server and client render the same string, so no hydration mismatch.
- Positive: a build server in UTC produces correct output.
- Negative: `HoursStatus` genuinely depends on the visitor's clock, so it renders
  nothing on the server and appears after hydration. Accepted: the authoritative
  hours are in server-rendered HTML in `HoursTable`, and the status is
  supplementary.
- Negative: daylight saving transitions must be handled by `Intl`, not by manual
  offset arithmetic. Manual offset arithmetic is prohibited.

**Alternatives considered.**
1. *Render in the visitor's local timezone.* Rejected — a visitor in New York
   would see "9pm" for a 6pm Pacific event, which is wrong and useless.
2. *Show both timezones.* Rejected — visual clutter for a restaurant whose
   customers are, without exception, physically present.
3. *Hardcode the offset as `-08:00`.* Rejected — breaks for seven months of every
   year during daylight saving time.

---

### ADR-0024 — `AGENTS.md` Rule 3 superseded from GraphQL to REST

**Date:** 2026-07-22
**Status:** Accepted

**Context.** `AGENTS.md` in the backend repository, Rule 3, states: *"Every post
type and taxonomy must be GraphQL-exposed. Set `show_in_graphql`,
`graphql_single_name`, and `graphql_plural_name` on registration. A CPT the
frontend cannot query is useless here."* ADR-0003 established that WPGraphQL is
not installed, making those arguments inert.

**Decision.** `AGENTS.md` Rule 3 is superseded and has been amended to read:

> **Every post type and taxonomy must be reachable through a `gotg/v1` REST
> endpoint.** Core REST exposure (`show_in_rest`) is disabled by default —
> `/wp/v2/*` would publish a second unshaped, unversioned contract alongside
> `gotg/v1`. Enable `show_in_rest` on an individual post type only when a
> specific admin feature requires it (e.g. block editor support), and record the
> exception in `D:\work\grills\docs\03-CONTENT-MODEL.md`. WPGraphQL is not used
> — see ADR-0024.

No registration in this project sets any `graphql_*` argument. `show_in_rest` is
`false` on all four custom post types and both taxonomies; the exception register
in `03-CONTENT-MODEL.md` §0.2 is currently empty. A companion rule (Rule 4) was
added to `AGENTS.md` pointing at `04-API-CONTRACT.md` as authoritative for
response shapes.

The amendment was applied on 2026-07-22, closing task T-BE-01 in
`11-PROJECT-PLAN.md`, Phase 0.

**Consequences.**
- Positive: `AGENTS.md` and the implementation agree. An AI agent reading
  `AGENTS.md` will not add GraphQL arguments and will not enable core REST by
  reflex.
- Positive: the underlying intent of Rule 3 — that no content type may be
  unreachable from the frontend — is preserved.
- Positive: core REST remains locked to authenticated users at the request level
  by the `rest_authentication_errors` filter in `04-API-CONTRACT.md` §9.3. This
  is defence in depth: `show_in_rest: false` removes the routes, and the filter
  denies anonymous access to whatever core registers regardless (users, media,
  block types, search). Disabling one does not silently open the other.
- Positive: the default is stated as a default rather than an absolute, with a
  named escape hatch and a required audit trail, so a future need for block
  editor support does not force a rule violation or a superseding ADR.
- Negative: `show_in_rest: false` means the block editor cannot be used for these
  post types without first registering an exception. Not a cost today — no custom
  post type uses the block editor (see the `supports` arrays in
  `03-CONTENT-MODEL.md`).
- Negative: two places now encode the same position — the `show_in_rest`
  arguments and the authentication filter. Both must be kept in force; removing
  the filter alone would still leave core routes closed, but removing
  `show_in_rest: false` alone would not open them, which can mislead someone
  debugging why a core route 401s.

**Alternatives considered.**
1. *Install WPGraphQL to satisfy the existing rule.* Rejected by ADR-0003.
2. *Set the `graphql_*` arguments anyway, inert.* Rejected — dead configuration
   implies a capability that does not exist and would mislead the next reader.
3. *Leave `AGENTS.md` unchanged and document the contradiction only here.*
   Rejected — `AGENTS.md` is loaded automatically by AI agents working in the
   backend repository, so a stale rule there actively causes wrong code.

---

### ADR-0025 — Native post meta instead of a custom-fields plugin

**Date:** 2026-07-22
**Status:** Accepted — **supersedes ADR-0009**

**Context.** The content model in `03-CONTENT-MODEL.md` needs repeating fields
(price variants, opening hours, hours exceptions, navigation rows, people,
social links), a settings screen, a page builder, and relationships between post
types. WordPress core provides storage for all of this — post meta, term meta,
and options — but no admin UI for any of it beyond a plain text input.

ADR-0009 chose ACF PRO to supply that UI. Three facts have since settled the
question differently:

1. ACF PRO is a recurring licence cost the client will not fund.
2. ACF free has no Repeater field. Price variants (`03-CONTENT-MODEL.md` §3.4),
   hours, navigation, and the page builder all repeat, so the free tier cannot
   express this content model at all.
3. The frontend never touches the fields layer. It consumes JSON from `gotg/v1`,
   and the response shapes in `04-API-CONTRACT.md` are byte-identical whichever
   mechanism stores the data.

Point 3 is the decisive one. The authoring mechanism is a backend implementation
detail with no bearing on the delivered product, so it should be chosen on cost,
dependency risk, and control rather than on developer convenience.

**Decision.** No custom-fields plugin. Not ACF PRO, not ACF free, not Meta Box,
not Carbon Fields, not Pods.

| Concern | Mechanism |
|---|---|
| Field storage | `register_post_meta()` and `register_term_meta()` in `mu-plugins/`, each with explicit `type`, `single`, `sanitize_callback`, and `auth_callback` |
| REST exposure | `show_in_rest` is `false` on every meta registration, consistent with ADR-0024. Meta reaches the frontend only through `gotg/v1` handlers. |
| Meta key convention | `_gotg_` prefix; the leading underscore makes the meta protected, so it never appears in the default Custom Fields UI |
| Admin UI | `add_meta_box()` with hand-written markup, nonce verification, per-post capability checks, sanitization on save, and validation errors surfaced inline and in a summary notice |
| Repeating fields | A single meta key holding an array of associative arrays, edited by a vanilla-JS repeater with add, remove, and move-up/move-down controls |
| Media fields | `wp_enqueue_media()` and the WordPress media modal, storing attachment IDs |
| Settings | One autoloaded option, `gotg_site_settings`, edited on a Settings API page |
| Database | Standard post types, post meta, term meta, and one option. **No custom tables.** |

Full specification: `03-CONTENT-MODEL.md`, particularly the meta box
implementation contract in §2.

**Consequences.**
- Positive: zero recurring software cost. `01-TECH-STACK.md` §11 no longer has a
  licence line, and DP-16 is no longer a hard blocker on the content model.
- Positive: zero third-party dependency in the authoring layer. Nothing can
  lapse, nothing can be deactivated, nothing ships a breaking major version.
  Risk R-14 is retired.
- Positive: field definitions are PHP in version control. There is no JSON sync
  step, no definitions living in the database, and no drift between an
  environment's database and the repository.
- Positive: total control of admin markup, which means the admin can meet the
  same WCAG 2.1 AA bar as the public site. Drag-and-drop reordering is dropped in
  favour of keyboard-operable move buttons precisely because that control now
  exists (`03-CONTENT-MODEL.md` §2.6).
- Positive: price is modelled as a repeater from day one at negligible marginal
  cost, retiring risk R-06 — the size-tiered-pricing migration that would
  otherwise have landed during content entry.
- **Negative: roughly 4.5 net additional developer-days**, itemised in
  `11-PROJECT-PLAN.md` §3. Phase 1 grows from 13 to 19.5 days. This is a real
  cost, budgeted rather than waved away.
- **Negative: hand-rolled validation and sanitization is a defect source.** Nonce
  checks, capability checks, sanitization, and the absent-checkbox problem are
  now project code repeated across six meta boxes and roughly forty fields, and
  copy-paste drift between handlers is the specific failure mode. Mitigated by
  implementing the seven-step save contract **once** in a shared helper, by
  two-layer sanitization, by PHPCS security rules blocking merge, and by unit
  tests per save handler. Registered as risk R-15 — the highest-scoring new risk
  this decision introduces.
- Negative: lower admin polish at launch than a mature commercial plugin would
  give. Addressed by ADR-0026's phased approach rather than by accepting it
  permanently.
- Negative: no field-level UI for an administrator to add a field without a
  developer. Acceptable — the schema is authoritative in `03-CONTENT-MODEL.md`
  and ad-hoc field creation would break the API contract anyway.
- Neutral: field data is stored as post meta either way, so query performance is
  unchanged from ADR-0009. Ordering and filtering stay on post columns and
  taxonomy terms rather than on meta.

**Alternatives considered.**
1. *ACF PRO 6.x* (~$49/yr single site, ~$249/yr agency). The original choice in
   ADR-0009. Rejected — the client will not fund a recurring licence, and it
   makes a commercial plugin load-bearing for the entire authoring layer. A
   lapsed licence or a removed plugin takes every edit screen with it.
2. *ACF free* ($0). Rejected — no Repeater field. Price variants, hours,
   navigation rows, people, and the page builder all require repeating
   structures. Working around this with numbered fields (`price_1`, `price_2`)
   or a serialised textarea would be worse than hand-building a proper repeater.
3. *Meta Box* (free core, ~$99/yr for the Repeater and Builder extensions).
   Rejected — the specific features needed sit behind the paid extensions, so it
   arrives at the same recurring cost as ACF PRO with less client familiarity and
   a smaller ecosystem.
4. *Carbon Fields* ($0, MIT, Composer-installed). The closest call. Genuinely
   free, code-defined rather than database-defined, and capable of everything
   required. Rejected on two grounds: it is maintained by a small team with a
   narrow contributor base, so it carries real abandonment risk for a project
   expected to run for years; and it would still interpose a third-party
   abstraction between the schema and the database for a nine-object model that
   core APIs handle directly. The saving over hand-building is real but smaller
   than it appears, because the meta box contract, validation, and error
   surfacing would still be project concerns.

---

### ADR-0026 — Phased admin UI; custom interface deferred to Phase 2

**Date:** 2026-07-22
**Status:** Accepted

**Context.** ADR-0025 makes the admin interface project code rather than a
plugin's output. That raises a scheduling question: build a purpose-designed
admin application now, or ship decluttered default WordPress screens and design
the custom interface later?

Building it now is tempting — the team is already in the admin layer, and a
bespoke "Grills" screen would present the menu far better than a list of posts.

**Decision.** Two phases.

**Phase 1 — default WordPress screens, decluttered.** Standard post edit screens
with purpose-built meta boxes, plus:

| Measure | Detail |
|---|---|
| Menu removal | `remove_menu_page()` hides Posts, Comments, Tools, Appearance, Plugins, Settings, and Users from non-administrators |
| Capability trimming | A dedicated `gotg_editor` role, cloned from Editor and trimmed, so hidden screens are also genuinely inaccessible by URL |
| Menu ordering | `menu_position` places the project's post types at the top of the admin nav |
| Box removal | `remove_meta_box()` strips slug, excerpt, comments, trackbacks, custom fields, and author from every project post type |
| Relabelling | Featured Image becomes "Dish Photo" / "Event Photo"; Page Attributes becomes "Order Within Section" |

**Phase 2 — a custom top-level "Grills" admin page** providing simplified editing
screens over the same post types and the same meta. Scoped and estimated at 9
developer-days in `11-PROJECT-PLAN.md` §3.0.

**Consequences.**
- Positive: launch is not delayed by 9 developer-days of admin polish. Every
  revenue-generating goal in `00-PROJECT-BRIEF.md` §4 depends on shipping, not on
  editor convenience.
- Positive: the Phase 2 interface is designed against observed behaviour rather
  than assumed behaviour. T-CO-10 records how the client actually uses the Phase 1
  screens and which tasks cause friction.
- Positive: the menu structure is unconfirmed (DP-21). A menu manager designed
  around an assumed section and pricing structure would be rebuilt once the real
  menu arrives.
- Positive: nothing built in Phase 1 is discarded. The custom screens read and
  write the same post types, the same meta keys, and the same validation helpers.
- Negative: the client's first experience of the CMS is plain WordPress. Meta
  boxes are functional but visually unremarkable, and a long menu is a long list
  of posts.
- Negative: risk that Phase 2 is pulled forward under pressure, disrupting the
  schedule. Registered as R-16. Mitigated by having Phase 2 already scoped and
  priced, so pulling it forward is a scheduling decision with a known cost rather
  than an emergency.
- Negative: if Phase 1 screens prove genuinely unusable rather than merely plain,
  that is a launch blocker. It must surface during T-CO-01 content entry — the
  first time the client enters 60–100 menu items — not after launch.

**Alternatives considered.**
1. *Build the custom admin application in Phase 1.* Rejected — 9 developer-days
   added to the critical path before launch, designed against guesses about both
   the client's workflow and the menu structure. The most likely outcome is
   building the wrong screens twice.
2. *Never build a custom admin.* Rejected as a default, though it remains a
   legitimate outcome. If T-CO-10 finds the client operating the Phase 1 screens
   comfortably, Phase 2 should be dropped rather than built for its own sake. The
   decision point is deliberately placed after evidence exists.
3. *Use the block editor with custom blocks as the admin UI.* Rejected — block
   content serialises to HTML comments in `post_content`, which is hostile to
   shaping into a clean JSON contract, and it would require `show_in_rest: true`,
   contradicting ADR-0024.
4. *A separate admin application outside WordPress, talking to the REST API.*
   Rejected — a second frontend to build, host, authenticate, and maintain, for a
   restaurant whose editor updates prices a few times a month.
