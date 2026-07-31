import type { ReactNode } from 'react';

/*
 * Icon glyph data — the one permitted data/barrel module
 * (07-CODING-STANDARDS.md §1.1). Inline SVG, `currentColor`, no icon font.
 *
 * Only the glyphs a shipped page needs are added; the full 24-name set in
 * 06-COMPONENT-SPEC.md §Icon is filled in as routes require them, rather than
 * pre-built. `IconName` is the union of what exists, so a component cannot ask
 * for a glyph that has not been drawn.
 */

export type IconName =
  | 'flame'
  | 'instagram'
  | 'chevron-left'
  | 'chevron-right';

export const GLYPHS = {
  'chevron-left': (
    <path
      d="M15 5 8 12l7 7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  'chevron-right': (
    <path
      d="M9 5l7 7-7 7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  flame: (
    <path
      d="M12 2c1 3-1.5 4.5-1.5 7A2.5 2.5 0 0 0 12 11a2.5 2.5 0 0 0 1.5-2.5C15 10 17 12 17 15a5 5 0 0 1-10 0c0-3 2-5 5-13Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  instagram: (
    <>
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle
        cx="12"
        cy="12"
        r="3.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="16.5" cy="7.5" r="1.1" fill="currentColor" />
    </>
  ),
} as const satisfies Record<IconName, ReactNode>;
