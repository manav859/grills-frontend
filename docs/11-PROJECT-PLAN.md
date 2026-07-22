# 11 — Project Plan

Status: **Living**
Last reviewed: 2026-07-22

Estimates are in **developer-days** for one developer working uninterrupted.
They exclude client review time, waiting on the Decisions Pending in
`00-PROJECT-BRIEF.md` §8, and content production by the client.

---

## 0. Definition of Done

Applies to every task. A task is not done until all rows are true.

| # | Criterion |
|---|---|
| 1 | Code is merged to `main` in the relevant repository |
| 2 | All CI stages pass (`10-ENVIRONMENTS-DEPLOYMENT.md` §5) |
| 3 | Verified on **staging** (MySQL), not only locally — see §10.4 of the environments document |
| 4 | Any content-model change is reflected in `03-CONTENT-MODEL.md` in the same PR |
| 5 | Any API shape change is reflected in `04-API-CONTRACT.md`, `types/api.ts`, and `types/api.schema.ts` in the same PR |
| 6 | No new axe critical or serious violations |
| 7 | Lighthouse budgets still met on affected routes |
| 8 | Any architectural decision is recorded as an ADR in `12-GLOSSARY-DECISIONS.md` |

---

## 1. Phase Overview

| Phase | Name | Duration (dev-days) | Gate |
|---|---|---|---|
| 0 | Foundation and Environments | 8 | Staging reachable end-to-end |
| 1 | Content Model, Admin UI, and API | 19.5 | All five endpoints pass contract tests on staging; every field editable in wp-admin |
| 2 | Design System and Primitives | 11 | Every primitive and layout component built and a11y-verified |
| 3 | Page Build | 21 | All five routes render real staging content |
| 4 | Integrations | 8 | Every integration has a verified failure mode |
| 5 | Content Production and Migration | 9 | Real content in staging, client sign-off |
| 6 | Hardening | 10 | All budgets met, full a11y audit passed |
| 7 | Launch and Cutover | 4 | Live on the production domain, zero downtime |
| 8 | Post-Launch Stabilisation | 5.5 | 14 days of clean monitoring |
| — | **Total to launch** | **97.75** | — |
| P2 | Custom admin application | 9 | Deferred — see §3.0 and ADR-0026 |

At a 4-day working week for one developer, 97.75 developer-days is approximately
**24 calendar weeks**. At full-time with a single developer, approximately
**20 calendar weeks** including review latency. `[ASSUMPTION] One developer
covering backend, frontend, and devops. Two developers working in parallel from
Phase 2 compresses this to roughly 14 calendar weeks, since Phase 1's admin UI
work parallelises against Phase 2's design system work.`

The Phase 1 figure includes the hand-built fields layer. See §3 for the
itemisation and the net cost of ADR-0025.

---

## 2. Phase Details

### Phase 0 — Foundation and Environments

**Objective:** Both repositories building, staging live on MySQL, CI green,
before any feature work.

| Aspect | Detail |
|---|---|
| Workstreams | DevOps, backend scaffolding, frontend scaffolding |
| Entry criteria | Repositories exist (**already met**); documentation set approved |
| Exit criteria | Staging WordPress serves a stub `gotg/v1/home`; Vercel preview builds and consumes it; CI passes on both repositories; environment variables registered in all environments |
| Dependencies | Client budget approval for hosting (DP-16) — **hard blocker**. No software licence is required; see ADR-0025. |
| Deliverables | Provisioned staging WordPress (MySQL, `utf8mb4`); Vercel project with all environments; both CI pipelines; `.env.example`; seed script; `AGENTS.md` Rules 3 and 5 amended |
| Risk | Cannot start feature work without hosting; escalate DP-16 immediately |

### Phase 1 — Content Model, Admin UI, and API

**Objective:** The complete schema from `03-CONTENT-MODEL.md` registered as
native meta with working admin editing, and all five endpoints returning
contract-conformant payloads.

| Aspect | Detail |
|---|---|
| Workstreams | Backend, admin UI, contract testing |
| Entry criteria | Phase 0 exit met |
| Exit criteria | All CPTs, taxonomies, post meta, term meta, and the settings option registered from `mu-plugins`; every field editable through a meta box that satisfies the §2 contract in `03-CONTENT-MODEL.md`; the `gotg_editor` role exists and is verified against the capability table; all five endpoints return 200 and pass `.strict()` Zod contract tests against staging; core REST locked down; revalidation webhook fires |
| Dependencies | Phase 0 |
| Deliverables | `mu-plugins/gotg/` complete including `meta.php`, `admin/` meta boxes, `gotg-repeater.js`, `gotg-block-builder.js`; `types/api.ts` and `types/api.schema.ts`; contract test suite; editor guardrails; role definition |
| Note | This phase is larger than it was under a fields plugin. Admin UI is roughly 6.5 of its 19.5 developer-days. That cost is the accepted tradeoff in ADR-0025 and `01-TECH-STACK.md` §4.1. |
| Note | Blocked partially on DP-21 (the real menu) for *content*, not for *schema*. Price variants are modelled as a repeater from the outset, so a size-tiered menu no longer forces a model change — this is why R-06 is retired. |

### Phase 2 — Design System and Primitives

**Objective:** Tokens implemented and every primitive, layout, navigation, and
form component built and accessibility-verified in isolation.

| Aspect | Detail |
|---|---|
| Workstreams | Frontend, design |
| Entry criteria | `05-DESIGN-SYSTEM.md` reviewed; brand assets received or provisional tokens accepted |
| Exit criteria | `tokens.css` and `theme.css` in place; contrast test suite passing; every component in `05-DESIGN-SYSTEM.md` §10.1, §10.2, §10.4, §10.5 built to its `06-COMPONENT-SPEC.md` entry; keyboard and screen-reader verified for `MobileNav`, `DaypartFilter`, `Gallery` carousel, and `ContactForm` |
| Dependencies | Phase 0. **Not** dependent on Phase 1 — components take typed props and can be built against fixtures. |
| Deliverables | Complete token layer; primitives; layout; navigation; forms; font files and loading strategy |
| Risk | DP-10 unresolved means tokens are provisional; a late brand delivery forces a token sweep. Mitigated by every value being a token — a palette swap is a one-file change plus a contrast re-run. |

### Phase 3 — Page Build

**Objective:** All five routes plus event detail rendering real staging content.

| Aspect | Detail |
|---|---|
| Workstreams | Frontend |
| Entry criteria | Phases 1 and 2 exit met |
| Exit criteria | All routes render from live staging endpoints; all content-block components built; metadata, sitemap, robots, and all JSON-LD emitted and validated; preview mode works end-to-end; every empty state verified by emptying the corresponding staging content |
| Dependencies | Phases 1, 2 |
| Deliverables | Six route files; content-block components; `lib/seo.ts`; `lib/json-ld.ts`; `sitemap.ts`; `robots.ts`; preview and revalidate route handlers; `error.tsx`, `not-found.tsx`, `global-error.tsx` |

### Phase 4 — Integrations

**Objective:** Every third-party surface wired, each with a verified failure
mode.

| Aspect | Detail |
|---|---|
| Workstreams | Frontend, devops |
| Entry criteria | Phase 3 exit met; vendor approvals obtained |
| Exit criteria | Contact form delivers end-to-end; Instagram feed renders and degrades correctly when the API is blocked; static map renders and degrades; GA4 fires every custom event in `09-INTEGRATIONS.md` §9; Sentry receives a test error with PII scrubbed; every row of the §13 failure matrix verified by deliberately breaking the integration |
| Dependencies | Phase 3; DP-04, DP-07, DP-08, DP-17, DP-18, DP-19 |
| Deliverables | Contact Server Action; Instagram component wired; map wired; analytics; Sentry; the failure-matrix verification record |

### Phase 5 — Content Production and Migration

**Objective:** Real content in staging, signed off by the client.

| Aspect | Detail |
|---|---|
| Workstreams | Content, client, backend |
| Entry criteria | Phase 3 exit met (editors need working pages to review); DP-21 resolved |
| Exit criteria | Complete menu entered with current prices; About copy written and approved; all events for the next 60 days entered; Site Settings fully populated; every image sourced, cropped, alt-texted, and uploaded; legal pages drafted and client-legal-reviewed; client written sign-off |
| Dependencies | DP-01, DP-02, DP-03, DP-09, DP-11, DP-12, DP-21, DP-22 |
| Deliverables | Populated staging content; image library; approved copy; privacy and accessibility pages |
| Risk | The single most common cause of restaurant-site delay. Owned by the client, not the build team. See R-01. |

### Phase 6 — Hardening

**Objective:** Meet every budget in `08-PERFORMANCE-SEO-A11Y.md` with real
content in place.

| Aspect | Detail |
|---|---|
| Workstreams | Frontend, QA |
| Entry criteria | Phases 4 and 5 exit met |
| Exit criteria | All Core Web Vitals and byte budgets met on every route with real content and real images; full WCAG 2.1 AA manual audit passed including the screen-reader matrix; cross-browser and cross-device pass; all redirects verified; structured data passes the Rich Results Test; load-tested |
| Dependencies | Phases 4, 5 |
| Deliverables | Lighthouse CI reports for all routes; the completed a11y audit document; a device test matrix record; the finalised redirect map |

### Phase 7 — Launch and Cutover

**Objective:** Live on the production domain with no downtime.

| Aspect | Detail |
|---|---|
| Workstreams | DevOps, client |
| Entry criteria | Phase 6 exit met; DP-13 and DP-14 resolved; TTL lowered ≥ 48 hours prior; client sign-off |
| Exit criteria | Production DNS resolves to Vercel; SSL active on apex and `www`; every route and redirect verified live; sitemap submitted; GA4 receiving; Google Business Profile and Instagram bio updated; contact form verified live |
| Dependencies | Phase 6; DP-13, DP-14 |
| Deliverables | Live site; completed cutover runbook with every step signed off; the DNS record set before and after, recorded |

### Phase 8 — Post-Launch Stabilisation

**Objective:** Fourteen days of clean operation and a documented handover.

| Aspect | Detail |
|---|---|
| Workstreams | All |
| Entry criteria | Phase 7 exit met |
| Exit criteria | Zero Search Console crawl errors for 14 consecutive days; no unresolved Sentry issues; Core Web Vitals field data within target; editor training delivered; Squarespace cancelled (T+7d minimum); Phase 2 backlog agreed |
| Dependencies | Phase 7 |
| Deliverables | Editor handbook; a 14-day monitoring report; the Phase 2 backlog |

---

## 3. Task Backlog

Areas: **BE** backend · **FE** frontend · **CO** content · **DO** devops.

| ID | Task | Phase | Area | Depends on | Est. |
|---|---|---|---|---|---|
| T-DO-01 | Confirm hosting budget; provision accounts. No software licence needed — ADR-0025 | 0 | DO | — | 0.5 |
| T-DO-02 | Provision Vercel project; configure all four environments and variables | 0 | DO | T-DO-01 | 0.5 |
| T-DO-03 | Provision staging WordPress on MySQL 8.0; verify `utf8mb4`; enable Redis | 0 | DO | T-DO-01 | 1 |
| T-DO-04 | Frontend CI pipeline: typecheck, lint, test, build, bundle report | 0 | DO | T-DO-02 | 1 |
| T-DO-05 | Backend CI pipeline: phpcs, PHPStan, meta-registration drift check against `03-CONTENT-MODEL.md` | 0 | DO | T-DO-03 | 1 |
| T-BE-01 | ~~Amend `AGENTS.md` Rule 3 from GraphQL to REST exposure~~ **Done 2026-07-22** — see ADR-0024 | 0 | BE | — | 0.25 |
| T-BE-02 | Scaffold `mu-plugins/gotg-core.php` and the `gotg/` module structure | 0 | BE | — | 0.5 |
| T-BE-03 | Write the idempotent content seed script | 0 | BE | T-BE-02 | 1 |
| T-FE-01 | Scaffold Next.js app: TypeScript config, ESLint, Prettier, Husky, folder structure | 0 | FE | T-DO-02 | 1 |
| T-FE-02 | `lib/env.ts` validation and `.env.example` | 0 | FE | T-FE-01 | 0.5 |
| T-DO-06 | Verify end-to-end: staging WordPress → Vercel preview | 0 | DO | T-DO-03, T-FE-01 | 0.75 |
| T-BE-04 | Register the four CPTs: `gotg_menu_item`, `gotg_event`, `gotg_location`, `gotg_block` | 1 | BE | T-BE-02 | 1 |
| T-BE-05 | Register the two taxonomies with custom `meta_box_cb` (radio sections, fixed dietary list) | 1 | BE | T-BE-04 | 0.75 |
| T-BE-06 | Register all post meta and term meta with `type`, `single`, `sanitize_callback`, `auth_callback`; write the shared sanitizer library | 1 | BE | T-BE-04, T-BE-05 | 1.5 |
| T-BE-07 | Meta box framework: nonce/capability/validation helpers, error transient, `admin_notices` summary, field-render partials | 1 | BE | T-BE-06 | 1.5 |
| T-BE-08 | Repeater component: `gotg-repeater.js`, row template markup, add/remove/move-up/move-down, live-region announcements, focus management, PHP reindexing | 1 | BE | T-BE-07 | 0.5 |
| T-BE-09 | Media field wiring: `wp_enqueue_media()`, picker script, preview markup, attachment validation | 1 | BE | T-BE-07 | 0.5 |
| T-BE-10 | Menu Item meta box, including the price-variants repeater and daypart checkboxes | 1 | BE | T-BE-08 | 1 |
| T-BE-11 | Event meta box, including conditional field display and end-after-start validation | 1 | BE | T-BE-07 | 1 |
| T-BE-12 | Location meta boxes: address/contact, plus fixed 7-row regular hours and the exceptions repeater | 1 | BE | T-BE-08 | 1.25 |
| T-BE-13 | Term meta forms for `gotg_menu_section` and `gotg_dietary` on the add and edit screens | 1 | BE | T-BE-07, T-BE-09 | 0.75 |
| T-BE-14 | SEO meta box for pages and events, with character counters | 1 | BE | T-BE-07, T-BE-09 | 0.5 |
| T-BE-15 | Page-block builder: `gotg-block-builder.js`, ten block panels, per-page type filtering, nested people repeater | 1 | BE | T-BE-08, T-BE-09 | 2 |
| T-BE-16 | Site Settings: option registration, `add_menu_page`, six tabs, merge-on-save sanitizer | 1 | BE | T-BE-08, T-BE-09 | 1.5 |
| T-BE-17 | Admin declutter: `remove_menu_page`, `remove_meta_box`, relabelling, list-table columns | 1 | BE | T-BE-04 | 0.5 |
| T-BE-18 | `gotg_editor` role: creation on activation, capability trimming, verification against the §13.3 table | 1 | BE | T-BE-04 | 0.5 |
| T-BE-19 | Register image sizes; implement the blur-placeholder generator | 1 | BE | T-BE-02 | 0.5 |
| T-BE-20 | Shaper helpers: `gotg_shape_image`, `gotg_shape_seo`, `gotg_build_global` | 1 | BE | T-BE-06, T-BE-16 | 1 |
| T-BE-21 | Shaper helpers: `gotg_shape_menu_item`, `gotg_shape_price_variants`, `gotg_shape_event`, `gotg_shape_blocks`; batched `update_meta_cache()` | 1 | BE | T-BE-06 | 1.5 |
| T-BE-22 | Register all five `gotg/v1` routes with permission callbacks and args | 1 | BE | T-BE-20, T-BE-21 | 1.5 |
| T-BE-23 | Lock down core REST for anonymous users | 1 | BE | T-BE-22 | 0.25 |
| T-BE-24 | Implement the revalidation webhook sender with the full tag map | 1 | BE | T-BE-22 | 0.75 |
| T-BE-25 | Editor guardrails: single-section enforcement, page deletion block, undersized-upload rejection, missing-alt notice, sectionless-item badge | 1 | BE | T-BE-10, T-BE-15 | 1 |
| T-BE-26 | Admin accessibility pass: keyboard-only run through every meta box, axe scan of the edit screens, screen-reader check of the repeater | 1 | BE | T-BE-10, T-BE-12, T-BE-15, T-BE-16 | 0.75 |
| T-FE-03 | Transcribe `types/api.ts` from `04-API-CONTRACT.md` | 1 | FE | T-BE-22 | 0.75 |
| T-FE-04 | Write `types/api.schema.ts` with the exactness type assertions | 1 | FE | T-FE-03 | 0.75 |
| T-FE-05 | Contract test suite hitting staging; wire into CI | 1 | FE | T-FE-04, T-DO-06 | 0.75 |
| T-FE-06 | Implement `tokens.css` and `theme.css` from `05-DESIGN-SYSTEM.md` | 2 | FE | T-FE-01 | 1 |
| T-FE-07 | Contrast pair data and `pnpm test:contrast` suite | 2 | FE | T-FE-06 | 0.5 |
| T-FE-08 | Font subsetting, self-hosting, `@font-face` with metric overrides, preloads | 2 | FE | T-FE-06 | 0.75 |
| T-FE-09 | Primitives: `Button`, `LinkButton`, `IconButton` | 2 | FE | T-FE-06 | 1 |
| T-FE-10 | Primitives: `Heading`, `Text`, `Badge`, `Price`, `Divider`, `VisuallyHidden` | 2 | FE | T-FE-06 | 0.75 |
| T-FE-11 | Primitives: `Icon` set (24 glyphs), `Image`, `Skeleton`, `Spinner` | 2 | FE | T-FE-06 | 1.25 |
| T-FE-12 | Layout: `Container`, `Section`, `Stack`, `Grid`, `SplitLayout`, `PageShell` | 2 | FE | T-FE-10 | 1 |
| T-FE-13 | Navigation: `SiteHeader`, `PrimaryNav`, `SkipLink`, `SiteFooter`, `SocialLinks` | 2 | FE | T-FE-12 | 1.5 |
| T-FE-14 | Navigation: `MobileNav` with focus trap, scroll lock, and inert background | 2 | FE | T-FE-13 | 1.25 |
| T-FE-15 | Navigation: `MobileCtaBar`, `AnnouncementBar`, `Breadcrumbs` | 2 | FE | T-FE-13 | 0.75 |
| T-FE-16 | Forms: `Field`, `TextInput`, `TextArea`, `Select`, `Checkbox`, `FormError`, `FormSuccess`, `Honeypot` | 2 | FE | T-FE-09 | 1.25 |
| T-FE-17 | `lib/api.ts` fetch wrapper with tags, revalidate, and error handling | 3 | FE | T-FE-03 | 0.5 |
| T-FE-18 | `lib/format.ts`, `lib/dates.ts`, `lib/hours.ts` (Pacific-time logic) | 3 | FE | T-FE-03 | 1 |
| T-FE-19 | `PageBlockRenderer` with the exhaustiveness guard | 3 | FE | T-FE-12 | 0.5 |
| T-FE-20 | Blocks: `Hero`, `TextSection`, `RichText`, `SplitFeature`, `CtaBand` | 3 | FE | T-FE-19 | 1.5 |
| T-FE-21 | Blocks: `Gallery` grid and carousel with the full keyboard contract | 3 | FE | T-FE-19 | 1.25 |
| T-FE-22 | Blocks: `MenuCard`, `MenuSection`, `DietaryLegend` | 3 | FE | T-FE-19 | 1.5 |
| T-FE-23 | Blocks: `EventCard`, `EventHero`, `RecurringProgrammeCard`, `AddToCalendar` | 3 | FE | T-FE-19, T-FE-18 | 1.5 |
| T-FE-24 | Blocks: `FeaturedMenuRow`, `EventsPreview`, `People`, `PersonCard`, `PageHeader` | 3 | FE | T-FE-22, T-FE-23 | 1 |
| T-FE-25 | Blocks: `LocationCard`, `HoursTable`, `MapEmbed` | 3 | FE | T-FE-18 | 1 |
| T-FE-26 | Navigation: `SectionNav`, `DaypartFilter`, `HoursStatus` | 3 | FE | T-FE-18, T-FE-22 | 1.5 |
| T-FE-27 | Route: `/` with metadata and `Restaurant`/`WebSite` JSON-LD | 3 | FE | T-FE-20, T-FE-24 | 1 |
| T-FE-28 | Route: `/menu` with `Menu` JSON-LD | 3 | FE | T-FE-22, T-FE-26 | 1 |
| T-FE-29 | Routes: `/events` and `/events/[slug]` with `Event` and `BreadcrumbList` JSON-LD | 3 | FE | T-FE-23 | 1.25 |
| T-FE-30 | Routes: `/about` and `/contact` | 3 | FE | T-FE-24, T-FE-25 | 1 |
| T-FE-31 | Routes: `/privacy-policy`, `/accessibility`, `not-found`, `error`, `global-error` | 3 | FE | T-FE-12 | 0.75 |
| T-FE-32 | `sitemap.ts`, `robots.ts`, and the full redirect map in `next.config.ts` | 3 | FE | T-FE-27 | 0.75 |
| T-FE-33 | `/preview` and `/preview/exit` route handlers; wire WordPress preview links | 3 | FE | T-FE-17 | 1 |
| T-FE-34 | `/api/revalidate` route handler with the tag allow-list | 3 | FE | T-BE-16 | 0.5 |
| T-FE-35 | Contact form Server Action with Resend, validation, and spam defences | 4 | FE | T-FE-16 | 1.25 |
| T-FE-36 | `InstagramFeed` with lazy load, timeout, and error fallback | 4 | FE | T-FE-11 | 1 |
| T-FE-37 | Static map integration with server-side URL signing | 4 | FE | T-FE-25 | 0.75 |
| T-FE-38 | GA4 with all ten custom events | 4 | FE | T-FE-27 | 1 |
| T-FE-39 | Sentry with PII scrubbing and source-map upload | 4 | FE | T-FE-01 | 0.75 |
| T-DO-07 | Verify every row of the integration failure matrix by breaking each integration | 4 | DO | T-FE-35, T-FE-36, T-FE-37 | 1 |
| T-DO-08 | Configure Resend domain verification: SPF and DKIM records | 4 | DO | T-FE-35 | 0.5 |
| T-CO-01 | Enter the complete menu into staging with current prices | 5 | CO | T-BE-25, DP-21 | 2 |
| T-CO-02 | Write and enter About copy, owner bios, and positioning | 5 | CO | DP-03 | 1 |
| T-CO-03 | Enter the next 60 days of events | 5 | CO | T-BE-11 | 0.5 |
| T-CO-04 | Populate Site Settings including hours exceptions | 5 | CO | T-BE-12, T-BE-16, DP-01, DP-09 | 0.5 |
| T-CO-05 | Source, crop, optimise, alt-text, and upload all imagery | 5 | CO | DP-11, DP-12 | 2 |
| T-CO-06 | Write SEO titles and meta descriptions for every page and event | 5 | CO | T-BE-14 | 0.75 |
| T-CO-07 | Draft the privacy policy and accessibility statement; client legal review | 5 | CO | T-FE-31 | 1 |
| T-CO-08 | Client content review and written sign-off | 5 | CO | T-CO-01…T-CO-07 | 1.25 |
| T-CD-01 | Export the indexed-URL list from Search Console | 6 | DO | DP-17 | 0.25 |
| T-CD-02 | Crawl Squarespace; reconcile against the redirect map; extend it | 6 | DO | T-CD-01 | 0.75 |
| T-FE-40 | Performance pass against real content: images, bundles, budgets | 6 | FE | T-CO-08 | 1.5 |
| T-FE-41 | Full manual WCAG 2.1 AA audit; remediate | 6 | FE | T-CO-08 | 2 |
| T-FE-42 | Screen-reader pass across the four-reader matrix | 6 | FE | T-FE-41 | 1 |
| T-FE-43 | Cross-browser and cross-device pass | 6 | FE | T-CO-08 | 1 |
| T-FE-44 | Validate all structured data in the Rich Results Test | 6 | FE | T-CO-06 | 0.5 |
| T-DO-09 | Playwright redirect test suite for the full map | 6 | DO | T-CD-02 | 0.75 |
| T-DO-10 | Lighthouse CI thresholds tuned and enforced on all routes | 6 | DO | T-FE-40 | 0.5 |
| T-DO-11 | Provision production WordPress; migrate content from staging | 6 | DO | T-CO-08 | 1 |
| T-DO-12 | Record every existing DNS record; lower TTL to 300s | 7 | DO | DP-13 | 0.25 |
| T-DO-13 | Add production domains to Vercel; verify SSL provisioning | 7 | DO | DP-14 | 0.25 |
| T-DO-14 | Execute the cutover runbook | 7 | DO | T-DO-11, T-DO-12, T-DO-13 | 1 |
| T-DO-15 | Post-cutover verification: routes, redirects, forms, analytics, schema | 7 | DO | T-DO-14 | 0.75 |
| T-DO-16 | Submit the sitemap; request indexing; update Google Business Profile | 7 | DO | T-DO-15 | 0.5 |
| T-DO-17 | Restore TTL; monitor Search Console for 48 hours | 7 | DO | T-DO-15 | 0.5 |
| T-CO-09 | Editor training session and handbook | 8 | CO | T-DO-15 | 1 |
| T-DO-18 | 14-day monitoring: Sentry, Search Console, Core Web Vitals | 8 | DO | T-DO-15 | 1.5 |
| T-DO-19 | Cancel Squarespace (T+7d minimum) | 8 | DO | T-DO-18 | 0.25 |
| T-DO-20 | Verify a backup restore end-to-end | 8 | DO | T-DO-11 | 0.75 |
| T-CO-10 | Record how the client actually uses the Phase 1 admin screens; log friction points | 8 | CO | T-CO-09 | 0.5 |
| T-DO-21 | Agree the Phase 2 backlog with the client | 8 | DO | T-DO-18, T-CO-10 | 0.5 |

Total: **97.75 developer-days** for Phase 0–8.

The increase from the previous 89 is Phase 1 growing from 13 to 19.5 days: the
admin UI that a fields plugin would have supplied is now build work. Itemised:

| Work | Days |
|---|---|
| Meta box framework (T-BE-07) | 1.5 |
| Repeater component and JS (T-BE-08) | 0.5 |
| Media field wiring (T-BE-09) | 0.5 |
| Page-block builder (T-BE-15) | 2.0 |
| Site Settings screen (T-BE-16) | 1.5 |
| Admin declutter (T-BE-17) | 0.5 |
| Role and capabilities (T-BE-18) | 0.5 |
| Admin accessibility pass (T-BE-26) | 0.75 |
| **Total attributable to hand-building the fields layer** | **7.75** |

Roughly 3.25 of those days would have been spent configuring a fields plugin
anyway, so the true net cost of ADR-0025 is about **4.5 developer-days**, matching
the figure in `01-TECH-STACK.md` §4.1.

### 3.0 Phase 2 backlog — custom admin application

Not built in Phase 1. Scoped here so it is estimated rather than discovered.

| ID | Task | Area | Depends on | Est. |
|---|---|---|---|---|
| T-P2-01 | Observe and document Phase 1 admin usage; identify the three highest-friction tasks | CO | T-CO-10 | 0.5 |
| T-P2-02 | Design the "Grills" admin screens against those findings | FE | T-P2-01 | 1.5 |
| T-P2-03 | Top-level `add_menu_page()` shell, sub-screens, nav, capability gating | BE | T-P2-02 | 1 |
| T-P2-04 | Simplified menu manager: all items on one screen, inline price and availability editing, drag-free reordering | BE | T-P2-03 | 3 |
| T-P2-05 | Simplified events screen: upcoming list, quick-add for a recurring live-music night | BE | T-P2-03 | 1.5 |
| T-P2-06 | Accessibility and keyboard pass over the new screens | BE | T-P2-04, T-P2-05 | 1 |
| T-P2-07 | Editor retraining on the new screens | CO | T-P2-06 | 0.5 |
| | **Phase 2 admin subtotal** | | | **9** |

`[ASSUMPTION] 9 developer-days assumes the custom screens wrap the same post
types and meta with no schema change. If Phase 1 usage reveals the content model
itself is wrong for the client's workflow, that is a separate and larger piece of
work.`

**Why this is deferred rather than built up front** — recorded as ADR-0026:

| Reason | Detail |
|---|---|
| The requirements do not exist yet | An editor UI is worth building when it removes known friction. Which screens are painful is not knowable before the client has used them for real. |
| The menu structure is unconfirmed | DP-21 is open. A menu manager designed around an assumed section and pricing structure would be rebuilt once the real menu arrives. |
| Default screens are functional, not blocking | Decluttered WordPress edit screens plus purpose-built meta boxes are entirely usable. This defers polish, not capability. |
| It protects the launch date | 9 developer-days of admin polish ahead of launch delays every revenue-generating goal in `00-PROJECT-BRIEF.md` §4 in exchange for editor convenience. |
| The cost of waiting is low | The custom screens read and write the same post types and meta. Nothing built in Phase 1 is thrown away. |

### 3.1 Critical path

```
T-DO-01 → T-DO-03 → T-BE-02 → T-BE-04/05 → T-BE-06 → T-BE-07
  → T-BE-08 → T-BE-10/15 → T-BE-21 → T-BE-22 → T-FE-03 → T-FE-05
  → T-FE-22 → T-FE-28 → T-CO-01 → T-CO-08
  → T-FE-40/41 → T-DO-11 → T-DO-14
```

T-DO-01 (budget approval) sits at the head of the critical path. Every day it
slips is a day the project slips.

---

## 4. Risk Register

Likelihood and impact are High / Medium / Low. Score is the product, used only
for ordering.

| ID | Risk | Likelihood | Impact | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R-01 | Content production stalls — the menu, copy, and photography are not delivered | **High** | **High** | 9 | Content is Phase 5 with named tasks and dates, not a launch-week afterthought. Structured menu data is requested at kickoff (DP-21). A launch-blocking content checklist is reviewed weekly. If content is not ready, the launch date moves rather than the site shipping with placeholders. | Client |
| R-02 | Decisions Pending remain unanswered, blocking integrations and schema | **High** | **Medium** | 6 | All 22 are tabulated in `00-PROJECT-BRIEF.md` §8 with owners. Reviewed at every client checkpoint. Items unanswered by the Phase 4 entry gate default to "not built in Phase 1" and are moved to the Phase 2 backlog. | Project lead |
| R-03 | SQLite/MySQL divergence produces staging-only defects | **Medium** | **High** | 6 | Full analysis in `10-ENVIRONMENTS-DEPLOYMENT.md` §10. Raw SQL is banned and enforced by PHPCS. Staging exists from Phase 0. Definition of Done requires staging verification. Escalation trigger: three or more divergence defects in one phase forces reconsideration of local MySQL. | Backend dev |
| R-04 | PHP output and TypeScript interfaces drift; a field renamed in PHP silently becomes `undefined` in the UI | **Medium** | **High** | 6 | Types are hand-maintained by decision (ADR-0003), so this risk is structural. Contract tests with `.strict()` Zod schemas run in CI on both repositories against staging and fail the build on any extra or missing key. Backend-before-frontend deploy ordering is mandated. A field rename requires paired PRs. | Both devs |
| R-05 | Brand assets (DP-10) arrive late or contradict the provisional tokens | **Medium** | **Medium** | 4 | Every value is a token; no hard-coded colours or sizes exist anywhere. A palette change is a one-file edit plus a contrast test re-run. Type-scale changes are similarly centralised. Budget 1 developer-day for a full token sweep. | Design |
| ~~R-06~~ | ~~The real menu needs size-tiered pricing, which the single `price` field cannot express~~ | — | — | — | **Retired 2026-07-22.** Price is modelled as a repeater (`_gotg_price_variants`) from the outset — `03-CONTENT-MODEL.md` §3.4. A size-tiered menu now requires no schema, API, or component change. | — |
| R-07 | DNS cutover breaks email because MX or SPF records are altered | **Low** | **High** | 3 | `10-ENVIRONMENTS-DEPLOYMENT.md` §9.5. Every existing record is recorded before any change; only the A and `www` CNAME records are touched. Email delivery is tested immediately after cutover. | DevOps |
| R-08 | Squarespace is cancelled before the new site is confirmed stable, removing the rollback target | **Low** | **High** | 3 | Cancellation is task T-DO-19 in Phase 8, gated on 14 days of clean monitoring and explicitly no earlier than T+7 days. Stated in the runbook as a hard rule. | Project lead |
| R-09 | Client budget rejects Vercel Pro or managed WordPress hosting | **Low** | **High** | 3 | Escalated as T-DO-01, the first task on the critical path. Fallback options and their tradeoffs are documented in `01-TECH-STACK.md` §5. Self-managed hosting adds roughly 3 developer-days of setup and ongoing maintenance liability. | Project lead |
| R-10 | Instagram integration breaks — Meta API changes or the vendor shuts down | **Low** | **Low** | 1 | Behold is a JSON API behind one component with a defined error state. Losing it degrades to a profile link. Swapping vendors is under 0.5 developer-days. | Frontend dev |
| R-11 | Dietary/allergen claims create liability exposure | **Low** | **Medium** | 2 | DP-22. The taxonomy ships registered but unpopulated until the client confirms willingness and approves disclaimer copy. `DietaryLegend` renders nothing on an empty tag set. | Client |
| R-12 | Traffic loss after cutover due to missed redirects | **Medium** | **Medium** | 4 | T-CD-01 and T-CD-02 build the authoritative URL list from Search Console plus a crawl, not from assumption. T-DO-09 tests every redirect automatically. Search Console 404 monitoring for 90 days post-launch. | DevOps |
| R-13 | Single-developer bus factor | **Medium** | **High** | 6 | This documentation set is the mitigation — it is written so a second developer or an AI agent can pick up any task from the documents alone. Both repositories are on GitHub with client-accessible ownership. No knowledge lives only in a person's head. | Project lead |
| ~~R-14~~ | ~~ACF PRO licence lapses or the plugin is removed, taking the entire field layer with it~~ | — | — | — | **Retired 2026-07-22 by ADR-0025.** No custom-fields plugin is installed. Field definitions are PHP in `mu-plugins/`, version controlled, with no licence to lapse. | — |
| R-15 | Hand-rolled validation and sanitization is a defect source — a missed nonce, a missing capability check, an unsanitized field, or a checkbox that silently keeps its old value | **Medium** | **High** | 6 | The security and correctness work a fields plugin performs is now project code, and it is repeated across six meta boxes and roughly forty fields. Copy-paste drift between handlers is the specific failure mode. Mitigations: (a) the seven-step save contract in `03-CONTENT-MODEL.md` §2.3 is mandatory and implemented **once** in a shared helper, not re-written per box; (b) two-layer sanitization — `sanitize_callback` on registration plus save-handler validation — so a bypassed handler still cannot write unsanitized data; (c) PHPCS `WordPress.Security` rules run in CI and block merge on a missing nonce or unescaped output; (d) a PHPStan rule asserting every `add_meta_box` callback has a paired `save_post` handler; (e) unit tests per save handler covering the absent-checkbox, invalid-value, missing-nonce, and insufficient-capability paths; (f) the PR checklist in `07-CODING-STANDARDS.md` gains a meta-box section. | Backend dev |
| R-16 | The hand-built admin proves too awkward for the client, and the Phase 2 admin app is pulled forward under pressure | **Medium** | **Medium** | 4 | T-CO-10 observes real usage rather than waiting for complaints. Phase 2 is already scoped and estimated (§3.0), so pulling it forward is a scheduling decision with a known price rather than an emergency. If the client cannot operate the Phase 1 screens at all, that is a launch blocker and must surface during T-CO-01 content entry, not after launch. | Project lead |
| R-17 | Admin accessibility regressions — the repeater, block builder, and media picker are custom widgets with keyboard and screen-reader contracts | **Low** | **Medium** | 2 | Contracts are specified up front in `03-CONTENT-MODEL.md` §2.6 and §2.7, drag-and-drop is excluded deliberately, and T-BE-26 is a dedicated keyboard and screen-reader pass over every admin screen. The admin an editor uses daily is held to the same WCAG 2.1 AA standard as the public site. | Backend dev |

---

## 5. Content Migration Plan

### 5.1 Carries over unchanged

| Item | Source | Destination | Notes |
|---|---|---|---|
| Phone number | Squarespace footer | `gotg_location.phone` | Verify it is current |
| Hours (Mon–Sun 6am–9pm) | Squarespace footer | `gotg_location.regular_hours` | Verify; capture exceptions per DP-09 |
| Instagram handle | Squarespace embed | `gotg_site_settings.social_links` | — |
| Tagline "Smoke your birdie" | Squarespace | `gotg_site_settings.tagline` | — |
| Live music schedule (Fri/Sat 6–9pm) | Squarespace Events | `gotg_site_settings` recurring programme | Modelled as a standing programme, not repeated events |

### 5.2 Rewritten

| Item | Why | Owner | Task |
|---|---|---|---|
| Home page copy | The existing site is a hero image and a tagline. There is no positioning copy to migrate. | Copywriter + client | T-CO-02 |
| About page | The single existing paragraph is a starting point, not a finished About page. Mark and Marco's story is the credibility asset and is currently unwritten. | Copywriter + client | T-CO-02 |
| Menu | Existing menu copy carries over as *text*, but every item must be re-entered as structured data: price, description, daypart availability, section, dietary tags. There is no import path from a Squarespace page to `gotg_menu_item`. | Client + build team | T-CO-01 |
| Events page copy | Currently a mention. Needs framing copy for the standing programme plus per-event summaries. | Copywriter | T-CO-02 |
| Contact page copy | Needs directions guidance ("at Simi Hills Golf Course, enter from…"), parking, and a clear catering path. | Copywriter | T-CO-02 |
| SEO titles and meta descriptions | None exist. All are new. | Build team | T-CO-06 |
| Privacy policy | Squarespace's boilerplate does not cover this stack's vendors. | Build team + client legal | T-CO-07 |

### 5.3 Must be re-shot or sourced

Photography is the highest-risk content item. The existing Squarespace imagery
is limited and its rights status and resolution are unknown (DP-11).

| Need | Minimum spec | Quantity | Status |
|---|---|---|---|
| Home hero | 2400×1350, landscape, food or smoker at golden hour | 1 | `[NEEDS CLIENT INPUT]` — DP-11, DP-12 |
| Featured menu items | 800×600, plated, consistent lighting | 6 | Not available |
| Menu item photos | 800×600 | 15–30 (a photo per item is not required) | Not available |
| Section banners | 1200×800 | 3–4 | Optional |
| Owner portraits — Mark, Marco | 800×800, square | 2 | Not available |
| About gallery — smoker, patio, course view, kitchen | 1200×900 | 6–12 | Not available |
| Event/performer photos | 800×600 | Per event | Client-supplied per event |
| Social share image | 1200×630 | 1 | Derive from the hero |
| Logo — SVG source | Vector, red and white variants | 2 | `[NEEDS CLIENT INPUT]` — DP-10 |
| Favicon source | 512×512 PNG | 1 | Derive from the logo |

**Recommendation:** a half-day professional shoot covering the hero, six featured
items, two portraits, and eight atmosphere shots. `[ASSUMPTION] A half-day
restaurant shoot in the Simi Valley area runs roughly $800–1,500.
[NEEDS CLIENT INPUT] — DP-12, budget approval.`

Without a shoot, the site launches with existing imagery of unverified quality.
The visual direction in `05-DESIGN-SYSTEM.md` §0 depends on photography carrying
the page; weak imagery degrades the outcome more than any other single factor.

### 5.4 Not migrated

| Item | Reason |
|---|---|
| Squarespace page templates and layout | Replaced entirely |
| Squarespace forms and any stored submissions | New form vendor; export any existing submissions to CSV for the client's records before cancellation |
| Squarespace Instagram embed | Replaced by the Behold integration |
| Squarespace analytics history | Not portable. Export a summary report before cancellation for baseline reference. |
| Squarespace SEO settings | Superseded by the `_gotg_seo_*` post meta fields |

### 5.5 Migration sequence

| # | Step | Task | Gate |
|---|---|---|---|
| 1 | Export everything from Squarespace: content, media, forms, analytics summary | T-CD-01 | Archive stored before any cancellation |
| 2 | Audit the media library; identify what is reusable at the required resolution | T-CO-05 | Reuse list agreed |
| 3 | Commission and complete the photo shoot | T-CO-05 | Images delivered |
| 4 | Enter structured menu data into staging | T-CO-01 | Every item has a price, section, and daypart |
| 5 | Write and enter all copy | T-CO-02 | Client approval |
| 6 | Upload and alt-text all imagery | T-CO-05 | Zero images missing alt text |
| 7 | Enter SEO metadata | T-CO-06 | Every page and event has a title and description |
| 8 | Client review and sign-off | T-CO-08 | Written approval |
| 9 | Migrate staging content to production WordPress | T-DO-11 | Spot-check every post type |
| 10 | Cutover | T-DO-14 | Runbook complete |
| 11 | Cancel Squarespace, no earlier than T+7 days | T-DO-19 | 14 days of clean monitoring |
