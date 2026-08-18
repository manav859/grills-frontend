import type { Metadata } from 'next';
import { Fragment } from 'react';
import type { ReactNode } from 'react';

import { DietaryLegend } from '@/components/blocks/dietary-legend';
import { MenuSection } from '@/components/blocks/menu-section';
import { PageHeader } from '@/components/blocks/page-header';
import { SectionDivider } from '@/components/brand/brand-decor';
import { Container } from '@/components/layout/container';
import { PageShell } from '@/components/layout/page-shell';
import { Section } from '@/components/layout/section';
import { Heading } from '@/components/primitives/heading';
import { Text } from '@/components/primitives/text';
import { JsonLd } from '@/components/seo/json-ld';
import { getMenu } from '@/lib/api';
import { menuJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const menu = await getMenu();
  return buildMetadata(menu.seo, menu._global, '/menu');
}

/*
 * Menu route — 02-INFORMATION-ARCHITECTURE.md §2.2. One fetch, in this Server
 * Component, through the typed getMenu() helper (CLAUDE.md rule 1). Static + ISR
 * on the `menu` tag / 3600s window, configured in the fetch layer.
 *
 * Block order: header → page intro → menu sections → dietary legend →
 * disclaimer → footer. The daypart filter and section jump-nav (both Client
 * Components) are deferred; the full, unfiltered menu renders and is indexable
 * without them.
 *
 * generateMetadata builds metadata from `menu.seo` (08 §4.2); JsonLd emits the
 * Menu + MenuSection + MenuItem graph (08 §4.5). Not rendered here: menu.blocks
 * (the page-builder blocks are a separate task); it is empty for this content,
 * so nothing is silently dropped.
 */

export default async function MenuPage(): Promise<ReactNode> {
  const menu = await getMenu();
  const {
    _global,
    title,
    sections,
    dietaryTags,
    showDietaryLegend,
    disclaimer,
  } = menu;

  const showLegend = showDietaryLegend && dietaryTags.length > 0;

  return (
    <PageShell global={_global} currentPath="/menu">
      <JsonLd data={menuJsonLd(_global, sections)} />
      <PageHeader title={title} />

      <Section>
        <Container>
          {sections.length === 0 ? (
            <Text tone="muted">
              Our menu is being updated. Please call {_global.location.phone}.
            </Text>
          ) : (
            <div className="flex flex-col gap-16">
              {sections.map((section, index) => (
                <Fragment key={section.slug}>
                  {/* A flag divider between sections, never above the first —
                      a rule at the top of a list separates it from nothing. */}
                  {index > 0 ? <SectionDivider /> : null}
                  <MenuSection section={section} activeDaypart="all" />
                </Fragment>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {showLegend ? (
        <Section tone="sunken" ariaLabelledBy="dietary-legend-heading">
          <Container width="narrow">
            <div className="flex flex-col gap-6">
              <Heading level={2} id="dietary-legend-heading">
                Dietary Information
              </Heading>
              <DietaryLegend tags={dietaryTags} />
            </div>
          </Container>
        </Section>
      ) : null}

      {disclaimer !== '' ? (
        <Section spacing="tight">
          <Container width="narrow">
            <Text size="body-sm" tone="muted">
              {disclaimer}
            </Text>
          </Container>
        </Section>
      ) : null}
    </PageShell>
  );
}
