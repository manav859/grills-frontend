import type { ReactNode } from 'react';

import { Badge } from '@/components/primitives/badge';
import { Text } from '@/components/primitives/text';
import type { DietaryColor, DietaryTag } from '@/types/api';

/*
 * DietaryLegend — 06-COMPONENT-SPEC.md §DietaryLegend. A <dl>: <dt> holds the
 * Badge with the abbreviation, <dd> holds the description. Returns null when
 * empty, so an item-free menu shows no legend regardless of the
 * showDietaryLegend toggle.
 */

export interface DietaryLegendProps {
  tags: DietaryTag[];
}

const COLOR_TONE = {
  neutral: 'neutral',
  green: 'green',
  amber: 'amber',
  red: 'red',
} as const satisfies Record<DietaryColor, 'neutral' | 'green' | 'amber' | 'red'>;

export function DietaryLegend({ tags }: DietaryLegendProps): ReactNode {
  if (tags.length === 0) {
    return null;
  }

  return (
    <dl className="flex flex-col gap-3">
      {tags.map((tag) => (
        <div key={tag.slug} className="flex items-center gap-3">
          <dt>
            <Badge tone={COLOR_TONE[tag.color]} title={tag.description}>
              {tag.abbreviation}
            </Badge>
          </dt>
          <dd>
            <Text as="span" size="body-sm" tone="muted">
              {tag.description}
            </Text>
          </dd>
        </div>
      ))}
    </dl>
  );
}
