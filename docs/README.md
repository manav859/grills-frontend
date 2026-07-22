# Grill on the Green — Documentation

Foundational documentation for the headless WordPress rebuild of
**Grill on the Green**, a restaurant on Simi Hills Golf Course, Simi Valley, CA.

These documents are written for AI coding agents and human developers as
equal-priority readers. Constraints are stated explicitly. Where information is
unavailable, it is marked `[NEEDS CLIENT INPUT]`; where the build team inferred
something, it is marked `[ASSUMPTION]`.

---

## Document Index

| # | Document | One-line description |
|---|---|---|
| 00 | [00-PROJECT-BRIEF.md](00-PROJECT-BRIEF.md) | Business context, audiences, journeys, ranked goals, success metrics, non-goals, and the 22 open client decisions |
| 01 | [01-TECH-STACK.md](01-TECH-STACK.md) | Every technology choice with a named rejected alternative, plus the recorded tradeoffs of the REST data layer |
| 02 | [02-INFORMATION-ARCHITECTURE.md](02-INFORMATION-ARCHITECTURE.md) | Sitemap, per-page block order, navigation structure, and the complete Squarespace redirect map |
| 03 | [03-CONTENT-MODEL.md](03-CONTENT-MODEL.md) | **Authoritative** CMS schema — every post type, taxonomy, field, relationship, and the editor experience |
| 04 | [04-API-CONTRACT.md](04-API-CONTRACT.md) | **Authoritative** REST contract — five `gotg/v1` endpoints, TypeScript interfaces, example payloads, caching, preview |
| 05 | [05-DESIGN-SYSTEM.md](05-DESIGN-SYSTEM.md) | Design tokens with WCAG contrast pairings, type scale, motion, z-index, and the full component inventory |
| 06 | [06-COMPONENT-SPEC.md](06-COMPONENT-SPEC.md) | Per-component specification: props, responsive behaviour, accessibility contract, empty states, data source |
| 07 | [07-CODING-STANDARDS.md](07-CODING-STANDARDS.md) | Directory structure, naming, TypeScript rules, banned patterns, commits, PR checklist, and 12 anti-patterns with corrections |
| 08 | [08-PERFORMANCE-SEO-A11Y.md](08-PERFORMANCE-SEO-A11Y.md) | Numeric budgets, image and font strategy, metadata rules, schema.org JSON-LD examples, WCAG 2.1 AA checklist |
| 09 | [09-INTEGRATIONS.md](09-INTEGRATIONS.md) | Every third-party surface with vendor comparisons, failure modes, environment variables, and cost |
| 10 | [10-ENVIRONMENTS-DEPLOYMENT.md](10-ENVIRONMENTS-DEPLOYMENT.md) | Environment matrix, variable registry, local setup, CI/CD, rollback, backups, DNS cutover, and the SQLite→MySQL parity analysis |
| 11 | [11-PROJECT-PLAN.md](11-PROJECT-PLAN.md) | Nine phases, a 97.75-day backlog with estimates and dependencies, a 17-item risk register, the deferred Phase 2 admin scope, and the content migration plan |
| 12 | [12-GLOSSARY-DECISIONS.md](12-GLOSSARY-DECISIONS.md) | Glossary, plus 26 Architecture Decision Records covering every significant choice |
| — | [README.md](README.md) | This index |

Backend repository policy lives in `C:\Users\manav\Studio\grills\AGENTS.md` and
is not duplicated here. Its Rule 3 reflects ADR-0024 and its Rule 5 reflects ADR-0025.

---

## Reading Order for a Developer Joining the Project

### Before writing any code

| Order | Document | Why |
|---|---|---|
| 1 | `00-PROJECT-BRIEF.md` | Who this is for and what success means. Read §8 Decisions Pending carefully — much of what looks undecided is deliberately unanswered. |
| 2 | `12-GLOSSARY-DECISIONS.md` Part 1 | Vocabulary. Skim it; return to it when a term is unfamiliar. |
| 3 | `12-GLOSSARY-DECISIONS.md` ADR-0001 to ADR-0008, plus ADR-0025 and ADR-0026 | The ten decisions that shape everything else. Do not propose alternatives to these. |
| 4 | `01-TECH-STACK.md` | The stack, and specifically §3 — the accepted costs of the REST data layer. |
| 5 | `10-ENVIRONMENTS-DEPLOYMENT.md` §1–§4 | Get a local environment running. §10 explains why local uses a different database engine than production. |

### Before touching the backend

| Order | Document |
|---|---|
| 6 | `C:\Users\manav\Studio\grills\AGENTS.md` — backend repository rules |
| 7 | `03-CONTENT-MODEL.md` — in full. It is authoritative and code must match it exactly. |
| 8 | `04-API-CONTRACT.md` §1–§4 and §6 — transport rules, shared types, and shaping rules |
| 9 | `07-CODING-STANDARDS.md` §1.2, §7.2, §8.3, §11.12 — backend structure, error handling, PHPCS, and the raw-object anti-pattern |

### Before touching the frontend

| Order | Document |
|---|---|
| 10 | `02-INFORMATION-ARCHITECTURE.md` — what pages exist and what is on them |
| 11 | `04-API-CONTRACT.md` §5 — the exact payload for the route you are building |
| 12 | `05-DESIGN-SYSTEM.md` — tokens first, then the component inventory in §10 |
| 13 | `06-COMPONENT-SPEC.md` §0 — the client-component register. Read this before typing `'use client'`. |
| 14 | `06-COMPONENT-SPEC.md` — the entry for the component you are building |
| 15 | `07-CODING-STANDARDS.md` — in full, especially §11 anti-patterns |
| 16 | `08-PERFORMANCE-SEO-A11Y.md` §1, §2, §5 — the budgets and the accessibility checklist you must meet |

### Before shipping

| Order | Document |
|---|---|
| 17 | `07-CODING-STANDARDS.md` §10 — PR requirements and the review checklist |
| 18 | `11-PROJECT-PLAN.md` §0 — the Definition of Done, including the staging-verification requirement |

### Reference as needed

| Document | When |
|---|---|
| `09-INTEGRATIONS.md` | Adding or debugging a third-party surface |
| `10-ENVIRONMENTS-DEPLOYMENT.md` §5–§11 | Deploying, rolling back, or planning the cutover |
| `11-PROJECT-PLAN.md` §3–§5 | Picking up a task, assessing a risk, or planning content |

---

## Shortest Path by Task

| If you are… | Read, in this order |
|---|---|
| Adding a CMS field | 03 → 04 → 07 §12 → then the paired PRs in 10 §7.5 |
| Building a component | 06 §0 → 06 (your component) → 05 → 07 §5, §11 |
| Building a route | 02 → 04 §5 → 06 §6 → 08 §4 |
| Fixing a performance regression | 08 §1, §2, §3 → 01 §7 |
| Fixing an accessibility issue | 08 §5 → 06 (the component's a11y contract) → 05 §9 |
| Wiring an integration | 09 → 09 §13 (the failure matrix is the acceptance criteria) |
| Deploying | 10 §5, §7 |
| Understanding why something is the way it is | 12 Part 2 |

---

## Maintenance

### Living documents

Updated whenever the thing they describe changes. A PR that changes behaviour
without updating the corresponding living document is rejected in review — the
mapping is in `07-CODING-STANDARDS.md` §12.

| Document | Update trigger |
|---|---|
| `00-PROJECT-BRIEF.md` | A Decision Pending is resolved; goals or metrics change |
| `01-TECH-STACK.md` | A dependency, host, or version changes |
| `02-INFORMATION-ARCHITECTURE.md` | A route is added, removed, or has its blocks reordered |
| `03-CONTENT-MODEL.md` | **Any** schema change. Same PR, always. |
| `04-API-CONTRACT.md` | **Any** response-shape change. Same PR as `types/api.ts` and `types/api.schema.ts`. |
| `05-DESIGN-SYSTEM.md` | A token changes or a component enters the inventory |
| `06-COMPONENT-SPEC.md` | A component's props, behaviour, or a11y contract changes |
| `07-CODING-STANDARDS.md` | A convention or lint rule changes |
| `08-PERFORMANCE-SEO-A11Y.md` | A budget is revised or a schema type is added |
| `09-INTEGRATIONS.md` | A vendor is selected, changed, or removed |
| `10-ENVIRONMENTS-DEPLOYMENT.md` | An environment, variable, or procedure changes |
| `11-PROJECT-PLAN.md` | Continuously through delivery; frozen after Phase 8 |
| `README.md` | A document is added or removed |

### Frozen sections

Recorded decisions, not current-state descriptions. They are not edited to
reflect new choices.

| Document / section | Rule |
|---|---|
| `12-GLOSSARY-DECISIONS.md` Part 2 — ADRs | **Append-only.** An accepted ADR is never edited except to set `Status: Superseded` and point to its replacement. Changing a decision means writing a new ADR. |
| `12-GLOSSARY-DECISIONS.md` Part 1 — Glossary | Living; append new terms |
| `11-PROJECT-PLAN.md` §4 Risk Register | Living until launch, then frozen as a record |
| `11-PROJECT-PLAN.md` §5 Content Migration Plan | Frozen after cutover |
| `10-ENVIRONMENTS-DEPLOYMENT.md` §9 DNS Cutover | Frozen after execution; retained with each step's completion signed off |

### Authoritative documents

Two documents are contract-level. Code that disagrees with them is wrong, not
the other way round.

| Document | Authority |
|---|---|
| `03-CONTENT-MODEL.md` | The CMS schema. `AGENTS.md` in the backend repository defers to it. Field names, post type keys, and taxonomy keys in PHP must match it exactly. |
| `04-API-CONTRACT.md` | Response shapes. `frontend/src/types/api.ts` is a transcription of it, not an independent source. |

If code and either document disagree: **stop and reconcile.** Do not silently
pick one.

---

## Current Blockers

Twenty-two client decisions are open. The full table with owners and impact is in
`00-PROJECT-BRIEF.md` §8. The ones on the critical path:

| ID | Question | Blocks |
|---|---|---|
| DP-16 | Monthly hosting budget | **All work.** First task on the critical path (T-DO-01). No longer includes a software licence — ADR-0025 removed the only one. |
| DP-21 | The menu, with current prices, in structured form | Content entry. No longer blocks the price field model — variants are built in up front, retiring risk R-06. |
| DP-10 | Brand guidelines, colours, typefaces, vector logo | Design token finalisation; every colour and type value is provisional until this lands |
| DP-13 / DP-14 | Domain ownership, registrar, and production domain | The DNS cutover cannot be scheduled |
| DP-11 / DP-12 | Photography rights and shoot budget | The visual direction depends on photography; this is the largest single quality risk |
