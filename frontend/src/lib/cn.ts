/**
 * Joins class names, dropping falsy entries. A dependency-free `clsx`: enough
 * for conditional token classes without pulling in a runtime library. The
 * ESLint Tailwind plugin is configured to read `cn(...)` arguments as class
 * lists (07-CODING-STANDARDS.md §8.1).
 */
export function cn(
  ...parts: (string | false | null | undefined)[]
): string {
  return parts.filter(Boolean).join(' ');
}
