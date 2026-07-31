import type { ReactNode } from 'react';

/*
 * RichText — 06-COMPONENT-SPEC.md §TextSection and RichText.
 *
 * The ONLY component permitted to use `dangerouslySetInnerHTML`
 * (07-CODING-STANDARDS.md §4). Its input is already sanitised server-side by
 * `wp_kses()` against the allow-list in 04-API-CONTRACT.md §6.2, and external
 * links already carry `rel="noopener noreferrer"` from the PHP shaper — this
 * component adds no client-side DOM manipulation. Typographic styling comes from
 * the scoped `.gotg-rich-text` class in globals.css.
 */

export interface RichTextProps {
  html: string;
}

export function RichText({ html }: RichTextProps): ReactNode {
  return (
    <div
      className="gotg-rich-text"
      // eslint-disable-next-line react/no-danger -- sole permitted use; input is server-sanitised (§6.2).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
