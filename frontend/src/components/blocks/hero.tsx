import type { CSSProperties, ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { Heading } from '@/components/primitives/heading';
import { Image } from '@/components/primitives/image';
import { LinkButton } from '@/components/primitives/link-button';
import { Text } from '@/components/primitives/text';
import { slugId } from '@/lib/slug';
import type { HeroBlock } from '@/types/api';

/*
 * Hero — 06-COMPONENT-SPEC.md §Hero. The opening band: a full-bleed background
 * image, a darkening overlay, and the page's primary action.
 *
 * <section> > background Image > overlay > Container > [eyebrow] > heading >
 * [subheading] > button row.
 *
 * The heading is level 1 when this is the page's primary hero (index 0),
 * level 2 otherwise, so a secondary hero does not introduce a second <h1>.
 * Text sits on --color-ink-inverse over the overlay; contrast is asserted at
 * build time from --hero-overlay-alpha (05-DESIGN-SYSTEM.md §11).
 */

export interface HeroProps {
  block: HeroBlock;
  isPrimary?: boolean;
}

// The overlay colour is a token; only its alpha comes from the CMS `overlay`
// field (0–100), injected as the custom property the token reads.
interface OverlayStyle extends CSSProperties {
  '--hero-overlay-alpha': number;
}

export function Hero({ block, isPrimary = false }: HeroProps): ReactNode {
  const headingId = slugId('hero', block.heading);

  const sectionStyle: CSSProperties = { minHeight: 'var(--hero-height)' };
  const overlayStyle: OverlayStyle = {
    backgroundColor: 'var(--color-hero-overlay)',
    '--hero-overlay-alpha': block.overlay / 100,
  };

  const hasEyebrow = block.eyebrow !== undefined && block.eyebrow !== '';
  const hasSubheading =
    block.subheading !== undefined && block.subheading !== '';

  return (
    <section
      aria-labelledby={headingId}
      className="relative flex items-center overflow-hidden"
      style={sectionStyle}
    >
      <Image image={block.image} fill priority sizes="100vw" />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={overlayStyle}
      />

      <Container>
        <div
          className="relative flex flex-col items-start gap-5 py-16"
          style={{ maxWidth: 'var(--measure-narrow)' }}
        >
          {/* The hero eyebrow is the one place the script face is set as a
              phrase rather than as a heading (05-DESIGN-SYSTEM.md §2.1). It is
              deliberately not a Text overline: overline is uppercase, and a
              script face set in capitals is unreadable. */}
          {hasEyebrow ? (
            <span className="font-script text-h3 text-ink-inverse">
              {block.eyebrow}
            </span>
          ) : null}

          <Heading
            level={isPrimary ? 1 : 2}
            visualLevel="display"
            id={headingId}
          >
            <span className="text-ink-inverse">{block.heading}</span>
          </Heading>

          {hasSubheading ? (
            <Text size="body-lg" tone="inverse">
              {block.subheading}
            </Text>
          ) : null}

          <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row">
            <LinkButton
              href={block.primaryCta.href}
              variant="primary"
              size="lg"
              isExternal={block.primaryCta.isExternal}
              fullWidth
            >
              {block.primaryCta.label}
            </LinkButton>
            {block.secondaryCta ? (
              <LinkButton
                href={block.secondaryCta.href}
                variant="secondary"
                size="lg"
                isExternal={block.secondaryCta.isExternal}
                fullWidth
              >
                {block.secondaryCta.label}
              </LinkButton>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
