import type { ReactNode } from 'react';

import { PageBlockRenderer } from '@/components/blocks/page-block-renderer';
import { PageHeader } from '@/components/blocks/page-header';
import { PageShell } from '@/components/layout/page-shell';
import { getAbout } from '@/lib/api';

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
 * generateMetadata / JSON-LD is the SEO task; this slice renders the page body.
 */

export default async function AboutPage(): Promise<ReactNode> {
  const about = await getAbout();
  const { _global, title, blocks } = about;

  return (
    <PageShell global={_global} currentPath="/about">
      <PageHeader title={title} />

      <PageBlockRenderer blocks={blocks} headingLevelOffset={0} />
    </PageShell>
  );
}
