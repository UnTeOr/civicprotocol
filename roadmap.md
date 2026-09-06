# CIVIC Protocol — roadmap

## Now
- [x] Design direction: sleek futuristic read-only data console (dark + light)
- [x] Shell: header nav, global search, theme toggle, language switcher
- [x] Pages: Overview, Registry (DIDs), Nodes, Actions + detail, Protocol docs, Run a node, About
- [x] "Proposals" renamed to "Actions" (URL /actions, /proposals redirects)
- [x] Mock network data layer (swappable for real sync later)

## Now
- [ ] External Supabase backend (NOT Lovable Cloud — user's own project, `civicprotocol` schema only):
  - [x] Credentials stored (URL + publishable key in env; service-role key + Postgres URL encrypted)
  - [x] Connection module `src/lib/civic-db.server.ts` scoped to `civicprotocol` schema
  - [x] Schema, tables, grants + RLS created directly in the external Supabase (user only needs to expose `civicprotocol`)
  - [x] Secure `/api/public/ingest` endpoint — nodes push identities/actions/vote totals with per-node keys
  - [x] Public `/api/public/snapshot` endpoint — nodes pull the merged network state back (push-out side)
  - [x] Data layer reads live from Supabase with automatic fallback to the mock snapshot
  - [ ] Assign per-node API keys (nodes.api_key) and onboard CIVIL.quest as the first pusher

## Later
- [ ] Agent multi-node presence + DID transfer model (identity_nodes table is ready for it)
- [ ] More languages beyond initial set
