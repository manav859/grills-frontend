import type { ReactNode } from 'react';

/**
 * Placeholder home route. Scaffolding only — the real Home page is built from
 * `HomeResponse` in a later task (`06-COMPONENT-SPEC.md` §10.6). It exists here
 * so the App Router has a root route to render and the app can start.
 */
export default function HomePage(): ReactNode {
  return (
    <main>
      <h1>Grill on the Green</h1>
      <p>Frontend scaffold. Page components arrive in the next task.</p>
    </main>
  );
}
