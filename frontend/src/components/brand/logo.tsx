import NextImage from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

import flagMark from '../../../public/brand/flag-mark.png';
import logoHorizontal from '../../../public/brand/logo-horizontal.png';
import logoReverse from '../../../public/brand/logo-reverse.png';

/*
 * Logo — 06-COMPONENT-SPEC.md §Logo.
 *
 * This is the second and only other place `next/image` is used directly; the
 * Image primitive is typed to the CMS `ImageObject` contract, and these are
 * build-time static assets with no CMS record. Static imports give Next the
 * intrinsic dimensions at compile time, so the reserved box is exact and the
 * logo cannot shift the header as it decodes.
 *
 * | variant   | Asset                 | Intended surface       |
 * | primary   | logo-horizontal.png   | Header, on cream/white |
 * | reverse   | logo-reverse.png      | Footer, on brand green |
 * | mark      | flag-mark.png         | Compact, on cream      |
 *
 * Height comes from a token and width is `auto`, so the lockup's 2.293:1 ratio
 * lives in the asset rather than being restated as a second token that could
 * drift from it.
 *
 * The logo is a mark, not text: it carries no alt text of its own here. Callers
 * wrap it in the link or heading that owns the accessible name — PageShell's
 * home link is labelled "Grill on the Green" — which keeps a screen reader from
 * announcing the name twice.
 */

export type LogoVariant = 'primary' | 'reverse' | 'mark';

const ASSET = {
  primary: logoHorizontal,
  reverse: logoReverse,
  mark: flagMark,
} as const satisfies Record<LogoVariant, typeof logoHorizontal>;

export interface LogoProps {
  variant?: LogoVariant;
  /** Token driving rendered height. Width follows from the asset's ratio. */
  height?: 'header' | 'footer';
  priority?: boolean;
  className?: string;
}

const HEIGHT_TOKEN = {
  header: 'var(--logo-height)',
  footer: 'var(--logo-height-footer)',
} as const satisfies Record<NonNullable<LogoProps['height']>, string>;

/*
 * `sizes` is given in the largest CSS pixel width the image is ever rendered
 * at, so Next requests a 2x source for retina and no more. The header lockup
 * tops out at 56px tall (128px wide) and the footer at 68px (156px wide); the
 * flag mark is near-square, so its width is close to its height.
 */
const SIZES = {
  primary: '(min-width: 768px) 128px, 101px',
  reverse: '(min-width: 768px) 156px, 129px',
  mark: '(min-width: 768px) 52px, 41px',
} as const satisfies Record<LogoVariant, string>;

export function Logo({
  variant = 'primary',
  height = 'header',
  priority = false,
  className,
}: LogoProps): ReactNode {
  const style: CSSProperties = { height: HEIGHT_TOKEN[height], width: 'auto' };

  return (
    <NextImage
      src={ASSET[variant]}
      alt=""
      sizes={SIZES[variant]}
      priority={priority}
      quality={90}
      className={className}
      style={style}
    />
  );
}
