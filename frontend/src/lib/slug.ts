/**
 * Turns a heading string into a DOM-id-safe slug for `aria-labelledby` wiring.
 * A `prefix` namespaces the id per block type so two blocks with the same
 * heading text on one page do not collide. Empty input yields the prefix alone.
 */
export function slugId(prefix: string, text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug === '' ? prefix : `${prefix}-${slug}`;
}
