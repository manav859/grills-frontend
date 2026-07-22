# 07 — Coding Standards

Status: **Living**
Last reviewed: 2026-07-22

Applies to both repositories. Frontend rules govern `D:\work\grills\frontend`.
Backend rules govern `C:\Users\manav\Studio\grills` and sit beneath `AGENTS.md`,
which takes precedence for backend repository policy.

---

## 1. Directory Structure

### 1.1 Frontend — `D:\work\grills\frontend`

```
frontend/
├── .husky/
│   └── pre-commit
├── public/
│   ├── fonts/
│   │   ├── inter-latin-400-normal.woff2
│   │   ├── inter-latin-500-normal.woff2
│   │   ├── inter-latin-600-normal.woff2
│   │   ├── bitter-latin-600-normal.woff2
│   │   └── bitter-latin-700-normal.woff2
│   ├── favicon.ico
│   └── og-default.jpg
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # /
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── global-error.tsx
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── menu/
│   │   │   └── page.tsx
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── privacy-policy/
│   │   │   └── page.tsx
│   │   ├── accessibility/
│   │   │   └── page.tsx
│   │   ├── preview/
│   │   │   ├── route.ts
│   │   │   └── exit/
│   │   │       └── route.ts
│   │   └── api/
│   │       └── revalidate/
│   │           └── route.ts
│   ├── components/
│   │   ├── primitives/
│   │   │   ├── button.tsx
│   │   │   ├── link-button.tsx
│   │   │   ├── icon-button.tsx
│   │   │   ├── heading.tsx
│   │   │   ├── text.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── image.tsx
│   │   │   ├── price.tsx
│   │   │   ├── price-list.tsx
│   │   │   ├── divider.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── spinner.tsx
│   │   │   ├── visually-hidden.tsx
│   │   │   └── icons/
│   │   │       ├── index.tsx
│   │   │       └── icon.tsx
│   │   ├── layout/
│   │   │   ├── container.tsx
│   │   │   ├── section.tsx
│   │   │   ├── stack.tsx
│   │   │   ├── grid.tsx
│   │   │   ├── split-layout.tsx
│   │   │   └── page-shell.tsx
│   │   ├── blocks/
│   │   │   ├── page-block-renderer.tsx
│   │   │   ├── hero.tsx
│   │   │   ├── text-section.tsx
│   │   │   ├── rich-text.tsx
│   │   │   ├── split-feature.tsx
│   │   │   ├── gallery.tsx
│   │   │   ├── gallery-carousel.tsx
│   │   │   ├── cta-band.tsx
│   │   │   ├── featured-menu-row.tsx
│   │   │   ├── events-preview.tsx
│   │   │   ├── people.tsx
│   │   │   ├── person-card.tsx
│   │   │   ├── instagram-feed.tsx
│   │   │   ├── menu-card.tsx
│   │   │   ├── menu-section.tsx
│   │   │   ├── dietary-legend.tsx
│   │   │   ├── event-card.tsx
│   │   │   ├── event-hero.tsx
│   │   │   ├── recurring-programme-card.tsx
│   │   │   ├── add-to-calendar.tsx
│   │   │   ├── location-card.tsx
│   │   │   ├── hours-table.tsx
│   │   │   ├── map-embed.tsx
│   │   │   └── page-header.tsx
│   │   ├── navigation/
│   │   │   ├── site-header.tsx
│   │   │   ├── site-footer.tsx
│   │   │   ├── primary-nav.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── mobile-cta-bar.tsx
│   │   │   ├── nav-dropdown.tsx
│   │   │   ├── skip-link.tsx
│   │   │   ├── breadcrumbs.tsx
│   │   │   ├── section-nav.tsx
│   │   │   ├── daypart-filter.tsx
│   │   │   ├── hours-status.tsx
│   │   │   ├── social-links.tsx
│   │   │   └── announcement-bar.tsx
│   │   └── forms/
│   │       ├── field.tsx
│   │       ├── text-input.tsx
│   │       ├── text-area.tsx
│   │       ├── select.tsx
│   │       ├── checkbox.tsx
│   │       ├── form-error.tsx
│   │       ├── form-success.tsx
│   │       ├── honeypot.tsx
│   │       └── contact-form.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── seo.ts
│   │   ├── json-ld.ts
│   │   ├── hours.ts
│   │   ├── dates.ts
│   │   ├── format.ts
│   │   ├── env.ts
│   │   └── cn.ts
│   ├── actions/
│   │   └── submit-contact.ts
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── theme.css
│   │   ├── globals.css
│   │   └── contrast-pairs.ts
│   ├── types/
│   │   ├── api.ts
│   │   └── api.schema.ts
│   └── test/
│       ├── contract.test.ts
│       ├── contrast.test.ts
│       └── setup.ts
├── e2e/
│   ├── a11y.spec.ts
│   ├── navigation.spec.ts
│   └── menu-filter.spec.ts
├── .env.example
├── .nvmrc
├── .prettierrc
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── vitest.config.ts
```

Rules:

| Rule | Detail |
|---|---|
| No `src/components/ui/` | Grouping by "ui" carries no information. Components live in the group named in `05-DESIGN-SYSTEM.md` §10. |
| No barrel files | No `index.ts` re-exports except `components/primitives/icons/index.tsx`, which is a data module. Barrels defeat tree-shaking and obscure import paths. |
| One component per file | The file name is the kebab-case component name. |
| Co-location limit | Tests live in `src/test/` and `e2e/`, not beside components. Component-adjacent test files were considered and rejected: the test suite here is contract- and a11y-level, not per-component. |
| `lib/` is pure | Modules in `lib/` export functions with no React and no side effects at import time. `api.ts` is the sole exception (it reads `process.env`). |

### 1.2 Backend — `C:\Users\manav\Studio\grills`

```
wp-content/
├── mu-plugins/
│   ├── gotg-core.php                    # bootstrap; requires everything below
│   └── gotg/
│       ├── post-types.php
│       ├── taxonomies.php
│       ├── meta.php                     # every register_post_meta / register_term_meta
│       ├── sanitizers.php               # shared sanitize_callback functions
│       ├── settings.php                 # gotg_site_settings option + Settings API page
│       ├── image-sizes.php
│       ├── roles.php                    # gotg_editor role and capabilities
│       ├── admin/
│       │   ├── meta-box-framework.php   # nonce, capability, validation, error transient
│       │   ├── fields.php               # render partials: text, textarea, select, checkbox, media
│       │   ├── box-menu-item.php
│       │   ├── box-event.php
│       │   ├── box-location.php
│       │   ├── box-seo.php
│       │   ├── box-page-blocks.php
│       │   ├── box-reusable-block.php
│       │   ├── term-fields.php          # gotg_menu_section and gotg_dietary term meta
│       │   ├── declutter.php            # remove_menu_page, remove_meta_box, relabelling
│       │   ├── list-tables.php          # custom columns and warning badges
│       │   ├── enqueue.php
│       │   └── assets/
│       │       ├── gotg-repeater.js
│       │       ├── gotg-block-builder.js
│       │       ├── gotg-media-field.js
│       │       ├── gotg-conditional-fields.js
│       │       └── gotg-admin.css
│       ├── rest/
│       │   ├── routes.php
│       │   ├── shape-global.php
│       │   ├── shape-menu-item.php
│       │   ├── shape-event.php
│       │   ├── shape-blocks.php
│       │   ├── shape-image.php
│       │   ├── endpoint-home.php
│       │   ├── endpoint-menu.php
│       │   ├── endpoint-events.php
│       │   ├── endpoint-about.php
│       │   └── endpoint-contact.php
│       └── revalidate.php
└── themes/
    └── gotg-headless/
        ├── style.css                    # header comment only
        ├── functions.php                # empty; no theme behaviour
        └── index.php                    # returns a 404 for any front-end request
```

Per `AGENTS.md`, no route logic, no post-type registration, no meta
registration, and no presentation code lives in the theme. There is no
`acf-json/` directory and no fields plugin — field definitions are PHP in
`mu-plugins/gotg/meta.php` (ADR-0025).

Backend file rules:

| Rule | Detail |
|---|---|
| One meta box per file | `admin/box-*.php` holds the render callback, the validator, and the save handler for exactly one meta box |
| The framework is not duplicated | The seven-step save contract (`03-CONTENT-MODEL.md` §2.3) is implemented once in `meta-box-framework.php`. A `box-*.php` file that re-implements nonce or capability checking is rejected in review. |
| Sanitizers are shared | Every `sanitize_callback` lives in `sanitizers.php` and is referenced by name from both `meta.php` and the save handlers |
| Admin assets have no build step | Plain ES2017 and plain CSS, served as authored. No bundler, no transpiler, no `node_modules` in the backend repository. |
| Admin assets are scoped | `enqueue.php` loads each script only on the screens that need it, checked against `get_current_screen()` |

---

## 2. Naming Conventions

| Thing | Convention | Example | Counter-example |
|---|---|---|---|
| Frontend file | kebab-case | `menu-card.tsx` | `MenuCard.tsx`, `menuCard.tsx` |
| React component | PascalCase | `MenuCard` | `menuCard` |
| Props interface | `{Component}Props` | `MenuCardProps` | `IMenuCardProps`, `Props` |
| Hook | `use` + camelCase | `useHoursStatus` | `hoursStatus` |
| Non-component function | camelCase, verb-first | `formatPrice`, `fetchEndpoint` | `priceFormat` |
| Boolean variable or prop | `is`/`has`/`should`/`can` prefix | `isFeatured`, `hasError` | `featured`, `error` (when boolean) |
| Type / interface | PascalCase, no prefix | `MenuItem` | `IMenuItem`, `TMenuItem` |
| Union member string | snake_case when it mirrors a CMS value, otherwise kebab | `'split_feature'`, `'image-left'` | mixing the two for one union |
| Constant | SCREAMING_SNAKE_CASE, module scope | `ALLOWED_PATHS` | `allowedPaths` for a frozen constant |
| Environment variable | SCREAMING_SNAKE_CASE | `WP_API_BASE_URL` | `wpApiBaseUrl` |
| CSS custom property | `--{category}-{name}-{modifier}` | `--color-brand-primary-hover` | `--primaryHover` |
| Tailwind escape hatch class | `gotg-` prefix | `.gotg-rich-text` | `.rich-text` |
| PHP function | `gotg_` + snake_case | `gotg_shape_menu_item` | `shapeMenuItem` |
| PHP file | kebab-case | `shape-menu-item.php` | `ShapeMenuItem.php` |
| Git branch | `{type}/{ticket}-{slug}` | `feat/T-FE-12-menu-card` | `menu-card-updates` |

Branch types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`.

---

## 3. Import Ordering

Six groups, blank line between each, alphabetised within each group.

```tsx
// 1. React and Next
import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

// 2. Third-party packages
import { clsx } from 'clsx';
import { z } from 'zod';

// 3. Internal aliases — types
import type { MenuItem, MenuResponse } from '@/types/api';

// 4. Internal aliases — lib and actions
import { submitContact } from '@/actions/submit-contact';
import { fetchEndpoint } from '@/lib/api';
import { formatPrice } from '@/lib/format';

// 5. Internal aliases — components
import { Badge } from '@/components/primitives/badge';
import { Heading } from '@/components/primitives/heading';

// 6. Relative imports and styles
import { MenuCardImage } from './menu-card-image';
```

Enforced by `eslint-plugin-import` `import/order` with
`newlines-between: 'always'` and `alphabetize: { order: 'asc' }`.

Type-only imports always use `import type`. `verbatimModuleSyntax` in
`tsconfig.json` makes this mandatory rather than stylistic.

Relative imports may not traverse upward more than one level. `../../lib/api` is
an error; use `@/lib/api`.

---

## 4. TypeScript Rules

### 4.1 Strictness

The full compiler configuration is in `01-TECH-STACK.md` §9.1 and is not
repeated here. It is not to be relaxed. A flag may not be disabled to make code
compile; the code changes instead.

### 4.2 Banned patterns

| Banned | Reason | Use instead |
|---|---|---|
| `any` | Erases all checking | `unknown` plus a narrowing guard |
| `as` type assertion | Asserts a fact the compiler cannot verify | A type guard, or fix the source type |
| `as unknown as T` | A double assertion is an admission the types are wrong | Fix the type |
| `!` non-null assertion | The value can be null at runtime | Explicit check, early return |
| `@ts-ignore` | Suppresses without explanation | `@ts-expect-error` with a one-line reason, or fix |
| `enum` | Emits runtime code; not erasable | `as const` object plus a derived union type |
| `namespace` | Superseded by modules | ES modules |
| `Function` type | Accepts anything callable | An explicit signature |
| `object` type | Accepts arrays and functions | `Record<string, unknown>` or a named interface |
| Default exports | Breaks rename refactors and auto-import | Named exports. Exception: `app/**/page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`, which Next.js requires to default-export. |
| `React.FC` | Adds implicit children, worsens generics | A plain function with a typed props parameter |
| Optional props with a runtime default duplicated in two places | Drift | Destructure with a default in the signature only |

Two narrow exceptions to `as`:
1. `const exhaustive: never = block` in a discriminated-union switch default.
2. `as const` on literal objects and arrays.

### 4.3 Type sourcing

Types describing API data are **only** defined in `src/types/api.ts`, transcribed
from `04-API-CONTRACT.md`. A component may not declare its own shape for API
data. Deriving is permitted and preferred:

```ts
// Correct
import type { MenuItem } from '@/types/api';

export interface MenuCardProps {
  item: MenuItem;
  variant?: 'default' | 'featured';
}

// Also correct — deriving a subset
type MenuItemSummary = Pick<MenuItem, 'name' | 'price' | 'slug'>;
```

```ts
// Wrong — a second, drifting definition of the same data
interface MenuCardProps {
  name: string;
  price: number;
  description?: string;
}
```

---

## 5. Component Authoring

### 5.1 Server / Client boundary

| Rule | Detail |
|---|---|
| Server by default | A file gets `'use client'` only if it appears in the client-component register in `06-COMPONENT-SPEC.md` §0. |
| Push the boundary down | Mark the smallest interactive leaf, not its parent. `SiteHeader` is client only for a scroll class; its nav content is server-rendered and passed as children. |
| Serialisable props only | Client components receive plain data. Functions, class instances, and `Date` objects are not passed across the boundary. Dates cross as ISO strings. |
| No data fetching in client components | No `useEffect` fetch, no SWR, no TanStack Query, no Apollo. The single exception is `InstagramFeed`, which loads third-party content after hydration and is documented as such. |
| Server Actions for mutations | Form submission uses a Server Action in `src/actions/`. No `fetch` to a self-hosted API route. |

### 5.2 Data fetching location

| Rule | Detail |
|---|---|
| One fetch per route | Each `page.tsx` calls `fetchEndpoint` exactly once, through a named `getX()` helper so `generateMetadata` and the component share the deduplicated call. |
| No fetching in components | Only `page.tsx` files fetch. A component that needs data receives it as a prop. |
| No prop drilling past two levels | Page → block component → leaf is the maximum. Deeper needs restructuring, not a context. |
| Context is not used for data | React Context appears nowhere in this codebase in Phase 1. The data flow is shallow enough that context would only hide it. |
| `_global` passes to `PageShell` only | Components needing global data receive the specific slice they need (`location`, `hours`, `navigation`), not the whole object. Exception: `SiteHeader`, `SiteFooter`, `MobileNav`, and `MobileCtaBar` take the whole `GlobalData` because they consume most of it. |

### 5.3 Structure of a component file

Order within the file:

1. `'use client'` if applicable — first line, before imports.
2. Imports, per §3.
3. Module-level constants.
4. Exported props interface.
5. The exported component.
6. Non-exported helper components used only by this file.

Helpers used by more than one file move to `lib/`, not to a shared component
file.

---

## 6. `dangerouslySetInnerHTML`

Permitted in exactly two places:

| Location | Content | Safety |
|---|---|---|
| `components/blocks/rich-text.tsx` | `bodyHtml` / `descriptionHtml` from the API | Sanitised server-side by `wp_kses()` with the allow-list in `04-API-CONTRACT.md` §6.2 |
| JSON-LD `<script>` in page components | Output of `JSON.stringify` over an object built in `lib/json-ld.ts` | The object is constructed from typed data; no user-supplied string is interpolated into markup |

Any third use is rejected in review. The ESLint rule `react/no-danger` is set to
`error` with inline `eslint-disable-next-line` comments required at both
permitted sites, so each occurrence is visible in a grep.

---

## 7. Error Handling and Logging

### 7.1 Frontend

| Situation | Handling |
|---|---|
| Build-time fetch failure | Throw. The build fails. Never fall back to placeholder content. |
| Runtime route error | `app/error.tsx` boundary renders a recovery UI with `reset()` and the phone number. |
| Root layout error | `app/global-error.tsx`, which renders its own `<html>` and `<body>`. |
| Route not found | `notFound()` → `app/not-found.tsx`. |
| Third-party failure (Instagram, map) | Caught locally, degraded UI, never propagated to the boundary. |
| Form submission failure | Returned as a typed result from the Server Action, rendered as a form error. Never thrown. |

Rules:
- No empty `catch {}`. Every catch either handles or rethrows.
- No `console.log` in committed code. `console.warn` and `console.error` are
  permitted only inside `if (process.env.NODE_ENV !== 'production')`.
- Errors thrown deliberately include the failing endpoint or component name in
  the message. `throw new Error('Failed')` is rejected.
- Server Actions return `{ status: 'success' } | { status: 'error'; message: string; fieldErrors?: Record<string, string> }`.
  They do not throw for expected failures.

```ts
// Correct
export interface ContactFormResult {
  status: 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
}
```

Sentry captures unhandled exceptions and Server Action errors. PII is scrubbed:
`beforeSend` strips `request.data` for the contact form endpoint entirely,
because it contains a name, email, and free-text message.

### 7.2 Backend

| Rule | Detail |
|---|---|
| Every REST callback returns `WP_REST_Response` or `WP_Error` | Never a bare array, never `wp_send_json`. |
| Error codes are prefixed | `gotg_page_not_found`, not `not_found`. |
| Missing configuration is a 500, not an empty payload | A site with no primary location returns an error so the build fails visibly. See `04-API-CONTRACT.md` §7. |
| Missing content is an empty array | Zero events is `[]`, not an error. |
| Logging | `error_log()` only, guarded by `if ( defined( 'WP_DEBUG' ) && WP_DEBUG )`. Never `var_dump`, `print_r`, or `echo` in a REST path. |
| Escaping | All output through the REST layer is sanitised at shaping time — `esc_url_raw()` for URLs, `wp_kses()` for HTML, `sanitize_text_field()` for text. JSON encoding is not escaping. |
| Input | Every route argument declares `type`, `sanitize_callback`, and where applicable `validate_callback`. |

---

## 8. Linting and Formatting

### 8.1 ESLint

`frontend/eslint.config.mjs` — flat config. Rule set summary:

| Source | Rules |
|---|---|
| `next/core-web-vitals` | Next.js correctness and CWV rules |
| `@typescript-eslint` `strictTypeChecked` | Type-aware strictness |
| `eslint-plugin-jsx-a11y` `strict` | Accessibility |
| `eslint-plugin-import` | `import/order`, `import/no-default-export` (with `app/**` overridden) |
| `eslint-plugin-tailwindcss` | `no-arbitrary-value`, `no-custom-classname` (allow-list: `gotg-*`, `sr-only`) |

Project-specific rules set to `error`:

| Rule | Purpose |
|---|---|
| `no-restricted-syntax` on `TSAnyKeyword` | Bans `any` |
| `no-restricted-syntax` on `TSEnumDeclaration` | Bans `enum` |
| `@typescript-eslint/no-non-null-assertion` | Bans `!` |
| `@typescript-eslint/consistent-type-imports` | Forces `import type` |
| `react/no-danger` | Forces an explicit disable comment at the two permitted sites |
| `no-console` (allow `warn`, `error`) | Keeps logs out of production |
| `tailwindcss/no-arbitrary-value` | Forces token use over `text-[17px]` |
| `jsx-a11y/no-autofocus` | Autofocus disorients screen-reader and magnifier users |
| `jsx-a11y/control-has-associated-label` | No unlabelled controls |

### 8.2 Prettier

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

`endOfLine: "lf"` matches the `.gitattributes` enforcement in both repositories
(`AGENTS.md`). Do not override it, and do not let an editor rewrite it to
`crlf` on Windows.

### 8.3 PHP

`phpcs.xml` in the backend repository:

```xml
<?xml version="1.0"?>
<ruleset name="GOTG">
	<description>Coding standard for Grill on the Green mu-plugins.</description>

	<file>wp-content/mu-plugins</file>
	<file>wp-content/themes/gotg-headless</file>

	<exclude-pattern>*/node_modules/*</exclude-pattern>
	<exclude-pattern>*/vendor/*</exclude-pattern>

	<arg name="extensions" value="php"/>
	<arg name="colors"/>
	<arg value="ps"/>

	<rule ref="WordPress">
		<exclude name="WordPress.Files.FileName.InvalidClassFileName"/>
	</rule>

	<rule ref="WordPress.WP.I18n">
		<properties>
			<property name="text_domain" type="array" value="gotg"/>
		</properties>
	</rule>

	<rule ref="WordPress.NamingConventions.PrefixAllGlobals">
		<properties>
			<property name="prefixes" type="array" value="gotg"/>
		</properties>
	</rule>

	<config name="minimum_wp_version" value="6.7"/>
	<config name="testVersion" value="8.2-"/>
</ruleset>
```

### 8.4 Git hooks

`pre-commit` runs `lint-staged`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --max-warnings=0 --fix", "prettier --write"],
    "*.{css,json,md}": ["prettier --write"]
  }
}
```

Type checking is not in the pre-commit hook — it is too slow for every commit
and runs in CI on every push instead.

---

## 9. Commit Messages

Conventional Commits, with the task ID from `11-PROJECT-PLAN.md` in the scope.

```
<type>(<scope>): <subject>

<body>

<footer>
```

| Element | Rule |
|---|---|
| `type` | `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `build`, `ci` |
| `scope` | The task ID (`T-FE-12`) or an area (`menu`, `api`, `tokens`) |
| `subject` | Imperative, lowercase, no trailing period, ≤72 chars |
| `body` | Why, not what. Wrapped at 72 columns. Optional for trivial changes. |
| `footer` | `Refs: T-FE-12`, `Closes #14`, or `BREAKING CHANGE: …` |

```
feat(T-FE-12): render dietary badges on menu cards

Badges read their abbreviation and colour from the gotg_dietary term
fields rather than from a hardcoded map, so adding a term requires no
frontend change.

Refs: T-FE-12
```

Rejected: `update stuff`, `fix bug`, `WIP`, `asdf`, and any subject that
describes the diff rather than the change.

Schema changes touching `03-CONTENT-MODEL.md` must include the documentation
edit in the same commit — `AGENTS.md` requires the documentation and the schema
to ship together.

---

## 10. Pull Requests

### 10.1 Requirements

| Requirement | Detail |
|---|---|
| Size | Under 400 changed lines where possible. A larger PR needs a stated reason in the description. |
| Branch | `{type}/{ticket}-{slug}` off `main` |
| Title | Same format as a commit subject |
| Description | What changed, why, and how it was verified. Screenshots for any visual change, at 375px and 1280px. |
| Linked task | The `11-PROJECT-PLAN.md` task ID |
| CI | All checks green. A red check is never merged, and never re-run until green without investigation. |
| Cross-repo | A change to the API contract requires linked PRs in both repositories, merged in the order backend-then-frontend. |
| Merge | Squash merge. The squash subject becomes the commit message. |

### 10.2 Review checklist

The reviewer confirms each item explicitly.

**Contract**
- [ ] Field names match `03-CONTENT-MODEL.md` and `04-API-CONTRACT.md` exactly
- [ ] No new API shape exists in code without a matching documentation change
- [ ] `types/api.ts` and `types/api.schema.ts` were updated together

**TypeScript**
- [ ] No `any`, `as`, `!`, or `@ts-ignore` introduced
- [ ] Optional API fields are handled, not assumed present
- [ ] Array indexing accounts for `noUncheckedIndexedAccess`

**Components**
- [ ] `'use client'` only where the register in `06-COMPONENT-SPEC.md` §0 permits
- [ ] No data fetching outside `page.tsx`
- [ ] Empty and absent states handled per the component spec — nodes omitted, not rendered empty

**Accessibility**
- [ ] Heading levels are sequential; exactly one `<h1>`
- [ ] Interactive elements are `<button>` or `<a>`, never a clickable `<div>`
- [ ] Focus is visible and follows the global ring
- [ ] Colour is never the only carrier of meaning
- [ ] New form fields have persistent visible labels
- [ ] Keyboard interaction matches the component's documented map

**Performance**
- [ ] Images go through the `Image` primitive with correct `sizes`
- [ ] Exactly one `priority` image per route
- [ ] No new client-side dependency without a stated justification and a bundle-size figure

**Design**
- [ ] Every value is a token; no arbitrary Tailwind values
- [ ] Spacing comes from the scale
- [ ] One primary button per viewport band

**Meta boxes and fields** (backend PRs touching `admin/` or `meta.php`)
- [ ] Every new meta key is registered in `meta.php` with `type`, `single`, `show_in_rest: false`, `sanitize_callback`, and `auth_callback`
- [ ] The meta key is `_gotg_`-prefixed and appears in `03-CONTENT-MODEL.md` with identical spelling
- [ ] The save handler goes through the shared framework — no re-implemented nonce or capability check
- [ ] Capability check is `current_user_can( 'edit_post', $post_id )`, not the bare `edit_posts`
- [ ] Every boolean field is written explicitly on save; an unchecked box does not silently retain its previous value
- [ ] Invalid input is rejected with a named error, not silently coerced
- [ ] A rejected field leaves the previous value intact and does not block the other fields in its box
- [ ] Every attribute is `esc_attr()`, every text node `esc_html()`, every URL `esc_url()`
- [ ] Every input has a visible `<label for>`; no placeholder-as-label
- [ ] New admin JS is keyboard operable and announces changes in a live region
- [ ] No drag-and-drop reordering introduced

---

## 11. Anti-Patterns

Each shows the rejected form and its correction.

### 11.1 Fetching in a component

```tsx
// WRONG — a second network request, outside the one-request-per-page rule,
// and it makes MenuSection unusable anywhere the endpoint is not appropriate.
export async function MenuSection({ slug }: { slug: string }) {
  const data = await fetch(`${process.env.WP_API_BASE_URL}/wp-json/gotg/v1/menu`)
    .then((response) => response.json());
  const section = data.sections.find((s: MenuSectionType) => s.slug === slug);
  return <section>{/* … */}</section>;
}
```

```tsx
// CORRECT — the page fetches once; the component receives data.
import type { MenuSection as MenuSectionData } from '@/types/api';

interface MenuSectionProps {
  section: MenuSectionData;
  activeDaypart: Daypart | 'all';
}

export function MenuSection({ section, activeDaypart }: MenuSectionProps) {
  return <section id={section.slug}>{/* … */}</section>;
}
```

### 11.2 Asserting away an optional field

```tsx
// WRONG — `description` is optional in the contract. This renders "undefined"
// or crashes the moment an editor leaves it blank.
<p>{item.description!.slice(0, 100)}</p>
```

```tsx
// CORRECT — omit the node entirely when the field is absent.
{item.description ? (
  <Text size="body-sm" tone="muted">
    {item.description}
  </Text>
) : null}
```

### 11.3 Clickable non-interactive element

```tsx
// WRONG — not focusable, not keyboard-operable, no role, no accessible name.
<div onClick={() => router.push(`/events/${event.slug}`)}>
  <h3>{event.title}</h3>
</div>
```

```tsx
// CORRECT — a real link, wrapped by the heading so the accessible name is the
// event title.
<Heading level={3}>
  <Link href={`/events/${event.slug}`}>{event.title}</Link>
</Heading>
```

### 11.4 Arbitrary values instead of tokens

```tsx
// WRONG — four values that exist in no scale and drift from the design system.
<div className="mt-[18px] rounded-[10px] bg-[#b02a20] text-[15px]">
```

```tsx
// CORRECT — every value resolves to a token.
<div className="mt-5 rounded-lg bg-brand text-body-sm">
```

### 11.5 Raw z-index

```css
/* WRONG — an unmanaged stacking value that will collide. */
.mobile-nav-panel {
  z-index: 9999;
}
```

```css
/* CORRECT — a layer from the documented scale. */
.mobile-nav-panel {
  z-index: var(--z-modal);
}
```

### 11.6 Removing the focus outline

```css
/* WRONG — keyboard users lose all position feedback. */
button:focus {
  outline: none;
}
```

```css
/* CORRECT — the global rule already handles this. Component CSS adds nothing. */
/* See 05-DESIGN-SYSTEM.md section 9. If a component needs a different offset: */
.menu-chip:focus-visible {
  outline-offset: 4px;
}
```

### 11.7 Client component for static content

```tsx
// WRONG — 'use client' on a component with no interactivity ships React and the
// component's code to the browser for markup that never changes.
'use client';

export function LocationCard({ location }: { location: Location }) {
  return <address>{location.streetAddress}</address>;
}
```

```tsx
// CORRECT — no directive. Rendered on the server, zero client JavaScript.
export function LocationCard({ location }: { location: Location }) {
  return <address>{location.streetAddress}</address>;
}
```

### 11.8 Formatting a Pacific-time event in the visitor's timezone

```tsx
// WRONG — a visitor in New York sees the wrong hour, and the server and client
// render different strings, causing a hydration error.
<time dateTime={event.startDateTime}>
  {new Date(event.startDateTime).toLocaleString()}
</time>
```

```tsx
// CORRECT — the event happens in Pacific time regardless of who is reading.
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

<time dateTime={event.startDateTime}>
  {formatter.format(new Date(event.startDateTime))}
</time>;
```

### 11.9 Duplicating an API type locally

```tsx
// WRONG — a second definition that silently drifts when the contract changes.
interface Event {
  title: string;
  date: string;
  performer: string;
}
```

```tsx
// CORRECT — one definition, transcribed from 04-API-CONTRACT.md.
import type { EventItem } from '@/types/api';
```

### 11.10 Placeholder as label

```tsx
// WRONG — the label disappears the moment the user types, and screen readers
// treat placeholder support inconsistently.
<input type="email" placeholder="Email address" name="email" />
```

```tsx
// CORRECT — a persistent visible label, with the placeholder as an example.
<Field label="Email address" name="email" required>
  <TextInput
    name="email"
    type="email"
    autoComplete="email"
    placeholder="name@example.com"
  />
</Field>
```

### 11.11 Silent catch

```ts
// WRONG — the failure disappears and the caller sees an empty result it cannot
// distinguish from a genuinely empty response.
try {
  posts = await loadInstagramPosts(handle);
} catch {
  posts = [];
}
```

```ts
// CORRECT — the failure is a distinct state the UI can render.
type FeedState =
  | { status: 'loaded'; posts: InstagramPost[] }
  | { status: 'error' };

let state: FeedState;

try {
  state = { status: 'loaded', posts: await loadInstagramPosts(handle) };
} catch (error) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('Instagram feed failed to load', error);
  }
  state = { status: 'error' };
}
```

### 11.12 PHP: returning a raw WordPress object

```php
<?php
// WRONG — leaks internal structure, snake_case keys, rendered/raw wrappers,
// and every meta field including private ones.
function gotg_rest_menu( WP_REST_Request $request ) {
	return get_posts( array( 'post_type' => 'gotg_menu_item' ) );
}
```

```php
<?php
// CORRECT — shaped to the documented contract, camelCase, nothing extra.
/**
 * Returns the shaped menu payload.
 *
 * @param WP_REST_Request $request Incoming request.
 * @return WP_REST_Response
 */
function gotg_rest_menu( WP_REST_Request $request ) {
	$sections = gotg_get_menu_sections();
	$payload  = array(
		'_global'           => gotg_build_global(),
		'seo'               => gotg_shape_seo( gotg_get_page_by_slug( 'menu' ) ),
		'title'             => __( 'Menu', 'gotg' ),
		'blocks'            => gotg_shape_blocks( gotg_get_page_by_slug( 'menu' ) ),
		'dayparts'          => gotg_get_daypart_windows(),
		'defaultDaypart'    => gotg_get_option( 'default_daypart', 'auto' ),
		'sections'          => $sections,
		'dietaryTags'       => gotg_collect_dietary_tags( $sections ),
		'showDietaryLegend' => (bool) gotg_get_option( 'show_dietary_legend', true ),
		'disclaimer'        => (string) gotg_get_option( 'menu_disclaimer', '' ),
	);

	return new WP_REST_Response( $payload, 200 );
}
```

---

## 12. Documentation Maintenance

| Change | Documents that must change in the same PR |
|---|---|
| New or renamed CPT, taxonomy, or field | `03-CONTENT-MODEL.md`, then `04-API-CONTRACT.md` if it reaches the API |
| Any change to a response shape | `04-API-CONTRACT.md`, `types/api.ts`, `types/api.schema.ts` |
| New component | `05-DESIGN-SYSTEM.md` §10 inventory and `06-COMPONENT-SPEC.md` |
| New or changed design token | `05-DESIGN-SYSTEM.md`, `styles/tokens.css`, `styles/theme.css`, `styles/contrast-pairs.ts` |
| New route | `02-INFORMATION-ARCHITECTURE.md`, `04-API-CONTRACT.md`, and the redirect removal if one shadowed it |
| New environment variable | `10-ENVIRONMENTS-DEPLOYMENT.md` §3 and `.env.example` |
| Any architectural decision | A new ADR in `12-GLOSSARY-DECISIONS.md` |

A PR that changes behaviour without the corresponding documentation change is
rejected in review regardless of code quality.
