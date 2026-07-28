import Link from 'next/link';
import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
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
 * Deferred, both Client Components not needed to render this route honestly:
 * AnnouncementBar (only when global.announcement !== null; null here) and
 * MobileCtaBar / MobileNav (the below-md hamburger and call bar). Below md the
 * header shows the brand and the call CTA, and the footer carries full nav.
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
            <Link
              href="/"
              className="font-display text-h3 font-bold text-ink"
              aria-label={site.name}
            >
              {site.name}
            </Link>
            <div className="flex items-center gap-6">
              <PrimaryNav
                items={navigation.primary}
                currentPath={currentPath}
              />
              <LinkButton
                href={navigation.headerCta.href}
                variant="primary"
                isExternal={navigation.headerCta.isExternal}
              >
                {navigation.headerCta.label}
              </LinkButton>
            </div>
          </div>
        </Container>
      </SiteHeader>

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      <SiteFooter global={global} />
    </>
  );
}
