import type { ReactNode } from 'react';

/*
 * VisuallyHidden — 06-COMPONENT-SPEC.md §Skeleton…VisuallyHidden. Hidden
 * visually but present for assistive tech; remains in the accessibility tree.
 * Uses the whitelisted `sr-only` utility (07-CODING-STANDARDS.md §8.1).
 */

export interface VisuallyHiddenProps {
  as?: 'span' | 'div';
  children: ReactNode;
}

export function VisuallyHidden({
  as = 'span',
  children,
}: VisuallyHiddenProps): ReactNode {
  const Tag = as;
  return <Tag className="sr-only">{children}</Tag>;
}
