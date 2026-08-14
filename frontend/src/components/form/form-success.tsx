import type { ReactNode } from 'react';

import { Heading } from '@/components/primitives/heading';
import { Text } from '@/components/primitives/text';

/*
 * FormSuccess — the confirmation that replaces ContactForm on a successful
 * submit (06 §ContactForm). The focusable status region and focus move are owned
 * by ContactForm; this is the panel's content.
 */

export interface FormSuccessProps {
  headingId: string;
}

export function FormSuccess({ headingId }: FormSuccessProps): ReactNode {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-sunken p-6 md:p-8">
      <Heading level={2} id={headingId} visualLevel="h3">
        Thank you — your message is on its way
      </Heading>
      <Text tone="muted">
        We read every enquiry and will get back to you as soon as we can. For
        anything urgent, please call us.
      </Text>
    </div>
  );
}
