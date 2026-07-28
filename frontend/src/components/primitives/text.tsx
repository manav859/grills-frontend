import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/*
 * Text — 06-COMPONENT-SPEC.md §Text. `tone="subtle"` is intentionally absent:
 * --color-ink-subtle is reserved for input placeholders.
 */

export interface TextProps {
  as?: 'p' | 'span' | 'div';
  size?: 'body-lg' | 'body' | 'body-sm' | 'caption' | 'overline';
  tone?: 'default' | 'muted' | 'inverse' | 'inverse-muted';
  weight?: 'regular' | 'medium' | 'semibold';
  id?: string;
  children: ReactNode;
}

const SIZE = {
  'body-lg': 'text-body-lg',
  body: 'text-body',
  'body-sm': 'text-body-sm',
  caption: 'text-caption',
  overline: 'text-overline uppercase',
} as const;

const TONE = {
  default: 'text-ink',
  muted: 'text-ink-muted',
  inverse: 'text-ink-inverse',
  'inverse-muted': 'text-ink-inverse-muted',
} as const;

const WEIGHT = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
} as const;

export function Text({
  as = 'p',
  size = 'body',
  tone = 'default',
  weight = 'regular',
  id,
  children,
}: TextProps): ReactNode {
  const Tag = as;
  return (
    <Tag
      id={id}
      className={cn('font-body', SIZE[size], TONE[tone], WEIGHT[weight])}
    >
      {children}
    </Tag>
  );
}
