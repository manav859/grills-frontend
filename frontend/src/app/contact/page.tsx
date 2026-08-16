import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { HoursTable } from '@/components/blocks/hours-table';
import { LocationCard } from '@/components/blocks/location-card';
import { MapEmbed } from '@/components/blocks/map-embed';
import { PageBlockRenderer } from '@/components/blocks/page-block-renderer';
import { PageHeader } from '@/components/blocks/page-header';
import { ContactForm } from '@/components/form/contact-form';
import { Container } from '@/components/layout/container';
import { PageShell } from '@/components/layout/page-shell';
import { Section } from '@/components/layout/section';
import { SocialLinks } from '@/components/navigation/social-links';
import { Heading } from '@/components/primitives/heading';
import { Text } from '@/components/primitives/text';
import { JsonLd } from '@/components/seo/json-ld';
import { getContact } from '@/lib/api';
import { contactJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContact();
  return buildMetadata(contact.seo, contact._global, '/contact');
}

/*
 * Contact route — 02-INFORMATION-ARCHITECTURE.md §2.6, 06-COMPONENT-SPEC.md
 * §ContactPage. One getContact() fetch in this Server Component; only ContactForm
 * is a Client Component (06 §0), the rest of the page is server-rendered.
 *
 * Order (06): PageHeader → LocationCard → HoursTable → MapEmbed → ContactForm →
 * SocialLinks → PageBlockRenderer. Location/hours/map are grouped into a "Visit"
 * section; the form, social links, and page blocks follow.
 *
 * Outline: h1 (PageHeader) → h2 per section (Find us, Opening hours, Send us a
 * message, Follow us) → any page-block headings at h2 via headingLevelOffset={0}.
 *
 * When `formEnabled` is false (no configured recipient), the form is replaced by
 * the phone/email fallback, per 04-API-CONTRACT §5.5. generateMetadata builds
 * metadata from `contact.seo` (08 §4.2); JsonLd emits the Restaurant node with
 * its OpeningHoursSpecification (08 §4.5).
 */

export default async function ContactPage(): Promise<ReactNode> {
  const contact = await getContact();
  const { _global, title, formEnabled, formSubjects, blocks } = contact;
  const { location, hours, social, site } = _global;

  return (
    <PageShell global={_global} currentPath="/contact">
      <JsonLd data={contactJsonLd(_global)} />
      <PageHeader title={title} />

      <Section ariaLabelledBy="contact-find-heading">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-4">
                <Heading level={2} id="contact-find-heading">
                  Find us
                </Heading>
                <LocationCard location={location} hours={hours} />
              </div>

              <div className="flex flex-col gap-4">
                <Heading level={2} id="contact-hours-heading">
                  Opening hours
                </Heading>
                <HoursTable hours={hours} />
              </div>
            </div>

            <MapEmbed location={location} />
          </div>
        </Container>
      </Section>

      <Section tone="sunken" ariaLabelledBy="contact-form-heading">
        <Container width="narrow">
          <div className="flex flex-col gap-6">
            <Heading level={2} id="contact-form-heading">
              Send us a message
            </Heading>
            {formEnabled ? (
              <ContactForm
                subjects={formSubjects}
                recipientLabel="the Grill on the Green team"
              />
            ) : (
              <Text tone="muted">
                Our enquiry form is unavailable right now. Please call{' '}
                <a
                  href={location.phoneHref}
                  className="font-semibold text-ink underline"
                >
                  {location.phone}
                </a>
                {location.email !== undefined ? (
                  <>
                    {' '}or email{' '}
                    <a
                      href={`mailto:${location.email}`}
                      className="font-semibold text-ink underline"
                    >
                      {location.email}
                    </a>
                  </>
                ) : null}
                .
              </Text>
            )}
          </div>
        </Container>
      </Section>

      {social.length > 0 ? (
        <Section spacing="tight" ariaLabelledBy="contact-social-heading">
          <Container width="narrow">
            <div className="flex flex-col gap-4">
              <Heading level={2} id="contact-social-heading">
                Follow us
              </Heading>
              <SocialLinks links={social} siteName={site.name} />
            </div>
          </Container>
        </Section>
      ) : null}

      <PageBlockRenderer blocks={blocks} headingLevelOffset={0} />
    </PageShell>
  );
}
