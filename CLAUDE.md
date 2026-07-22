# AI Instructions

This repository holds the **frontend and documentation** for Grill on the Green,
a headless WordPress project.

| Path | Contents |
|---|---|
| `frontend/` | Next.js 15 App Router application, TypeScript |
| `docs/` | The authoritative documentation set — see `docs/README.md` |

The backend is a separate repository at `C:\Users\manav\Studio\grills`, governed
by its own `AGENTS.md`. Open the multi-root workspace at
`D:\work\grills\grills.code-workspace` to work across both. Never open only one
folder — cross-repo consistency cannot be verified from a single root.

## Authoritative Documents

Two documents are contract-level. Code that disagrees with them is wrong, not
the other way round. If code and either document disagree, stop and reconcile —
do not silently pick one.

| Document | Authority |
|---|---|
| `docs/03-CONTENT-MODEL.md` | The CMS schema. Meta keys, post type slugs, and taxonomy keys. |
| `docs/04-API-CONTRACT.md` | Response shapes. `frontend/src/types/api.ts` is a transcription of it, not an independent source. |

Read `docs/README.md` for the full index and reading order.

## Rules

1. **Data comes from `gotg/v1` REST endpoints.** One request per page, in a
   Server Component, via `fetch()` with Next.js cache options. No GraphQL. No
   client-side data fetching. No Next.js `/api/*` route that proxies WordPress —
   `/api/revalidate` and `/preview` are control endpoints and are the only
   permitted route handlers.

2. **Server Components by default.** `'use client'` is permitted only for
   components listed in the client-component register in
   `docs/06-COMPONENT-SPEC.md` §0.

3. **Every value is a token.** No arbitrary Tailwind values, no hard-coded hex
   codes, sizes, or z-index numbers. Tokens are defined in
   `docs/05-DESIGN-SYSTEM.md` and implemented in `frontend/src/styles/`.

4. **TypeScript is strict.** No `any`, no `as`, no `!`, no `@ts-ignore`. See
   `docs/07-CODING-STANDARDS.md` §4 for the full banned-pattern list.

5. **Accessibility is WCAG 2.1 AA.** Not aspirational. Component contracts in
   `docs/06-COMPONENT-SPEC.md` and the checklist in
   `docs/08-PERFORMANCE-SEO-A11Y.md` §5 are requirements.

6. **Documentation ships with the change.** A PR that changes behaviour without
   updating the corresponding living document is incomplete. The mapping is in
   `docs/07-CODING-STANDARDS.md` §12.

7. **Line endings are LF.** Enforced by `.gitattributes`. Do not override.

## Before Changing a Response Shape

Read `docs/04-API-CONTRACT.md` first. A shape change requires updating that
document, `frontend/src/types/api.ts`, and `frontend/src/types/api.schema.ts` in
the same commit, plus a paired change in the backend repository — deployed
backend-first. See `docs/10-ENVIRONMENTS-DEPLOYMENT.md` §7.5.

## Commit Policy

Commit after every completed unit of work. Do not batch unrelated changes into
one commit, and do not leave completed work uncommitted at the end of a session.

A unit of work is complete when it is coherent on its own — one component built
and rendering, one route wired to its endpoint, one document revised. If the
change spans both repositories, commit each separately with messages that
reference the same change.

Before committing, always run `git status` and review what is staged. Never
run `git add .` without checking the result first.

Commit message format — Conventional Commits:

    <type>(<scope>): <subject>

Types: feat, fix, docs, refactor, chore, test, style
Scope: the area touched — e.g. menu, events, api, tokens, plan, content-model

Subject line: imperative mood, lower case, no trailing period, under 72
characters. Add a body only when the reason for the change is not obvious from
the diff.

Examples:

    feat(menu): build MenuCard with price variant list
    feat(tokens): add colour and type scale custom properties
    docs(content-model): replace ACF field groups with native meta spec
    docs(plan): add phase 2 admin application scope
    fix(api): correct price shape in menu endpoint response

Never commit: credentials, API keys, `.env` or `.env.local` files, database
dumps, `node_modules/`, `.next/`, or anything under a gitignored path. If a task
requires a secret, reference it as an environment variable and document it in
`D:\work\grills\docs\10-ENVIRONMENTS-DEPLOYMENT.md`.

Do not amend or force-push a commit that has been pushed to a remote.
