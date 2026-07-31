import type { ReactNode } from 'react';

import { Heading } from '@/components/primitives/heading';
import { Image } from '@/components/primitives/image';
import { Text } from '@/components/primitives/text';
import type { Person } from '@/types/api';

/*
 * PersonCard — 06-COMPONENT-SPEC.md §PersonCard / People. <article> with a
 * square photo (1/1, --radius-full), name as Heading level 3, role as an
 * overline, and an optional bio.
 *
 * `photo` absent → no placeholder avatar and no reserved space, so the text sits
 * on its own. `bio` absent → the node is omitted.
 */

export interface PersonCardProps {
  person: Person;
  headingLevel?: 3;
}

export function PersonCard({
  person,
  headingLevel = 3,
}: PersonCardProps): ReactNode {
  return (
    <article className="flex flex-col items-center gap-3 text-center">
      {person.photo ? (
        <div className="w-32 overflow-hidden rounded-full">
          <Image
            image={person.photo}
            fill
            aspectRatio="1/1"
            sizes="128px"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <Heading level={headingLevel} visualLevel="h4">
          {person.name}
        </Heading>
        {person.role !== '' ? (
          <Text as="span" size="overline" tone="muted" weight="semibold">
            {person.role}
          </Text>
        ) : null}
      </div>

      {person.bio !== undefined && person.bio !== '' ? (
        <Text size="body-sm" tone="muted">
          {person.bio}
        </Text>
      ) : null}
    </article>
  );
}
