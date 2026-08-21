import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/layout/container';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { Text } from '@/components/primitives/text';

/*
 * 404 — deliberately data-free.
 *
 * Every other route composes PageShell, which needs `_global` from WordPress.
 * An error page that fetches is an error page that can fail: a 404 served while
 * the CMS is unreachable would throw and become a 500. So this route renders
 * from static assets and tokens only, with no header, no footer, and no fetch.
 *
 * That is why the flag mark is the right lockup here rather than the horizontal
 * one — there is no header above it to be consistent with, so the mark stands
 * alone as the identity and carries the alt text itself.
 */

export const metadata = {
  title: 'Page not found',
};

export default function NotFound(): ReactNode {
  const style: CSSProperties = { minHeight: '70svh' };

  return (
    <main id="main-content" className="flex items-center" style={style}>
      <Container width="narrow">
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <Logo variant="mark" height="badge" alt="Grill on the Green" />

          <Heading level={1} visualLevel="h1">
            We could not find that page
          </Heading>

          <Text size="body-lg" tone="muted">
            It may have moved, or the link may be out of date. The menu and the
            opening hours are both a click away.
          </Text>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <div className="w-full sm:w-auto sm:shrink-0">
              <LinkButton href="/" variant="primary" size="lg" fullWidth>
                Back to home
              </LinkButton>
            </div>
            <div className="w-full sm:w-auto sm:shrink-0">
              <LinkButton href="/menu" variant="secondary" size="lg" fullWidth>
                View the menu
              </LinkButton>
            </div>
          </div>

          <Link
            href="/contact"
            className="font-body text-body-sm text-brand font-semibold underline"
          >
            Contact and opening hours
          </Link>
        </div>
      </Container>
    </main>
  );
}
