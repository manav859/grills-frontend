import type { Weekday } from '@/types/api';

/*
 * Date and time formatting, pinned to the restaurant's timezone.
 *
 * Every event date and time renders in America/Los_Angeles regardless of where
 * the server or the visitor is, so the string a visitor reads is the event's
 * actual Pacific date. The zone is pinned by passing `timeZone` to every
 * `Intl.DateTimeFormat` here — never by relying on the runtime's local zone.
 * With a fixed zone the server and client produce identical output, so there is
 * no hydration mismatch.
 *
 * Event helpers take the ISO-8601 `startDateTime`/`endDateTime` strings, which
 * already carry the Pacific offset (e.g. `-07:00`); `new Date` parses the
 * absolute instant and the formatter re-expresses it in the pinned zone.
 *
 * The recurring programme's `starts`/`ends` are zoneless `HH:MM` wall-clock
 * strings (a standing weekly time, not a dated instant), so they are formatted
 * as literal wall-clock, not converted through any zone.
 */

export const PACIFIC_TIME_ZONE = 'America/Los_Angeles';

const monthFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: PACIFIC_TIME_ZONE,
  month: 'short',
});
const dayFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: PACIFIC_TIME_ZONE,
  day: 'numeric',
});
const timeFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: PACIFIC_TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit',
});

/** Short month for an ISO datetime, in Pacific — e.g. "Aug". */
export function formatEventMonth(iso: string): string {
  return monthFormat.format(new Date(iso));
}

/** Day of month for an ISO datetime, in Pacific — e.g. "7". */
export function formatEventDay(iso: string): string {
  return dayFormat.format(new Date(iso));
}

/** Time of day for an ISO datetime, in Pacific — e.g. "6:00 PM". */
export function formatEventTime(iso: string): string {
  return timeFormat.format(new Date(iso));
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

/** Weekdays as a pluralised conjunction list — e.g. "Fridays and Saturdays". */
export function formatWeekdaysPlural(days: Weekday[]): string {
  return dayListFormat.format(days.map((day) => DAY_PLURAL[day]));
}

/** Splits a zoneless "HH:MM" into a 12-hour label and am/pm suffix. */
function clockParts(value: string): { label: string; suffix: 'am' | 'pm' } {
  const [hRaw = '0', mRaw = '00'] = value.split(':');
  const hour = Number(hRaw);
  const suffix = hour < 12 ? 'am' : 'pm';
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  const label = mRaw === '00' ? String(twelve) : `${String(twelve)}:${mRaw}`;
  return { label, suffix };
}

/**
 * Labels for a wall-clock range, collapsing a shared suffix so a same-meridiem
 * range reads "6–9pm" rather than "6pm–9pm". Returns the two visible labels;
 * the caller supplies the raw values as the `<time datetime>` attributes.
 */
export function formatWallClockRange(
  starts: string,
  ends: string,
): { startLabel: string; endLabel: string } {
  const start = clockParts(starts);
  const end = clockParts(ends);
  const startLabel =
    start.suffix === end.suffix
      ? start.label
      : `${start.label}${start.suffix}`;
  return { startLabel, endLabel: `${end.label}${end.suffix}` };
}
