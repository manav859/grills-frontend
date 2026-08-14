import type { ReactNode } from 'react';

import { Text } from '@/components/primitives/text';
import type { Location } from '@/types/api';

/*
 * MapEmbed — 06-COMPONENT-SPEC.md §MapEmbed. The spec's default `static` variant
 * is a Google Static Maps image built from the location's coordinates, wrapped
 * in a link to `directionsUrl`.
 *
 * PENDING (09-INTEGRATIONS.md §8): Google Static Maps is "pending client
 * approval" and needs an API key that is not configured. Rather than block on a
 * key or render a broken <img>, this renders a graceful, keyless placeholder —
 * a styled panel that IS the directions link — so the section is usable now and
 * upgrades to the real static image once the key lands. Flagged, not invented.
 *
 * `interactive` (an <iframe>) is deliberately not built: it sets third-party
 * cookies and costs ~900 KB (09 §8), and is opt-in only.
 */

export interface MapEmbedProps {
  location: Location;
  variant?: 'static' | 'interactive';
}

export function MapEmbed({ location }: MapEmbedProps): ReactNode {
  const accessibleName = `Open directions to ${location.name} in Google Maps`;

  return (
    <a
      href={location.directionsUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={accessibleName}
      className="group block overflow-hidden rounded-lg border border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-interactive"
    >
      <div className="flex aspect-16-9 w-full flex-col items-center justify-center gap-2 bg-surface-sunken p-6 text-center transition-colors group-hover:bg-surface-raised">
        <Text as="span" weight="semibold">
          {location.name}
        </Text>
        <Text as="span" size="body-sm" tone="muted">
          {location.streetAddress}, {location.city}, {location.state}{' '}
          {location.postalCode}
        </Text>
        <Text as="span" size="body-sm" weight="semibold">
          View on Google Maps
        </Text>
      </div>
    </a>
  );
}
