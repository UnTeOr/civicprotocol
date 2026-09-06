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
  - [ ] User runs `civic-supabase-setup.sql` in their Supabase SQL editor (creates schema, tables, grants, exposes schema)
  - [ ] Secure `/api/public/ingest` endpoint — nodes push identities/actions/vote totals with per-node keys
  - [ ] Swap mock data layer for live reads from Supabase

## Later
- [ ] Agent multi-node presence + DID transfer model (identity_nodes table is ready for it)
- [ ] More languages beyond initial set
