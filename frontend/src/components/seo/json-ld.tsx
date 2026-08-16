import type { ReactNode } from 'react';

/*
 * JsonLd — renders one <script type="application/ld+json"> server-side
 * (08-PERFORMANCE-SEO-A11Y.md §4.5). `<` is escaped to its unicode form so a
 * string value inside the data can never break out of the script element.
 */

export interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps): ReactNode {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON-LD has no non-dangerous API; the payload is escaped above.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
