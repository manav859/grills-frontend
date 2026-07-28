import type { ReactNode } from 'react';

import { GLYPHS } from './index';
import type { IconName } from './index';

/*
 * Icon — 06-COMPONENT-SPEC.md §Icon. Without `title` the SVG is decorative
 * (aria-hidden, not focusable); with `title` it is an image with an accessible
 * name.
 */

export interface IconProps {
  name: IconName;
  size?: 16 | 20 | 24 | 32;
  title?: string;
}

export function Icon({ name, size = 24, title }: IconProps): ReactNode {
  const labelled = typeof title === 'string' && title.length > 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
    >
      {labelled ? <title>{title}</title> : null}
      {GLYPHS[name]}
    </svg>
  );
}
