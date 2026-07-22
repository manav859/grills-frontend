# 06 — Component Specification

Status: **Living**
Last reviewed: 2026-07-22

Every component in `05-DESIGN-SYSTEM.md` §10 is specified here. Type names come
from `04-API-CONTRACT.md`; field names come from `03-CONTENT-MODEL.md`. Where a
component names a CMS field, that name must match those documents exactly.

Conventions used throughout:

| Term | Meaning |
|---|---|
| **Server** | React Server Component. No `'use client'`. Default for everything. |
| **Client** | Carries `'use client'`. Permitted only where the Justification column states a reason. |
| Breakpoints | `sm` 640, `md` 768, `lg` 1024, `xl` 1280 — see `05-DESIGN-SYSTEM.md` §7 |
| Keyboard map | Lists only keys the component handles. Unlisted keys fall through to the browser. |

Shared prop types (`ImageObject`, `LinkObject`, `MenuItem`, `EventItem`,
`GlobalData`, `PageBlock`, and the block interfaces) are imported from
`@/types/api` and are not redeclared here.

Client-component register — the complete list. Any component not on this list is
a Server Component, and adding to this list requires review.

| Component | Justification |
|---|---|
| `MobileNav` | Open/close state, focus trap, body scroll lock |
| `MobileCtaBar` | Hides on scroll-down; reads scroll position |
| `SiteHeader` | Scroll-position class toggle only; the header's content is passed in as server-rendered children |
| `NavDropdown` | Open state, roving focus |
| `DaypartFilter` | URL search-param state, current-time default |
| `HoursStatus` | Computes open/closed from the visitor's clock |
| `Gallery` (carousel variant only) | Slide index, keyboard navigation |
| `InstagramFeed` | Third-party fetch after hydration |
| `ContactForm` | Form state, validation, submission |
| `AnnouncementBar` | Dismissal persisted to `sessionStorage` |
| `AddToCalendar` | Generates an `.ics` blob in the browser |
| `SectionNav` | Scroll-spy active state |

---

## 1. Primitives

### `Button`

Purpose: Triggers an action in the same page. Never navigates — use
`LinkButton` for navigation.

Anatomy: `<button>` > [leading icon] > label > [trailing icon or spinner].

```ts
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
  iconStart?: IconName;
  iconEnd?: IconName;
  fullWidth?: boolean;
  children: ReactNode;
}
```

| Variant | Background | Text | Border |
|---|---|---|---|
| `primary` | `--color-brand-primary` | `--color-ink-inverse` | none |
| `secondary` | `--color-surface-raised` | `--color-ink` | 1px `--color-border-interactive` |
| `ghost` | transparent | `--color-ink` | none |
| `danger` | `--color-danger` | `--color-ink-inverse` | none |

| State | Treatment |
|---|---|
| default | As above |
| hover | `primary` → `--color-brand-primary-hover`; `secondary`/`ghost` → `--color-surface-sunken` |
| focus-visible | Global focus ring (`05-DESIGN-SYSTEM.md` §9). No other change. |
| active | `primary` → `--color-brand-primary-active`; all variants `transform: translateY(1px)` |
| disabled | `opacity: 0.5`, `cursor: not-allowed`, `aria-disabled="true"`, still focusable |
| loading | `Spinner` replaces `iconStart`; `aria-busy="true"`; `disabled` set; label text unchanged |

Sizes: `sm` 36px height / `--text-label`; `md` 44px / `--text-body`; `lg` 52px /
`--text-body-lg`. Minimum touch target is 44×44 at every size, achieved with
padding on `sm`.

Responsive: `fullWidth` is applied below `sm` for primary page actions; auto
width at `sm` and up.

Accessibility:
- Renders a real `<button>` with an explicit `type` (defaults to `"button"`).
- `disabled` uses `aria-disabled` plus a click guard rather than the `disabled`
  attribute, so the control stays focusable and discoverable.
- When `isLoading`, `loadingLabel` is announced via a `VisuallyHidden` element
  inside an `aria-live="polite"` region. Default `loadingLabel` is `"Loading"`.
- Icon-only usage is prohibited; use `IconButton`.

Keyboard: `Enter` and `Space` activate — native behaviour, not reimplemented.

Data source: none.

---

### `LinkButton`

Purpose: Navigation styled as a button.

```ts
export interface LinkButtonProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isExternal?: boolean;
  iconStart?: IconName;
  iconEnd?: IconName;
  fullWidth?: boolean;
  children: ReactNode;
}
```

Renders `next/link` for internal hrefs and `<a>` for `isExternal`, `tel:`, and
`mailto:`. External links receive `rel="noopener noreferrer"` and, when
`target="_blank"` is used, a `VisuallyHidden` "(opens in a new tab)" suffix.
`target="_blank"` is used only for ticketing, reservation, ordering, and social
links.

States and sizes match `Button`. There is no loading state — navigation is not
an in-page action.

Accessibility: the accessible name is the visible label. A link whose label is
"Learn more" without further context is prohibited; labels state the
destination.

Data source: `LinkObject` and `CtaLink` from `04-API-CONTRACT.md`.

---

### `IconButton`

```ts
export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  icon: IconName;
  label: string;
  variant?: 'solid' | 'ghost';
  size?: 'sm' | 'md';
}
```

`label` is required and becomes `aria-label`. The icon `<svg>` carries
`aria-hidden="true"` and `focusable="false"`.

Touch target is 44×44 minimum regardless of icon size, achieved with padding.

Used by: `MobileNav` trigger and close, `Gallery` carousel controls,
`AnnouncementBar` dismiss.

---

### `Heading`

```ts
export interface HeadingProps {
  level: 1 | 2 | 3 | 4;
  visualLevel?: 'display' | 'h1' | 'h2' | 'h3' | 'h4';
  id?: string;
  children: ReactNode;
}
```

`level` sets the semantic tag; `visualLevel` sets the type token. Decoupling
them lets a visually large section heading remain an `<h2>` in the outline.

Document rules, enforced by review and by the axe test suite:
- Exactly one `<h1>` per page.
- No heading level is skipped.
- `Hero.heading` is `level={1}` on `/` and `level={2}` everywhere else.

---

### `Text`

```ts
export interface TextProps {
  as?: 'p' | 'span' | 'div';
  size?: 'body-lg' | 'body' | 'body-sm' | 'caption' | 'overline';
  tone?: 'default' | 'muted' | 'inverse' | 'inverse-muted';
  weight?: 'regular' | 'medium' | 'semibold';
  children: ReactNode;
}
```

`tone="subtle"` is intentionally absent: `--color-ink-subtle` is reserved for
input placeholders and is not available through this component.

---

### `Badge`

```ts
export interface BadgeProps {
  tone?: 'neutral' | 'green' | 'amber' | 'red' | 'brand';
  title?: string;
  children: ReactNode;
}
```

Colour pairings per `05-DESIGN-SYSTEM.md` §1.5. Renders `<span>` with
`--radius-sm`, `--text-caption`, `--space-1`/`--space-2` padding.

Accessibility: the badge's text is its meaning. When the visible text is an
abbreviation, the component renders `<abbr title={title}>` so the expansion is
available. Colour is never the only signal.

Data source: `DietaryTag.abbreviation` (visible) and `DietaryTag.description`
(`title`).

---

### `Icon`

```ts
export type IconName =
  | 'arrow-right'
  | 'arrow-left'
  | 'calendar'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'clock'
  | 'close'
  | 'directions'
  | 'external'
  | 'facebook'
  | 'flame'
  | 'google'
  | 'instagram'
  | 'mail'
  | 'map-pin'
  | 'menu'
  | 'music'
  | 'phone'
  | 'ticket'
  | 'tripadvisor'
  | 'utensils'
  | 'yelp'
  | 'youtube';

export interface IconProps {
  name: IconName;
  size?: 16 | 20 | 24 | 32;
  title?: string;
}
```

Icons are inline SVG in `@/components/primitives/icons`, not an icon font and
not a runtime-fetched sprite. `currentColor` fill only.

Accessibility: without `title`, renders `aria-hidden="true"` and
`focusable="false"`. With `title`, renders `role="img"` and `<title>`.

---

### `Image`

Purpose: The single image entry point. Direct use of `next/image` outside this
component is prohibited.

```ts
export interface ImageProps {
  image: ImageObject;
  sizes: string;
  priority?: boolean;
  fill?: boolean;
  aspectRatio?: '1/1' | '4/3' | '3/2' | '16/9';
  decorative?: boolean;
}
```

| State | Behaviour |
|---|---|
| loading | `blurDataUrl` renders as `placeholder="blur"` when present; otherwise `--color-surface-sunken` fills the reserved box |
| loaded | Fades in over `--duration-fast` |
| error | Reserved box retains `--color-surface-sunken`; no broken-image icon; no error text |

Layout stability: `width` and `height` from `ImageObject` are always passed, or
`fill` is used inside a container with an explicit `aspectRatio`. An image
without reserved space is a CLS defect.

Accessibility: `alt` comes from `image.alt`. `decorative` forces `alt=""`. A
missing `image.alt` on a non-decorative image logs a development warning naming
the `src` — see `08-PERFORMANCE-SEO-A11Y.md`.

Data source: any `ImageObject` in `04-API-CONTRACT.md`.

---

### `Price`

Renders one money amount with an optional label. It does **not** know about
variants — `PriceList` composes it.

```ts
export interface PriceProps {
  amount: number;
  label?: string;
  size?: 'default' | 'large';
}
```

Formats with `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`.
Whole-dollar amounts render without cents (`$24`, not `$24.00`); fractional
amounts render with two decimals (`$13.50`). Implemented by setting
`minimumFractionDigits` to `0` when `Number.isInteger(amount)` and `2`
otherwise.

Renders `<span>` with `--font-weight-semibold` and
`font-variant-numeric: tabular-nums`. `label` renders before the amount in
`--text-caption` / `--color-ink-muted`.

Accessibility: never a heading.

Data source: `PriceVariant.amount`, `PriceVariant.label`,
`EventItem.coverCharge`.

---

### `PriceList`

Purpose: Renders a menu item's full price set. One variant or six, the component
is the same.

```ts
import type { PriceVariant } from '@/types/api';

export interface PriceListProps {
  variants: PriceVariant[];
  size?: 'default' | 'large';
}
```

| `variants` | Rendering |
|---|---|
| One, no `label` | A bare `Price`. Visually identical to a scalar price. No list markup. |
| One, with `label` | A single `Price` with its label. Still no list markup. |
| Two or more | A `<ul>` with `aria-label="Prices"`, one `<li>` per variant, each a `Price` with its label |

The single-variant case deliberately emits no list wrapper: a one-item list is
noise for a screen-reader user, and the overwhelming majority of items have one
price.

Responsive: at `md` and up, multiple variants render as a right-aligned stack.
Below `md` they render inline, comma-separated, wrapping as needed — a vertical
stack per item would make a long menu much taller on the device that matters
most.

Accessibility:
- A variant `label` is rendered as visible text, never as a `title` attribute.
- Order is the editor's order, preserved. Never sorted by amount.
- Screen-reader output for a multi-variant item reads "Prices: half rack, $29;
  full rack, $46".

Empty state: `variants` is guaranteed non-empty by the API
(`04-API-CONTRACT.md` §2.1). The component returns `null` on an empty array as a
defensive guard rather than rendering an empty list.

Data source: `MenuItem.priceVariants` ← `_gotg_price_variants`, see
`03-CONTENT-MODEL.md` §3.4.

---

### `Skeleton`, `Spinner`, `Divider`, `VisuallyHidden`

| Component | Props | Notes |
|---|---|---|
| `Skeleton` | `{ variant: 'text' \| 'rect' \| 'circle'; lines?: number; }` | `--color-surface-sunken` with a shimmer that is disabled under reduced motion. Container carries `aria-hidden="true"`; the live region announcing load state lives on the parent. |
| `Spinner` | `{ size?: 'sm' \| 'md'; label: string; }` | `role="status"`, `label` in a `VisuallyHidden`. Under reduced motion the rotation is replaced by an opacity pulse. |
| `Divider` | `{ variant?: 'solid' \| 'spacer'; }` | `solid` renders `<hr>` with `--color-border`; `spacer` renders a `<div aria-hidden="true">` with vertical space only. |
| `VisuallyHidden` | `{ as?: 'span' \| 'div'; children: ReactNode; }` | Clip-path technique; remains focusable so `SkipLink` can use it. |

---

## 2. Layout

### `Container`

```ts
export interface ContainerProps {
  width?: 'default' | 'narrow' | 'full';
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'nav' | 'main';
  children: ReactNode;
}
```

`default` → `--container-max` 1280px; `narrow` → `--container-narrow` 768px;
`full` → 100% with gutters only. Horizontal padding is `--gutter`, which steps
from 24px to 40px at `md`.

---

### `Section`

```ts
export interface SectionProps {
  tone?: 'surface' | 'sunken' | 'inverse';
  spacing?: 'default' | 'tight' | 'none';
  id?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
}
```

Renders `<section>`. Vertical padding is `--section-y` (48px mobile, 96px
desktop); `tight` halves it. When `ariaLabelledBy` is absent and the section
contains a heading, the heading's `id` must be supplied — an unlabelled
`<section>` adds a landmark with no name and is prohibited.

`tone="inverse"` sets `--color-surface-inverse` background and switches
descendant text tokens to their inverse variants.

---

### `Stack`, `Grid`, `SplitLayout`

| Component | Props | Responsive |
|---|---|---|
| `Stack` | `{ direction?: 'column' \| 'row'; gap?: SpaceToken; align?: 'start' \| 'center' \| 'end' \| 'stretch'; wrap?: boolean; children: ReactNode }` | `direction="row"` collapses to column below `sm` unless `wrap` is set |
| `Grid` | `{ columns: 2 \| 3 \| 4; gap?: SpaceToken; children: ReactNode }` | 1 column below `sm`; 2 at `sm`; requested count at `lg` |
| `SplitLayout` | `{ imageSide: 'left' \| 'right'; media: ReactNode; content: ReactNode }` | Stacked below `lg` with media **always first** regardless of `imageSide`; side-by-side 50/50 at `lg` |

`SplitLayout` uses CSS `order` for the side swap, never DOM reordering — DOM
order stays media-then-content so the reading order matches the mobile visual
order.

---

### `PageShell`

Purpose: The frame every route renders inside. Owns the landmark structure.

```ts
export interface PageShellProps {
  global: GlobalData;
  children: ReactNode;
}
```

Anatomy, in DOM order:

```
SkipLink (targets #main-content)
AnnouncementBar   — rendered only when global.announcement !== null
SiteHeader
main#main-content tabIndex={-1}
  {children}
SiteFooter
MobileCtaBar      — below md only
```

`main` receives `tabIndex={-1}` so `SkipLink` can move focus to it. Below `md`,
`main` carries `padding-bottom: var(--mobile-cta-bar-height)` so the fixed bar
never covers content.

Data source: `GlobalData` from every endpoint.

---

## 3. Content Blocks

### `PageBlockRenderer`

Purpose: Maps a `PageBlock[]` to components. The only place block `type` is
switched on.

```ts
export interface PageBlockRendererProps {
  blocks: PageBlock[];
  headingLevelOffset?: 0 | 1;
}
```

```tsx
// frontend/src/components/blocks/page-block-renderer.tsx
import type { PageBlock } from '@/types/api';
import { CtaBand } from './cta-band';
import { EventsPreview } from './events-preview';
import { FeaturedMenuRow } from './featured-menu-row';
import { Gallery } from './gallery';
import { Hero } from './hero';
import { InstagramFeed } from './instagram-feed';
import { People } from './people';
import { SplitFeature } from './split-feature';
import { TextSection } from './text-section';

interface PageBlockRendererProps {
  blocks: PageBlock[];
  headingLevelOffset?: 0 | 1;
}

export function PageBlockRenderer({
  blocks,
  headingLevelOffset = 0,
}: PageBlockRendererProps) {
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${String(index)}`;

        switch (block.type) {
          case 'hero':
            return (
              <Hero key={key} block={block} isPrimary={index === 0} />
            );
          case 'text':
            return (
              <TextSection
                key={key}
                block={block}
                headingLevelOffset={headingLevelOffset}
              />
            );
          case 'split_feature':
            return <SplitFeature key={key} block={block} />;
          case 'gallery':
            return <Gallery key={key} block={block} />;
          case 'cta_band':
            return <CtaBand key={key} block={block} />;
          case 'featured_items':
            return <FeaturedMenuRow key={key} block={block} />;
          case 'events_preview':
            return <EventsPreview key={key} block={block} />;
          case 'people':
            return <People key={key} block={block} />;
          case 'instagram_feed':
            return <InstagramFeed key={key} block={block} />;
          default: {
            const exhaustive: never = block;
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.warn('Unhandled page block', exhaustive);
            }
            return null;
          }
        }
      })}
    </>
  );
}
```

The `never` assignment is the exhaustiveness guard: adding a block type to
`PageBlock` without handling it here fails the type check. In production an
unknown type renders nothing rather than throwing.

---

### `Hero`

Purpose: The opening band of a page — image, headline, and the page's primary
action.

Anatomy: `<section>` > background `Image` > overlay > `Container` > [eyebrow] >
heading > [subheading] > button row.

```ts
export interface HeroProps {
  block: HeroBlock;
  isPrimary?: boolean;
}
```

Responsive:

| Breakpoint | Height | Type | Buttons |
|---|---|---|---|
| base | `min(72svh, 560px)` | `--text-display` 40px | Stacked, full width |
| `md` | `min(80svh, 680px)` | `--text-display` 64px | Row, auto width |
| `lg` | `min(84svh, 760px)` | unchanged | unchanged |

`svh` is used rather than `vh` so mobile browser chrome does not cause a jump.

Accessibility:
- Heading renders at `level={1}` when `isPrimary`, otherwise `level={2}`.
- Overlay opacity comes from `block.overlay / 100`. The build asserts the
  resulting text contrast is ≥4.5:1 — see `05-DESIGN-SYSTEM.md` §11.
- The background image is content, not decoration: `block.image.alt` is used and
  is required by the CMS.
- Exactly one `variant="primary"` button.

Loading: `priority` is set on the image. This is the LCP element on `/` and is
the only image on the page loaded eagerly.

Empty states: `eyebrow`, `subheading`, and `secondaryCta` are each omitted from
the DOM when absent — no empty nodes, no reserved space.

Data source: `HeroBlock` ← the `hero` page block (`03-CONTENT-MODEL.md` §9.3).

---

### `TextSection` and `RichText`

```ts
export interface TextSectionProps {
  block: TextBlock;
  headingLevelOffset?: 0 | 1;
}

export interface RichTextProps {
  html: string;
}
```

`TextSection` renders `Section` > `Container` (`narrow` when
`block.width === 'narrow'`) > optional `Heading` (`level={2 + offset}`) >
`RichText`.

`RichText` is the **only** component in the codebase permitted to use
`dangerouslySetInnerHTML`. Its input is already sanitised server-side by
`wp_kses()` with the allow-list in `04-API-CONTRACT.md` §6.2. It applies typographic
styles to descendant `p`, `ul`, `ol`, `li`, `a`, `strong`, `em`, and `h3` via a
scoped class, so the CMS never emits inline styles or classes.

Links inside `RichText` receive `rel="noopener noreferrer"` on external hosts,
applied by a server-side rewrite in the PHP shaper rather than by client-side
DOM manipulation.

Data source: `TextBlock.bodyHtml`, `EventItem.descriptionHtml`.

---

### `SplitFeature`

```ts
export interface SplitFeatureProps {
  block: SplitFeatureBlock;
}
```

Anatomy: `Section` > `Container` > `SplitLayout` > [`Image`, content column
(heading, body, optional `LinkButton`)].

Responsive: image full-width above text below `lg`; 50/50 at `lg` with side per
`block.imageSide`. Image aspect ratio `4/3`, `sizes="(min-width: 1024px) 50vw, 100vw"`.

Accessibility: heading is `level={2}`. `body` is plain text (not HTML) and
renders through `Text`, with `\n` converted to `<br />` at render time — the
field's `new_lines: br` setting means the API delivers literal newlines, not
markup.

Data source: `SplitFeatureBlock` ← the `split_feature` page block (`03-CONTENT-MODEL.md` §9.3).

---

### `Gallery`

```ts
export interface GalleryProps {
  block: GalleryBlock;
}
```

`layout: 'grid'` — Server Component. `Grid` with 2 columns at `sm`, 3 at `lg`.
No lightbox in Phase 1.

`layout: 'carousel'` — **Client Component**. Contract:

| Requirement | Implementation |
|---|---|
| Role | `<div role="region" aria-roledescription="carousel" aria-label={heading ?? 'Photo gallery'}>` |
| Slides | `<ul>` with `<li role="group" aria-roledescription="slide" aria-label="3 of 8">` |
| Controls | Two `IconButton`s labelled "Previous photo" / "Next photo", disabled at the ends (no wrapping) |
| Keyboard | `ArrowLeft` previous, `ArrowRight` next, `Home` first, `End` last — active only when focus is inside the region |
| Live region | `aria-live="polite"` announcing "Photo 3 of 8" on change |
| Auto-advance | None. Ever. |
| Reduced motion | Slide transition becomes an instant swap |
| Touch | Native scroll-snap; the buttons scroll the container rather than transforming it |

Empty state: `images` is guaranteed non-empty by the API (§4 of
`04-API-CONTRACT.md` omits empty gallery blocks), but the component still returns
`null` on an empty array rather than rendering an empty region.

Data source: `GalleryBlock.images`.

---

### `CtaBand`

```ts
export interface CtaBandProps {
  block: CtaBandBlock;
}
```

Full-width band, centred content, max width `--measure-narrow`.

| `style` | Section tone | Button variant |
|---|---|---|
| `brand` | `--color-brand-primary` background, inverse text | `secondary` (white on red) |
| `ink` | `inverse` | `primary` |
| `surface` | `sunken` | `primary` |

`brand` deliberately uses a `secondary` button: a red button on a red band would
have no boundary. Contrast of white-on-`--color-brand-primary` is 6.42:1.

Accessibility: heading `level={2}`; band is a `Section` with `ariaLabelledBy`
pointing at that heading.

---

### `FeaturedMenuRow`

```ts
export interface FeaturedMenuRowProps {
  block: FeaturedItemsBlock;
}
```

Anatomy: `Section` > `Container` > heading > horizontal item row > optional
`LinkButton` to `/menu`.

Responsive: horizontal scroll-snap row below `md` showing ~1.2 cards to signal
overflow; `Grid` of 3 at `md`; `Grid` of 3 with larger cards at `lg`. Maximum 6
items enforced server-side.

Accessibility: the scroll container is `tabindex="0"` with
`role="group"` and `aria-label="Featured menu items"` so keyboard users can
scroll it. Cards themselves are not focusable — `MenuCard` is not interactive.

Empty state: the block is absent from the payload when there are no featured
items, so the component never renders an empty row. It returns `null` if
`items.length === 0` as a defensive guard.

Data source: `FeaturedItemsBlock.items` ← `gotg_menu_item` where `is_featured`.

---

### `MenuCard`

Purpose: Renders a single menu item within a menu section list.

Anatomy: container > [optional image] > header row (name, price) > description >
dietary tag row.

```ts
export interface MenuCardProps {
  item: MenuItem;
  variant?: 'default' | 'featured';
  headingLevel?: 3 | 4;
}
```

Responsive: below `md`, the image stacks above the text at full width with a
`3/2` aspect ratio. At `md` and up, the image is a 96px fixed-width leading
thumbnail with a `1/1` ratio and the text column flexes.
`sizes="(min-width: 768px) 96px, 100vw"`.

Accessibility:
- Renders as `<article>`.
- The item name is a `Heading` at `headingLevel` (default `4`, since sections
  own the `<h3>`). Prices are **not** headings.
- Prices render through `PriceList`, which handles one or many variants.
- Dietary tags render as a `<ul>` with `aria-label="Dietary information"`, one
  `Badge` per `<li>`.
- `spiceLevel` other than `none` renders a flame `Icon` with a `title` of
  "Mild", "Medium", or "Hot" — never colour alone.
- No interactive elements. The card is not clickable and must not receive focus.

Empty states:
- `description` absent → the description node is omitted entirely rather than
  rendering an empty element.
- `image` absent → the layout collapses to text-only with no reserved space.
- `dietaryTags` empty → the `<ul>` is omitted, not rendered empty.
- `priceVariants` with one unlabelled entry → renders as a plain price with no
  list markup and no label node.

`variant="featured"` adds a 1px `--color-brand-oak` border and
`--shadow-sm`; it does not change the semantics.

Data source: `gotg_menu_item` — see `03-CONTENT-MODEL.md` §3.

---

### `MenuSection`

```ts
export interface MenuSectionProps {
  section: MenuSectionType;
  activeDaypart: Daypart | 'all';
  depth?: 0 | 1;
}
```

(`MenuSectionType` is the `MenuSection` interface from `@/types/api`, aliased at
import to avoid a name collision with this component.)

Anatomy: `<section id={section.slug}>` > `Heading` (`level={2}` at depth 0,
`level={3}` at depth 1) > [`intro`] > [`image`] > `MenuCard` list > child
sections.

Filtering: an item renders when `activeDaypart === 'all'` or
`item.availability.includes(activeDaypart)`. Filtering happens on the client
because `DaypartFilter` is client-side; the full item set is present in the
initial HTML so the unfiltered menu is indexable and works without JavaScript.

Responsive: single column below `sm`; two columns at `lg` using CSS columns with
`break-inside: avoid` on cards.

Accessibility:
- `id={section.slug}` is the anchor target for `SectionNav`.
- `scroll-margin-top: calc(var(--header-height) + var(--space-4))` so anchored
  headings are not hidden under the sticky header.
- Items are a `<ul>`; each `MenuCard` is wrapped in an `<li>`.
- When every item is filtered out, the section renders its heading plus
  "Not served at {daypart}." rather than disappearing — a section vanishing on
  filter change is disorienting.

Data source: `MenuResponse.sections`.

---

### `DietaryLegend`

```ts
export interface DietaryLegendProps {
  tags: DietaryTag[];
}
```

Renders a `<dl>`: `<dt>` holds the `Badge` with `abbreviation`, `<dd>` holds
`description`. Returns `null` when `tags` is empty.

Data source: `MenuResponse.dietaryTags` ← `gotg_dietary`.

---

### `EventCard`

```ts
export interface EventCardProps {
  event: EventItem;
  variant?: 'list' | 'preview';
  headingLevel?: 2 | 3;
}
```

Anatomy: `<article>` > date block > [image] > heading (linked) > summary >
metadata row (time, performer, ticket badge) > `LinkButton` to detail.

Responsive: `list` — image left at `md`+ (33% width), stacked below. `preview` —
always stacked, used in three-across grids.

Accessibility:
- `<article>` wrapper.
- The title is the only link, wrapped in the heading. A card-wide click target
  is not used, because it forces either a duplicate link or a non-semantic
  clickable div.
- Dates render inside `<time dateTime={event.startDateTime}>`.
- The visible date string is formatted with
  `Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', … })` so the
  server and the client agree regardless of the visitor's timezone. Formatting
  the date in the visitor's local zone would produce a hydration mismatch and
  would be factually wrong — the event happens on Pacific time.
- `isTicketed` renders a `Badge tone="brand"` reading "Ticketed"; when
  `coverCharge` is present the badge reads "Ticketed · $45".

Empty states: `image` absent → no reserved space; `performerName` absent → the
metadata row omits that item and its separator.

Data source: `EventItem` ← `gotg_event`.

---

### `EventHero`, `RecurringProgrammeCard`, `AddToCalendar`

| Component | Props | Notes |
|---|---|---|
| `EventHero` | `{ event: EventItem }` | `Heading level={1}`, `<time>` pair for start and end, `image` at `16/9` with `priority`, performer link with `rel="noopener noreferrer"`. |
| `RecurringProgrammeCard` | `{ recurring: RecurringProgramme }` | Heading `level={2}`; days rendered as a readable list ("Fridays and Saturdays") built from `recurring.days` with `Intl.ListFormat`; times formatted in Pacific. |
| `AddToCalendar` | `{ event: EventItem; location: Location }` | **Client.** Builds an RFC 5545 `.ics` blob and triggers a download. `Button variant="secondary"` labelled "Add to calendar". Falls back to a Google Calendar template URL if `Blob`/`URL.createObjectURL` is unavailable. `DTSTART`/`DTEND` are emitted in UTC with a `VTIMEZONE`-free `Z` suffix, converted from the Pacific values. |

---

### `PersonCard` / `People`

```ts
export interface PersonCardProps {
  person: Person;
  headingLevel?: 3;
}

export interface PeopleProps {
  block: PeopleBlock;
}
```

`People` renders `Section` > optional heading (`level={2}`) > `Grid columns={2}`
of `PersonCard`. `PersonCard` renders `<article>` with a square photo
(`aspectRatio="1/1"`, `--radius-full`), name as `Heading level={3}`, role as
`Text size="overline" tone="muted"`, bio as `Text`.

Empty states: `photo` absent → no placeholder avatar and no reserved space; the
text column occupies full width. `bio` absent → node omitted.

Data source: `PeopleBlock.people` ← the `people` page block repeater (`03-CONTENT-MODEL.md` §9.3).

---

### `LocationCard`, `HoursTable`, `MapEmbed`

#### `LocationCard`

```ts
export interface LocationCardProps {
  location: Location;
  hours?: Hours;
  variant?: 'full' | 'compact';
}
```

Anatomy: `<address>` containing name, formatted postal address, phone link,
optional email link, parking note, and a `LinkButton` to `directionsUrl`.

Accessibility: `<address>` is used only for contact details of the page owner,
which is correct here. The address is not italicised (browser default is
overridden). The phone renders as `<a href={location.phoneHref}>` displaying
`location.phone`, and is a link at every breakpoint — on desktop it opens the
OS handler, which is acceptable and preferable to making the number
unselectable.

#### `HoursTable`

```ts
export interface HoursTableProps {
  hours: Hours;
  highlightToday?: boolean;
}
```

Renders a `<table>` with `<caption class="sr-only">Opening hours</caption>`,
`<th scope="row">` for each weekday, and a cell reading either
"6:00 AM – 9:00 PM" or "Closed".

`highlightToday` marks the current Pacific day with `--color-surface-sunken`
background and a `VisuallyHidden` "(today)" appended to the row header. Because
"today" depends on the visitor's clock, the highlight is applied by
`HoursStatus`'s client logic passing a `todayIndex` prop; the server renders the
table with no highlight, and no hydration mismatch occurs because the server
output contains no day-dependent markup.

Exceptions from `hours.exceptions` falling within the next 14 days render below
the table as a short list ("Thanksgiving, Nov 26 — Closed").

#### `MapEmbed`

```ts
export interface MapEmbedProps {
  location: Location;
  variant?: 'static' | 'interactive';
}
```

Default `static`: a static map image built from `location.latitude` and
`location.longitude`, wrapped in a link to `location.directionsUrl` with an
accessible name of "Open directions to Grill on the Green in Google Maps". Alt
text describes the map, not the image file.

`interactive` renders an `<iframe title="Map showing Grill on the Green">` and
is used only if the client accepts the third-party cookie and performance cost
— see `09-INTEGRATIONS.md`. Error state: if the static image fails, the link and
address render alone with no broken image.

---

### `PageHeader`

```ts
export interface PageHeaderProps {
  title: string;
  intro?: string;
  eyebrow?: string;
}
```

`Section spacing="tight"` > `Container width="narrow"` > optional eyebrow >
`Heading level={1}` > optional `Text size="body-lg"`. Used on `/menu`,
`/events`, `/about`, `/contact` — every page except `/`, where `Hero` owns the
`<h1>`.

---

### `InstagramFeed`

**Client Component.**

```ts
export interface InstagramFeedProps {
  block: InstagramFeedBlock;
}
```

| State | Rendering |
|---|---|
| loading | `Grid` of `Skeleton variant="rect"` at `1/1`, count = `block.count`; container `aria-busy="true"` |
| loaded | `Grid` of linked square images, each link labelled "View post on Instagram" |
| error | Heading plus a `LinkButton variant="secondary"` to `https://www.instagram.com/{handle}/` reading "See our Instagram". The grid is not rendered. |
| empty | Same as error. Zero posts is indistinguishable from a failure from the user's perspective. |

Loading is deferred until the section enters the viewport, via
`IntersectionObserver`. The feed is never part of the initial JavaScript payload
for above-the-fold content and never contributes to LCP.

Failure mode: the component must not throw. A rejected fetch, a timeout of 5
seconds, or a malformed response all resolve to the error state.

Data source: `InstagramFeedBlock` for configuration; posts from the vendor in
`09-INTEGRATIONS.md`.

---

## 4. Navigation

### `SiteHeader`

**Client Component** — for the scroll-position class only. All content is passed
in as server-rendered children.

```ts
export interface SiteHeaderProps {
  global: GlobalData;
  variant?: 'transparent' | 'solid';
}
```

Anatomy: `<header>` > `Container width="full"` > logo link > `PrimaryNav`
(`md`+) > `HoursStatus variant="header"` (`md`+) > header CTA `LinkButton`
(`md`+) > `MobileNav` trigger (below `md`).

| State | Treatment |
|---|---|
| at-top, `variant="transparent"` | Transparent background, `logoInverse`, inverse text. Used on `/` over the hero. |
| at-top, `variant="solid"` | `--color-surface-raised`, `logo`, bottom border. Used on all other routes. |
| scrolled (>16px) | Always solid, `--shadow-md`, `logo` |

Position: `sticky`, `top: 0`, `z-index: var(--z-sticky)`. Height 64px mobile,
80px at `md`.

Accessibility:
- `<header>` is the banner landmark; there is exactly one per page.
- The logo link's accessible name is `global.site.name`, supplied via the SVG's
  `alt`. It is not named "Home" — the name is the brand, and screen-reader users
  understand a logo link.
- `PrimaryNav` sits in a `<nav aria-label="Primary">`.
- The transparent variant's text-over-image contrast is guaranteed by the hero
  overlay assertion in `05-DESIGN-SYSTEM.md` §11.

---

### `PrimaryNav`

```ts
export interface PrimaryNavProps {
  items: LinkObject[];
  currentPath: string;
}
```

Horizontal list, `md` and up only. The active item carries
`aria-current="page"` and a 2px `--color-brand-primary` underline. Active state
is determined by exact match, or by prefix match for `/events` so
`/events/[slug]` marks Events as current.

Hover shows the underline at 40% opacity. Underline is not the sole active
indicator for colour-blind users: the active item is also `--font-weight-semibold`.

---

### `MobileNav`

**Client Component.**

```ts
export interface MobileNavProps {
  global: GlobalData;
}
```

Anatomy: `IconButton` trigger > portal-rendered backdrop > panel > close button,
nav list, phone CTA, `HoursStatus variant="inline"`, `SocialLinks`.

| State | Behaviour |
|---|---|
| closed | Panel unmounted. Trigger `aria-expanded="false"`. |
| opening | Panel mounts, slides from the right over `--duration-slow` with `--ease-spring`; backdrop fades. |
| open | Focus trapped. `document.body` receives `overflow: hidden` and the scrollbar-width compensation padding. |
| closing | Reverse transition; panel unmounts on completion. |

Accessibility contract:

| Requirement | Implementation |
|---|---|
| Trigger | `<button aria-expanded aria-controls="mobile-nav-panel" aria-label="Open menu">`; label becomes "Close menu" when open |
| Panel | `role="dialog"`, `aria-modal="true"`, `aria-label="Site menu"` |
| Focus on open | Moves to the close button |
| Focus on close | Returns to the trigger, always, including close-by-Escape and close-by-route-change |
| Focus trap | Tab and Shift+Tab cycle within the panel |
| Escape | Closes |
| Backdrop click | Closes |
| Route change | Closes |
| Inert background | `aria-hidden="true"` on the sibling `main` and `footer` while open |
| Reduced motion | Panel appears and disappears with no transition |

Keyboard map:

| Key | Action |
|---|---|
| `Enter` / `Space` on trigger | Open |
| `Escape` | Close and restore focus |
| `Tab` | Next focusable within panel, wrapping |
| `Shift+Tab` | Previous focusable within panel, wrapping |

---

### `MobileCtaBar`

**Client Component.**

```ts
export interface MobileCtaBarProps {
  global: GlobalData;
}
```

Fixed bottom bar, below `md` only. Two equal targets: **Call** (`phoneHref`) and
**Menu** (`/menu`). Height 64px, `z-index: var(--z-mobile-bar)`, respects
`env(safe-area-inset-bottom)`.

Behaviour: hides on scroll down past 200px, reappears on scroll up. Always
visible when the page is at the top or bottom. Hidden entirely while `MobileNav`
is open.

Accessibility: `<nav aria-label="Quick actions">`. Both targets are ≥48px tall.
It is not `aria-hidden` when scrolled out of view — it is removed from the
layout with `transform`, so it stays reachable by keyboard and the transform is
reversed on focus.

---

### `NavDropdown`

Specified for Phase 2, when catering, private events, and gift cards need
grouping under a parent item.

```ts
export interface NavDropdownProps {
  label: string;
  items: LinkObject[];
}
```

| Requirement | Implementation |
|---|---|
| Trigger | `<button aria-expanded aria-haspopup="true" aria-controls>` — a `<button>`, never a link, because it opens a menu rather than navigating |
| Panel | `<ul>` of links; not `role="menu"` (these are navigation links, not application menu commands) |
| Open on | Click, `Enter`, `Space`, `ArrowDown` |
| Close on | `Escape` (focus returns to trigger), click outside, blur out of the group, route change |
| Hover | Opens after a 100ms delay, closes after a 300ms delay. Hover is never the only way to open. |
| Keyboard | `ArrowDown` / `ArrowUp` move between items; `Home` / `End` jump to ends; `Tab` closes and moves on |

---

### `SkipLink`

```ts
export interface SkipLinkProps {
  targetId: string;
}
```

First focusable element in the DOM. Visually hidden until focused, then pinned
top-left at `z-index: var(--z-skip-link)` with a solid background and the
standard focus ring. Activating it moves focus to `#main-content`
(`tabIndex={-1}`) — it does not merely scroll.

---

### `SectionNav`

**Client Component** — scroll-spy only.

```ts
export interface SectionNavProps {
  sections: Array<{ slug: string; title: string }>;
}
```

Sticky below the header at `md`+; a horizontally scrolling chip row below `md`.
`<nav aria-label="Menu sections">` containing anchor links to `#{slug}`.

Active detection uses `IntersectionObserver` with
`rootMargin: '-{headerHeight}px 0px -70% 0px'`. The active item carries
`aria-current="location"`, not `aria-current="page"` — it is a position within
the page, not a different page.

Without JavaScript the anchors still work; only the active highlight is lost.

---

### `DaypartFilter`

**Client Component.**

```ts
export interface DaypartFilterProps {
  dayparts: DaypartWindow[];
  defaultDaypart: Daypart | 'auto' | 'all';
}
```

Renders a "All day" option plus one option per `DaypartWindow`.

Behaviour:
- State lives in the `?daypart=` search parameter, written with
  `router.replace(..., { scroll: false })` so filtering does not push history
  entries or jump the scroll position.
- On first render with `defaultDaypart === 'auto'` and no parameter present, the
  component resolves the current Pacific time against `dayparts[].starts/ends`
  and applies the match. This runs in an effect after hydration, so the server
  HTML always contains the unfiltered menu — critical for indexability and for
  no-JavaScript users.
- Outside all windows (before 6am), falls back to "All day".

Accessibility:

| Requirement | Implementation |
|---|---|
| Pattern | Tabs are not used — this filters content in place rather than switching panels. Implemented as a `<fieldset>` of radio inputs styled as pills, with a `<legend class="sr-only">Filter menu by daypart</legend>`. |
| Keyboard | Native radio-group behaviour: arrow keys move and select, `Tab` enters and leaves the group |
| Announcement | An `aria-live="polite"` region announces "Showing lunch items. 24 items." after each change |
| No-JS | Renders as a real form with a submit button that is hidden when JavaScript is available |

---

### `HoursStatus`

**Client Component.**

```ts
export interface HoursStatusProps {
  hours: Hours;
  variant?: 'header' | 'inline';
}
```

| State | Text | Dot colour |
|---|---|---|
| open | "Open until 9pm" | `--color-success` |
| closing-soon (<60 min) | "Closing at 9pm" | `--color-warning` |
| closed | "Closed · Opens 6am" | `--color-danger` |
| unknown | Renders nothing | — |

Computation: current time in `America/Los_Angeles` via
`Intl.DateTimeFormat(..., { timeZone: hours.timezone })`, checked against
`hours.exceptions` for today's date first, then `hours.regular`.

Hydration: the server renders the `unknown` state (nothing). The status appears
after hydration. This is deliberate — rendering a time-dependent string on the
server produces a mismatch and can display a stale status from a cached page.
The status is supplementary; `HoursTable` on `/contact` carries the full
authoritative hours in server-rendered HTML.

Accessibility: the coloured dot is `aria-hidden`; the text carries the meaning.
Wrapped in `<p role="status">` so a change is announced without stealing focus.

---

### `SiteFooter`, `SocialLinks`, `AnnouncementBar`, `Breadcrumbs`

| Component | Props | Notes |
|---|---|---|
| `SiteFooter` | `{ global: GlobalData }` | `<footer>` contentinfo landmark, one per page. Four columns per `02-INFORMATION-ARCHITECTURE.md` §3.3; stacked below `lg`. Nav wrapped in `<nav aria-label="Footer">`. Copyright uses `global.site.legalName` and the current year computed at build time. |
| `SocialLinks` | `{ links: SocialLink[]; variant?: 'row' \| 'stack' }` | `<ul>` of `IconButton`-styled links. Accessible name is `"Grill on the Green on Instagram"`, built from platform plus site name — never the bare handle. Returns `null` on an empty array. |
| `AnnouncementBar` | `{ announcement: Announcement }` | Above the header. `role="region" aria-label="Announcement"`. Dismissible via `IconButton`; dismissal keyed to a hash of the text in `sessionStorage`, so changed copy reappears. **Client.** |
| `Breadcrumbs` | `{ trail: Array<{ label: string; href?: string }> }` | `<nav aria-label="Breadcrumb">` > `<ol>`. The final item has no `href` and carries `aria-current="page"`. Separators are CSS `::before` content with `aria-hidden`. Emits `BreadcrumbList` JSON-LD — see `08-PERFORMANCE-SEO-A11Y.md`. Used only on `/events/[slug]`. |

---

## 5. Forms

All form components are used by `ContactForm` and nothing else in Phase 1.

### `Field`

```ts
export interface FieldProps {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}
```

Anatomy: `<div>` > `<label htmlFor={name}>` > [hint `<p id={name}-hint>`] >
control (cloned with `id`, `aria-describedby`, `aria-invalid`) > [`FormError`
`<p id={name}-error role="alert">`].

Rules, applied to every field in the codebase:
- The label is always visible. Placeholder-as-label is prohibited.
- Required fields append a visible "(required)" in `--text-caption`, not an
  asterisk. Optional-marking is not used.
- `aria-describedby` chains hint then error, in that order.
- `aria-invalid="true"` is set only when `error` is present.
- The error message names the fix ("Enter an email address like name@example.com"),
  not the failure ("Invalid").

---

### `TextInput`, `TextArea`, `Select`, `Checkbox`

```ts
export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> {
  name: string;
  type?: 'text' | 'email' | 'tel';
  hasError?: boolean;
}

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  name: string;
  rows?: number;
  maxLength?: number;
  hasError?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  hasError?: boolean;
  required?: boolean;
}

export interface CheckboxProps {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hasError?: boolean;
}
```

| State | Treatment |
|---|---|
| default | `--color-surface-raised` background, 1px `--color-border-strong`, `--radius-md`, 44px min height |
| focus | Global focus ring; border becomes `--color-border-interactive` |
| filled | No visual change |
| error | 2px `--color-danger` border plus the `FormError` message. Border colour alone is never the only error signal. |
| disabled | `--color-surface-sunken` background, `--color-ink-subtle` text, `aria-disabled` |

Inputs set `autoComplete` (`name`, `email`, `tel`), `inputMode` (`email`,
`tel`), and `enterKeyHint` where applicable. `Select` uses a native `<select>` —
no custom listbox, no combobox, no third-party select library.

`TextArea` with `maxLength` renders a character counter in an
`aria-live="polite"` region that updates only at 80% of the limit and above, so
it does not announce on every keystroke.

---

### `ContactForm`

**Client Component.**

```ts
export interface ContactFormProps {
  subjects: string[];
  recipientLabel?: string;
}
```

Fields, in order:

| Field | Component | Type | Required | Validation |
|---|---|---|---|---|
| Name | `TextInput` | text | Yes | 2–80 chars |
| Email | `TextInput` | email | Yes | RFC-shaped, validated server-side too |
| Phone | `TextInput` | tel | No | 10–20 chars, digits and `+ - ( ) space` |
| Subject | `Select` | — | Yes | Must be one of `subjects` |
| Message | `TextArea` | — | Yes | 10–2000 chars |
| Consent | `Checkbox` | — | Yes | Must be checked |
| *(honeypot)* | `Honeypot` | — | — | Must be empty |

| State | Behaviour |
|---|---|
| idle | Submit enabled |
| submitting | Submit `isLoading`, all fields `readOnly` (not `disabled`, so values stay readable) |
| success | Form replaced by `FormSuccess` in a `role="status"` region; focus moves to it |
| error | `FormError variant="summary"` at the top of the form in `role="alert"`, listing each failed field as a link to that field; focus moves to the summary |

Validation timing: on submit first. After a field has failed once, that field
re-validates on blur. Never on keystroke — validating while the user is still
typing an email address reports an error for every incomplete prefix.

Submission: a Next.js Server Action posts to the vendor in
`09-INTEGRATIONS.md`. No client-side API key is present in the bundle. Spam
defences are the `Honeypot` field plus a minimum time-to-submit of 3 seconds
recorded as a hidden timestamp and checked server-side.

Failure mode: if the vendor call fails, the error summary reads "We could not
send your message. Please call 805-842-2947 or email {email}." with both as
links. The user's entered values are preserved.

`Honeypot`: an input named `company` inside a `VisuallyHidden` wrapper with
`tabIndex={-1}` and `autoComplete="off"`. It is not `display: none`, which some
bots detect, and it is hidden from screen readers via `aria-hidden` on the
wrapper.

Data source: `ContactResponse.formSubjects`, `_global.location.phone`,
`_global.location.email`.

---

## 6. Page-Level Compositions

Each is an `async` Server Component that performs exactly one `fetch`.

### `HomePage` — `/`

```tsx
// frontend/src/app/page.tsx
import type { Metadata } from 'next';
import { PageBlockRenderer } from '@/components/blocks/page-block-renderer';
import { LocationCard } from '@/components/blocks/location-card';
import { PageShell } from '@/components/layout/page-shell';
import { Section } from '@/components/layout/section';
import { Container } from '@/components/layout/container';
import { fetchEndpoint } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { restaurantJsonLd } from '@/lib/json-ld';
import type { HomeResponse } from '@/types/api';

async function getHome(): Promise<HomeResponse> {
  return fetchEndpoint<HomeResponse>('home', 'home', 3600);
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getHome();
  return buildMetadata(data.seo, data._global, '/');
}

export default async function HomePage() {
  const data = await getHome();

  return (
    <PageShell global={data._global}>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(restaurantJsonLd(data._global)),
        }}
      />
      <PageBlockRenderer blocks={data.blocks} />
      <Section tone="sunken">
        <Container>
          <LocationCard
            location={data._global.location}
            hours={data._global.hours}
            variant="full"
          />
        </Container>
      </Section>
    </PageShell>
  );
}
```

Both `generateMetadata` and the component call `getHome()`. Next.js deduplicates
identical `fetch` calls within a single render pass, so this is one network
request, not two.

The JSON-LD `<script>` is the second and final permitted use of
`dangerouslySetInnerHTML`, alongside `RichText`. Both are explicitly
allow-listed in `07-CODING-STANDARDS.md` §6.

### Remaining compositions

| Component | Route | Endpoint | Structure | JSON-LD |
|---|---|---|---|---|
| `MenuPage` | `/menu` | `menu` | `PageHeader` → `DaypartFilter` → `SectionNav` → `MenuSection[]` → `DietaryLegend` → disclaimer → `PageBlockRenderer` | `Menu`, `MenuSection`, `MenuItem` |
| `EventsPage` | `/events` | `events` | `PageHeader` → `RecurringProgrammeCard` → `EventCard[]` or `emptyMessage` → `PageBlockRenderer` | `Event[]` |
| `EventDetailPage` | `/events/[slug]` | `events` | `Breadcrumbs` → `EventHero` → `RichText` → `AddToCalendar` → `LocationCard` → `EventsPreview` | `Event`, `BreadcrumbList` |
| `AboutPage` | `/about` | `about` | `PageHeader` → `PageBlockRenderer` | none beyond `_global` |
| `ContactPage` | `/contact` | `contact` | `PageHeader` → `LocationCard` → `HoursTable` → `MapEmbed` → `ContactForm` → `SocialLinks` → `PageBlockRenderer` | `Restaurant`, `OpeningHoursSpecification` |
| `NotFoundPage` | `/404` | none | Heading, explanation, links to `/menu`, `/events`, `/contact`, plus the phone number | none |
| `ErrorPage` | error boundary | none | Heading, "Something went wrong", `Button` calling `reset()`, phone link | none |

`EventDetailPage` implements `generateStaticParams`:

```tsx
// frontend/src/app/events/[slug]/page.tsx (params generation only)
import { fetchEndpoint } from '@/lib/api';
import type { EventsResponse } from '@/types/api';

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const data = await fetchEndpoint<EventsResponse>('events', 'events', 900);
  return data.upcoming.map((event) => ({ slug: event.slug }));
}

export const dynamicParams = false;
```

`dynamicParams = false` makes any slug outside the upcoming set a 404 without a
request, which is correct: an event that has ended has no page.

`NotFoundPage` cannot fetch `_global` (Next.js `not-found.tsx` renders outside
the data-fetching route segment in some cases), so it renders a reduced shell
with hardcoded phone number and navigation links. This is the single place where
site data is duplicated in the frontend repo, and it is annotated as such in the
source.
