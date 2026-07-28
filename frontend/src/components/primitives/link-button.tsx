import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icon } from '@/components/primitives/icons/icon';
import type { IconName } from '@/components/primitives/icons/index';
import { VisuallyHidden } from '@/components/primitives/visually-hidden';
import { cn } from '@/lib/cn';

/*
 * LinkButton — 06-COMPONENT-SPEC.md §LinkButton. Navigation styled as a button.
 * `next/link` for internal hrefs; a plain <a> for tel:/mailto: and external
 * links. External http(s) links open in a new tab with the documented rel and a
 * visually-hidden "(opens in a new tab)" suffix.
 *
 * Note: the spec's exact button heights (36/44/52px) are not expressible in the
 * token spacing scale (which skips steps 9/11/13), so sizes are padding-based
 * and each meets the 44×44 minimum touch target. Reported as a design-system
 * gap.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface LinkButtonProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isExternal?: boolean;
  iconStart?: IconName;
  iconEnd?: IconName;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT = {
  primary: 'bg-brand text-ink-inverse hover:bg-brand-hover active:bg-brand-active',
  secondary:
    'bg-surface-raised text-ink border border-border-interactive hover:bg-surface-sunken',
  ghost: 'text-ink hover:bg-surface-sunken',
  danger: 'bg-danger text-ink-inverse',
} as const;

const SIZE = {
  sm: 'px-3 py-3 text-label',
  md: 'px-5 py-3 text-body',
  lg: 'px-6 py-4 text-body-lg',
} as const;

function isDialHref(href: string): boolean {
  return href.startsWith('tel:') || href.startsWith('mailto:');
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  isExternal = false,
  iconStart,
  iconEnd,
  fullWidth = false,
  children,
}: LinkButtonProps): ReactNode {
  const className = cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-body font-semibold transition-colors active:translate-y-px',
    VARIANT[variant],
    SIZE[size],
    fullWidth && 'w-full',
  );

  const content = (
    <>
      {iconStart ? <Icon name={iconStart} size={20} /> : null}
      {children}
      {iconEnd ? <Icon name={iconEnd} size={20} /> : null}
    </>
  );

  // tel:/mailto: — a plain anchor, never a new tab.
  if (isDialHref(href)) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  // External web links open in a new tab, with the documented rel and suffix.
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
        <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
