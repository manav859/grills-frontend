import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/*
 * Price — 06-COMPONENT-SPEC.md §Price. One money amount with an optional label.
 * Knows nothing about variants — PriceList composes it. Whole dollars render
 * without cents ($24); fractional amounts with two decimals ($13.50). Never a
 * heading.
 */

export interface PriceProps {
  amount: number;
  label?: string;
  size?: 'default' | 'large';
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export function Price({
  amount,
  label,
  size = 'default',
}: PriceProps): ReactNode {
  return (
    <span className="inline-flex items-baseline gap-2">
      {label !== undefined && label !== '' ? (
        <span className="font-body text-caption text-ink-muted">{label}</span>
      ) : null}
      <span
        className={cn(
          'font-body font-semibold text-ink tabular-nums',
          size === 'large' ? 'text-body-lg' : 'text-body',
        )}
      >
        {formatAmount(amount)}
      </span>
    </span>
  );
}
