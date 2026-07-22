# 09 — Integrations

Status: **Living**
Last reviewed: 2026-07-22

Every third-party surface follows the same rule: **no integration may break a
page.** Each has a defined failure mode that degrades to something useful, and
none is a hard dependency of a route render.

---

## 1. Integration Summary

| # | Capability | Recommendation | Method | Status | Monthly cost |
|---|---|---|---|---|---|
| 1 | Online ordering | Defer to Phase 2 | Redirect | **Blocked — DP-08** | $0 in Phase 1 |
| 2 | Reservations | Defer to Phase 2; phone in Phase 1 | Redirect | **Blocked — DP-04** | $0 in Phase 1 |
| 3 | Events calendar | First-party (`gotg_event`) | Native | **Decided** | $0 |
| 4 | Contact form delivery | Resend via Server Action | API | **Pending approval** | $0 |
| 5 | Newsletter capture | Defer to Phase 2 | API | **Blocked — DP-19** | $0 in Phase 1 |
| 6 | Instagram feed | Behold | API | **Pending approval** | $6 |
| 7 | Maps | Google Static Maps + link out | API + redirect | **Pending approval** | ~$0 |
| 8 | Analytics | GA4 + Vercel Analytics | Script + native | **Pending — DP-17** | $0 |
| 9 | Gift cards | Defer to Phase 2 | Redirect | **Blocked — DP-07** | $0 in Phase 1 |
| 10 | Error tracking | Sentry | SDK | **Recommended** | $0 |

Phase 1 recurring integration cost: **~$6/month**, plus Vercel and WordPress
hosting from `01-TECH-STACK.md` §11.

---

## 2. Online Ordering

**Capability needed:** A visitor on `/menu` places an order for pickup.

**Status: blocked on DP-08.** Nothing ships until the client states whether an
ordering provider already exists.

| Vendor | Method | Commission / fee | Menu sync | Notes |
|---|---|---|---|---|
| **Toast Online Ordering** | Redirect to a hosted page | ~$0 commission if on Toast POS; POS from ~$69/mo | Automatic from POS | Best if the restaurant already runs Toast |
| **Square Online** | Redirect | 2.6% + 10¢ per transaction | Automatic from Square POS | Best if already on Square |
| **ChowNow** | Redirect or embed | ~$149/mo flat, no commission | Manual | Predictable cost, no per-order bite |
| **Owner.com** | Redirect | ~$399/mo | Managed | Too expensive at this scale |

**Recommendation, pending client approval:** match whatever POS the restaurant
already runs. If the POS is Toast or Square, use its native ordering and redirect
to it. If neither, ordering is deferred past launch — building a first-party
ordering flow is an explicit non-goal (`00-PROJECT-BRIEF.md` §6).

| Aspect | Detail |
|---|---|
| Method | Redirect. `target="_blank"`, `rel="noopener noreferrer"`. |
| Data flow | Outbound only. No customer data enters WordPress or Next.js. |
| Environment variable | None — the URL is CMS content (`gotg_site_settings.ordering_url`) |
| Failure mode | If `_global.actions.orderingUrl` is absent, every Order Online CTA is omitted from the DOM. No disabled button, no "coming soon". |
| Fallback UI | The phone CTA occupies the same position. |
| PCI scope | None. Payment never touches this project's infrastructure. |

---

## 3. Reservations

**Capability needed:** A visitor books a table.

**Status: blocked on DP-04** — it is not established that the restaurant takes
reservations at all.

| Vendor | Method | Cost | Notes |
|---|---|---|---|
| **Phone only** | `tel:` link | $0 | Zero integration. Correct answer for a golf-course restaurant with walk-in volume. |
| **OpenTable** | Redirect or widget | ~$449/mo + $1.50/cover | Heavy for this venue |
| **Resy** | Redirect | ~$189/mo | Lighter, still significant |
| **Yelp Reservations** | Redirect | ~$249/mo | — |
| **Tock** | Redirect | ~$69/mo + 2% | Best value if a platform is wanted |

**Recommendation, pending client approval: phone only for Phase 1.** The primary
audience is on-course and walks in. A reservation platform's monthly fee is not
justified without evidence of turned-away covers.

| Aspect | Detail |
|---|---|
| Method | `tel:+18058422947` on the header CTA, the mobile bottom bar, and the contact page |
| Data flow | None |
| Environment variable | None — `gotg_site_settings.reservation_url`, empty by default |
| Failure mode | `reservationUrl` absent → the Reserve CTA is omitted; "Reservation enquiry" is added to `ContactResponse.formSubjects` instead |
| Schema impact | `acceptsReservations: "False"` in the `Restaurant` JSON-LD until this resolves — see `08-PERFORMANCE-SEO-A11Y.md` §4.5 |

---

## 4. Events and Live Music Calendar

**Capability needed:** Publish dated events; let visitors add one to a calendar.

**Decision: first-party.** Events are the `gotg_event` post type
(`03-CONTENT-MODEL.md` §4). No third-party calendar is used.

Rejected alternatives:

| Alternative | Why not |
|---|---|
| Google Calendar embed | Not indexable, not styleable, no `Event` structured data, poor mobile experience |
| Eventbrite listing page | Correct for ticketed events only; a Friday music night is not an Eventbrite event |
| The Events Calendar (WP plugin) | Brings a large plugin, its own REST surface, and a data model the frontend does not need |

| Aspect | Detail |
|---|---|
| Method | Native — `/wp-json/gotg/v1/events` |
| Data flow | WordPress → Next.js, outbound only |
| Add-to-calendar | Client-side `.ics` generation in `AddToCalendar` (`06-COMPONENT-SPEC.md` §3). No vendor, no request. |
| Ticketed events | `ticket_url` links out to whatever the client uses (Eventbrite in the example payload). The link is content, not an integration. |
| Failure mode | None — this is first-party data |
| Environment variable | None |
| Cost | $0 |

---

## 5. Contact Form Delivery

**Capability needed:** Deliver an enquiry to the restaurant's inbox reliably,
without exposing an email address to scrapers and without WordPress in the path.

| Vendor | Method | Free tier | Paid | Notes |
|---|---|---|---|---|
| **Resend** | API from a Server Action | 3,000 emails/mo, 100/day | $20/mo for 50k | Requires domain verification (SPF, DKIM). Best deliverability and full control of the email template. |
| **Formspark** | POST to an endpoint | 250 submissions lifetime | $25 one-time for 50k | No domain setup, no DNS work, no code to maintain |
| **Web3Forms** | POST to an endpoint | 250/mo | $8/mo | Cheapest hosted option |
| **WP mail via REST** | POST to WordPress | $0 | $0 | Rejected — shared-host `wp_mail()` deliverability is poor and it puts WordPress in the request path for a user-facing action |

**Recommendation, pending client approval: Resend.** The domain must be
configured for DNS anyway during cutover (§12), so SPF and DKIM records are
marginal work. Volume is far below the free tier. The alternative, Formspark, is
a reasonable fallback if the client will not permit DNS record changes.

| Aspect | Detail |
|---|---|
| Method | Next.js Server Action → Resend REST API. The API key never reaches the browser. |
| Data flow | Browser → Vercel Server Action → Resend → the restaurant's inbox. Nothing is stored by this project. |
| Data retention | None. Submissions are not persisted in WordPress, Vercel, or any database. Resend retains delivery logs per its own policy. |
| Environment variables | `RESEND_API_KEY` (secret), `CONTACT_FORM_TO` (secret), `CONTACT_FORM_FROM` (not secret) |
| Spam defence | Honeypot field, 3-second minimum time-to-submit, and server-side length and format validation. No CAPTCHA in Phase 1 — reCAPTCHA harms accessibility and adds ~90 KB. Revisit only if spam volume proves it necessary. |
| Failure mode | The Server Action returns `{ status: 'error' }`. The form renders "We could not send your message. Please call 805-842-2947 or email {email}." with both as links, and the user's values are preserved. |
| Monitoring | A failed send is reported to Sentry with the message body scrubbed. |
| Cost | $0 at expected volume |

```ts
// frontend/src/actions/submit-contact.ts
'use server';

import { z } from 'zod';

const MIN_SUBMIT_MS = 3000;

const ContactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(1).max(60),
  message: z.string().trim().min(10).max(2000),
  consent: z.literal('on'),
  company: z.literal(''),
  startedAt: z.coerce.number().int().positive(),
});

export interface ContactFormResult {
  status: 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitContact(
  _previous: ContactFormResult | null,
  formData: FormData
): Promise<ContactFormResult> {
  const parsed = ContactSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !(key in fieldErrors)) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      status: 'error',
      message: 'Please correct the fields below.',
      fieldErrors,
    };
  }

  if (Date.now() - parsed.data.startedAt < MIN_SUBMIT_MS) {
    return { status: 'success' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_FORM_TO;
  const from = process.env.CONTACT_FORM_FROM;

  if (!apiKey || !to || !from) {
    throw new Error('Contact form environment variables are not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: parsed.data.email,
      subject: `Website enquiry: ${parsed.data.subject}`,
      text: [
        `Name: ${parsed.data.name}`,
        `Email: ${parsed.data.email}`,
        `Phone: ${parsed.data.phone ?? 'Not provided'}`,
        `Subject: ${parsed.data.subject}`,
        '',
        parsed.data.message,
      ].join('\n'),
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    return {
      status: 'error',
      message:
        'We could not send your message. Please call 805-842-2947 or email us directly.',
    };
  }

  return { status: 'success' };
}
```

A submission failing the honeypot or the time check returns `success` without
sending. Telling a bot it was detected teaches it to evade.

---

## 6. Newsletter Capture

**Status: blocked on DP-19.** No capture UI ships until the client confirms a
list exists and names the platform.

| Vendor | Method | Free tier | Notes |
|---|---|---|---|
| **Mailchimp** | API or embedded form | 500 contacts, 1,000 sends/mo | Most likely already in use by a small restaurant |
| **Klaviyo** | API | 250 contacts | Built for retail; heavier than needed |
| **Beehiiv** | API | 2,500 subscribers | Publication-oriented |
| **Resend Audiences** | API | Included with Resend | Consolidates to one vendor if Resend is chosen for forms |

**Recommendation, pending client approval:** if a Mailchimp list already exists,
use it via API from a Server Action, mirroring the contact form pattern. If no
list exists, do not create one — an empty list nobody sends to is worse than no
capture form.

| Aspect | Detail |
|---|---|
| Method | Server Action → vendor API. Never an embedded vendor `<script>`. |
| Data flow | Browser → Vercel → vendor. Email address only. |
| Environment variables | `MAILCHIMP_API_KEY` (secret), `MAILCHIMP_LIST_ID` (secret), `MAILCHIMP_SERVER_PREFIX` (not secret) |
| Failure mode | Inline error: "We could not sign you up. Please try again later." The rest of the footer is unaffected. |
| Consent | An unticked checkbox with explicit consent copy. No pre-ticked boxes, no implied consent from form submission. |
| Cost | $0 at expected volume |

---

## 7. Instagram Feed

**Capability needed:** Show the six most recent posts from `@grillonthegreen_simi`
on `/`.

Meta's Instagram Basic Display API was deprecated on 2024-12-04. Direct
integration now requires the Instagram Graph API with a Business account, a
linked Facebook Page, a Meta app, and a token refreshed every 60 days. Building
and maintaining that is disproportionate for a photo row.

| Vendor | Method | Cost | Notes |
|---|---|---|---|
| **Behold** | JSON API | $6/mo (Basic) | Returns clean JSON; no vendor script, no iframe; handles token refresh |
| **EmbedSocial** | Widget script | ~$29/mo | Injects a third-party script — a performance and privacy cost |
| **SnapWidget** | iframe | $6/mo | iframe cannot be styled to the design system |
| **Direct Graph API** | Own integration | $0 | Free, but the 60-day token refresh is an operational failure waiting to happen; a lapsed token silently empties the feed |
| **Manual curation** | CMS gallery block | $0 | Zero dependency, but stale within weeks |

**Recommendation, pending client approval: Behold, $6/month.** It returns JSON,
so the images render through this project's own `Image` primitive and inherit
the design system. No third-party script enters the page.

| Aspect | Detail |
|---|---|
| Method | Client-side `fetch` to Behold's JSON endpoint, after intersection |
| Data flow | Browser → Behold → browser. Instagram → Behold happens out of band. |
| Why client-side | Server-side fetching would tie the page's ISR revalidation to a third-party's uptime. A Behold outage during a rebuild would either fail the build or bake an empty feed into static HTML for an hour. Client-side keeps the failure isolated to one section. |
| Environment variable | `NEXT_PUBLIC_BEHOLD_FEED_ID` — not secret; the feed ID is public by design and returns only public posts |
| Timeout | 5 seconds |
| Failure mode | Error state per `06-COMPONENT-SPEC.md` §3: heading plus a "See our Instagram" link button. The grid is not rendered and no error text is shown to the user. |
| Empty feed | Treated identically to an error |
| Prerequisite | The client's Instagram account must be a Business or Creator account. `[NEEDS CLIENT INPUT]` |
| Cost | $6/month |

---

## 8. Maps

**Capability needed:** Show where the restaurant is and open turn-by-turn
directions.

| Option | Method | Cost | Page weight | Privacy |
|---|---|---|---|---|
| **Google Static Maps API + link out** | `<img>` + `<a>` | $2 per 1,000 loads; $200/mo free credit covers ~100,000 | ~40 KB | No third-party cookies |
| **Google Maps embed iframe** | iframe | Free | ~900 KB, ~30 requests | Sets cookies before consent |
| **Mapbox Static Images** | `<img>` + `<a>` | 50,000/mo free | ~40 KB | No cookies |
| **OpenStreetMap static** | `<img>` | $0 | ~40 KB | No cookies |

**Recommendation, pending client approval: Google Static Maps plus a link to
Google Maps directions.** Google is where the audience's saved places and
navigation already live, the static image costs ~40 KB against an iframe's
~900 KB, and no cookie is set before the user chooses to leave.

| Aspect | Detail |
|---|---|
| Method | Static image API for display; plain link for directions |
| Data flow | Browser → Google, image request only. Coordinates come from `_global.location`. |
| Environment variable | `GOOGLE_MAPS_STATIC_API_KEY` (secret) — the image URL is signed server-side so the key is never in client HTML |
| Key restriction | HTTP referrer restricted to the production and staging domains, and scoped to the Static Maps API only |
| Failure mode | If the image fails, the address text and the "Get Directions" button render alone. No broken-image icon, no error text. |
| Accessibility | Alt text describes the location, not the image: "Map showing Grill on the Green at Simi Hills Golf Course, Simi Valley". The link's accessible name is "Open directions to Grill on the Green in Google Maps". |
| Cost | $0 within the free credit at expected traffic |

The interactive iframe variant of `MapEmbed` exists in the component spec but is
not enabled in Phase 1. Enabling it requires a cookie-consent mechanism, which
is not in scope.

---

## 9. Analytics

**Capability needed:** Measure the metrics in `00-PROJECT-BRIEF.md` §5.

| Vendor | Method | Cost | Notes |
|---|---|---|---|
| **GA4** | `@next/third-parties` script | $0 | Likely already in place (DP-17); integrates with Google Business Profile reporting |
| **Vercel Analytics** | First-party, no cookie | Included with Pro | Real-user Core Web Vitals — the only source for the §1 targets in `08-PERFORMANCE-SEO-A11Y.md` |
| **Plausible** | Script | $9/mo | Cookieless and simpler, but loses GA4 continuity and Google Ads attribution |

**Recommendation: GA4 plus Vercel Analytics.** They answer different questions —
GA4 answers "what did people do", Vercel Analytics answers "how fast was it for
real users". Neither substitutes for the other.

Custom events, matching the success metrics:

| Event name | Trigger | Parameters |
|---|---|---|
| `phone_click` | Any `tel:` link activated | `location`: `header` \| `footer` \| `mobile_bar` \| `contact` \| `hero` |
| `directions_click` | Any link to `directionsUrl` | `location` |
| `menu_view` | `/menu` loaded | `daypart` |
| `daypart_filter` | `DaypartFilter` changed | `daypart` |
| `event_view` | `/events/[slug]` loaded | `event_slug` |
| `add_to_calendar_click` | `AddToCalendar` activated | `event_slug` |
| `contact_form_submit` | Server Action returns success | `subject` |
| `instagram_click` | Instagram link or post activated | `location` |
| `order_click` | Order Online CTA activated (Phase 2) | `location` |
| `reservation_click` | Reserve CTA activated (Phase 2) | `location` |

| Aspect | Detail |
|---|---|
| Method | `<GoogleAnalytics />` from `@next/third-parties/google`, loaded with `afterInteractive` |
| Data flow | Browser → Google |
| Environment variable | `NEXT_PUBLIC_GA_MEASUREMENT_ID` — not secret |
| Loading | Deferred; never blocks render; excluded from the LCP path |
| Failure mode | A blocked or failed analytics script has no user-visible effect. No feature depends on it. |
| Privacy | IP anonymisation is GA4 default. `/privacy-policy` must disclose GA4 use. No consent banner in Phase 1 — CCPA requires disclosure and an opt-out link, not a pre-consent gate. `[NEEDS CLIENT INPUT]` — confirm with client legal review. |
| Cost | $0 |

---

## 10. Gift Cards

**Status: blocked on DP-07.**

| Vendor | Method | Cost | Notes |
|---|---|---|---|
| **Toast Gift Cards** | Redirect | Included with Toast POS | If already on Toast |
| **Square Gift Cards** | Redirect | 2.9% + 30¢ per sale | If already on Square |
| **Yiftee** | Redirect | ~$0 to merchant | Works without a POS integration |

**Recommendation, pending client approval:** match the POS, exactly as with
ordering (§2). A standalone gift-card vendor is only worth adding if the client
has no POS-native option.

| Aspect | Detail |
|---|---|
| Method | Redirect, `target="_blank"` |
| Data flow | Outbound only |
| Environment variable | None — `gotg_site_settings.gift_card_url` |
| Failure mode | URL absent → every gift-card CTA is omitted from the DOM, and the `/gift-cards` redirect to `/contact` in `02-INFORMATION-ARCHITECTURE.md` §4.2 stays in place |
| Cost | $0 to this project |

---

## 11. Error Tracking

| Aspect | Detail |
|---|---|
| Vendor | Sentry, free tier (5,000 errors/month, 1 user) |
| Method | `@sentry/nextjs` SDK |
| Data flow | Browser and Vercel functions → Sentry |
| Environment variables | `NEXT_PUBLIC_SENTRY_DSN` (not secret), `SENTRY_AUTH_TOKEN` (secret, build-time source-map upload only) |
| PII scrubbing | `beforeSend` drops `request.data` entirely for the contact Server Action, and strips `user.email` and `user.ip_address` globally |
| Sample rate | `tracesSampleRate: 0.1` in production, `1.0` in preview |
| Failure mode | Sentry being unreachable has no user-visible effect |
| Alternative not chosen | Vercel logs alone — no aggregation, no release tracking, no source-mapped stack traces |
| Cost | $0 |

---

## 12. Environment Variable Summary

Complete registry with environments and secrecy is in
`10-ENVIRONMENTS-DEPLOYMENT.md` §3. This table lists only integration-owned
variables.

| Variable | Owner | Secret | Required in Phase 1 |
|---|---|---|---|
| `RESEND_API_KEY` | §5 Contact form | Yes | Yes |
| `CONTACT_FORM_TO` | §5 Contact form | Yes | Yes |
| `CONTACT_FORM_FROM` | §5 Contact form | No | Yes |
| `NEXT_PUBLIC_BEHOLD_FEED_ID` | §7 Instagram | No | Yes |
| `GOOGLE_MAPS_STATIC_API_KEY` | §8 Maps | Yes | Yes |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | §9 Analytics | No | Yes |
| `NEXT_PUBLIC_SENTRY_DSN` | §11 Sentry | No | Yes |
| `SENTRY_AUTH_TOKEN` | §11 Sentry | Yes | Yes (CI only) |
| `MAILCHIMP_API_KEY` | §6 Newsletter | Yes | No — Phase 2 |
| `MAILCHIMP_LIST_ID` | §6 Newsletter | Yes | No — Phase 2 |
| `MAILCHIMP_SERVER_PREFIX` | §6 Newsletter | No | No — Phase 2 |

---

## 13. Integration Failure Matrix

The single most important table in this document. Every row must remain true.

| Integration | If it fails, the user sees | Does the page still render? | Does the build still succeed? |
|---|---|---|---|
| Ordering | No Order CTA | Yes | Yes |
| Reservations | No Reserve CTA; phone CTA in its place | Yes | Yes |
| Events | n/a — first-party | Yes | Fails only if WordPress is unreachable at build |
| Contact form | Error message with phone and email as links; entered values preserved | Yes | Yes |
| Newsletter | Inline "could not sign you up" message | Yes | Yes |
| Instagram | Heading plus a "See our Instagram" link | Yes | Yes |
| Maps | Address text and Get Directions button, no image | Yes | Yes |
| Analytics | Nothing | Yes | Yes |
| Gift cards | No gift-card CTA | Yes | Yes |
| Sentry | Nothing | Yes | Yes |
| **WordPress** | **Last successfully rendered page (stale content)** | **Yes** | **No — a failed build is deliberate** |

WordPress is the only hard dependency, and even it does not affect live traffic:
a failed revalidation serves the last good static render indefinitely. See
`04-API-CONTRACT.md` §7.1.

---

## 14. Decisions Pending Client Approval

| Integration | Decision needed | Blocks | Reference |
|---|---|---|---|
| Ordering | Which POS/ordering provider, if any | Order CTA, `/order` redirect target | DP-08 |
| Reservations | Are reservations taken, and how | Reserve CTA, `acceptsReservations` schema | DP-04 |
| Contact form | Approve Resend; permit SPF/DKIM DNS records | Contact form launch | DP-18 |
| Contact form | Recipient email address | Contact form launch | DP-18 |
| Instagram | Approve $6/mo Behold; confirm Business account | Instagram section on `/` | — |
| Maps | Approve Google Cloud project and billing account | Map on `/contact` | — |
| Analytics | Provide existing GA4 property access, or approve a new one | Baselines, all success metrics | DP-17 |
| Analytics | Legal review of the privacy policy and CCPA opt-out approach | `/privacy-policy` publication | — |
| Newsletter | Does a list exist, and on what platform | Newsletter capture | DP-19 |
| Gift cards | Are gift cards sold, and through what system | Gift-card CTA, `/gift-cards` page | DP-07 |
