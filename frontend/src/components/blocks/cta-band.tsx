import type { CSSProperties, ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { Text } from '@/components/primitives/text';
import { cn } from '@/lib/cn';
import { slugId } from '@/lib/slug';
import type { CtaBandBlock } from '@/types/api';

/*
 * CtaBand — 06-COMPONENT-SPEC.md §CtaBand. A full-width band, centred, capped at
 * --measure-narrow, wired as a labelled section.
 *
 * | style   | Band            | Button      |
 * | brand   | brand primary   | secondary   |  ← a red button on a red band would
 * | ink     | inverse surface | primary     |    have no boundary, so brand uses
 * | surface | sunken          | primary     |    a secondary (white) button.
 *
 * `brand` is not a Section tone (Section's contract lists surface/sunken/inverse
 * only), so the band is rendered as its own <section> here with the same
 * --section-y padding Section applies. Text is inverse on brand/ink, default on
 * surface.
 */

export interface CtaBandProps {
  block: CtaBandBlock;
}

const BAND = {
  brand: 'bg-brand text-ink-inverse',
  ink: 'bg-surface-inverse text-ink-inverse',
  surface: 'bg-surface-sunken text-ink',
} as const satisfies Record<CtaBandBlock['style'], string>;

const BUTTON_VARIANT = {
  brand: 'secondary',
  ink: 'primary',
  surface: 'primary',
} as const satisfies Record<CtaBandBlock['style'], 'primary' | 'secondary'>;

export function CtaBand({ block }: CtaBandProps): ReactNode {
  const headingId = slugId('cta', block.heading);
  const isInverse = block.style !== 'surface';
  const style: CSSProperties = { paddingBlock: 'var(--section-y)' };

  return (
    <section
      aria-labelledby={headingId}
      className={cn(BAND[block.style])}
      style={style}
    >
      <Container>
        <div
          className="mx-auto flex flex-col items-center gap-5 text-center"
          style={{ maxWidth: 'var(--measure-narrow)' }}
        >
          <Heading level={2} id={headingId}>
            {isInverse ? (
              <span className="text-ink-inverse">{block.heading}</span>
            ) : (
              block.heading
            )}
          </Heading>

          {block.body !== undefined && block.body !== '' ? (
            <Text size="body-lg" tone={isInverse ? 'inverse-muted' : 'muted'}>
              {block.body}
            </Text>
          ) : null}

          <LinkButton
            href={block.cta.href}
            variant={BUTTON_VARIANT[block.style]}
            size="lg"
            isExternal={block.cta.isExternal}
          >
            {block.cta.label}
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
