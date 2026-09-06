-- ============================================================
-- CIVIC Protocol — external Supabase setup
-- Run this ONCE in your Supabase project's SQL Editor.
-- Everything lives in the `civicprotocol` schema; your other
-- schemas (public, med, ...) are never touched.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS civicprotocol;

-- ------------------------------------------------------------
-- Nodes: platforms connected to the network (e.g. CIVIL.quest)
-- ------------------------------------------------------------
CREATE TABLE civicprotocol.nodes (
  slug        text PRIMARY KEY,              -- short unique id, e.g. 'civilquest'
  name        text NOT NULL,
  url         text NOT NULL,
  status      text NOT NULL DEFAULT 'pending',  -- live | syncing | pending | paused
  api_key     text,                          -- per-node push key (service-role writes only)
  last_seen_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Identities: unique usernames + DIDs across the whole network
-- type: human | agent | organization | nonhuman
-- ------------------------------------------------------------
CREATE TABLE civicprotocol.identities (
  did          text PRIMARY KEY,             -- e.g. 'did:civic:civilquest:aurora'
  username     text NOT NULL UNIQUE,         -- globally unique across all nodes
  type         text NOT NULL DEFAULT 'human',
  display_name text,
  home_node    text REFERENCES civicprotocol.nodes(slug),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Multi-node presence: an identity (human or agent) active on several nodes
CREATE TABLE civicprotocol.identity_nodes (
  did       text NOT NULL REFERENCES civicprotocol.identities(did) ON DELETE CASCADE,
  node_slug text NOT NULL REFERENCES civicprotocol.nodes(slug) ON DELETE CASCADE,
  PRIMARY KEY (did, node_slug)
);

-- ------------------------------------------------------------
-- Actions: anything the network can vote on (not just proposals)
-- ------------------------------------------------------------
CREATE TABLE civicprotocol.actions (
  id         text PRIMARY KEY,               -- e.g. 'ACT-0317'
  origin_node text REFERENCES civicprotocol.nodes(slug),
  title      text NOT NULL,
  summary    text,
  status     text NOT NULL DEFAULT 'open',   -- open | passed | rejected | draft
  closes_at  timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Per-node vote totals for each action (aggregated outputs)
CREATE TABLE civicprotocol.action_node_totals (
  action_id     text NOT NULL REFERENCES civicprotocol.actions(id) ON DELETE CASCADE,
  node_slug     text NOT NULL REFERENCES civicprotocol.nodes(slug) ON DELETE CASCADE,
  votes_for     integer NOT NULL DEFAULT 0,
  votes_against integer NOT NULL DEFAULT 0,
  approval      numeric(5,2) NOT NULL DEFAULT 0,  -- 0-100
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (action_id, node_slug)
);

-- ------------------------------------------------------------
-- Access: the world reads (anon), only service_role writes.
-- The ingest endpoint writes with the service-role key, which
-- bypasses RLS — so no write policies are needed at all.
-- ------------------------------------------------------------
GRANT USAGE ON SCHEMA civicprotocol TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA civicprotocol TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA civicprotocol TO authenticated;
GRANT ALL    ON ALL TABLES IN SCHEMA civicprotocol TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA civicprotocol GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA civicprotocol GRANT ALL    ON TABLES TO service_role;

ALTER TABLE civicprotocol.nodes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE civicprotocol.identities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE civicprotocol.identity_nodes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE civicprotocol.actions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE civicprotocol.action_node_totals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read nodes"        ON civicprotocol.nodes              FOR SELECT TO anon USING (true);
CREATE POLICY "public read identities"   ON civicprotocol.identities         FOR SELECT TO anon USING (true);
CREATE POLICY "public read membership"   ON civicprotocol.identity_nodes     FOR SELECT TO anon USING (true);
CREATE POLICY "public read actions"      ON civicprotocol.actions            FOR SELECT TO anon USING (true);
CREATE POLICY "public read vote totals"  ON civicprotocol.action_node_totals FOR SELECT TO anon USING (true);

-- ------------------------------------------------------------
-- Expose the schema to the Data API.
-- IMPORTANT: keep your existing schemas in the list (public, med,
-- storage, graphql_public) — this ADDS civicprotocol.
-- Easier alternative: Supabase Dashboard → Settings → API →
-- "Exposed schemas" → add `civicprotocol`.
-- ------------------------------------------------------------
ALTER DATABASE postgres SET pgrst.db_schemas = 'public, med, civicprotocol';
NOTIFY pgrst, 'reload config';
