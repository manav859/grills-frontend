import type { ReactNode } from 'react';

import { Price } from '@/components/primitives/price';
import type { PriceVariant } from '@/types/api';

/*
 * PriceList — 06-COMPONENT-SPEC.md §PriceList. Renders a menu item's full price
 * set: one variant or six, same component. A single variant emits no list
 * markup (a one-item list is screen-reader noise); two or more render a labelled
 * <ul>. Order is the editor's, never sorted by amount.
 *
 * Below md multiple variants render inline and wrap; at md and up they stack
 * right-aligned — a vertical stack per item would make a long menu much taller
 * on the phone, the device that matters most.
 */

export interface PriceListProps {
  variants: PriceVariant[];
  size?: 'default' | 'large';
}

export function PriceList({
  variants,
  size = 'default',
}: PriceListProps): ReactNode {
  // Guaranteed non-empty by the API (04-API-CONTRACT.md §2.1); guard anyway.
  if (variants.length === 0) {
    return null;
  }

  if (variants.length === 1) {
    const only = variants[0];
    if (!only) {
      return null;
    }
    return (
      <Price
        amount={only.amount}
        size={size}
        {...(only.label !== undefined ? { label: only.label } : {})}
      />
    );
  }

  return (
    <ul
      aria-label="Prices"
      className="flex flex-wrap gap-x-3 gap-y-1 md:flex-col md:items-end md:text-right"
    >
      {variants.map((variant, index) => (
        <li key={`${variant.label ?? 'price'}-${String(index)}`}>
          <Price
            amount={variant.amount}
            size={size}
            {...(variant.label !== undefined ? { label: variant.label } : {})}
          />
          {index < variants.length - 1 ? (
            <span aria-hidden="true" className="md:hidden">
              ,
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
