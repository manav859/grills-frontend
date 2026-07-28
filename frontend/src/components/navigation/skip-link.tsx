import type { CSSProperties, ReactNode } from 'react';

/*
 * SkipLink — 06-COMPONENT-SPEC.md §SkipLink, 02-INFORMATION-ARCHITECTURE.md
 * §3.4. First focusable element in the DOM; visually hidden until focused, then
 * revealed above everything (--z-skip-link). Targets #main-content.
 */

export interface SkipLinkProps {
  targetId?: string;
}

export function SkipLink({
  targetId = 'main-content',
}: SkipLinkProps): ReactNode {
  const style: CSSProperties = { zIndex: 'var(--z-skip-link)' };

  return (
    <a
      href={`#${targetId}`}
      style={style}
      className="sr-only rounded-md bg-surface-raised px-4 py-3 font-body text-label font-semibold text-ink shadow-lg focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
    >
      Skip to content
    </a>
  );
}
