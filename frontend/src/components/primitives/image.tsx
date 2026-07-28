import NextImage from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type { ImageObject } from '@/types/api';

/*
 * Image — 06-COMPONENT-SPEC.md §Image. The single image entry point; direct use
 * of next/image elsewhere is prohibited.
 *
 * `blurDataUrl` renders as a native blur placeholder when present; when absent
 * the reserved box holds --color-surface-sunken and the sharp image simply
 * appears (the blur field is empty until the generation hook lands —
 * 03-CONTENT-MODEL.md §2.8). Width/height always come from the payload, or
 * `fill` inside a box with an explicit aspectRatio — an image without reserved
 * space is a CLS defect.
 *
 * Kept a Server Component. The spec's load fade-in and error-box suppression
 * need an onLoad/onError client wrapper; native blur-up plus the sunken box
 * cover the same ground and are deferred rather than forcing this into the
 * client register.
 */

export interface ImageProps {
  image: ImageObject;
  sizes: string;
  priority?: boolean;
  fill?: boolean;
  aspectRatio?: '1/1' | '4/3' | '3/2' | '16/9';
  decorative?: boolean;
}

export function Image({
  image,
  sizes,
  priority = false,
  fill = false,
  aspectRatio,
  decorative = false,
}: ImageProps): ReactNode {
  const alt = decorative ? '' : image.alt;
  const blur = image.blurDataUrl;

  const blurProps =
    typeof blur === 'string' && blur.length > 0
      ? ({ placeholder: 'blur', blurDataURL: blur } as const)
      : ({ placeholder: 'empty' } as const);

  if (fill) {
    // aspectRatio is structural, not a design token; the token set has no
    // aspect-ratio scale (reported).
    const boxStyle: CSSProperties = aspectRatio
      ? { aspectRatio: aspectRatio.replace('/', ' / ') }
      : {};

    return (
      <span
        className="relative block overflow-hidden bg-surface-sunken"
        style={boxStyle}
      >
        <NextImage
          src={image.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          {...blurProps}
        />
      </span>
    );
  }

  return (
    <NextImage
      src={image.src}
      alt={alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      className={cn('h-auto bg-surface-sunken')}
      {...blurProps}
    />
  );
}
