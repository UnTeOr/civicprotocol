# Actions rename, Nodes page update, and sync prototype

## 1. Rename "Proposals" to "Actions"

Any voteable item is an "Action", not only formal proposals — this matches the protocol model.

- Move routes: `proposals.index.tsx` → `actions.index.tsx`, `proposals.$id.tsx` → `actions.$id.tsx` (URL becomes `/actions` and `/actions/$id`)
- Update all `Link to="/proposals..."` references (nav in `site-shell.tsx`, home page sections, registry cross-links if any)
- Update i18n keys: `home.proposals` → `home.actions`, `home.proposalsLede`, `stat.proposals`, nav label — English plus the 7 other locales
- Update `src/data/network.ts`: rename the `proposals` export to `actions` (type `Proposal` → `Action`) and adjust wording like "open proposals" → "open actions"
- Update head() titles/descriptions to say Actions
- Keep `/proposals` redirecting to `/actions` so the published URL doesn't break

## 2. Nodes page — "Run your own node" button

- Add a prominent button at the top of the Nodes page (next to the section heading) linking to `/run-a-node`, so visitors see existing nodes first and then the path to start their own
- Keep the existing dashed "Add your node" card at the end of the grid as the secondary cue

## 3. Sync model — prototype direction (design only this round)

Recommended: **nodes push to CIVIC**. It is the simplest to build and matches your read-only model:

```text
CIVIL.quest ──push──> CIVIC Protocol site (stores records, displays them)
new node    ──push──>        ^
```

- Each node sends a small signed payload (identities, actions, vote totals) to a secure endpoint on this site whenever something changes
- This site stores the records and serves the current snapshot to visitors
- Later evolution: pull feeds, per-record verification, conflict rules — the push model doesn't block any of that

**Blocker:** storing pushed records requires a database, which needs Lovable Cloud enabled on this project (Connectors → Lovable Cloud → enable). This round ships items 1 and 2 only. Once Cloud is enabled, the follow-up plan is: a `records` table + a secure `/api/public/ingest` endpoint with per-node keys, then swap the mock data layer for real reads.

## Technical notes

- Route rename means renaming the files and updating every `Link`/`navigate` literal; the redirect for `/proposals` uses a small route file that throws `redirect({ to: "/actions" })`
- No data-shape changes beyond renames; the mock snapshot stays as-is
- After edits: typecheck + verify all pages return 200, including `/actions`, `/actions/<id>`, and the `/proposals` redirect
