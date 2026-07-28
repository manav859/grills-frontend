import type { ReactNode } from 'react';

import { Badge } from '@/components/primitives/badge';
import { Heading } from '@/components/primitives/heading';
import { Icon } from '@/components/primitives/icons/icon';
import { Image } from '@/components/primitives/image';
import { PriceList } from '@/components/primitives/price-list';
import { Text } from '@/components/primitives/text';
import { cn } from '@/lib/cn';
import type { DietaryColor, MenuItem, SpiceLevel } from '@/types/api';

/*
 * MenuCard — 06-COMPONENT-SPEC.md §MenuCard. One menu item in a section list.
 * Renders <article> with no interactive elements. Prices go through PriceList
 * (one or many variants). Every optional field degrades: no image collapses to
 * text-only, no description omits the node, no dietary tags omit the list.
 *
 * The image is full-width at 3/2 on mobile and a 96px square (1/1) leading
 * thumbnail at md, per spec — expressed with the aspect-ratio token utilities
 * (aspect-3-2 md:aspect-square, 05-DESIGN-SYSTEM.md §4.4). The wrapper owns the
 * ratio and the sunken degrade box; Image fills it.
 */

export interface MenuCardProps {
  item: MenuItem;
  variant?: 'default' | 'featured';
  headingLevel?: 3 | 4;
}

const SPICE_LABEL = {
  mild: 'Mild',
  medium: 'Medium',
  hot: 'Hot',
} as const satisfies Record<Exclude<SpiceLevel, 'none'>, string>;

const DIETARY_TONE = {
  neutral: 'neutral',
  green: 'green',
  amber: 'amber',
  red: 'red',
} as const satisfies Record<DietaryColor, 'neutral' | 'green' | 'amber' | 'red'>;

export function MenuCard({
  item,
  variant = 'default',
  headingLevel = 4,
}: MenuCardProps): ReactNode {
  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-lg p-4 md:flex-row',
        variant === 'featured' && 'border border-oak shadow-sm',
      )}
    >
      {item.image ? (
        <div className="relative aspect-3-2 w-full shrink-0 overflow-hidden rounded-lg bg-surface-sunken md:aspect-square md:w-24">
          <Image
            image={item.image}
            fill
            sizes="(min-width: 768px) 96px, 100vw"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <span className="flex items-center gap-2">
            <Heading level={headingLevel} visualLevel="h4">
              {item.name}
            </Heading>
            {item.spiceLevel !== 'none' ? (
              <span className="text-ember">
                <Icon name="flame" size={16} title={SPICE_LABEL[item.spiceLevel]} />
              </span>
            ) : null}
          </span>
          <PriceList variants={item.priceVariants} />
        </div>

        {item.description !== undefined && item.description !== '' ? (
          <Text size="body-sm" tone="muted">
            {item.description}
          </Text>
        ) : null}

        {item.dietaryTags.length > 0 ? (
          <ul
            aria-label="Dietary information"
            className="flex flex-wrap gap-2"
          >
            {item.dietaryTags.map((tag) => (
              <li key={tag.slug}>
                <Badge tone={DIETARY_TONE[tag.color]} title={tag.description}>
                  {tag.abbreviation}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
