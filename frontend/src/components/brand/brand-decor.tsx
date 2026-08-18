import NextImage from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import flagSketchCream from '../../../public/brand/decor/flag-sketch-cream.png';
import flagSketch from '../../../public/brand/decor/flag-sketch.png';
import scriptWordmark from '../../../public/brand/decor/script-wordmark.png';

/*
 * Brand decoration — 05-DESIGN-SYSTEM.md §0, 06-COMPONENT-SPEC.md §Brand decor.
 *
 * The client's own supporting graphics used as texture, so the page reads as
 * something designed rather than as flat bands of colour. Everything here is
 * decorative in the strict sense: `aria-hidden`, `pointer-events-none`, never
 * carrying meaning, and never the only way to perceive anything.
 *
 * These are the supporting elements only — the flag sketch and the script
 * wordmark. The red-flag horizontal lockup remains the one identity and is
 * never repeated as decoration, and the alternate grill-illustration concepts
 * from the branding deck are deliberately not introduced.
 *
 * Contrast: a watermark sits behind text, so at its worst a stroke lands
 * directly under a glyph. At `opacity-10` on cream the effective background is
 * #E3E6DF, which still gives ink 14.97:1 and a green heading 8.69:1 — both far
 * above AA. On brand green the cream watermark is held to `opacity-5`, because
 * at 0.12 muted cream text drops to 4.38:1 and fails. Figures in
 * 05-DESIGN-SYSTEM.md §1.6.
 */

export type WatermarkArt = 'flag' | 'script';
export type WatermarkPlacement = 'right' | 'left' | 'center';

export interface BrandWatermarkProps {
  art?: WatermarkArt;
  placement?: WatermarkPlacement;
  /** `inverse` swaps to the cream sketch and drops opacity for dark bands. */
  tone?: 'default' | 'inverse';
}

const PLACEMENT = {
  right: 'right-0 top-0 translate-x-1/4 -translate-y-1/6',
  left: 'left-0 bottom-0 -translate-x-1/4 translate-y-1/6',
  center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
} as const satisfies Record<WatermarkPlacement, string>;

/*
 * Sized in viewport units so the watermark scales with the band rather than
 * with the text, and capped so it never becomes a background image on a wide
 * monitor. `vmax` keeps it generous on mobile, where sections are short.
 */
const ART_SIZE = {
  flag: 'min(46vmax, 520px)',
  script: 'min(80vmax, 900px)',
} as const satisfies Record<WatermarkArt, string>;

export function BrandWatermark({
  art = 'flag',
  placement = 'right',
  tone = 'default',
}: BrandWatermarkProps): ReactNode {
  const inverse = tone === 'inverse';
  const src =
    art === 'script' ? scriptWordmark : inverse ? flagSketchCream : flagSketch;
  const style: CSSProperties = { width: ART_SIZE[art], height: 'auto' };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute select-none',
        PLACEMENT[placement],
        inverse ? 'opacity-5' : 'opacity-10',
      )}
    >
      <NextImage src={src} alt="" sizes="900px" style={style} />
    </div>
  );
}

export interface BrandAccentProps {
  /** Rendered height; width follows the asset's ratio. */
  size?: 'sm' | 'md';
  tone?: 'default' | 'inverse';
  className?: string;
}

const ACCENT_HEIGHT = {
  sm: 'var(--space-5)',
  md: 'var(--space-8)',
} as const satisfies Record<NonNullable<BrandAccentProps['size']>, string>;

/*
 * The small flag beside a section title. Full strength — it sits next to text,
 * not under it, so it is a graphic object at 4.00:1 against cream, above the
 * 3:1 non-text floor, and it carries no meaning the heading does not.
 */
export function BrandAccent({
  size = 'sm',
  tone = 'default',
  className,
}: BrandAccentProps): ReactNode {
  const style: CSSProperties = { height: ACCENT_HEIGHT[size], width: 'auto' };

  return (
    <span
      aria-hidden="true"
      className={cn('pointer-events-none inline-flex shrink-0', className)}
    >
      <NextImage
        src={tone === 'inverse' ? flagSketchCream : flagSketch}
        alt=""
        sizes="48px"
        style={style}
      />
    </span>
  );
}

/*
 * A divider between major bands: a centred flag flanked by hairlines. Replaces
 * nothing structural — the sections are still separate landmarks — so it is
 * purely visual and hidden from assistive tech.
 */
export function SectionDivider({
  tone = 'default',
}: {
  tone?: 'default' | 'inverse';
}): ReactNode {
  const rule = tone === 'inverse' ? 'bg-border-inverse' : 'bg-border';
  const style: CSSProperties = { height: 'var(--border-width)' };

  return (
    <div aria-hidden="true" className="flex items-center gap-4">
      <span className={cn('flex-1', rule)} style={style} />
      <BrandAccent size="md" tone={tone} />
      <span className={cn('flex-1', rule)} style={style} />
    </div>
  );
}
