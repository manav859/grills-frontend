# 00 — Project Brief

Status: **Living**
Owner: Project lead
Last reviewed: 2026-07-22

---

## 1. Business Context

| Attribute | Value | Source |
|---|---|---|
| Client name | Grill on the Green | Supplied |
| Business type | Full-service restaurant | Supplied |
| Location | Simi Hills Golf Course, Simi Valley, CA | Supplied |
| Street address | `[NEEDS CLIENT INPUT]` | — |
| Cuisine | American classics + smoked BBQ | Supplied |
| Hours | Mon–Sun, 06:00–21:00 | Supplied |
| Dayparts served | Breakfast, lunch, dinner | Supplied |
| Phone | 805-842-2947 | Supplied |
| Instagram | `@grillonthegreen_simi` | Supplied |
| Live music | Friday and Saturday, 18:00–21:00 | Supplied |
| Tagline in use | "Smoke your birdie" | Supplied |
| Ownership | Mark (golfer), Marco (BBQ chef) | Supplied |
| Current site | https://flamingo-piccolo-4nsz.squarespace.com/ | Supplied |
| Current platform | Squarespace — to be decommissioned | Supplied |

### 1.1 Current Site Inventory

| Page | Content present | Reusable? |
|---|---|---|
| Home | Hero imagery, tagline | Imagery only, subject to quality review |
| Events | Live music mention | No — rewrite |
| Menu | Menu listing | Copy only, must be re-entered as structured data |
| About | Single paragraph about Mark and Marco | Yes — edit and expand |
| Contact | Hours, phone, Instagram embed | Yes — data carries over |

The existing site is content-thin. Assume the majority of production copy is new
work. See `11-PROJECT-PLAN.md` §Content Migration Plan.

---

## 2. Target Audiences

Audiences are ranked by commercial priority. Rank drives layout hierarchy in
`02-INFORMATION-ARCHITECTURE.md` and CTA priority in `05-DESIGN-SYSTEM.md`.

| Rank | Audience | Context of visit | Device bias | Primary need | Primary CTA served |
|---|---|---|---|---|---|
| 1 | Golfers (on-course and pre/post-round) | Mid-round or immediately after; time-pressured | Mobile, often on cellular, outdoors in bright sun | "What can I eat right now, and is it open?" | View Menu / Call |
| 2 | Local diners | Evening or weekend meal planning | Mobile + desktop split | "Is this worth the drive, and what does it cost?" | View Menu / Directions |
| 3 | Event-goers (live music) | Weekend planning, Thu–Sat | Mobile | "Who is playing and when?" | View Events |
| 4 | Catering and private-event buyers | Weekday research, longer session | Desktop | "Can they handle my party of N, and what does it cost?" | Enquiry form / Call |

`[ASSUMPTION] Device bias figures are inferred from restaurant-industry norms and
the on-course use case, not from client analytics. Validate against Squarespace
analytics before finalising performance budgets in 08-PERFORMANCE-SEO-A11Y.md.`

---

## 3. Primary User Journeys

Each journey is expressed as: entry → path → success event. Success events are
the measurable outcomes tracked in §5.

| ID | Journey | Entry point | Path | Success event |
|---|---|---|---|---|
| J1 | On-course hunger | Google "grill on the green simi" → Home | Home → Menu → (Call or walk in) | `menu_view` then `phone_click`, or menu dwell > 30s |
| J2 | Is it open now | Google Business Profile → Home | Home (hours block above fold) | Hours block viewed; `phone_click` or `directions_click` |
| J3 | Weekend music | Instagram bio link → Home | Home → Events → event detail | `event_view`, `add_to_calendar_click` |
| J4 | Dinner decision | Search "bbq simi valley" → Menu | Menu → About → Contact | `directions_click` or `reservation_click` |
| J5 | Catering enquiry | Search "catering simi valley" → Catering (Phase 2) | Catering → enquiry form → submit | `catering_form_submit` |
| J6 | Returning regular | Direct / bookmark → Home | Home → Menu (specials) | `menu_view` |

---

## 4. Business Goals, Ranked

| Rank | Goal | Rationale | Site mechanism |
|---|---|---|---|
| 1 | Increase covers (walk-in and planned) | Direct revenue | Fast, complete, current menu; hours and phone always reachable |
| 2 | Establish credibility beyond the golf course | Site currently reads as a course amenity, not a destination restaurant | Editorial photography, About story, BBQ positioning |
| 3 | Fill Friday/Saturday evenings | Live music is fixed cost; empty seats are pure loss | Events surface with dated, indexable event pages |
| 4 | Capture catering and private-event leads | Highest per-transaction value | Dedicated enquiry path, structured lead capture |
| 5 | Own local search for "BBQ" and "breakfast" in Simi Valley | Compounding, low marginal cost | LocalBusiness/Restaurant schema, per-page metadata, sitemap |
| 6 | Reduce inbound phone load for routine questions | Staff time | Hours, menu, and directions answerable without a call |

---

## 5. Success Metrics

Baselines are unknown until Squarespace analytics are supplied.

| Metric | Target | Measurement | Baseline |
|---|---|---|---|
| Largest Contentful Paint (mobile, p75) | ≤ 2.0s | Vercel Analytics / CrUX | n/a — new build |
| Interaction to Next Paint (p75) | ≤ 200ms | Vercel Analytics | n/a |
| Cumulative Layout Shift (p75) | ≤ 0.05 | Vercel Analytics | n/a |
| Menu page views / total sessions | ≥ 45% | GA4 | `[NEEDS CLIENT INPUT]` |
| `phone_click` events / sessions | ≥ 8% | GA4 custom event | `[NEEDS CLIENT INPUT]` |
| `directions_click` / sessions | ≥ 5% | GA4 custom event | `[NEEDS CLIENT INPUT]` |
| Catering form submissions / month | ≥ 6 by month 3 | Form provider + GA4 | `[NEEDS CLIENT INPUT]` |
| Organic impressions for "bbq simi valley" | Top 10 by month 6 | Google Search Console | `[NEEDS CLIENT INPUT]` |
| Lighthouse Accessibility score | ≥ 95 on every template | CI (Lighthouse CI) | n/a |
| Axe critical/serious violations | 0 | CI (axe-core) | n/a |

---

## 6. Explicit Non-Goals

These are out of scope for the initial build. Each is listed so it is not
silently re-introduced. Reclassifying any item requires a new ADR in
`12-GLOSSARY-DECISIONS.md`.

| Non-goal | Reason | Revisit trigger |
|---|---|---|
| First-party online ordering / checkout | Payment handling, PCI scope, and menu-sync cost exceed value at this volume | If a POS with an ordering API is adopted |
| First-party reservation engine | Third-party redirect is sufficient; see `09-INTEGRATIONS.md` | If cover volume justifies owning the funnel |
| User accounts / loyalty programme | No supporting operational system exists | If a loyalty vendor is contracted |
| Multi-location support | Single location today; data model supports it but no UI is built | Second location signed |
| E-commerce (merchandise) | No inventory or fulfilment operation | If merchandise line launches |
| Blog / editorial content programme | No editorial resource identified | If a content owner is assigned |
| Multilingual content | No demand evidence supplied | Client request |
| Native mobile app | Web covers all identified journeys | — |
| WordPress front-end rendering | Headless by decision; see ADR-0001 | Never |
| Real-time table availability display | Requires POS/PMS integration not in scope | POS integration |

---

## 7. Constraints

| Constraint | Detail | Governing document |
|---|---|---|
| Repository structure | Fixed two-repo split, already implemented | `10-ENVIRONMENTS-DEPLOYMENT.md` |
| Local database | SQLite via WordPress Studio; production requires MySQL/MariaDB | `10-ENVIRONMENTS-DEPLOYMENT.md` §SQLite Parity |
| Data layer | Custom REST namespace `gotg/v1`; WPGraphQL prohibited | `04-API-CONTRACT.md`, ADR-0003 |
| Frontend framework | Next.js App Router, TypeScript | ADR-0002 |
| Naming prefix | `gotg_` on all WordPress-registered objects | `AGENTS.md` (backend repo) |
| Line endings | LF, enforced by `.gitattributes` in both repos | `AGENTS.md` |
| Accessibility floor | WCAG 2.1 AA | `08-PERFORMANCE-SEO-A11Y.md` |

---

## 8. Decisions Pending

Every row blocks work. No row may be resolved by assumption. Owner column names
the party who must answer, not the party who chases the answer.

| ID | Question | Blocks | Owner | Impact if unanswered |
|---|---|---|---|---|
| DP-01 | Exact street address and mailing address | LocalBusiness schema, Contact page, Google Business Profile alignment | Client | Schema incomplete; local SEO degraded |
| DP-02 | Registered legal business name | Schema `legalName`, footer copyright | Client | Placeholder in footer |
| DP-03 | Is the restaurant open to non-golfers without course access? | Home copy, About positioning, audience rank 2 | Client | Positioning copy cannot be written |
| DP-04 | Does the restaurant take reservations at all? If so, by phone only or via a platform? | `09-INTEGRATIONS.md` reservations section, primary CTA hierarchy | Client | Reservation CTA cannot ship |
| DP-05 | Is catering an active, staffed service line today? | Catering page existence, journey J5 | Client | Catering page deferred to Phase 2 |
| DP-06 | Private-event / banquet capacity and minimums | Private events page content | Client | Page cannot be written |
| DP-07 | Are gift cards sold, and through what system? | `09-INTEGRATIONS.md` gift cards | Client | Gift card CTA omitted |
| DP-08 | Does an online ordering provider already exist (Toast, Square, ChowNow)? | `09-INTEGRATIONS.md` ordering | Client | Ordering CTA omitted |
| DP-09 | Holiday and seasonal hours variance from Mon–Sun 6am–9pm | `OpeningHoursSpecification` schema, Site Settings model | Client | Schema asserts hours that may be wrong |
| DP-10 | Official brand colours, typefaces, and logo source files (SVG/AI) | `05-DESIGN-SYSTEM.md` token finalisation | Client | Tokens remain derived-from-logo assumptions |
| DP-11 | Rights and source files for existing Squarespace photography | Content migration, image pipeline | Client | Reshoot cost enters budget |
| DP-12 | Is a professional photo shoot budgeted? | Home hero, menu imagery quality | Client | Launch with stock or existing imagery |
| DP-13 | Who owns the domain, and at which registrar? | DNS cutover runbook | Client | Cutover cannot be scheduled |
| DP-14 | Production domain name (`grillonthegreen.com` or other) | Canonical URLs, redirects, schema | Client | All absolute URLs are placeholders |
| DP-15 | Who is the day-to-day content editor after launch? | Editor-experience design in `03-CONTENT-MODEL.md`, training scope | Client | Editor UX tuned for an unknown skill level |
| DP-16 | Monthly hosting/service budget ceiling | Hosting tier selection in `01-TECH-STACK.md` | Client | Recommendations assume mid-tier |
| DP-17 | Existing Google Analytics / Search Console / Google Business Profile access | Analytics continuity, baselines | Client | Historical baselines lost |
| DP-18 | Email address(es) to receive contact and catering form submissions | `09-INTEGRATIONS.md` form delivery | Client | Forms cannot be wired |
| DP-19 | Does a newsletter list exist, and on what platform? | Newsletter integration | Client | Capture deferred |
| DP-20 | Confirmed live-music booking lead time (how far ahead are acts known?) | Events publishing workflow, revalidation cadence | Client | Events cache policy is a guess |
| DP-21 | Full menu with current prices in a structured form (spreadsheet or PDF) | Content entry, launch date | Client | Content entry cannot start |
| DP-22 | Allergen/dietary claims policy — is the client willing to publish them? | `gotg_dietary` taxonomy usability, liability copy | Client | Dietary tags ship empty |

---

## 9. Related Documents

| Topic | Document |
|---|---|
| Stack rationale | `01-TECH-STACK.md` |
| Sitemap and navigation | `02-INFORMATION-ARCHITECTURE.md` |
| CMS schema | `03-CONTENT-MODEL.md` |
| API shapes | `04-API-CONTRACT.md` |
| Delivery phasing | `11-PROJECT-PLAN.md` |
| Decision log | `12-GLOSSARY-DECISIONS.md` |
