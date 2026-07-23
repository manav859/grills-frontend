# 10 — Environments and Deployment

Status: **Living**
Last reviewed: 2026-07-23

The local environment described in §1 and §4 is **already established and
implemented**. It is documented, not proposed. Do not substitute an alternative
arrangement. Backend repository policy is governed by `AGENTS.md` at
`C:\Users\manav\Studio\grills\AGENTS.md`; this document does not restate it.

---

## 1. Repository Structure

Two repositories, both git, both LF line endings enforced by `.gitattributes`.

| Repo | Path | Contents | Tracked paths |
|---|---|---|---|
| Backend | `C:\Users\manav\Studio\grills` | WordPress Studio site | `wp-content/mu-plugins/`, `wp-content/themes/gotg-headless/` |
| Frontend + docs | `D:\work\grills` | Next.js app, documentation | `frontend/`, `docs/`, `.gitattributes`, `grills.code-workspace` |

Not tracked in the backend repository: WordPress core, `wp-admin/`,
`wp-includes/`, `wp-content/plugins/`, `wp-content/uploads/`, `wp-config.php`.
All are reproducible or environment-specific.

The two repositories are opened together through the multi-root workspace at
`D:\work\grills\grills.code-workspace`. Opening only one root is prohibited by
`AGENTS.md`: cross-repository consistency — a field name in
`03-CONTENT-MODEL.md` matching its PHP registration matching its TypeScript
interface — cannot be verified from a single root.

### 1.1 Repository Configuration

Both repositories have GitHub remotes under the same owner, `manav859`. Both are
private.

| Repo | Local path | Remote | Visibility | Default branch |
|---|---|---|---|---|
| Backend | `C:\Users\manav\Studio\grills` | https://github.com/manav859/grills | Private | `main` |
| Frontend + docs | `D:\work\grills` | https://github.com/manav859/grills-frontend | Private | `main` |

`[NEEDS CLIENT INPUT] Long-term repository ownership — whether these transfer to
a client-owned GitHub organisation at handover, and the access model for it.`

**The two repositories are committed and pushed separately.** They share no
history and no remote. A change that spans both — a contract change being the
common case (§7.5) — is two commits and two pushes, one per repository, with
messages that reference the same change. There is no mechanism that keeps them
in step automatically; the ordering rules in §7.5 are what make a spanning
change safe.

#### What is not in git

The backend repository tracks only `wp-content/mu-plugins/` and
`wp-content/themes/gotg-headless/`. Everything else Studio generates is
untracked, and the reason differs by asset:

| Asset | In git | Why |
|---|---|---|
| WordPress core, `wp-admin/`, `wp-includes/` | No | Reinstallable at a pinned version |
| `wp-content/plugins/` | No | The three free plugins in `01-TECH-STACK.md` §4 reinstall from source |
| `wp-content/uploads/` | No | Local uploads are seed-grade; production uploads are backed up by the host (§8.1) |
| `wp-config.php` | No | Environment-specific, holds the shared secrets (§3.3) |
| `wp-content/database/` | **No** | Not reproducible — see below |

The first four are **reproducible**: losing them costs an install, not content.
`wp-content/database/` is not. It holds the local SQLite database, which is the
**only copy of local content** — every post, term, and meta value authored in
`wp-admin` since the last seed run. It exists in no other repository, on no
remote, and in no host backup, because §8.1's automated backups cover production
only and §2 classifies the local environment as disposable.

That classification holds only for content the seed script reproduces
(`tools/seed-content.php`, §4.2 step 8, idempotent). Content authored beyond the
seed is unique to that file and is lost with it. Such content is backed up by
the manual procedure in §8 — the same off-site principle as §8.2, applied to the
SQLite file rather than a MySQL dump. Do not solve this by committing the
database: it is gitignored deliberately, it is binary, and it would put content
into a code repository.

---

## 2. Environment Matrix

| Property | Local | Preview | Staging | Production |
|---|---|---|---|---|
| Frontend URL | `http://localhost:3000` | `https://gotg-{hash}.vercel.app` | `https://staging.{domain}` | `https://{domain}` |
| WordPress URL | `http://localhost:{studio-port}` | `https://cms-staging.{domain}` | `https://cms-staging.{domain}` | `https://cms.{domain}` |
| Frontend host | Next dev server | Vercel | Vercel | Vercel |
| WordPress host | WordPress Studio | Managed WP host | Managed WP host | Managed WP host |
| Database | **SQLite** | MySQL 8.0 | MySQL 8.0 | MySQL 8.0 |
| PHP | Studio-bundled 8.2 | 8.2 | 8.2 | 8.2 |
| Content | Local seed data | Staging content | Client UAT content | Live content |
| Purpose | Development | Per-PR review | Client review, contract tests, migration rehearsal | Live site |
| Frontend access | Local only | Vercel deployment protection (team SSO) | HTTP Basic auth | Public |
| WordPress admin access | Local only | Host IP allow-list + strong credentials | Host IP allow-list + strong credentials | 2FA required, IP allow-list preferred |
| `robots.txt` | n/a | `Disallow: /` | `Disallow: /` | Full rules per `08-PERFORMANCE-SEO-A11Y.md` §4.4 |
| Search engine indexing | No | No | No | Yes |
| Analytics | Disabled | Disabled | Disabled | Enabled |
| Sentry environment | Not initialised | `preview` | `staging` | `production` |
| Sentry `tracesSampleRate` | — | 1.0 | 1.0 | 0.1 |
| Backups | None automated — manual copy of the SQLite file (§8.1) | None | Weekly | Daily, 30-day retention |
| Deploys from | — | Any PR branch | `main` | Tagged release or manual promotion |

`[NEEDS CLIENT INPUT] {domain} is unresolved — DP-14. Every URL above is a
template until the production domain is confirmed.`

Preview and staging share one WordPress instance. Giving every PR its own
WordPress would require provisioning and seeding a database per branch, which is
disproportionate for a five-endpoint API whose shape rarely changes per PR.
Consequence: a PR that changes the API contract must merge its backend change to
staging before its frontend preview will build. This ordering is stated in
`07-CODING-STANDARDS.md` §10.1.

---

## 3. Environment Variable Registry

Complete. A variable not listed here does not exist; adding one requires editing
this table and `frontend/.env.example` in the same PR.

### 3.1 Frontend (Vercel / Next.js)

| Variable | Purpose | Example | Local | Preview | Staging | Production | Secret |
|---|---|---|---|---|---|---|---|
| `WP_API_BASE_URL` | WordPress origin for `gotg/v1` requests. No trailing slash. | `https://cms.grillonthegreen.com` | ✅ | ✅ | ✅ | ✅ | No |
| `NEXT_PUBLIC_SITE_URL` | Canonical frontend origin, used for canonicals, sitemap, and JSON-LD | `https://grillonthegreen.com` | ✅ | ✅ | ✅ | ✅ | No |
| `PREVIEW_SECRET` | Shared secret validating WordPress preview links | `<generate: openssl rand -hex 32>` | ✅ | ✅ | ✅ | ✅ | **Yes** |
| `REVALIDATE_SECRET` | Shared secret authenticating WordPress revalidation webhooks | `<generate: openssl rand -hex 32>` | ✅ | ➖ | ✅ | ✅ | **Yes** |
| `WP_PREVIEW_USER` | WordPress username for preview API authentication | `gotg-preview` | ✅ | ✅ | ✅ | ✅ | No |
| `WP_PREVIEW_APP_PASSWORD` | WordPress Application Password for that user | `<issued by WordPress: Users → Profile → Application Passwords>` | ✅ | ✅ | ✅ | ✅ | **Yes** |
| `RESEND_API_KEY` | Contact form email delivery | `<issued by Resend dashboard>` | ➖ | ✅ | ✅ | ✅ | **Yes** |
| `CONTACT_FORM_TO` | Recipient for contact form submissions | `hello@grillonthegreen.com` | ➖ | ✅ | ✅ | ✅ | **Yes** |
| `CONTACT_FORM_FROM` | Verified sender address | `website@grillonthegreen.com` | ➖ | ✅ | ✅ | ✅ | No |
| `NEXT_PUBLIC_BEHOLD_FEED_ID` | Instagram feed identifier | `<issued by Behold dashboard>` | ➖ | ✅ | ✅ | ✅ | No |
| `GOOGLE_MAPS_STATIC_API_KEY` | Signs static map image URLs server-side | `<issued by Google Cloud console>` | ➖ | ✅ | ✅ | ✅ | **Yes** |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 property | `<issued by GA4 admin, format G-XXXXXXXXXX>` | ➖ | ➖ | ➖ | ✅ | No |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry project endpoint | `<issued by Sentry project settings>` | ➖ | ✅ | ✅ | ✅ | No |
| `SENTRY_AUTH_TOKEN` | Source-map upload at build time | `<issued by Sentry, scoped to project:releases>` | ➖ | ✅ | ✅ | ✅ | **Yes** |
| `SENTRY_ORG` | Sentry organisation slug | `gotg` | ➖ | ✅ | ✅ | ✅ | No |
| `SENTRY_PROJECT` | Sentry project slug | `gotg-frontend` | ➖ | ✅ | ✅ | ✅ | No |
| `VERCEL_ENV` | Set by Vercel; read to gate indexing and analytics | `production` | ➖ | auto | auto | auto | No |
| `STAGING_BASIC_AUTH_USER` | HTTP Basic username protecting staging | `gotg` | ➖ | ➖ | ✅ | ➖ | **Yes** |
| `STAGING_BASIC_AUTH_PASSWORD` | HTTP Basic password protecting staging | `<generate: openssl rand -base64 24>` | ➖ | ➖ | ✅ | ➖ | **Yes** |

✅ required · ➖ not set

Any `NEXT_PUBLIC_` variable is embedded in the client bundle and is public by
definition. No secret may carry that prefix. This is why the Google Maps key is
server-side only — the map URL is signed in a Server Component.

**No real value appears in this table, and none ever may.** Every Example cell
is either a non-secret literal (a URL, a slug, an environment name) or an
angle-bracketed instruction describing how to obtain the value. A cell that
contains something resembling a usable credential is a defect, whether or not
the value is live — a plausible-looking example gets copied.

### 3.2 Backend (WordPress `wp-config.php`)

| Constant | Purpose | Example | Local | Staging | Production | Secret |
|---|---|---|---|---|---|---|
| `GOTG_FRONTEND_URL` | Target for revalidation webhooks and preview redirects | `https://grillonthegreen.com` | ✅ | ✅ | ✅ | No |
| `GOTG_REVALIDATE_SECRET` | Must equal the frontend `REVALIDATE_SECRET` | `<generate: openssl rand -hex 32>` | ✅ | ✅ | ✅ | **Yes** |
| `GOTG_PREVIEW_SECRET` | Must equal the frontend `PREVIEW_SECRET` | `<generate: openssl rand -hex 32>` | ✅ | ✅ | ✅ | **Yes** |
| `WP_ENVIRONMENT_TYPE` | WordPress environment awareness | `local` / `staging` / `production` | ✅ | ✅ | ✅ | No |
| `WP_DEBUG` | Verbose errors and logging | `true` local, `false` elsewhere | ✅ | ✅ | ✅ | No |
| `WP_DEBUG_LOG` | Log destination | `true` | ✅ | ✅ | ➖ | No |
| `DISALLOW_FILE_EDIT` | Disables the admin theme/plugin editor | `true` | ✅ | ✅ | ✅ | No |
| `DISALLOW_FILE_MODS` | Blocks admin-initiated plugin installs on production | `false` local, `true` production | ✅ | ✅ | ✅ | No |
| `AUTOMATIC_UPDATER_DISABLED` | Prevents unreviewed core auto-updates | `true` | ➖ | ✅ | ✅ | No |
| `WP_MEMORY_LIMIT` | PHP memory for admin operations | `256M` | ✅ | ✅ | ✅ | No |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_HOST` | MySQL credentials | `<issued by the managed host>` | ➖ (SQLite) | ✅ | ✅ | **Yes** |
| `WP_CACHE` | Enables object caching | `true` | ➖ | ✅ | ✅ | No |
| WordPress salts (8 constants) | Session and cookie security | `<generate: https://api.wordpress.org/secret-key/1.1/salt/>` | ✅ | ✅ | ✅ | **Yes** |

Secrets are stored in the host's environment configuration, never in a tracked
file. `wp-config.php` is gitignored (`AGENTS.md`).

### 3.3 Shared Secret Handling

`PREVIEW_SECRET` / `GOTG_PREVIEW_SECRET` and `REVALIDATE_SECRET` /
`GOTG_REVALIDATE_SECRET` are **shared secrets**: one value held on both sides of
a trust boundary. They obey four rules.

| Rule | Detail |
|---|---|
| Generate per environment | Local, staging, and production each get their own pair. Never reuse one value across environments — a leaked local secret must not authenticate against production. |
| Both sides must match | `PREVIEW_SECRET` in Vercel must equal `GOTG_PREVIEW_SECRET` in `wp-config.php` for the same environment, byte for byte. A mismatch surfaces as a 401 from `/preview` or a silently ignored revalidation webhook. |
| Never committed | Not in a tracked file, not in `.env.example`, not in a document, not in a commit message, not in a task description. They live only in the hosting provider's environment variable store (Vercel Project Settings → Environment Variables; the WordPress host's environment configuration or `wp-config.php`) and, locally, in `frontend/.env.local`, which is gitignored. |
| Rotate on exposure | If a value is ever committed, pasted into a ticket, or sent over an unencrypted channel, rotate both sides immediately. Rotation is a two-step deploy: set the new value on both sides, then redeploy the frontend. Brief webhook failures during the window are absorbed by the time-based ISR floor in §6.3. |

Generate a pair with:

```bash
openssl rand -hex 32   # PREVIEW_SECRET  / GOTG_PREVIEW_SECRET
openssl rand -hex 32   # REVALIDATE_SECRET / GOTG_REVALIDATE_SECRET
```

The same four rules apply to every row in §3.1 and §3.2 marked **Secret: Yes**,
including `WP_PREVIEW_APP_PASSWORD`, `RESEND_API_KEY`, `CONTACT_FORM_TO`,
`GOOGLE_MAPS_STATIC_API_KEY`, `SENTRY_AUTH_TOKEN`, the staging Basic Auth
credentials, the database credentials, and the WordPress salts — the only
difference is that those are issued by a provider rather than generated locally.

Storage locations, for the avoidance of doubt:

| Environment | Frontend secrets live in | Backend secrets live in |
|---|---|---|
| Local | `frontend/.env.local` — gitignored, never committed | `wp-config.php` — gitignored per `AGENTS.md` |
| Preview | Vercel environment variables, Preview scope | Staging WordPress host configuration |
| Staging | Vercel environment variables, Preview scope | Staging WordPress host configuration |
| Production | Vercel environment variables, Production scope | Production WordPress host configuration |

### 3.4 `.env.example`

Committed. Contains every frontend variable with an empty or placeholder value
and a one-line comment. Never contains a real secret.

```bash
# frontend/.env.example
# Copy to .env.local and fill in. Never commit .env.local.

# --- WordPress ---
# Studio site URL. Find it in the Studio app under the site name.
WP_API_BASE_URL=http://localhost:8881

# --- Site ---
# Canonical origin. Locally this is the dev server.
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# --- Preview and revalidation ---
# Generate each with: openssl rand -hex 32
# Must match GOTG_PREVIEW_SECRET in the WordPress wp-config.php, byte for byte.
PREVIEW_SECRET=
# Must match GOTG_REVALIDATE_SECRET in the WordPress wp-config.php, byte for byte.
REVALIDATE_SECRET=
# WordPress user and Application Password used for draft previews.
WP_PREVIEW_USER=
WP_PREVIEW_APP_PASSWORD=

# --- Contact form (optional locally; submissions no-op without these) ---
RESEND_API_KEY=
CONTACT_FORM_TO=
CONTACT_FORM_FROM=

# --- Instagram (optional locally; the feed renders its error state without it) ---
NEXT_PUBLIC_BEHOLD_FEED_ID=

# --- Maps (optional locally; the map renders its fallback without it) ---
GOOGLE_MAPS_STATIC_API_KEY=

# --- Analytics and monitoring (production only; leave empty locally) ---
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

Environment variables are validated at startup so a missing value fails loudly
rather than producing `undefined` in a URL:

```ts
// frontend/src/lib/env.ts
import { z } from 'zod';

const ServerEnvSchema = z.object({
  WP_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  PREVIEW_SECRET: z.string().min(16),
  REVALIDATE_SECRET: z.string().min(16),
  WP_PREVIEW_USER: z.string().optional(),
  WP_PREVIEW_APP_PASSWORD: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  CONTACT_FORM_TO: z.string().email().optional(),
  CONTACT_FORM_FROM: z.string().email().optional(),
  GOOGLE_MAPS_STATIC_API_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) {
    return cached;
  }

  const parsed = ServerEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => issue.path.join('.'))
      .join(', ');
    throw new Error(`Invalid or missing environment variables: ${missing}`);
  }

  cached = parsed.data;
  return cached;
}
```

---

## 4. Local Setup from a Clean Machine

Assumes Windows 11 with git installed.

### 4.1 Prerequisites

| Tool | Version | Install |
|---|---|---|
| WordPress Studio | Latest | https://developer.wordpress.com/studio/ |
| Node.js | 22 LTS | `winget install OpenJS.NodeJS.LTS` |
| pnpm | 9.x | `corepack enable && corepack prepare pnpm@9 --activate` |
| Git | 2.40+ | `winget install Git.Git` |
| VS Code | Latest | `winget install Microsoft.VisualStudioCode` |

### 4.2 Backend

1. Install and open WordPress Studio.
2. Create a site named **grills**. Studio places it at
   `C:\Users\manav\Studio\grills` and provisions SQLite through the
   `sqlite-database-integration` plugin automatically.
3. Replace the generated site directory contents with the repository:
   ```bash
   cd /c/Users/manav/Studio
   git clone https://github.com/manav859/grills.git grills-repo
   ```
   Then copy `wp-content/mu-plugins/` and `wp-content/themes/gotg-headless/`
   from `grills-repo` into the Studio site, and initialise the Studio site
   directory as the working copy of the backend repository. Only those two paths
   are tracked; everything else Studio generated stays untracked.
4. Install no custom-fields plugin. Fields are registered in PHP by the
   mu-plugins copied in step 3 and are available as soon as WordPress loads —
   there is no licence to enter, no plugin to activate, and no JSON to sync
   (`AGENTS.md` Rule 5, ADR-0025).
5. Activate the **gotg-headless** theme.
6. Generate the two shared secrets. Run each command once and keep the output —
   the same two values go into both `wp-config.php` below and
   `frontend/.env.local` in §4.3. They must match byte for byte; see §3.3.
   ```bash
   openssl rand -hex 32   # use for GOTG_PREVIEW_SECRET  / PREVIEW_SECRET
   openssl rand -hex 32   # use for GOTG_REVALIDATE_SECRET / REVALIDATE_SECRET
   ```
7. Add to `wp-config.php` (gitignored), pasting the generated values:
   ```php
   define( 'GOTG_FRONTEND_URL', 'http://localhost:3000' );
   define( 'GOTG_REVALIDATE_SECRET', '' ); // paste the second value from step 6
   define( 'GOTG_PREVIEW_SECRET', '' );    // paste the first value from step 6
   define( 'WP_ENVIRONMENT_TYPE', 'local' );
   define( 'WP_DEBUG', true );
   define( 'WP_DEBUG_LOG', true );
   define( 'WP_DEBUG_DISPLAY', false );
   define( 'DISALLOW_FILE_EDIT', true );
   ```
8. Seed content:
   ```bash
   wp @gotg-local eval-file tools/seed-content.php
   ```
   The seed script creates the five routed pages with their exact slugs, one
   `gotg_location`, the default `gotg_menu_section` and `gotg_dietary` terms,
   a handful of `gotg_menu_item` records, two `gotg_event` records, and
   populates Site Settings. It is idempotent.
9. Verify: `http://localhost:{studio-port}/wp-json/gotg/v1/home` returns JSON
   containing a `_global` key.

### 4.3 Frontend

```bash
cd /d/work
git clone https://github.com/manav859/grills-frontend.git grills
cd grills/frontend
cp .env.example .env.local
# Set WP_API_BASE_URL to the Studio site URL and port from step 4.2.
# Paste the two secrets generated in step 6 of 4.2 into PREVIEW_SECRET and
# REVALIDATE_SECRET. They must match wp-config.php byte for byte.
pnpm install
pnpm dev
```

Verify `http://localhost:3000` renders the home page with seeded content.

### 4.4 Workspace

Open `D:\work\grills\grills.code-workspace` in VS Code. Both roots load. Do not
open either folder alone.

Recommended extensions: ESLint, Prettier, Tailwind CSS IntelliSense, PHP
Intelephense, PHP Sniffer.

### 4.5 Verification checklist

- [ ] `http://localhost:{studio-port}/wp-admin` loads and Site Settings appears in the admin menu
- [ ] All five `gotg/v1` endpoints return 200 with a `_global` key
- [ ] `http://localhost:{studio-port}/wp-json/wp/v2/posts` returns 401 (core REST locked down)
- [ ] `pnpm dev` serves all five routes without errors
- [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm test` pass
- [ ] Saving a menu item in `wp-admin` triggers a revalidation request visible in the Next.js dev server log
- [ ] Clicking Preview on a draft page opens the frontend with draft content
- [ ] `git config core.autocrlf` returns nothing or `false` in both repositories — LF is enforced by `.gitattributes` and must not be overridden

---

## 5. CI/CD Pipeline

### 5.1 Frontend — GitHub Actions + Vercel

| Stage | Trigger | Steps | Blocking |
|---|---|---|---|
| 1. Install | Every push | Checkout, setup Node 22, `pnpm install --frozen-lockfile` | Yes |
| 2. Static checks | Every push | `pnpm typecheck`, `pnpm lint --max-warnings=0`, `pnpm format:check` | Yes |
| 3. Unit tests | Every push | `pnpm test` (Vitest — contrast pairs, formatters, hours logic) | Yes |
| 4. Contract tests | Every PR, and every `main` push | `pnpm test:contract` against staging WordPress | Yes |
| 5. Build | Every push | `pnpm build` | Yes |
| 6. Bundle report | Every PR | `@next/bundle-analyzer`; comment per-route first-load JS delta | No — comment only |
| 7. Preview deploy | Every PR | Vercel builds and deploys a preview URL | Yes |
| 8. E2E + a11y | Every PR, against the preview URL | Playwright + `@axe-core/playwright` | Yes |
| 9. Lighthouse CI | Every PR, against the preview URL | Budgets from `08-PERFORMANCE-SEO-A11Y.md` §1.3 | Yes |
| 10. Production deploy | Merge to `main` | Vercel builds and deploys production | Yes |
| 11. Post-deploy smoke | After production deploy | Playwright smoke suite against production | Yes — a failure triggers the §7 rollback |

Stage 4 depends on staging WordPress being reachable. If it is down, the job
fails rather than skipping. A skipped contract test is worse than a red build:
it removes the only automated guard against PHP/TypeScript drift
(`04-API-CONTRACT.md` §10).

### 5.2 Backend — GitHub Actions

| Stage | Trigger | Steps | Blocking |
|---|---|---|---|
| 1. Lint | Every push | `phpcs` against `phpcs.xml` (`07-CODING-STANDARDS.md` §8.3) | Yes |
| 2. Static analysis | Every push | PHPStan level 5 with `szepeviktor/phpstan-wordpress` | Yes |
| 3. Syntax | Every push | `php -l` on every changed `.php` file | Yes |
| 4. Meta box pairing | Every push | Assert every `add_meta_box()` callback has a matching `save_post` handler, and that each handler calls `wp_verify_nonce()` and `current_user_can()` | Yes |
| 5. Schema drift check | Every PR | Assert every post type, taxonomy, meta key, and settings option key registered in code appears in `docs/03-CONTENT-MODEL.md`, and vice versa | Yes |
| 6. Deploy to staging | Merge to `main` | rsync `wp-content/mu-plugins/` and `wp-content/themes/gotg-headless/` to the staging host | Yes |
| 7. Deploy to production | Manual approval | Same rsync to production, then flush the object cache | Yes |

Stage 5 is the mechanism that makes `AGENTS.md`'s "documentation and schema ship
together" rule enforceable rather than aspirational.

Backend deploys copy files only. There is no build step, no Composer install on
the host, and no database migration — content lives in the database and travels
separately (§8).

---

## 6. Content-Change-Triggers-Rebuild

On-demand tag revalidation, with time-based ISR as the safety net. Both are
active. Tag mapping is in `04-API-CONTRACT.md` §8.

### 6.1 WordPress side

```php
<?php
/**
 * Sends on-demand revalidation requests to the frontend when content changes.
 *
 * @package GOTG
 */

/**
 * Maps a changed object to the cache tags it invalidates.
 *
 * @param string $post_type Post type or 'options' or 'term'.
 * @return string[] Cache tags.
 */
function gotg_tags_for_change( $post_type ) {
	switch ( $post_type ) {
		case 'gotg_menu_item':
			return array( 'menu', 'home' );
		case 'gotg_event':
			return array( 'events', 'home' );
		case 'gotg_location':
			return array( 'contact', 'home' );
		case 'gotg_block':
			return array( 'home', 'menu', 'events', 'about', 'contact' );
		case 'options':
		case 'term':
			return array( 'home', 'menu', 'events', 'about', 'contact' );
		default:
			return array();
	}
}

/**
 * Posts a revalidation request to the frontend.
 *
 * @param string[] $tags Cache tags to invalidate.
 * @return void
 */
function gotg_send_revalidate( array $tags ) {
	if ( empty( $tags ) ) {
		return;
	}

	if ( ! defined( 'GOTG_FRONTEND_URL' ) || ! defined( 'GOTG_REVALIDATE_SECRET' ) ) {
		return;
	}

	$response = wp_remote_post(
		trailingslashit( GOTG_FRONTEND_URL ) . 'api/revalidate',
		array(
			'timeout'  => 5,
			'blocking' => false,
			'headers'  => array(
				'Content-Type'      => 'application/json',
				'x-gotg-revalidate' => GOTG_REVALIDATE_SECRET,
			),
			'body'     => wp_json_encode( array( 'tags' => array_values( array_unique( $tags ) ) ) ),
		)
	);

	if ( is_wp_error( $response ) && defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		error_log( 'gotg revalidate failed: ' . $response->get_error_message() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
	}
}

/**
 * Triggers revalidation after a post is saved.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 * @return void
 */
function gotg_revalidate_on_save( $post_id, $post ) {
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( wp_is_post_revision( $post_id ) ) {
		return;
	}

	if ( 'page' === $post->post_type ) {
		$tags = array( $post->post_name );
		gotg_send_revalidate( array_intersect( $tags, array( 'home', 'menu', 'events', 'about', 'contact' ) ) );
		return;
	}

	gotg_send_revalidate( gotg_tags_for_change( $post->post_type ) );
}
add_action( 'save_post', 'gotg_revalidate_on_save', 20, 2 );

/**
 * Triggers revalidation after a post is deleted or trashed.
 *
 * @param int $post_id Post ID.
 * @return void
 */
function gotg_revalidate_on_delete( $post_id ) {
	$post_type = get_post_type( $post_id );

	if ( ! is_string( $post_type ) ) {
		return;
	}

	gotg_send_revalidate( gotg_tags_for_change( $post_type ) );
}
add_action( 'before_delete_post', 'gotg_revalidate_on_delete', 10, 1 );
add_action( 'wp_trash_post', 'gotg_revalidate_on_delete', 10, 1 );

/**
 * Triggers revalidation after a taxonomy term changes.
 *
 * @return void
 */
function gotg_revalidate_on_term_change() {
	gotg_send_revalidate( gotg_tags_for_change( 'term' ) );
}
add_action( 'edited_gotg_menu_section', 'gotg_revalidate_on_term_change' );
add_action( 'created_gotg_menu_section', 'gotg_revalidate_on_term_change' );
add_action( 'delete_gotg_menu_section', 'gotg_revalidate_on_term_change' );
add_action( 'edited_gotg_dietary', 'gotg_revalidate_on_term_change' );
add_action( 'created_gotg_dietary', 'gotg_revalidate_on_term_change' );
add_action( 'delete_gotg_dietary', 'gotg_revalidate_on_term_change' );

/**
 * Triggers revalidation after the Site Settings option is updated.
 *
 * @param mixed $old_value Previous option value.
 * @param mixed $value     New option value.
 * @return void
 */
function gotg_revalidate_on_settings_save( $old_value, $value ) {
	gotg_send_revalidate( gotg_tags_for_change( 'options' ) );
}
add_action( 'update_option_gotg_site_settings', 'gotg_revalidate_on_settings_save', 20, 2 );
add_action( 'add_option_gotg_site_settings', 'gotg_revalidate_on_settings_save', 20, 2 );
```

`update_option_{$option}` does not fire when the submitted value is identical to
the stored one, so an editor pressing Save with no changes does not trigger a
five-tag invalidation. `add_option_{$option}` covers the first save, when the
option does not yet exist.

`blocking => false` means the editor's save completes without waiting for
Vercel. A slow or unreachable frontend never blocks the admin.

### 6.2 Frontend side

```ts
// frontend/src/app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';

const VALID_TAGS = new Set(['home', 'menu', 'events', 'about', 'contact']);

interface RevalidateBody {
  tags?: unknown;
}

export async function POST(request: NextRequest): Promise<Response> {
  const secret = request.headers.get('x-gotg-revalidate');

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  let body: RevalidateBody;

  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return Response.json({ revalidated: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (!Array.isArray(body.tags)) {
    return Response.json({ revalidated: false, error: 'tags must be an array' }, { status: 400 });
  }

  const tags = body.tags.filter(
    (tag): tag is string => typeof tag === 'string' && VALID_TAGS.has(tag)
  );

  if (tags.length === 0) {
    return Response.json({ revalidated: false, error: 'No valid tags' }, { status: 400 });
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return Response.json({ revalidated: true, tags, now: Date.now() });
}
```

The `VALID_TAGS` allow-list prevents an attacker with the secret from
invalidating arbitrary cache entries, and prevents a typo in PHP from silently
doing nothing.

### 6.3 Editor-visible behaviour

| Action | Time to appear on the live site |
|---|---|
| Save a menu item | Under 10 seconds |
| Save an event | Under 10 seconds |
| Save Site Settings | Under 10 seconds across all five routes |
| Webhook lost or frontend unreachable at save time | Within the endpoint's `revalidate` window — 15 minutes for events, 1 hour for home and menu, 24 hours for about and contact |

The time-based floor is why `about` and `contact` can safely use 86400: an urgent
change to either still propagates in seconds through the webhook, and 24 hours is
only the worst case if the webhook is lost.

---

## 7. Deployment and Rollback

### 7.1 Frontend deployment

| Step | Action |
|---|---|
| 1 | Merge the PR to `main` (squash) |
| 2 | Vercel builds automatically; every route is statically generated |
| 3 | Build failure → no deployment, the previous production remains live |
| 4 | Build success → atomic promotion to the production alias |
| 5 | Post-deploy smoke suite runs against production |
| 6 | Smoke failure → automatic rollback per §7.2 |

Deploys are atomic. There is no window in which some routes are new and others
are old.

### 7.2 Frontend rollback

| Method | Command | Time |
|---|---|---|
| Vercel instant rollback | Vercel dashboard → Deployments → previous → Promote to Production | ~10 seconds |
| CLI | `vercel rollback <deployment-url> --token=$VERCEL_TOKEN` | ~10 seconds |
| Git revert | `git revert <sha> && git push` | ~3 minutes (full rebuild) |

Use instant rollback first, always. Investigate afterwards. A revert commit
follows once the cause is understood, so `main` does not stay ahead of what is
deployed.

Rollback does not restore content — content lives in WordPress. Rolling the
frontend back does not undo a bad menu edit; that is a content restore (§8.3).

### 7.3 Backend deployment

| Step | Action |
|---|---|
| 1 | Merge to `main`; CI deploys `mu-plugins/` and the theme to staging |
| 2 | Verify all five endpoints on staging return 200 and pass contract tests |
| 3 | Manual approval in GitHub Actions |
| 4 | rsync to production |
| 5 | Flush the object cache: `wp cache flush` |
| 6 | Trigger a full revalidation: `wp eval "gotg_send_revalidate( array( 'home', 'menu', 'events', 'about', 'contact' ) );"` |
| 7 | Verify all five endpoints on production |

### 7.4 Backend rollback

| Step | Action |
|---|---|
| 1 | `git checkout <previous-tag>` in the deployment workspace |
| 2 | rsync the previous file set to production |
| 3 | `wp cache flush` |
| 4 | Trigger a full revalidation |

Code rollback is safe because mu-plugins are stateless: they register post types
and shape responses. They do not migrate data. A code rollback never loses
content.

**Exception:** if a deploy included a content-model change that an editor has
already used (for example a new required field now populated on 40 menu items),
rolling the code back leaves that data orphaned in the database. It is not lost,
but it stops appearing in the API. Content-model changes must therefore be
additive and backward compatible within a release, and destructive schema changes
require a content backup taken immediately before deployment.

### 7.5 Deployment order for a contract change

Backend first, always.

1. Merge and deploy the backend change (the endpoint returns the new field).
2. Verify contract tests pass against staging.
3. Merge and deploy the frontend change (the component consumes the new field).

The reverse order ships a frontend expecting a field the API does not return.
Because new fields are additive, a deployed backend with an unshipped frontend is
harmless — the extra key is ignored until the frontend uses it. The `.strict()`
Zod contract test would flag it, which is why the contract test and the
TypeScript interface are updated in the backend PR's paired frontend PR, merged
in that order.

---

## 8. Backups

### 8.1 Policy

| Asset | Frequency | Retention | Location | Restore tested |
|---|---|---|---|---|
| Production database | Daily, automated by host | 30 days | Host-managed, off-server | Quarterly |
| Production database, pre-deploy | Before every production backend deploy | 7 days | Host snapshot | Per deploy |
| `wp-content/uploads/` | Daily, automated by host | 30 days | Host-managed, off-server | Quarterly |
| Authored code | Every push | Indefinite | GitHub, both repositories | Continuously (CI builds from it) |
| Field definitions | Every push | Indefinite | `mu-plugins/gotg/meta.php` in the backend repository | Continuously (CI registers them) |
| Documentation | Every push | Indefinite | GitHub | — |
| Vercel deployments | Every deploy | Per Vercel retention | Vercel | Via instant rollback |
| Local SQLite database, `wp-content/database/` | Manual, before any risky local operation and after any significant authoring session | Keep the last 3 | Outside the repository working copy — it is gitignored and must stay that way (§1.1) | On copy back |

WordPress core and third-party plugins are not backed up — they are reinstallable
from source at a pinned version. The same applies to `wp-content/uploads/` and
`wp-config.php` locally; §1.1 lists which untracked backend paths are
reproducible and which are not.

The local database is the one local asset no other copy exists of. Back it up by
copying the directory with WordPress Studio's site stopped, so no write is in
flight:

```bash
cp -r /c/Users/manav/Studio/grills/wp-content/database \
      "/c/Users/manav/Studio/_backups/grills-db-$(date +%Y-%m-%d)"
```

The destination is outside the Studio site directory so a clean reinstall of the
site cannot take the backups with it.

### 8.2 Off-site copy

The managed host's backups are the primary mechanism. A monthly manual export is
stored independently of the host so a host account compromise or termination is
survivable:

```bash
wp @gotg-production db export gotg-$(date +%Y-%m-%d).sql
tar -czf gotg-uploads-$(date +%Y-%m-%d).tar.gz wp-content/uploads/
```

`[NEEDS CLIENT INPUT] Destination for the off-site copy — client-owned cloud
storage or agency storage.`

### 8.3 Restore procedure

| Scenario | Procedure | Expected downtime |
|---|---|---|
| Bad content edit, single post | Restore from WordPress revisions in the admin | None |
| Bad content edit, widespread | Restore the previous daily database snapshot via the host panel, then trigger a full revalidation | Editing is unavailable 5–15 minutes; the public site is unaffected |
| Uploads lost | Restore `wp-content/uploads/` from the host snapshot | Images 404 until restored; pages still render |
| WordPress instance lost entirely | Provision a new instance, restore the database and uploads, redeploy `mu-plugins/` and the theme from git, reinstall the three free plugins from §4 of `01-TECH-STACK.md` | 1–2 hours; the public site continues serving stale-but-correct static pages throughout |
| Frontend broken | Vercel instant rollback (§7.2) | ~10 seconds |

The last row of the WordPress-loss scenario is the practical payoff of the
static-plus-ISR architecture: WordPress can be gone for two hours and no visitor
notices.

---

## 9. DNS and Domain Cutover

Zero-downtime migration from Squarespace.

`[NEEDS CLIENT INPUT] DP-13 (registrar and domain ownership) and DP-14
(production domain) must both be resolved before this runbook can be scheduled.`

### 9.1 Pre-cutover, T-14 days

| # | Task | Owner | Verification |
|---|---|---|---|
| 1 | Confirm domain ownership and obtain registrar access | Client | Log in to the registrar |
| 2 | Export the indexed-URL list from Google Search Console | Build team | CSV saved |
| 3 | Crawl the Squarespace site (Screaming Frog) for every reachable URL | Build team | CSV saved |
| 4 | Reconcile both lists against the redirect map in `02-INFORMATION-ARCHITECTURE.md` §4; add any missing path | Build team | Every indexed URL maps to a destination |
| 5 | Lower the DNS TTL on the apex A record and the `www` CNAME to **300 seconds** | Build team | `dig {domain} +short` shows a 300s TTL |
| 6 | Provision `cms.{domain}` on the WordPress host with SSL | Build team | `https://cms.{domain}/wp-json/gotg/v1/home` returns 200 |
| 7 | Migrate content from staging WordPress to production WordPress | Build team | Spot-check every post type in the admin |
| 8 | Point the frontend production environment at `cms.{domain}` | Build team | Vercel environment variables updated |
| 9 | Full client UAT sign-off on staging | Client | Written approval |

Step 5 is the step most often skipped and the one that determines whether the
cutover takes five minutes or two days. A 48-hour TTL means 48 hours of split
traffic.

### 9.2 Pre-cutover, T-2 days

| # | Task | Verification |
|---|---|---|
| 10 | Confirm the lowered TTL has propagated (elapsed time > the old TTL) | `dig {domain}` from three networks |
| 11 | Add `{domain}` and `www.{domain}` as domains in the Vercel project | Vercel shows both, pending DNS |
| 12 | Record the exact DNS records Vercel requires | A record for the apex, CNAME for `www` |
| 13 | Verify every redirect in `02-INFORMATION-ARCHITECTURE.md` §4 against the staging deployment | Automated redirect test suite green |
| 14 | Verify the sitemap, robots, and all JSON-LD on staging | Rich Results Test passes |
| 15 | Freeze Squarespace content editing | Client notified in writing |
| 16 | Take a full Squarespace content and media export | Archive stored |
| 17 | Confirm the production frontend build is green and all smoke tests pass | CI green |

### 9.3 Cutover day

Schedule for a Tuesday or Wednesday between 02:00 and 04:00 Pacific — the
restaurant opens at 06:00 and the overnight window has the least traffic. Never
Friday: a Friday cutover puts any fallout into a weekend with live music.

| # | Time | Task | Rollback trigger |
|---|---|---|---|
| 18 | T-0 | Final verification that the production frontend serves correctly on its `.vercel.app` URL | Any failure → abort, do not touch DNS |
| 19 | T+0 | Update the apex A record and the `www` CNAME at the registrar to Vercel's values | — |
| 20 | T+2min | Confirm propagation from multiple resolvers: `dig @8.8.8.8 {domain}`, `dig @1.1.1.1 {domain}` | No propagation in 15 minutes → revert the records |
| 21 | T+5min | Vercel issues the SSL certificate automatically | No certificate in 20 minutes → investigate CAA records |
| 22 | T+10min | Verify `https://{domain}` and `https://www.{domain}` both serve the new site and `www` redirects to the apex | Wrong site served → revert the records |
| 23 | T+15min | Walk every route on the live domain: `/`, `/menu`, `/events`, an event detail, `/about`, `/contact` | Any 500 → Vercel instant rollback |
| 24 | T+20min | Test every redirect from §4 of the IA document against the live domain | Broken redirect → patch and redeploy; not a cutover abort |
| 25 | T+25min | Submit the sitemap in Google Search Console; request indexing for the five primary routes | — |
| 26 | T+30min | Verify GA4 is receiving events on the live domain | — |
| 27 | T+35min | Submit a contact form on the live domain and confirm delivery | No delivery → check the Resend domain verification |
| 28 | T+40min | Verify the Instagram feed, the static map, and the `tel:` links on a real phone | — |
| 29 | T+45min | Update the Google Business Profile website URL | — |
| 30 | T+50min | Update the Instagram bio link | Client |
| 31 | T+24h | Restore the DNS TTL to 3600 seconds | — |
| 32 | T+48h | Confirm no crawl errors in Search Console | — |
| 33 | T+7d | Cancel the Squarespace subscription | **Not before** — it is the only rollback target for the old site |

### 9.4 Zero-downtime rationale

Downtime occurs when DNS points at nothing. It is avoided because:

1. The new site is live and verified on its Vercel URL before any DNS change.
2. The 300-second TTL means resolvers converge within five minutes.
3. During the overlap, some resolvers return Squarespace and some return Vercel.
   Both serve a working site. No visitor sees an error.
4. Vercel provisions SSL automatically once DNS resolves, so there is no
   certificate gap.
5. Squarespace stays live and paid for seven days after cutover, so reverting the
   DNS records restores the old site immediately if needed.

### 9.5 Email

`[NEEDS CLIENT INPUT] If email for the domain is currently hosted through
Squarespace (Google Workspace via Squarespace, or Squarespace's own mail), the
MX, SPF, DKIM, and DMARC records must be preserved verbatim through the cutover.
Changing the A record does not affect MX records, but a registrar-level "point
everything to Vercel" action does — and it will break email silently. Record
every existing DNS record before making any change, and change only the A and
CNAME records named in step 19.`

Additionally, Resend (`09-INTEGRATIONS.md` §5) requires its own SPF include and
DKIM record. These are added alongside the existing email records, not in place
of them.

---

## 10. SQLite → MySQL Parity

**This is a real risk, not a formality.**

### 10.1 The situation

Local development uses SQLite through WordPress Studio's bundled
`sqlite-database-integration` plugin. This is a fixed, pre-existing arrangement
and is not being changed. Staging and production use MySQL 8.0, because that is
what WordPress supports in production and what every managed WordPress host
provides.

Consequence: **every developer works against a different database engine than
the one that serves the client.** Code that works locally can fail on staging,
and the failure will surface at the point of deployment rather than at the point
of writing.

### 10.2 How SQLite works here

`sqlite-database-integration` is a drop-in that intercepts `$wpdb` queries and
translates MySQL SQL into SQLite SQL at runtime. It is a translation layer, not
a compatible engine. Translation is good but not total.

### 10.3 Specific divergence risks

| # | Risk | Manifestation | Mitigation |
|---|---|---|---|
| 1 | Raw `$wpdb->query()` with MySQL-specific SQL | Works in MySQL, fails or silently misbehaves under translation | **Prohibited.** All data access uses `WP_Query`, `get_posts()`, `get_terms()`, `get_post_meta()`, `get_term_meta()`, and `get_option()`. Any `$wpdb` usage requires an ADR. |
| 2 | Collation and case sensitivity | SQLite `LIKE` is case-insensitive for ASCII by default; MySQL depends on collation. A search or slug comparison behaves differently. | Slug comparisons use exact matches on values WordPress has already sanitised to lowercase. No `LIKE` queries in shaper code. |
| 3 | Sort order for mixed-case and accented strings | Menu sections order differently locally than on staging | Ordering is by the numeric `display_order` field, with the term name only as a tiebreak. Numeric ordering is identical across engines. |
| 4 | `FULLTEXT` indexes | Not supported by SQLite | No full-text search exists in this project (`02-INFORMATION-ARCHITECTURE.md` §3.4). Do not introduce one. |
| 5 | Date and time functions | `DATE_ADD`, `STR_TO_DATE`, `NOW()` in raw SQL translate imperfectly | Date filtering for upcoming events uses `WP_Query` `meta_query` with `type => 'DATETIME'`, not raw SQL. Comparison values are computed in PHP with `wp_date()`. |
| 6 | Numeric meta comparison | `meta_value` is stored as text; MySQL and SQLite cast differently in `ORDER BY` | Price sorting is not performed in SQL. Items are ordered by `menu_order`, an integer post column. |
| 7 | `JSON_*` functions | Not available under translation | Not used. Repeating fields are stored as PHP-serialised arrays by `update_post_meta()` and read back by `get_post_meta()`; serialisation is handled by WordPress in PHP, never by the database. |
| 8 | Transactions and locking | Different semantics | No multi-statement transactions in this codebase. |
| 9 | Character set | SQLite is UTF-8; MySQL must be `utf8mb4` | The production database must be created with `utf8mb4` / `utf8mb4_unicode_520_ci`. A `utf8` (3-byte) database corrupts emoji in menu descriptions and event titles. Verify at provisioning. |
| 10 | Auto-increment behaviour after deletion | IDs may differ between environments | Nothing depends on specific IDs. The API exposes `id` only where the frontend needs a React key, and slugs are the stable identifiers. |
| 11 | `max_allowed_packet` and query size limits | Not applicable to SQLite; MySQL can reject a large query | The `/menu` payload is assembled in PHP from many small queries, not one large one. |
| 12 | Plugin compatibility | Reduced by ADR-0025 to three free plugins, none of which stores project data. The fields layer is core `register_post_meta()` and `get_post_meta()`, which the SQLite translation layer supports as well as it supports WordPress itself. | Verified on staging (MySQL) by the contract tests before every production deploy. Removing the commercial fields plugin removes the largest third-party surface this risk previously covered. |
| 13 | Third-party plugin with raw SQL | Redis Object Cache, Safe SVG, and WP Migrate may issue engine-specific SQL | Redis Object Cache runs on staging and production only, never locally. Any plugin added later is tested on staging before it is considered supported. |

### 10.4 Mitigation protocol

| Control | Rule | Enforcement |
|---|---|---|
| No raw SQL | `$wpdb->query`, `$wpdb->get_results`, and `$wpdb->prepare` do not appear in `mu-plugins/` | PHPCS custom sniff, blocking in CI |
| Staging is authoritative | Contract tests (`04-API-CONTRACT.md` §10) run against staging MySQL, never against local SQLite | CI stage 4 |
| No local-only sign-off | A feature is not "done" until it has been verified on staging. Local verification is necessary and not sufficient. | Definition of Done in `11-PROJECT-PLAN.md` |
| Early staging | Staging with MySQL is provisioned in Phase 0, before feature work begins, so divergence surfaces in week 1 rather than week 8 | Task T-DO-03 |
| Content lives in MySQL | Real content is authored on staging and promoted to production. Local content is disposable seed data. | §11 |
| `utf8mb4` verified | The production and staging database character set is checked at provisioning and recorded | T-DO-03 acceptance criteria |

### 10.5 Migration path

There is no SQLite-to-MySQL migration of content, because local content is never
promoted. The paths are:

| Direction | Mechanism | Frequency |
|---|---|---|
| Code: local → staging → production | git + rsync (§5.2) | Per merge |
| Content: staging → production | `wp db export` / `wp db import` plus `wp search-replace` for URLs, or the host's push tool | At launch, then rarely |
| Content: production → staging | Host pull tool, or `wp db export` / `wp db import` | Before any risky change, to rehearse against real data |
| Content: production/staging → local | `wp db export` on MySQL, then `wp db import` into the local SQLite site. **This is the one place the engines meet.** | On demand, best-effort |

The last row is the fragile one. A MySQL dump is MySQL SQL and does not import
cleanly into SQLite. Two workable approaches:

1. **Preferred — WP-CLI content export/import.** Use
   `wp export --dir=... --post_type=gotg_menu_item,gotg_event,gotg_location,page`
   to produce WXR, then `wp import` on the local site. This is engine-agnostic
   because it moves content through WordPress's own APIs rather than through SQL.
   Media requires `--fetch-attachments`. All field values are post meta and term
   meta, which WXR carries natively, so they survive the round trip. The
   `gotg_site_settings` option is **not** in WXR and must be exported separately
   with `wp option get gotg_site_settings --format=json`.
2. **Fallback — reseed.** Run the seed script (§4.2 step 8). Faster, always
   works, and adequate for most development.

Attempting a direct `mysqldump` → SQLite import is not supported and must not be
attempted; it will produce a broken local site and waste hours.

### 10.6 If SQLite proves untenable

If divergence causes repeated staging-only failures, the escape hatch is to move
local development to MySQL via a Docker container or a Studio configuration
change, keeping the same repository layout. This is a change to §1's established
environment and requires a superseding ADR. It is documented here so the option
is known, not because it is planned.

Trigger for reconsidering: **three or more staging-only defects traced to engine
divergence within one phase.**

---

## 11. Content Promotion

| Question | Answer |
|---|---|
| Where is real content authored? | Staging WordPress (MySQL) |
| Where is local content from? | The idempotent seed script; it is disposable |
| How does content reach production? | Database export/import at launch; afterwards production is authored directly |
| After launch, is content ever pushed from staging? | No. Production becomes the authoring environment. Staging is refreshed *from* production before risky changes. |
| Is media migrated? | Yes — `wp-content/uploads/` is copied alongside the database at launch, and `wp search-replace` rewrites URLs |
| Are user accounts migrated? | Yes, at launch. Passwords are reset for every account on the production instance. |

Post-launch, the flow reverses: production is the source of truth for content,
staging is refreshed from production, and local remains seeded. This is stated
explicitly because the pre-launch and post-launch directions are opposite, and
getting it backwards overwrites live content.
