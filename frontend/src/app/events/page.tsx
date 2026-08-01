import type { ReactNode } from 'react';

import { EventList } from '@/components/blocks/event-list';
import { PageBlockRenderer } from '@/components/blocks/page-block-renderer';
import { PageHeader } from '@/components/blocks/page-header';
import { RecurringProgrammeCard } from '@/components/blocks/recurring-programme-card';
import { PageShell } from '@/components/layout/page-shell';
import { getEvents } from '@/lib/api';

/*
 * Events route — 02-INFORMATION-ARCHITECTURE.md §2.3. One fetch, in this Server
 * Component, through the typed getEvents() helper (CLAUDE.md rule 1). Static +
 * ISR on the `events` tag / 900s window, configured in the fetch layer.
 *
 * Block order (02-IA §2.3): PageHeader → RecurringProgrammeCard (when present)
 * → upcoming EventList → any page-builder blocks. Past and private events are
 * excluded server-side (04-API-CONTRACT §5.3), so the route renders exactly
 * what `upcoming` provides, in the contract's start-ascending order.
 *
 * Heading outline: PageHeader owns the page <h1>; RecurringProgrammeCard and
 * EventList are each <h2>; event titles are <h3>. `headingLevelOffset={0}` keeps
 * any page blocks' top headings at <h2> under the same <h1>.
 *
 * generateMetadata / Event JSON-LD and the /events/[slug] detail route are the
 * SEO and detail tasks; this slice is the listing. events.blocks is empty for
 * this content — nothing is silently dropped.
 */

export default async function EventsPage(): Promise<ReactNode> {
  const events = await getEvents();
  const { _global, title, recurring, upcoming, emptyMessage, blocks } = events;

  return (
    <PageShell global={_global} currentPath="/events">
      <PageHeader title={title} />

      {recurring ? <RecurringProgrammeCard recurring={recurring} /> : null}

      <EventList
        events={upcoming}
        emptyMessage={emptyMessage}
        hasRecurring={recurring !== null}
        contactHref="/contact"
      />

      <PageBlockRenderer blocks={blocks} headingLevelOffset={0} />
    </PageShell>
  );
}
