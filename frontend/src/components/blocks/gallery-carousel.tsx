'use client';

import { useCallback, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

import { IconButton } from '@/components/primitives/icon-button';
import { Image } from '@/components/primitives/image';
import type { ImageObject } from '@/types/api';

/*
 * GalleryCarousel — 06-COMPONENT-SPEC.md §Gallery (carousel variant). Client
 * Component (register §0: slide index + keyboard nav).
 *
 * Native scroll-snap does the moving; the buttons scroll the container rather
 * than transforming it, so touch and button navigation share one model. There
 * is no auto-advance, ever. Under reduced motion the scroll jump is instant.
 * A polite live region announces the current slide.
 */

export interface GalleryCarouselProps {
  images: ImageObject[];
  label: string;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function GalleryCarousel({
  images,
  label,
}: GalleryCarouselProps): ReactNode {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const scrollToIndex = useCallback((next: number) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const clamped = Math.max(0, Math.min(next, track.children.length - 1));
    const slide = track.children[clamped];
    if (slide instanceof HTMLElement) {
      track.scrollTo({
        left: slide.offsetLeft - track.offsetLeft,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
    setIndex(clamped);
  }, []);

  // Keep the announcement honest when the user swipes: derive the nearest slide
  // from the scroll position.
  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const width = track.clientWidth;
    const nearest = width > 0 ? Math.round(track.scrollLeft / width) : 0;
    setIndex((current) => (current === nearest ? current : nearest));
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          scrollToIndex(index - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          scrollToIndex(index + 1);
          break;
        case 'Home':
          event.preventDefault();
          scrollToIndex(0);
          break;
        case 'End':
          event.preventDefault();
          scrollToIndex(count - 1);
          break;
        default:
          break;
      }
    },
    [count, index, scrollToIndex],
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- arrow-key handler on the carousel region is an ARIA carousel pattern requirement (§Gallery).
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-4"
    >
      <ul
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto"
      >
        {images.map((image, slideIndex) => (
          <li
            key={image.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${String(slideIndex + 1)} of ${String(count)}`}
            className="w-full shrink-0 grow-0 basis-full snap-center"
          >
            <Image
              image={image}
              fill
              aspectRatio="3/2"
              sizes="(min-width: 1024px) 1024px, 100vw"
            />
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <IconButton
          icon="chevron-left"
          label="Previous photo"
          variant="solid"
          onClick={() => {
            scrollToIndex(index - 1);
          }}
          disabled={index === 0}
        />
        {/* Live region: sr-only is the whitelisted visually-hidden utility (07 §8.1). */}
        <span aria-live="polite" className="sr-only">
          Photo {String(index + 1)} of {String(count)}
        </span>
        <IconButton
          icon="chevron-right"
          label="Next photo"
          variant="solid"
          onClick={() => {
            scrollToIndex(index + 1);
          }}
          disabled={index === count - 1}
        />
      </div>
    </div>
  );
}
