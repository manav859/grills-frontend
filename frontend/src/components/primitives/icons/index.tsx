import type { ReactNode } from 'react';

/*
 * Icon glyph data — the one permitted data/barrel module
 * (07-CODING-STANDARDS.md §1.1). Inline SVG on a 24×24 viewBox, `currentColor`
 * only (no hardcoded colour), no icon font and no runtime-fetched sprite.
 *
 * The complete 25-name inventory from 06-COMPONENT-SPEC.md §Icon is present, so
 * `IconName` matches the spec exactly and any component may reference any listed
 * glyph. The brand marks (facebook, google, tripadvisor, yelp, youtube) are
 * simplified single-colour line/solid representations drawn to this set's
 * conventions — recognisable, not pixel-accurate official logos, which is
 * appropriate for a currentColor icon system.
 */

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

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export const GLYPHS = {
  'arrow-right': (
    <path d="M4 12h15M13 6l6 6-6 6" {...STROKE} />
  ),
  'arrow-left': (
    <path d="M20 12H5M11 6l-6 6 6 6" {...STROKE} />
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" {...STROKE} />
      <path d="M8 3v4M16 3v4M3.5 9.5h17" {...STROKE} />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" {...STROKE} />,
  'chevron-down': <path d="M5 9l7 7 7-7" {...STROKE} />,
  'chevron-left': <path d="M15 5 8 12l7 7" {...STROKE} />,
  'chevron-right': <path d="M9 5l7 7-7 7" {...STROKE} />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" {...STROKE} />
      <path d="M12 7.5V12l3.2 2" {...STROKE} />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" {...STROKE} />,
  directions: (
    <>
      <path d="M11.3 2.7a1 1 0 0 1 1.4 0l8.6 8.6a1 1 0 0 1 0 1.4l-8.6 8.6a1 1 0 0 1-1.4 0l-8.6-8.6a1 1 0 0 1 0-1.4Z" {...STROKE} />
      <path d="M10 14v-2a1.5 1.5 0 0 1 1.5-1.5H15" {...STROKE} />
      <path d="M13.5 8.5 16 11l-2.5 2.5" {...STROKE} />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" {...STROKE} />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" {...STROKE} />
    </>
  ),
  facebook: (
    <path
      d="M13.4 21v-7.3h2.5l.4-2.9h-2.9V9c0-.8.3-1.4 1.5-1.4h1.5V5c-.3 0-1.3-.1-2.4-.1-2.3 0-3.9 1.4-3.9 4v2.1H7.5v2.9h2.6V21z"
      fill="currentColor"
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
  google: (
    <>
      <path d="M15.8 8.4A5.5 5.5 0 1 0 17.5 12.5" {...STROKE} />
      <path d="M17.5 12.5h-5" {...STROKE} />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.75" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="7.5" r="1.1" fill="currentColor" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" {...STROKE} />
      <path d="M4 7l8 5.5L20 7" {...STROKE} />
    </>
  ),
  'map-pin': (
    <>
      <path d="M12 21c4-4.5 6.5-7.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 13.4 8 16.5 12 21Z" {...STROKE} />
      <circle cx="12" cy="10.3" r="2.4" {...STROKE} />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" {...STROKE} />,
  music: (
    <>
      <path d="M9 18V6l9-2v10" {...STROKE} />
      <circle cx="6.5" cy="18" r="2.5" {...STROKE} />
      <circle cx="15.5" cy="16" r="2.5" {...STROKE} />
    </>
  ),
  phone: (
    <path
      d="M6.5 3h3l1.5 4-2 1.4a11 11 0 0 0 5 5l1.4-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5a2 2 0 0 1 2-2Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  ticket: (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" {...STROKE} />
      <path d="M14.5 7v10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="0.5 2.5" />
    </>
  ),
  tripadvisor: (
    <>
      <path d="M4 14a4 4 0 1 1 8 0 4 4 0 1 1 8 0" {...STROKE} />
      <circle cx="8" cy="13.5" r="1.4" fill="currentColor" />
      <circle cx="16" cy="13.5" r="1.4" fill="currentColor" />
      <path d="M8.5 9.5c2-1 5-1 7 0" {...STROKE} />
    </>
  ),
  utensils: (
    <>
      <path d="M8 3v6a2 2 0 0 0 4 0V3" {...STROKE} />
      <path d="M10 11v10" {...STROKE} />
      <path d="M16.5 3c-1.6 1.6-1.6 6.4 0 9v9" {...STROKE} />
    </>
  ),
  yelp: (
    <path
      d="M12 3.5v6.2M8 6.5l2.8 3.9M16 6.5l-2.8 3.9M9.2 17.2 11 13m1.8 4.2L11 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3.5" {...STROKE} />
      <path d="M10.5 9.8v4.4L15 12Z" fill="currentColor" />
    </>
  ),
} as const satisfies Record<IconName, ReactNode>;
