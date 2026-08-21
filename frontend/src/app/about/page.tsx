import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { PageBlockRenderer } from '@/components/blocks/page-block-renderer';
import { PageHeader } from '@/components/blocks/page-header';
import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/layout/container';
import { PageShell } from '@/components/layout/page-shell';
import { Section } from '@/components/layout/section';
import { getAbout } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  return buildMetadata(about.seo, about._global, '/about');
}

/*
 * About route — 02-INFORMATION-ARCHITECTURE.md §2.5. One fetch, in this Server
 * Component, through the typed getAbout() helper (CLAUDE.md rule 1). Static + ISR
 * on the `about` tag / 86400s window, configured in the fetch layer.
 *
 * The page is composition only: PageHeader owns the page <h1>, then the flexible
 * page blocks (04-API-CONTRACT §5.4 — the whole body is `blocks[]`; there is no
 * separate intro/people/cta field) render in editor order through the shared
 * PageBlockRenderer. The seeded About page composes text → split_feature →
 * gallery → people → cta_band, but the route makes no assumption about which
 * blocks are present or their order — an omitted block simply does not render.
 *
 * Heading outline: PageHeader is the <h1>; every block's top heading is <h2>
 * (`headingLevelOffset={0}`, blocks sit directly under the page <h1>), and the
 * nested headings each block owns (PersonCard names are <h3>) follow from there,
 * so the outline never skips a level.
 *
 * generateMetadata builds title/description/OG/canonical from `about.seo` and
 * defaults (08 §4.2). No JSON-LD node is placed on /about (08 §4.5).
 */

export default async function AboutPage(): Promise<ReactNode> {
  const about = await getAbout();
  const { _global, title, blocks } = about;

  return (
    <PageShell global={_global} currentPath="/about">
      <PageHeader title={title} />

      {/*
       * The stacked badge as a credibility anchor. It is the one lockup that
       * carries "since 2024", which is why it belongs on the page telling the
       * story rather than in the chrome. Green on cream is 10.31:1, and it sits
       * on its own band so it never competes with the header lockup above it.
       *
       * This is the only place the logo is the sole carrier of the name, so it
       * is the only place Logo is given real alt text.
       */}
      <Section spacing="tight">
        <Container>
          <div className="flex justify-center">
            <Logo
              variant="stacked"
              height="badge"
              alt="Grill on the Green, since 2024"
            />
          </div>
        </Container>
      </Section>

      <PageBlockRenderer blocks={blocks} headingLevelOffset={0} />
    </PageShell>
  );
}
