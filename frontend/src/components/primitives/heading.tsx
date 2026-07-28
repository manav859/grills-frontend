import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/*
 * Heading — 06-COMPONENT-SPEC.md §Heading.
 * `level` sets the semantic tag; `visualLevel` sets the type token, so a
 * visually large heading can still sit at the right depth in the outline.
 */

export interface HeadingProps {
  level: 1 | 2 | 3 | 4;
  visualLevel?: 'display' | 'h1' | 'h2' | 'h3' | 'h4';
  id?: string;
  children: ReactNode;
}

const VISUAL_SIZE = {
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  h4: 'text-h4',
} as const;

// Weights follow the type scale in 05-DESIGN-SYSTEM.md §2.3.
const VISUAL_WEIGHT = {
  display: 'font-bold',
  h1: 'font-bold',
  h2: 'font-bold',
  h3: 'font-semibold',
  h4: 'font-semibold',
} as const;

const DEFAULT_VISUAL = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
} as const satisfies Record<HeadingProps['level'], HeadingProps['visualLevel']>;

export function Heading({
  level,
  visualLevel,
  id,
  children,
}: HeadingProps): ReactNode {
  const visual = visualLevel ?? DEFAULT_VISUAL[level];
  const className = cn(
    'font-display text-ink text-balance',
    VISUAL_SIZE[visual],
    VISUAL_WEIGHT[visual],
  );

  const Tag = `h${String(level)}` as 'h1' | 'h2' | 'h3' | 'h4';

  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
}
