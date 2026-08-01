import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Heading } from '@/components/primitives/heading';
import { Text } from '@/components/primitives/text';
import { slugId } from '@/lib/slug';
import type { RecurringProgramme, Weekday } from '@/types/api';

/*
 * RecurringProgrammeCard — 06-COMPONENT-SPEC.md §EventHero/RecurringProgrammeCard.
 * The standing weekly programme (live music), which is NOT an event record and
 * so is presented as a distinct highlighted panel above the dated listing.
 *
 * Heading is level 2. Days render as a readable conjunction list
 * ("Fridays and Saturdays") and the wall-clock time range as "6–9pm", both in
 * the restaurant's Pacific context — starts/ends are zoneless HH:MM strings, so
 * they are formatted as literal wall-clock, not converted. (The shared Pacific
 * date/time helpers land in the next commit; formatting is inline here.)
 */

export interface RecurringProgrammeCardProps {
  recurring: RecurringProgramme;
}

const DAY_PLURAL = {
  monday: 'Mondays',
  tuesday: 'Tuesdays',
  wednesday: 'Wednesdays',
  thursday: 'Thursdays',
  friday: 'Fridays',
  saturday: 'Saturdays',
  sunday: 'Sundays',
} as const satisfies Record<Weekday, string>;

const dayListFormat = new Intl.ListFormat('en-US', {
  style: 'long',
  type: 'conjunction',
});

/** Splits a zoneless "HH:MM" into a 12-hour hour label, minutes, and am/pm. */
function clockParts(value: string): { label: string; suffix: 'am' | 'pm' } {
  const [hRaw = '0', mRaw = '00'] = value.split(':');
  const hour = Number(hRaw);
  const suffix = hour < 12 ? 'am' : 'pm';
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  const label = mRaw === '00' ? String(twelve) : `${String(twelve)}:${mRaw}`;
  return { label, suffix };
}

export function RecurringProgrammeCard({
  recurring,
}: RecurringProgrammeCardProps): ReactNode {
  const headingId = slugId('recurring', recurring.heading);

  const daysLabel = dayListFormat.format(
    recurring.days.map((day) => DAY_PLURAL[day]),
  );

  const start = clockParts(recurring.starts);
  const end = clockParts(recurring.ends);
  // Collapse a shared suffix: "6–9pm" rather than "6pm–9pm".
  const startLabel =
    start.suffix === end.suffix ? start.label : `${start.label}${start.suffix}`;
  const endLabel = `${end.label}${end.suffix}`;

  return (
    <Section spacing="tight" ariaLabelledBy={headingId}>
      <Container>
        <div className="flex flex-col gap-3 rounded-lg border border-oak bg-surface-raised p-6 shadow-sm md:p-8">
          <Text as="span" size="overline" tone="muted" weight="semibold">
            {daysLabel} ·{' '}
            <time dateTime={recurring.starts}>{startLabel}</time>–
            <time dateTime={recurring.ends}>{endLabel}</time>
          </Text>
          <Heading level={2} id={headingId}>
            {recurring.heading}
          </Heading>
          <Text size="body-lg" tone="muted">
            {recurring.body}
          </Text>
        </div>
      </Container>
    </Section>
  );
}
