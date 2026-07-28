import type { ReactNode } from 'react';

import { DietaryLegend } from '@/components/blocks/dietary-legend';
import { MenuSection } from '@/components/blocks/menu-section';
import { PageHeader } from '@/components/blocks/page-header';
import { Container } from '@/components/layout/container';
import { PageShell } from '@/components/layout/page-shell';
import { Section } from '@/components/layout/section';
import { Heading } from '@/components/primitives/heading';
import { Text } from '@/components/primitives/text';
import { getMenu } from '@/lib/api';

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
 * Not rendered here: menu.blocks (the page-builder blocks — PageBlockRenderer
 * and the block library are a separate task) and generateMetadata / JSON-LD
 * (the SEO task, 08-PERFORMANCE-SEO-A11Y.md). menu.blocks is empty for this
 * content; nothing is silently dropped.
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
      <PageHeader title={title} />

      <Section>
        <Container>
          {sections.length === 0 ? (
            <Text tone="muted">
              Our menu is being updated. Please call {_global.location.phone}.
            </Text>
          ) : (
            <div className="flex flex-col gap-16">
              {sections.map((section) => (
                <MenuSection
                  key={section.slug}
                  section={section}
                  activeDaypart="all"
                />
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
