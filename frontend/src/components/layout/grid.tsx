import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/*
 * Grid — 06-COMPONENT-SPEC.md §Stack, Grid, SplitLayout. A responsive grid:
 * one column below `sm`, two at `sm`, the requested count at `lg`. `gap` is a
 * spacing token (05-DESIGN-SYSTEM.md §3); the class map keeps the value static
 * so Tailwind can see it — no arbitrary values.
 */

export type SpaceToken = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

export interface GridProps {
  columns: 2 | 3 | 4;
  gap?: SpaceToken;
  children: ReactNode;
}

// The count at `lg`; below that the layout is fixed at 1→2 for every variant.
const LG_COLUMNS = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
} as const satisfies Record<GridProps['columns'], string>;

const GAP = {
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
  16: 'gap-16',
} as const satisfies Record<SpaceToken, string>;

export function Grid({ columns, gap = 6, children }: GridProps): ReactNode {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2', LG_COLUMNS[columns], GAP[gap])}>
      {children}
    </div>
  );
}
