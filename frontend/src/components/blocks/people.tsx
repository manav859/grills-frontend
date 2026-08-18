import type { ReactNode } from 'react';

import { PersonCard } from '@/components/blocks/person-card';
import { Container } from '@/components/layout/container';
import { Grid } from '@/components/layout/grid';
import { Section } from '@/components/layout/section';
import { Heading } from '@/components/primitives/heading';
import { slugId } from '@/lib/slug';
import type { PeopleBlock } from '@/types/api';

/*
 * People — 06-COMPONENT-SPEC.md §PersonCard / People. Section > optional heading
 * (level 2) > Grid of two columns of PersonCard.
 *
 * The shaper drops nameless rows and returns null when nobody remains; the empty
 * guard here is defensive.
 */

export interface PeopleProps {
  band?: 'surface' | 'sunken';
  block: PeopleBlock;
}

export function People({
  block,
  band = 'surface',
}: PeopleProps): ReactNode {
  if (block.people.length === 0) {
    return null;
  }

  const hasHeading = block.heading !== undefined && block.heading !== '';
  const headingId = hasHeading ? slugId('people', block.heading ?? '') : undefined;

  return (
    <Section
      tone={band}
      {...(headingId !== undefined ? { ariaLabelledBy: headingId } : {})}
    >
      <Container>
        <div className="flex flex-col gap-8">
          {hasHeading ? (
            <Heading
              level={2}
              {...(headingId !== undefined ? { id: headingId } : {})}
            >
              {block.heading}
            </Heading>
          ) : null}
          <Grid columns={2} gap={8}>
            {block.people.map((person) => (
              <PersonCard key={person.name} person={person} />
            ))}
          </Grid>
        </div>
      </Container>
    </Section>
  );
}
