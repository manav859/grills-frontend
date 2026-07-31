import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/*
 * Skeleton — 06-COMPONENT-SPEC.md §Skeleton, Spinner, Divider, VisuallyHidden.
 * A placeholder block in --color-surface-sunken with a pulse that stops under
 * reduced motion (`motion-reduce:animate-none`). It is `aria-hidden`; the live
 * region announcing load state belongs to the parent, not here.
 *
 * `rect` and `circle` fill their container, so the caller reserves the box (an
 * `aspect-*` cell, for instance). `text` draws `lines` bars.
 */

export interface SkeletonProps {
  variant: 'text' | 'rect' | 'circle';
  lines?: number;
}

const BASE = 'bg-surface-sunken animate-pulse motion-reduce:animate-none';

export function Skeleton({ variant, lines = 3 }: SkeletonProps): ReactNode {
  if (variant === 'text') {
    return (
      <span aria-hidden="true" className="flex flex-col gap-2">
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className={cn(
              BASE,
              'block h-4 rounded-sm',
              index === lines - 1 ? 'w-2/3' : 'w-full',
            )}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        BASE,
        'block h-full w-full',
        variant === 'circle' ? 'rounded-full' : 'rounded-md',
      )}
    />
  );
}
