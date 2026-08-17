# 05 — Design System

Status: **Colour and type frozen for Phase 1 (brand assets received)**
Last reviewed: 2026-08-17

---

## 0. Visual Direction

Derived from the two approved references and the existing brand assets. This
section constrains interpretation; it is not decoration.

| Principle | Source | Application here |
|---|---|---|
| Editorial restraint, generous whitespace | sweetgreen | Section vertical rhythm of 96–128px at desktop. One idea per band. No decorative dividers. |
| Photography carries the page | sweetgreen | Hero and split-feature images are full-bleed or half-bleed. Photography is never a background texture behind body copy. |
| One unmistakable primary CTA per view | sweetgreen | Exactly one `Button variant="primary"` per viewport band. Secondary actions use `variant="secondary"` or `variant="ghost"`. |
| Restrained motion | sweetgreen | Entrance animation is opacity and 8px translate only. No parallax. No scroll-jacking. Nothing animates longer than 400ms. |
| Restaurant-industry conventions | woodranch | Menu as a single scannable page. Hours and phone permanently reachable. Events as dated cards. Catering and private events as first-class destinations (Phase 2). |
| Clubhouse green on cream | brand guidelines | Deep green primary against a cream surface, with sand as the second surface and the flag red reserved as an accent. Warm, not clinical; green carries the weight, red is a highlight. |

Divergences from sweetgreen, stated so they are not treated as oversights:

| Divergence | Reason |
|---|---|
| Denser type scale, smaller display sizes | The audience reads on a phone in sunlight mid-round, not on a laptop. Legibility beats drama. |
| Higher contrast floor than sweetgreen uses | Outdoor use. All body text meets 7:1 where achievable, never below 4.5:1. |
| No ingredient-illustration system | No illustration budget. Photography only. |

**DP-10 is closed (2026-08-17).** The client delivered brand guidelines, the
logo set, and three typefaces. §1 and §2 are no longer provisional: the five
palette values in §1.1 and the three families in §2.1 are the brand as
delivered, and everything else in those sections is derived from them.

Two notes carried forward from the handover:

- The delivered PNG lockups sample as green `#1E4538` and red `#CC3D3B`, a hair
  off the `#1E4338` / `#DE2A33` in the branding deck. The deck values are
  authoritative here; the delta is an export colour-profile artefact and is
  invisible at these deltas (ΔE < 2 for the green). Raised with the client for
  the record, not blocking.
- `[ASSUMPTION] The three delivered typefaces (Rilley, Corbert Compact, Carla
  Sans) are self-hosted on the assumption that the client's licence covers web
  embedding. Myriad Pro was excluded — its Adobe licence does not permit
  self-hosting. Licence certificates are [NEEDS CLIENT INPUT].`

---

## 1. Colour

### 1.1 Brand and surface

The palette has exactly five given values. Everything else in §1 is derived
from them, and no sixth hue may be introduced without an ADR.

| Given | Value | Role |
|---|---|---|
| Brand green | `#1E4338` | Headings, primary text, dark surfaces, primary CTA |
| Brand red | `#DE2A33` | Accent only — logo, large highlights |
| Cream | `#F9F8F2` | Primary page background |
| Sand | `#EAE0DA` | Alternating sections, cards |
| Ink | `#111111` | Near-black body text |

Contrast ratios are computed against `--color-surface` (`#F9F8F2`) unless the
Usage column states otherwise. AA requires 4.5:1 for normal text, 3:1 for large
text (≥24px, or ≥18.66px bold) and for UI component boundaries.

| Token | Value | Usage | Contrast |
|---|---|---|---|
| `--color-brand-primary` | `#1E4338` | Primary button background, active nav underline, headings, brand rules | 10.31:1 on surface — AAA |
| `--color-brand-primary-hover` | `#19372E` | Primary button hover | 12.13:1 vs `--color-ink-inverse` — AAA |
| `--color-brand-primary-active` | `#142C25` | Primary button pressed | 13.93:1 vs `--color-ink-inverse` — AAA |
| `--color-brand-primary-subtle` | `#DFE2DC` | Tinted backgrounds behind brand content | 1.23:1 vs surface — background only; brand green on it is 8.38:1 |
| `--color-brand-accent` | `#DE2A33` | **Accent only.** Logo, large display accents, decorative rules, the spice glyph | 4.40:1 on surface — see the prohibition below |
| `--color-brand-accent-subtle` | `#F6E3DF` | Tinted background behind accent content | Background only; brand green on it is 8.86:1 |
| `--color-surface` | `#F9F8F2` | Page background | — |
| `--color-surface-raised` | `#FFFFFF` | Cards, panels, sticky header | 1.06:1 vs surface — sufficient with a border |
| `--color-surface-sunken` | `#EAE0DA` | Alternating section bands, input backgrounds | 1.22:1 vs surface |
| `--color-surface-inverse` | `#1E4338` | Footer, dark CTA bands | — |

**The accent-red prohibition.** `--color-brand-accent` reaches 4.40:1 on cream
and 3.61:1 on sand. Both clear the 3:1 large-text and non-text floor; neither
clears the 4.5:1 normal-text floor. It is therefore permitted for the logo,
display-size type (≥24px, or ≥18.66px bold), icons and rules, and prohibited
for body copy, labels, captions, links, and form errors. Those use
`--color-brand-primary` or `--color-ink`. Reversed is no better — cream on red
is the same 4.40:1 — so there is no red button, in any variant, at any size.
Against brand green red measures 2.34:1 and is decoration only, never a glyph
that carries meaning.

`--color-surface-inverse` is brand green rather than a near-black. The hero and
modal scrims are not: they stay on ink (§1.4), because green is too light to
darken a photograph to an accessible contrast.

### 1.2 Ink (text)

| Token | Value | Usage | On `--color-surface` | On `--color-surface-sunken` | On `--color-surface-inverse` |
|---|---|---|---|---|---|
| `--color-ink` | `#111111` | Body copy | 17.75:1 — AAA | 14.54:1 — AAA | — |
| `--color-ink-muted` | `#3E4743` | Secondary copy, captions, metadata | 9.02:1 — AAA | 7.39:1 — AAA | — |
| `--color-ink-subtle` | `#59615D` | Placeholder text, disabled labels | 5.99:1 — AA | 4.91:1 — AA | — |
| `--color-ink-inverse` | `#F9F8F2` | Text on `--color-surface-inverse` and on brand-primary | — | — | 10.31:1 — AAA |
| `--color-ink-inverse-muted` | `#BCC5BE` | Secondary text on dark | — | — | 6.20:1 — AA |

`--color-ink-subtle` is checked against sand as well as cream because inputs sit
on `--color-surface-sunken`. It passes AA on both, but is still prohibited for
any text carrying meaning: it is permitted only for placeholder text inside
inputs that also carry a persistent visible label.

Headings use `--color-brand-primary` (green, 10.31:1) rather than `--color-ink`;
body copy uses ink. This is the split the branding deck specifies.

### 1.3 Semantic and state

| Token | Value | Usage | On surface | On sunken | On its own `-subtle` |
|---|---|---|---|---|---|
| `--color-success` | `#1F6B4A` | Form success, "Open now" indicator | 6.05:1 — AA | 4.96:1 — AA | 5.10:1 — AA |
| `--color-success-subtle` | `#DFE7DE` | Success message background | Background only | — | ink on it: 14.95:1 |
| `--color-warning` | `#8A5A00` | Limited availability, closing-soon notice | 5.57:1 — AA | 4.56:1 — AA | 4.72:1 — AA |
| `--color-warning-subtle` | `#ECE5D5` | Warning background | Background only | — | ink on it: 15.05:1 |
| `--color-danger` | `#96201A` | Form errors, "Closed" indicator, allergen badge | 7.84:1 — AAA | 6.42:1 — AAA | 5.73:1 — AA |
| `--color-danger-subtle` | `#EFDED8` | Error message background | Background only | — | ink on it: 14.49:1 |
| `--color-info` | `#1F5E82` | Neutral informational notices | 6.62:1 — AAA | 5.42:1 — AA | 5.56:1 — AA |
| `--color-info-subtle` | `#DFE6E5` | Info background | Background only | — | ink on it: 14.92:1 |

`--color-danger` is deliberately **not** `--color-brand-accent`. Two reasons, and
both are binding: brand red at 4.40:1 cannot carry an error message at label
size, and if error red and brand red were the same value an error would read as
branding. `#96201A` is a darker, less saturated oxblood — recognisably an error
colour, unmistakably not the flag red.

`--color-success` is likewise not `--color-brand-primary`. It is lighter and
more saturated so that an "Open now" pill does not read as a brand chip.

### 1.4 Border and overlay

| Token | Value | Usage | Contrast on surface |
|---|---|---|---|
| `--color-border` | `#D2CDC7` | Default card and input borders | 1.55:1 — decorative only |
| `--color-border-strong` | `#A5ABA3` | Input borders, table rules, focus-adjacent boundaries | 2.28:1 |
| `--color-border-interactive` | `#6C7F76` | Borders that convey component boundaries (checkbox, radio) | 4.00:1 on cream, 3.28:1 on sand — passes AA non-text 3:1 on both |
| `--color-border-inverse` | `#577268` | Rules on `--color-surface-inverse` (footer divider) | 2.09:1 vs green — decorative divider, not a component boundary |
| `--color-focus-ring` | `#111111` | Focus indicator, outer ring | 17.75:1 on cream, 14.54:1 on sand |
| `--color-focus-ring-halo` | `#F9F8F2` | Focus indicator, inner halo | 10.31:1 on brand green, 4.40:1 on accent red |
| `--color-overlay-scrim` | `rgba(17, 17, 17, 0.60)` | Mobile nav backdrop, modal scrim | — |
| `--color-hero-overlay` | `rgba(17, 17, 17, var(--hero-overlay-alpha))` | Hero image darkening; alpha set per-block from the CMS `overlay` field | Must yield ≥4.5:1 for hero text — see below |

The focus indicator is two-tone; §9 gives the rule and the reasoning. In short:
no single hue in this palette clears 3:1 against cream, sand, **and** brand green
at once, so ink and cream are stacked and each covers the surfaces the other
cannot.

The hero overlay stays on ink, not on `--color-surface-inverse`. Composited over
the worst case — a blown-out white region of the photograph — brand green at any
usable alpha tops out around 3.7:1, below the 4.5:1 the hero subheading needs.
Ink reaches 4.65:1 at `alpha 0.60`, which is therefore the token default and the
floor for the CMS `overlay` field:

| `--hero-overlay-alpha` | Composite over white | Cream text |
|---|---|---|
| `0.45` | `#949494` | 2.85:1 — fails |
| `0.55` | `#7C7C7C` | 3.92:1 — large text only |
| **`0.60`** | `#707070` | **4.65:1 — AA** |

### 1.5 Dietary badge pairings

Mapped from the `color` field on `gotg_dietary` terms — see
`03-CONTENT-MODEL.md` §8.1.

| Field value | Background token | Text token | Contrast |
|---|---|---|---|
| `neutral` | `--color-surface-sunken` `#EAE0DA` | `--color-ink` `#111111` | 14.54:1 — AAA |
| `green` | `--color-success-subtle` `#DFE7DE` | `--color-success` `#1F6B4A` | 5.10:1 — AA |
| `amber` | `--color-warning-subtle` `#ECE5D5` | `--color-warning` `#8A5A00` | 4.72:1 — AA |
| `red` | `--color-danger-subtle` `#EFDED8` | `--color-danger` `#96201A` | 5.73:1 — AA |

Only `green` (Vegetarian) and `neutral` (Gluten-Free) are in use — the client
confirmed those two dietary tags and no others. `amber` and `red` stay in the
vocabulary because `03-CONTENT-MODEL.md` §8.1 declares the field's full range.

Badges never rely on colour alone: each renders its `abbreviation` text and
carries the full `description` as its accessible name.

---

## 2. Typography

### 2.1 Families

| Token | Stack | Usage | Licence |
|---|---|---|---|
| `--font-display` | `"Bitter", Georgia, "Times New Roman", serif` | H1–H3, hero headings, section headings | SIL OFL, self-hosted |
| `--font-body` | `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Body copy, UI, navigation, buttons | SIL OFL, self-hosted |
| `--font-script` | *(none — logo only)* | The cursive wordmark is an SVG asset, never live text | — |

The cursive wordmark from the existing logo is **not** implemented as a webfont.
It is delivered as SVG (`_global.site.logo`) with a text alternative. Reasons:
the licence status of the existing script face is unknown (DP-10), script faces
render poorly below 24px, and a wordmark is a mark, not text.

`[ASSUMPTION] Bitter and Inter are placeholders selected for warmth, wide weight
range, and open licensing. Replace on receipt of brand guidelines — DP-10.`

### 2.2 Weights

| Token | Value | Usage |
|---|---|---|
| `--font-weight-regular` | `400` | Body copy |
| `--font-weight-medium` | `500` | UI labels, nav items, table headers |
| `--font-weight-semibold` | `600` | Buttons, prices, card titles |
| `--font-weight-bold` | `700` | Display headings |

Only these four weights are loaded. Adding a fifth requires a design decision
recorded as an ADR.

### 2.3 Type scale — mobile (below `md`, 768px)

| Token | Size | Line height | Letter spacing | Weight | Family | Usage |
|---|---|---|---|---|---|---|
| `--text-display` | `2.5rem` / 40px | `1.1` / 44px | `-0.02em` | 700 | display | Hero heading |
| `--text-h1` | `2rem` / 32px | `1.15` / 36.8px | `-0.015em` | 700 | display | Page H1 |
| `--text-h2` | `1.625rem` / 26px | `1.2` / 31.2px | `-0.01em` | 700 | display | Section heading |
| `--text-h3` | `1.25rem` / 20px | `1.3` / 26px | `-0.005em` | 600 | display | Sub-section, card title |
| `--text-h4` | `1.0625rem` / 17px | `1.35` / 22.95px | `0` | 600 | body | Menu item name |
| `--text-body-lg` | `1.125rem` / 18px | `1.6` / 28.8px | `0` | 400 | body | Intro paragraphs |
| `--text-body` | `1rem` / 16px | `1.6` / 25.6px | `0` | 400 | body | Default body copy |
| `--text-body-sm` | `0.9375rem` / 15px | `1.55` / 23.25px | `0` | 400 | body | Menu descriptions, captions |
| `--text-label` | `0.875rem` / 14px | `1.4` / 19.6px | `0.01em` | 500 | body | Form labels, nav |
| `--text-caption` | `0.8125rem` / 13px | `1.45` / 18.85px | `0.01em` | 400 | body | Metadata, legends |
| `--text-overline` | `0.75rem` / 12px | `1.3` / 15.6px | `0.08em` | 600 | body | Eyebrows, uppercase labels |

Body copy never drops below 15px. 13px is reserved for non-essential metadata
that is duplicated elsewhere in accessible form.

### 2.4 Type scale — desktop (`md` and up)

Only the tokens that change are listed. Everything else inherits the mobile
value.

| Token | Size | Line height | Letter spacing |
|---|---|---|---|
| `--text-display` | `4rem` / 64px | `1.05` / 67.2px | `-0.025em` |
| `--text-h1` | `3rem` / 48px | `1.1` / 52.8px | `-0.02em` |
| `--text-h2` | `2.25rem` / 36px | `1.15` / 41.4px | `-0.015em` |
| `--text-h3` | `1.5rem` / 24px | `1.25` / 30px | `-0.01em` |
| `--text-h4` | `1.125rem` / 18px | `1.35` / 24.3px | `0` |
| `--text-body-lg` | `1.25rem` / 20px | `1.6` / 32px | `0` |

At `lg` (1024px) and above the scale is unchanged from `md`. The site does not
scale type at three breakpoints — two steps are sufficient and halve the
regression surface.

### 2.5 Measure

| Token | Value | Applies to |
|---|---|---|
| `--measure-narrow` | `65ch` | `TextBlock` with `width: 'narrow'`, all body prose |
| `--measure-wide` | `80ch` | `TextBlock` with `width: 'wide'` |
| `--measure-heading` | `20ch` | Display and H1 headings |

---

## 3. Spacing

Base unit 4px. Tokens are named by step, not by intent, so a single scale serves
padding, margin, and gap.

| Token | Value | px | Typical use |
|---|---|---|---|
| `--space-0` | `0` | 0 | Reset |
| `--space-1` | `0.25rem` | 4 | Icon-to-text gap |
| `--space-2` | `0.5rem` | 8 | Badge padding, tight stacks |
| `--space-3` | `0.75rem` | 12 | Input padding vertical |
| `--space-4` | `1rem` | 16 | Default gap, card padding mobile |
| `--space-5` | `1.25rem` | 20 | — |
| `--space-6` | `1.5rem` | 24 | Card padding desktop, gutter mobile |
| `--space-8` | `2rem` | 32 | Gap between cards |
| `--space-10` | `2.5rem` | 40 | Gutter desktop |
| `--space-12` | `3rem` | 48 | Section padding mobile |
| `--space-16` | `4rem` | 64 | Gap between menu sections |
| `--space-20` | `5rem` | 80 | — |
| `--space-24` | `6rem` | 96 | Section padding desktop |
| `--space-32` | `8rem` | 128 | Major band separation desktop |

### 3.1 Layout tokens

| Token | Value | Notes |
|---|---|---|
| `--container-max` | `1280px` | Maximum content width |
| `--container-narrow` | `768px` | Prose containers |
| `--gutter-mobile` | `var(--space-6)` | 24px |
| `--gutter-desktop` | `var(--space-10)` | 40px |
| `--section-y-mobile` | `var(--space-12)` | 48px |
| `--section-y-desktop` | `var(--space-24)` | 96px |
| `--header-height` | `64px` | Mobile |
| `--header-height-desktop` | `80px` | `md` and up |
| `--mobile-cta-bar-height` | `64px` | Persistent bottom call bar; body gets matching bottom padding below `md` |
| `--hero-height` | `min(72svh, 560px)` | `Hero` band min-height; steps to `min(80svh, 680px)` at `md` and `min(84svh, 760px)` at `lg`. `svh` avoids a jump as mobile chrome shows/hides (06-COMPONENT-SPEC.md §Hero) |

---

## 4. Radii, Shadows, Borders

### 4.1 Border radius

| Token | Value | Usage |
|---|---|---|
| `--radius-none` | `0` | Full-bleed images |
| `--radius-sm` | `4px` | Badges, tags |
| `--radius-md` | `8px` | Inputs, buttons |
| `--radius-lg` | `12px` | Cards |
| `--radius-xl` | `20px` | Feature panels, modal |
| `--radius-full` | `9999px` | Avatars, pill filters, icon buttons |

### 4.2 Shadows

Warm-tinted rather than neutral black, so shadows sit in the palette.

| Token | Value | Usage |
|---|---|---|
| `--shadow-none` | `none` | Flat surfaces |
| `--shadow-sm` | `0 1px 2px 0 rgba(28, 27, 25, 0.06)` | Resting cards |
| `--shadow-md` | `0 4px 12px -2px rgba(28, 27, 25, 0.10), 0 2px 4px -2px rgba(28, 27, 25, 0.06)` | Hovered cards, sticky header once scrolled |
| `--shadow-lg` | `0 12px 28px -6px rgba(28, 27, 25, 0.14), 0 4px 8px -4px rgba(28, 27, 25, 0.08)` | Dropdowns, popovers |
| `--shadow-xl` | `0 24px 48px -12px rgba(28, 27, 25, 0.20)` | Mobile nav panel, modal |

Shadow is never the sole indicator of an interactive boundary — a border or a
contrast change accompanies it.

### 4.3 Border widths

| Token | Value | Usage |
|---|---|---|
| `--border-width` | `1px` | Default |
| `--border-width-thick` | `2px` | Focus ring, active nav underline, input focus |

### 4.4 Aspect ratios

The fixed image ratios the component specs use (`06-COMPONENT-SPEC.md`
§`Image`). Tokenised so image boxes reserve space without an arbitrary Tailwind
value; each maps to an `aspect-*` utility.

| Token | Value | Utility | Usage |
|---|---|---|---|
| `--aspect-square` | `1 / 1` | `aspect-square` | `MenuCard` md thumbnail, `PersonCard` portrait |
| `--aspect-4-3` | `4 / 3` | `aspect-4-3` | General card media |
| `--aspect-3-2` | `3 / 2` | `aspect-3-2` | `MenuCard` mobile image, `SplitFeature`, section banners |
| `--aspect-16-9` | `16 / 9` | `aspect-16-9` | Wide/landscape media |

A component that needs two ratios across breakpoints composes the utilities —
`MenuCard` uses `aspect-3-2 md:aspect-square` for its full-width mobile image and
96px square desktop thumbnail. No new ratio may be introduced as an arbitrary
value; add a token here instead.

### 4.5 Control heights

Interactive-control heights (`06-COMPONENT-SPEC.md` §`Button`). The step spacing
scale (§3) deliberately omits the values these need (9/11/13 → 36/44/52px), so
control height is its own small token set rather than a spacing extension.

| Token | Value | px | Size | Meets 44px touch box |
|---|---|---|---|---|
| `--control-height-sm` | `2.25rem` | 36 | `Button size="sm"` | **No — see below** |
| `--control-height-md` | `2.75rem` | 44 | `Button size="md"`, default | Yes, by height |
| `--control-height-lg` | `3.25rem` | 52 | `Button size="lg"` | Yes, by height |

Applied as `min-height` (controls reference the token directly, as with
`--container-max`; there is no `--spacing` step for these values, so no `h-*`
utility). `md` and `lg` meet the 44×44 minimum touch target by height alone.
`sm` is **36px tall — below the 44px minimum** — and keeps that compact visual
height for pointer-dense contexts; its interactive box is expanded to 44px by a
transparent overlay (`.gotg-hit-target`, in `frontend/src/styles/globals.css`),
so the touch target is preserved without inflating the visual. This is the
"achieved with padding on `sm`" line in §`Button` made concrete.

---

## 5. Motion

| Token | Value | Usage |
|---|---|---|
| `--duration-instant` | `100ms` | Colour and opacity on small controls |
| `--duration-fast` | `160ms` | Button and link hover, badge transitions |
| `--duration-base` | `240ms` | Card hover lift, accordion open |
| `--duration-slow` | `400ms` | Mobile nav panel, modal enter |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0.2, 1)` | Default for entering and moving |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering the viewport |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving the viewport |
| `--ease-spring` | `cubic-bezier(0.34, 1.4, 0.64, 1)` | Mobile nav panel only |

Nothing exceeds 400ms. Only `opacity`, `transform`, and colour properties are
animated — never `height`, `width`, `top`, or `left`.

### 5.1 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Under reduced motion, entrance animations do not play at reduced speed — content
renders in its final state immediately. The carousel variant of `Gallery`
disables auto-advance permanently and never re-enables it.

---

## 6. Z-Index Layers

Only these values are used. A raw `z-index` number in a component is a lint
error — see `07-CODING-STANDARDS.md` §8.

| Token | Value | Layer |
|---|---|---|
| `--z-base` | `0` | Document flow |
| `--z-raised` | `10` | Cards on hover, sticky section nav |
| `--z-sticky` | `100` | Sticky site header |
| `--z-mobile-bar` | `200` | Persistent mobile call bar |
| `--z-dropdown` | `300` | Nav dropdown, select menus |
| `--z-overlay` | `400` | Mobile nav backdrop, modal scrim |
| `--z-modal` | `500` | Mobile nav panel, dialogs |
| `--z-toast` | `600` | Form success and error toasts |
| `--z-skip-link` | `700` | Skip-to-content link when focused |

The skip link sits above everything: it must be visible the instant it receives
focus, including while a modal is open.

---

## 7. Breakpoints

| Token | Min width | Target | Layout change |
|---|---|---|---|
| *(base)* | `0` | Phones | Single column, mobile nav, persistent bottom CTA bar |
| `--bp-sm` | `640px` | Large phones, small tablets portrait | Two-column menu item grid |
| `--bp-md` | `768px` | Tablets | Desktop nav appears, bottom CTA bar hides, desktop type scale applies |
| `--bp-lg` | `1024px` | Laptops | Three-column grids, split features go side-by-side |
| `--bp-xl` | `1280px` | Desktops | Container reaches `--container-max`, gutters stop growing |

Mobile-first. Every media query is `min-width`. `max-width` queries are
prohibited except in the reduced-motion and print blocks.

---

## 8. Token Output

### 8.1 CSS custom properties

`frontend/src/styles/tokens.css`, imported once in the root layout.

```css
:root {
  /* Colour — brand and surface */
  --color-brand-primary: #1e4338;
  --color-brand-primary-hover: #19372e;
  --color-brand-primary-active: #142c25;
  --color-brand-primary-subtle: #dfe2dc;
  --color-brand-accent: #de2a33;
  --color-brand-accent-subtle: #f6e3df;
  --color-surface: #f9f8f2;
  --color-surface-raised: #ffffff;
  --color-surface-sunken: #eae0da;
  --color-surface-inverse: #1e4338;

  /* Colour — ink */
  --color-ink: #111111;
  --color-ink-muted: #3e4743;
  --color-ink-subtle: #59615d;
  --color-ink-inverse: #f9f8f2;
  --color-ink-inverse-muted: #bcc5be;

  /* Colour — semantic */
  --color-success: #1f6b4a;
  --color-success-subtle: #dfe7de;
  --color-warning: #8a5a00;
  --color-warning-subtle: #ece5d5;
  --color-danger: #96201a;
  --color-danger-subtle: #efded8;
  --color-info: #1f5e82;
  --color-info-subtle: #dfe6e5;

  /* Colour — border and overlay */
  --color-border: #d2cdc7;
  --color-border-strong: #a5aba3;
  --color-border-interactive: #6c7f76;
  --color-border-inverse: #577268;
  --color-focus-ring: #111111;
  --color-focus-ring-halo: #f9f8f2;
  --color-overlay-scrim: rgba(17, 17, 17, 0.6);
  --hero-overlay-alpha: 0.6;
  --color-hero-overlay: rgba(17, 17, 17, var(--hero-overlay-alpha));

  /* Typography — families */
  --font-display: "Bitter", Georgia, "Times New Roman", serif;
  --font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;

  /* Typography — weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Typography — mobile scale */
  --text-display: 2.5rem;
  --text-display-lh: 1.1;
  --text-display-ls: -0.02em;
  --text-h1: 2rem;
  --text-h1-lh: 1.15;
  --text-h1-ls: -0.015em;
  --text-h2: 1.625rem;
  --text-h2-lh: 1.2;
  --text-h2-ls: -0.01em;
  --text-h3: 1.25rem;
  --text-h3-lh: 1.3;
  --text-h3-ls: -0.005em;
  --text-h4: 1.0625rem;
  --text-h4-lh: 1.35;
  --text-h4-ls: 0em;
  --text-body-lg: 1.125rem;
  --text-body-lg-lh: 1.6;
  --text-body: 1rem;
  --text-body-lh: 1.6;
  --text-body-sm: 0.9375rem;
  --text-body-sm-lh: 1.55;
  --text-label: 0.875rem;
  --text-label-lh: 1.4;
  --text-label-ls: 0.01em;
  --text-caption: 0.8125rem;
  --text-caption-lh: 1.45;
  --text-caption-ls: 0.01em;
  --text-overline: 0.75rem;
  --text-overline-lh: 1.3;
  --text-overline-ls: 0.08em;

  /* Measure */
  --measure-narrow: 65ch;
  --measure-wide: 80ch;
  --measure-heading: 20ch;

  /* Spacing */
  --space-0: 0rem;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  --space-32: 8rem;

  /* Layout */
  --container-max: 1280px;
  --container-narrow: 768px;
  --gutter: var(--space-6);
  --section-y: var(--space-12);
  --header-height: 64px;
  --mobile-cta-bar-height: 64px;

  /* Control heights */
  --control-height-sm: 2.25rem;
  --control-height-md: 2.75rem;
  --control-height-lg: 3.25rem;

  /* Aspect ratios */
  --aspect-square: 1 / 1;
  --aspect-4-3: 4 / 3;
  --aspect-3-2: 3 / 2;
  --aspect-16-9: 16 / 9;

  /* Radii */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgba(28, 27, 25, 0.06);
  --shadow-md: 0 4px 12px -2px rgba(28, 27, 25, 0.1),
    0 2px 4px -2px rgba(28, 27, 25, 0.06);
  --shadow-lg: 0 12px 28px -6px rgba(28, 27, 25, 0.14),
    0 4px 8px -4px rgba(28, 27, 25, 0.08);
  --shadow-xl: 0 24px 48px -12px rgba(28, 27, 25, 0.2);

  /* Borders */
  --border-width: 1px;
  --border-width-thick: 2px;

  /* Motion */
  --duration-instant: 100ms;
  --duration-fast: 160ms;
  --duration-base: 240ms;
  --duration-slow: 400ms;
  --ease-standard: cubic-bezier(0.2, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-spring: cubic-bezier(0.34, 1.4, 0.64, 1);

  /* Z-index */
  --z-base: 0;
  --z-raised: 10;
  --z-sticky: 100;
  --z-mobile-bar: 200;
  --z-dropdown: 300;
  --z-overlay: 400;
  --z-modal: 500;
  --z-toast: 600;
  --z-skip-link: 700;
}

@media (min-width: 768px) {
  :root {
    --text-display: 4rem;
    --text-display-lh: 1.05;
    --text-display-ls: -0.025em;
    --text-h1: 3rem;
    --text-h1-lh: 1.1;
    --text-h1-ls: -0.02em;
    --text-h2: 2.25rem;
    --text-h2-lh: 1.15;
    --text-h2-ls: -0.015em;
    --text-h3: 1.5rem;
    --text-h3-lh: 1.25;
    --text-h3-ls: -0.01em;
    --text-h4: 1.125rem;
    --text-h4-lh: 1.35;
    --text-body-lg: 1.25rem;
    --gutter: var(--space-10);
    --section-y: var(--space-24);
    --header-height: 80px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 8.2 Tailwind theme

Tailwind CSS 4 reads its theme from CSS. `frontend/src/styles/theme.css`:

```css
@import "tailwindcss";
@import "./tokens.css";

@theme inline {
  --color-brand: var(--color-brand-primary);
  --color-brand-hover: var(--color-brand-primary-hover);
  --color-brand-active: var(--color-brand-primary-active);
  --color-brand-subtle: var(--color-brand-primary-subtle);
  --color-accent: var(--color-brand-accent);
  --color-accent-subtle: var(--color-brand-accent-subtle);

  --color-surface: var(--color-surface);
  --color-surface-raised: var(--color-surface-raised);
  --color-surface-sunken: var(--color-surface-sunken);
  --color-surface-inverse: var(--color-surface-inverse);

  --color-ink: var(--color-ink);
  --color-ink-muted: var(--color-ink-muted);
  --color-ink-subtle: var(--color-ink-subtle);
  --color-ink-inverse: var(--color-ink-inverse);
  --color-ink-inverse-muted: var(--color-ink-inverse-muted);

  --color-success: var(--color-success);
  --color-success-subtle: var(--color-success-subtle);
  --color-warning: var(--color-warning);
  --color-warning-subtle: var(--color-warning-subtle);
  --color-danger: var(--color-danger);
  --color-danger-subtle: var(--color-danger-subtle);
  --color-info: var(--color-info);
  --color-info-subtle: var(--color-info-subtle);

  --color-border: var(--color-border);
  --color-border-strong: var(--color-border-strong);
  --color-border-interactive: var(--color-border-interactive);
  --color-border-inverse: var(--color-border-inverse);
  --color-focus: var(--color-focus-ring);

  --font-display: var(--font-display);
  --font-body: var(--font-body);

  --text-display: var(--text-display);
  --text-display--line-height: var(--text-display-lh);
  --text-display--letter-spacing: var(--text-display-ls);
  --text-h1: var(--text-h1);
  --text-h1--line-height: var(--text-h1-lh);
  --text-h1--letter-spacing: var(--text-h1-ls);
  --text-h2: var(--text-h2);
  --text-h2--line-height: var(--text-h2-lh);
  --text-h2--letter-spacing: var(--text-h2-ls);
  --text-h3: var(--text-h3);
  --text-h3--line-height: var(--text-h3-lh);
  --text-h4: var(--text-h4);
  --text-h4--line-height: var(--text-h4-lh);
  --text-body-lg: var(--text-body-lg);
  --text-body-lg--line-height: var(--text-body-lg-lh);
  --text-body: var(--text-body);
  --text-body--line-height: var(--text-body-lh);
  --text-body-sm: var(--text-body-sm);
  --text-body-sm--line-height: var(--text-body-sm-lh);
  --text-label: var(--text-label);
  --text-label--line-height: var(--text-label-lh);
  --text-caption: var(--text-caption);
  --text-caption--line-height: var(--text-caption-lh);
  --text-overline: var(--text-overline);
  --text-overline--line-height: var(--text-overline-lh);
  --text-overline--letter-spacing: var(--text-overline-ls);

  --spacing-1: var(--space-1);
  --spacing-2: var(--space-2);
  --spacing-3: var(--space-3);
  --spacing-4: var(--space-4);
  --spacing-5: var(--space-5);
  --spacing-6: var(--space-6);
  --spacing-8: var(--space-8);
  --spacing-10: var(--space-10);
  --spacing-12: var(--space-12);
  --spacing-16: var(--space-16);
  --spacing-20: var(--space-20);
  --spacing-24: var(--space-24);
  --spacing-32: var(--space-32);

  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --radius-full: var(--radius-full);

  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);

  --aspect-square: var(--aspect-square);
  --aspect-4-3: var(--aspect-4-3);
  --aspect-3-2: var(--aspect-3-2);
  --aspect-16-9: var(--aspect-16-9);

  --ease-standard: var(--ease-standard);
  --ease-out: var(--ease-out);
  --ease-in: var(--ease-in);
  --ease-spring: var(--ease-spring);

  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

Arbitrary values (`text-[17px]`, `bg-[#ff0000]`, `z-[999]`) are prohibited. Every
value must resolve to a token. Enforced by ESLint — see
`07-CODING-STANDARDS.md` §8.

---

## 9. Focus Indicator

One focus treatment, applied globally. Components do not define their own.

It is two-tone: a 2px ink outline held 2px off the element, with a cream halo
filling that gap. The provisional palette could use a single blue because blue
contrasted with both the off-white surface and the red brand colour. This
palette has no such hue — the surfaces now span cream, sand, and a dark green,
and nothing clears 3:1 against all three:

| Candidate | On cream | On sand | On brand green |
|---|---|---|---|
| `#1F5E82` (the old blue) | 6.62:1 | 5.42:1 | **1.56:1** |
| `#111111` (ink) | 17.75:1 | 14.54:1 | **1.72:1** |
| `#F9F8F2` (cream) | **1.00:1** | **1.22:1** | 10.31:1 |

Stacking the last two solves it: on cream and sand the ink outline carries the
indicator (17.75:1, 14.54:1); on the green button and green CTA bands the cream
halo carries it (10.31:1), with the ink outline reading against the halo at
17.75:1. Every surface is covered by at least one ring at well over 3:1.

```css
:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: var(--border-width-thick) solid var(--color-focus-ring);
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--color-focus-ring-halo);
  border-radius: var(--radius-sm);
}

:where(a, button, input, select, textarea, summary, [tabindex]):focus:not(
    :focus-visible
  ) {
  outline: none;
}
```

`outline: none` without a replacement is prohibited anywhere in the codebase.

---

## 10. Component Inventory

Full specifications in `06-COMPONENT-SPEC.md`. This table is the index; the two
documents must list the same components.

### 10.1 Primitives

| Component | Variants | States | Required props |
|---|---|---|---|
| `Button` | `primary`, `secondary`, `ghost`, `danger` | default, hover, focus-visible, active, disabled, loading | `children` |
| `LinkButton` | same as `Button` | default, hover, focus-visible, active | `href`, `children` |
| `IconButton` | `solid`, `ghost` | default, hover, focus-visible, active, disabled | `icon`, `label` |
| `Text` | `body-lg`, `body`, `body-sm`, `caption`, `overline` | default | `children` |
| `Heading` | `display`, `h1`, `h2`, `h3`, `h4` | default | `level`, `children` |
| `Badge` | `neutral`, `green`, `amber`, `red`, `brand` | default | `children` |
| `Icon` | 24 named glyphs | default | `name` |
| `Image` | `fill`, `fixed` | loading, loaded, error | `image` |
| `Price` | `default`, `large` | default | `amount` |
| `PriceList` | `default`, `large` | default, single-variant, multi-variant | `variants` |
| `Divider` | `solid`, `spacer` | default | none |
| `VisuallyHidden` | — | default | `children` |
| `Skeleton` | `text`, `rect`, `circle` | default | none |
| `Spinner` | `sm`, `md` | default | `label` |

### 10.2 Layout

| Component | Variants | States | Required props |
|---|---|---|---|
| `Container` | `default`, `narrow`, `full` | default | `children` |
| `Section` | `surface`, `sunken`, `inverse` | default | `children` |
| `Stack` | `column`, `row` | default | `children` |
| `Grid` | `2`, `3`, `4` columns | default | `children` |
| `SplitLayout` | `image-left`, `image-right` | default | `media`, `content` |
| `PageShell` | — | default | `global`, `children` |

### 10.3 Content blocks

| Component | Variants | States | Required props |
|---|---|---|---|
| `PageBlockRenderer` | — | default, unknown-type | `blocks` |
| `Hero` | `full`, `compact` | default | `block` |
| `TextSection` | `narrow`, `wide` | default | `block` |
| `RichText` | — | default | `html` |
| `SplitFeature` | `image-left`, `image-right` | default | `block` |
| `Gallery` | `grid`, `carousel` | default, loading | `block` |
| `CtaBand` | `brand`, `ink`, `surface` | default | `block` |
| `FeaturedMenuRow` | — | default, empty | `block` |
| `EventsPreview` | — | default, empty | `block` |
| `PersonCard` | — | default | `person` |
| `InstagramFeed` | — | loading, loaded, error, empty | `block` |
| `MenuCard` | `default`, `featured` | default | `item` |
| `MenuSection` | — | default, empty | `section` |
| `DietaryLegend` | — | default, empty | `tags` |
| `EventCard` | `list`, `preview` | default | `event` |
| `EventHero` | — | default | `event` |
| `RecurringProgrammeCard` | — | default | `recurring` |
| `LocationCard` | `full`, `compact` | default | `location` |
| `HoursTable` | — | default | `hours` |
| `MapEmbed` | `static`, `interactive` | default, error | `location` |
| `PageHeader` | — | default | `title` |

### 10.4 Navigation

| Component | Variants | States | Required props |
|---|---|---|---|
| `SiteHeader` | `transparent`, `solid` | at-top, scrolled | `global` |
| `SiteFooter` | — | default | `global` |
| `PrimaryNav` | — | default, item-active | `items` |
| `MobileNav` | — | closed, opening, open, closing | `global` |
| `MobileCtaBar` | — | default | `global` |
| `NavDropdown` | — | closed, open, focus-within | `label`, `items` |
| `SkipLink` | — | hidden, focused | `targetId` |
| `Breadcrumbs` | — | default | `trail` |
| `SectionNav` | — | default, item-active | `sections` |
| `DaypartFilter` | — | default, active, disabled | `dayparts`, `value` |
| `HoursStatus` | `header`, `inline` | open, closing-soon, closed, unknown | `hours` |
| `SocialLinks` | `row`, `stack` | default | `links` |
| `AnnouncementBar` | — | default, dismissed | `announcement` |

### 10.5 Forms

| Component | Variants | States | Required props |
|---|---|---|---|
| `Field` | — | default, error | `label`, `name`, `children` |
| `TextInput` | `text`, `email`, `tel` | default, focus, filled, error, disabled | `name` |
| `TextArea` | — | default, focus, filled, error, disabled | `name` |
| `Select` | — | default, focus, error, disabled | `name`, `options` |
| `Checkbox` | — | unchecked, checked, focus, error, disabled | `name`, `label` |
| `FormError` | `field`, `summary` | default | `children` |
| `FormSuccess` | — | default | `children` |
| `ContactForm` | — | idle, submitting, success, error | `subjects` |
| `Honeypot` | — | default | none |

### 10.6 Page-level compositions

| Component | Data source | Route |
|---|---|---|
| `HomePage` | `HomeResponse` | `/` |
| `MenuPage` | `MenuResponse` | `/menu` |
| `EventsPage` | `EventsResponse` | `/events` |
| `EventDetailPage` | `EventsResponse` filtered by slug | `/events/[slug]` |
| `AboutPage` | `AboutResponse` | `/about` |
| `ContactPage` | `ContactResponse` | `/contact` |
| `NotFoundPage` | `_global` only | `/404` |
| `ErrorPage` | none | error boundary |

---

## 11. Contrast Validation Protocol

§1 is frozen now that DP-10 has closed, but contrast is still re-validated
whenever a colour token changes:

1. `pnpm test:contrast` runs a Vitest suite that computes WCAG contrast for
   every pairing declared in §1 and fails if a pairing falls below its stated
   threshold.
2. The pairing table is data in `frontend/src/styles/contrast-pairs.ts`, not
   prose — the test reads the same list documented here.
3. Hero text contrast is validated separately: the build asserts that
   `--hero-overlay-alpha` for each published hero yields ≥4.5:1 between
   `--color-ink-inverse` and the composited overlay at its darkest sampled
   region. A hero failing this check fails the build with the page slug named.
