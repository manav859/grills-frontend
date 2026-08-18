import type { CSSProperties, ReactNode } from 'react';

/*
 * SkipLink — 06-COMPONENT-SPEC.md §SkipLink, 02-INFORMATION-ARCHITECTURE.md
 * §3.4. First focusable element in the DOM; off screen until focused, then
 * revealed above everything (--z-skip-link). Targets #main-content.
 *
 * Positioning does the hiding, not the screen-reader-only utility pair. That
 * pair is fragile on this element for two reasons: the horizontal and vertical
 * padding here re-inflate the padding the hidden state zeroes out, and the
 * reveal utility resets position to static, so whether a focused link floats
 * over the header or lands in normal flow beside the logo comes down to which
 * rule Tailwind happens to emit last. A permanently fixed element translated
 * off the top of the viewport takes no part in layout at all, focused or not,
 * and needs no such tie-break.
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
      className="bg-surface-raised text-ink font-body text-label fixed top-0 left-4 -translate-y-full rounded-md px-4 py-3 font-semibold shadow-lg focus:translate-y-4"
    >
      Skip to content
    </a>
  );
}
