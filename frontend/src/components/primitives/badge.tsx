import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/*
 * Badge — 06-COMPONENT-SPEC.md §Badge. Colour pairings per 05-DESIGN-SYSTEM.md
 * §1.5; colour is never the only signal, so the text carries the meaning. When
 * the visible text is an abbreviation, `title` supplies the expansion via
 * <abbr>.
 */

export interface BadgeProps {
  tone?: 'neutral' | 'green' | 'amber' | 'red' | 'brand';
  title?: string;
  children: ReactNode;
}

const TONE = {
  neutral: 'bg-surface-sunken text-ink',
  green: 'bg-success-subtle text-success',
  amber: 'bg-warning-subtle text-warning',
  red: 'bg-danger-subtle text-danger',
  brand: 'bg-brand-subtle text-brand',
} as const;

export function Badge({
  tone = 'neutral',
  title,
  children,
}: BadgeProps): ReactNode {
  const labelled = typeof title === 'string' && title.length > 0;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-1 font-body text-caption font-medium',
        TONE[tone],
      )}
    >
      {labelled ? (
        <abbr title={title} className="no-underline">
          {children}
        </abbr>
      ) : (
        children
      )}
    </span>
  );
}
