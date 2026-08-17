import Link from 'next/link';
import type { ReactNode } from 'react';

import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/layout/container';
import { MobileCtaBar } from '@/components/navigation/mobile-cta-bar';
import { MobileNav } from '@/components/navigation/mobile-nav';
import { PrimaryNav } from '@/components/navigation/primary-nav';
import { SiteFooter } from '@/components/navigation/site-footer';
import { SiteHeader } from '@/components/navigation/site-header';
import { SkipLink } from '@/components/navigation/skip-link';
import { LinkButton } from '@/components/primitives/link-button';
import type { GlobalData } from '@/types/api';

/*
 * PageShell — 06-COMPONENT-SPEC.md §PageShell. The frame every route renders
 * inside; owns the landmark structure (skip link, banner, main, contentinfo).
 *
 * `currentPath` is added to the spec's props so the server-rendered PrimaryNav
 * can mark the active item — PrimaryNav is a Server Component (not in the client
 * register), so it cannot read the pathname from a client hook.
 *
 * Below md the desktop nav and header CTA are hidden; the MobileNav hamburger
 * (in the header) and the fixed MobileCtaBar (Call / Menu) take over. Both are
 * Client Components; the rest of the shell stays a Server Component. `main`
 * carries .gotg-has-mobile-bar so the fixed bar never overlaps content.
 *
 * Still deferred: AnnouncementBar (only when global.announcement !== null; null
 * here).
 */

export interface PageShellProps {
  global: GlobalData;
  currentPath: string;
  children: ReactNode;
}

export function PageShell({
  global,
  currentPath,
  children,
}: PageShellProps): ReactNode {
  const { site, navigation } = global;

  return (
    <>
      <SkipLink />
      <SiteHeader variant="solid">
        <Container as="div">
          <div className="flex items-center justify-between gap-4">
            {/* The link owns the accessible name; Logo renders alt="" so the
                name is announced once, not twice. */}
            <Link
              href="/"
              className="flex shrink-0 items-center"
              aria-label={site.name}
            >
              <Logo variant="primary" height="header" priority />
            </Link>
            <div className="flex items-center gap-6">
              <PrimaryNav
                items={navigation.primary}
                currentPath={currentPath}
              />
              <div className="hidden md:block">
                <LinkButton
                  href={navigation.headerCta.href}
                  variant="primary"
                  isExternal={navigation.headerCta.isExternal}
                >
                  {navigation.headerCta.label}
                </LinkButton>
              </div>
              <MobileNav global={global} />
            </div>
          </div>
        </Container>
      </SiteHeader>

      <main id="main-content" tabIndex={-1} className="gotg-has-mobile-bar">
        {children}
      </main>

      <SiteFooter global={global} />

      <MobileCtaBar global={global} />
    </>
  );
}
