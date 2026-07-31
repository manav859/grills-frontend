import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/*
 * SplitLayout — 06-COMPONENT-SPEC.md §Stack, Grid, SplitLayout. Media and
 * content side by side at `lg`, stacked below with media always first. The
 * side swap uses CSS `order`, never DOM reordering: DOM order stays
 * media-then-content so the reading order matches the mobile visual order.
 */

export interface SplitLayoutProps {
  imageSide: 'left' | 'right';
  media: ReactNode;
  content: ReactNode;
}

export function SplitLayout({
  imageSide,
  media,
  content,
}: SplitLayoutProps): ReactNode {
  // media is first in the DOM. At lg, when the image belongs on the right, its
  // order is bumped after the content column; below lg both orders collapse.
  const mediaOrder = imageSide === 'right' ? 'lg:order-2' : 'lg:order-1';
  const contentOrder = imageSide === 'right' ? 'lg:order-1' : 'lg:order-2';

  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
      <div className={cn(mediaOrder)}>{media}</div>
      <div className={cn(contentOrder)}>{content}</div>
    </div>
  );
}
