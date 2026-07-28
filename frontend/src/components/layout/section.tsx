import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/cn';

/*
 * Section — 06-COMPONENT-SPEC.md §Section. Vertical padding is --section-y
 * (48px mobile / 96px desktop, via the token's media query); `tight` halves it.
 * An unlabelled <section> is prohibited: when it contains a heading, pass
 * `ariaLabelledBy` with that heading's id.
 */

export interface SectionProps {
  tone?: 'surface' | 'sunken' | 'inverse';
  spacing?: 'default' | 'tight' | 'none';
  id?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
}

const TONE = {
  surface: 'bg-surface text-ink',
  sunken: 'bg-surface-sunken text-ink',
  inverse: 'bg-surface-inverse text-ink-inverse',
} as const;

const PADDING_BLOCK = {
  default: 'var(--section-y)',
  tight: 'calc(var(--section-y) / 2)',
  none: '0',
} as const;

export function Section({
  tone = 'surface',
  spacing = 'default',
  id,
  ariaLabelledBy,
  children,
}: SectionProps): ReactNode {
  const style: CSSProperties = { paddingBlock: PADDING_BLOCK[spacing] };

  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(TONE[tone])}
      style={style}
    >
      {children}
    </section>
  );
}
