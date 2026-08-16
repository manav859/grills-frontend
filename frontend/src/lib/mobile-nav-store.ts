/*
 * Mobile-nav open state as a tiny external store, shared by MobileNav (the
 * drawer) and MobileCtaBar (which must hide entirely while the drawer is open,
 * 06-COMPONENT-SPEC.md §MobileCtaBar). A module-level store lets the two
 * components — far apart in the tree, under a Server Component shell — stay in
 * sync without a client context provider wrapping the whole page.
 *
 * Consumed via useSyncExternalStore; the server snapshot is always `false`
 * (closed), which matches the initial client state, so there is no hydration
 * mismatch.
 */

let open = false;
const listeners = new Set<() => void>();

export function getMobileNavOpen(): boolean {
  return open;
}

export function getMobileNavServerSnapshot(): boolean {
  return false;
}

export function setMobileNavOpen(next: boolean): void {
  if (open === next) {
    return;
  }
  open = next;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeMobileNav(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
