import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Heading } from '@/components/primitives/heading';
import { Text } from '@/components/primitives/text';

/*
 * PageHeader — 06-COMPONENT-SPEC.md §PageHeader. Owns the page <h1> on every
 * route except Home. Section (tight) > Container (narrow) > optional eyebrow >
 * Heading level 1 > optional intro.
 */

export interface PageHeaderProps {
  title: string;
  intro?: string;
  eyebrow?: string;
}

export function PageHeader({
  title,
  intro,
  eyebrow,
}: PageHeaderProps): ReactNode {
  return (
    <Section spacing="tight">
      <Container width="narrow">
        <div className="flex flex-col gap-3">
          {eyebrow !== undefined && eyebrow !== '' ? (
            <Text as="span" size="overline" tone="muted" weight="semibold">
              {eyebrow}
            </Text>
          ) : null}
          <Heading level={1}>{title}</Heading>
          {intro !== undefined && intro !== '' ? (
            <Text size="body-lg" tone="muted">
              {intro}
            </Text>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
