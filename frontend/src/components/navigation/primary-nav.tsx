import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type { LinkObject } from '@/types/api';

/*
 * PrimaryNav — 06-COMPONENT-SPEC.md §PrimaryNav. Horizontal, md and up only.
 * Active item carries aria-current="page", a brand underline, and semibold
 * weight (never colour alone). Active is exact match, or prefix for /events so
 * /events/[slug] keeps Events current.
 */

export interface PrimaryNavProps {
  items: LinkObject[];
  currentPath: string;
}

function isActive(href: string, currentPath: string): boolean {
  if (href === '/events') {
    return currentPath === '/events' || currentPath.startsWith('/events/');
  }
  return currentPath === href;
}

export function PrimaryNav({ items, currentPath }: PrimaryNavProps): ReactNode {
  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul className="flex items-center gap-6">
        {items.map((item) => {
          const active = isActive(item.href, currentPath);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'font-body text-label text-ink transition-colors hover:text-brand',
                  active
                    ? 'border-b-2 border-brand pb-1 font-semibold'
                    : 'font-medium',
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
