'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { Icon } from '@/components/primitives/icons/icon';
import { cn } from '@/lib/cn';
import {
  getMobileNavOpen,
  getMobileNavServerSnapshot,
  subscribeMobileNav,
} from '@/lib/mobile-nav-store';
import type { GlobalData } from '@/types/api';

/*
 * MobileCtaBar — 06-COMPONENT-SPEC.md §MobileCtaBar. A fixed bottom bar shown
 * below md with the two primary phone actions: Call and (food) Menu. It hides on
 * scroll-down past 200px and reappears on scroll-up or at the page ends, and is
 * hidden entirely while the drawer is open (read from the shared store).
 *
 * It is never aria-hidden: hiding is a transform, so the targets stay reachable
 * by keyboard and the transform is reversed on focus (focus-within). The shell's
 * <main> reserves --mobile-cta-bar-height below md (.gotg-has-mobile-bar) so the
 * bar never overlaps content. The server snapshot keeps it visible, matching the
 * first client paint — no layout shift on mount.
 */

export interface MobileCtaBarProps {
  global: GlobalData;
}

const HIDE_AFTER = 200;

export function MobileCtaBar({ global }: MobileCtaBarProps): ReactNode {
  const navOpen = useSyncExternalStore(
    subscribeMobileNav,
    getMobileNavOpen,
    getMobileNavServerSnapshot,
  );
  const [hidden, setHidden] = useState(false);

  const { location } = global;

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = (): void => {
      const y = window.scrollY;
      const atTop = y <= HIDE_AFTER;
      const atBottom =
        window.innerHeight + y >= document.documentElement.scrollHeight - 2;
      if (atTop || atBottom) {
        setHidden(false);
      } else if (y > lastY) {
        setHidden(true);
      } else if (y < lastY) {
        setHidden(false);
      }
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const style: CSSProperties = {
    zIndex: 'var(--z-mobile-bar)',
    minHeight: 'var(--mobile-cta-bar-height)',
    paddingBottom: 'env(safe-area-inset-bottom)',
  };

  const targetClasses =
    'flex items-center justify-center gap-2 font-body text-body font-semibold text-ink transition-colors hover:bg-surface-sunken';

  return (
    <nav
      aria-label="Quick actions"
      className={cn(
        'gotg-cta-bar fixed inset-x-0 bottom-0 grid grid-cols-2 border-t border-border bg-surface-raised md:hidden',
        'focus-within:translate-y-0',
        hidden || navOpen ? 'translate-y-full' : 'translate-y-0',
      )}
      style={style}
    >
      <a href={location.phoneHref} className={cn(targetClasses, 'border-r border-border')}>
        <Icon name="phone" size={20} />
        Call
      </a>
      <Link href="/menu" className={targetClasses}>
        <Icon name="flame" size={20} />
        Menu
      </Link>
    </nav>
  );
}
