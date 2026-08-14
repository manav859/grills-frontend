import type { ReactNode } from 'react';

import { Text } from '@/components/primitives/text';
import {
  formatCalendarDate,
  formatWallClockTime,
  pacificTodayISODate,
} from '@/lib/datetime';
import type { Hours, HoursException, Weekday } from '@/types/api';

/*
 * HoursTable — 06-COMPONENT-SPEC.md §HoursTable. A <table> of the weekly opening
 * hours with a screen-reader caption and a <th scope="row"> per weekday; each
 * cell reads "6:00 AM – 9:00 PM" or "Closed". Server Component.
 *
 * `highlightToday` is intentionally NOT applied here: the spec routes today's
 * highlight through HoursStatus's client `todayIndex` so the server emits no
 * day-dependent markup and cannot hydrate-mismatch. HoursStatus is a
 * mobile/header component outside this task; the table renders un-highlighted.
 *
 * Exceptions: the spec's "next 14 days" window is widened to "all upcoming"
 * (date >= today, Pacific) so the seeded Thanksgiving closure — the only
 * exception in the data and ~3 months out — is not silently dropped. Flagged for
 * the intended window to be confirmed. Filtering runs server-side only, so there
 * is no hydration concern.
 */

export interface HoursTableProps {
  hours: Hours;
  highlightToday?: boolean;
}

const DAY_LABEL: Record<Weekday, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

function exceptionHoursLabel(exception: HoursException): string {
  if (exception.isClosed || exception.opens === undefined || exception.closes === undefined) {
    return 'Closed';
  }
  return `${formatWallClockTime(exception.opens)} – ${formatWallClockTime(exception.closes)}`;
}

export function HoursTable({ hours }: HoursTableProps): ReactNode {
  const today = pacificTodayISODate();
  const upcomingExceptions = hours.exceptions
    .filter((exception) => exception.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-4">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Opening hours</caption>
        <tbody>
          {hours.regular.map((row) => (
            <tr key={row.day} className="border-b border-border">
              <th
                scope="row"
                className="py-2 pr-6 font-body font-medium text-ink"
              >
                {DAY_LABEL[row.day]}
              </th>
              <td className="py-2 text-right font-body tabular-nums text-ink-muted">
                {row.isClosed
                  ? 'Closed'
                  : `${formatWallClockTime(row.opens)} – ${formatWallClockTime(row.closes)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {upcomingExceptions.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {upcomingExceptions.map((exception) => (
            <li key={exception.date}>
              <Text size="body-sm" tone="muted">
                {exception.label}, {formatCalendarDate(exception.date)} —{' '}
                {exceptionHoursLabel(exception)}
              </Text>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
