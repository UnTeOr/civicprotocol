import { createServerFn } from "@tanstack/react-start";
import * as mock from "@/data/network";
import type { Action, Identity, IdentityType, NetworkNode } from "@/data/network";
import { CIVIC_SCHEMA, civicPublic } from "./civic-db.server";

/**
 * Health check for the external Supabase connection. Reports whether the
 * API is reachable and whether the `civicprotocol` schema is exposed to
 * the Data API yet (requires `GRANT USAGE ON SCHEMA civicprotocol TO anon;`
 * plus the schema being added to the project's exposed schemas).
 */
export const checkCivicConnection = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const supabase = civicPublic();
      const { error } = await supabase.from("nodes").select("slug").limit(1);
      if (!error) {
        return { ok: true, schemaExposed: true, schema: CIVIC_SCHEMA };
      }
      const schemaMissing =
        error.code === "PGRST106" || // schema not in exposed schemas
        error.code === "42P01" || // table does not exist
        error.code === "PGRST205"; // table not found in schema cache
      return {
        ok: true,
        schemaExposed: !schemaMissing,
        schema: CIVIC_SCHEMA,
        detail: error.code,
      };
    } catch {
      return { ok: false, schemaExposed: false, schema: CIVIC_SCHEMA };
    }
  },
);

export interface NetworkData {
  live: boolean;
  nodes: NetworkNode[];
  identities: Identity[];
  actions: Action[];
  networkStats: typeof mock.networkStats;
}

function mockSnapshot(): NetworkData {
  return {
    live: false,
    nodes: mock.nodes,
    identities: mock.identities,
    actions: mock.actions,
    networkStats: mock.networkStats,
  };
}

type DbNode = {
  slug: string;
  name: string;
  url: string;
  status: string;
  last_seen_at: string | null;
  created_at: string;
};
type DbIdentity = {
  did: string;
  username: string;
  type: string;
  display_name: string | null;
  home_node: string | null;
  created_at: string;
};
type DbPresence = { did: string; node_slug: string };
type DbAction = {
  id: string;
  origin_node: string | null;
  title: string;
  summary: string | null;
  status: string;
  closes_at: string | null;
  created_at: string;
};
type DbTotal = {
  action_id: string;
  node_slug: string;
  votes_for: number;
  votes_against: number;
  approval: number;
};

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const secs = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function mapType(t: string): IdentityType {
  return t === "nonhuman" ? "non-human" : (t as IdentityType);
}

function mapActionStatus(s: string): Action["status"] {
  if (s === "open") return "voting";
  if (s === "passed") return "ratified";
  return "closed"; // rejected | draft
}

/**
 * Reads the merged network state from the external Supabase database and
 * maps it into the UI's shape. Falls back to the bundled placeholder
 * snapshot whenever the schema is not exposed yet or any read fails, so
 * the site always renders.
 */
export const getNetworkData = createServerFn({ method: "GET" }).handler(
  async (): Promise<NetworkData> => {
    try {
      const db = civicPublic();
      const [nodesRes, identitiesRes, presenceRes, actionsRes, totalsRes] =
        await Promise.all([
          db.from("nodes").select("slug, name, url, status, last_seen_at, created_at"),
          db
            .from("identities")
            .select("did, username, type, display_name, home_node, created_at"),
          db.from("identity_nodes").select("did, node_slug"),
          db
            .from("actions")
            .select("id, origin_node, title, summary, status, closes_at, created_at"),
          db
            .from("action_node_totals")
            .select("action_id, node_slug, votes_for, votes_against, approval"),
        ]);

      const error =
        nodesRes.error ??
        identitiesRes.error ??
        presenceRes.error ??
        actionsRes.error ??
        totalsRes.error;
      const dbNodes = (nodesRes.data ?? []) as DbNode[];
      if (error || dbNodes.length === 0) return mockSnapshot();

      const dbIdentities = (identitiesRes.data ?? []) as DbIdentity[];
      const dbPresence = (presenceRes.data ?? []) as DbPresence[];
      const dbActions = (actionsRes.data ?? []) as DbAction[];
      const dbTotals = (totalsRes.data ?? []) as DbTotal[];

      // Identity counts per node (memberships + home).
      const countByNode = new Map<string, number>();
      for (const i of dbIdentities) {
        if (i.home_node) {
          countByNode.set(i.home_node, (countByNode.get(i.home_node) ?? 0) + 1);
        }
      }

      const nodes: NetworkNode[] = dbNodes.map((node) => ({
        id: node.slug,
        name: node.name,
        url: node.url,
        region: "—",
        status: node.status === "live" ? "live" : "provisioning",
        lastSync: relativeTime(node.last_seen_at),
        identities: countByNode.get(node.slug) ?? 0,
        latencyMs: 0,
      }));

      const alsoOnByDid = new Map<string, string[]>();
      for (const p of dbPresence) {
        const list = alsoOnByDid.get(p.did) ?? [];
        list.push(p.node_slug);
        alsoOnByDid.set(p.did, list);
      }

      // Votes cast per identity are not synced yet; totals live per action.
      const identities: Identity[] = dbIdentities.map((i) => ({
        username: i.username,
        did: i.did,
        type: mapType(i.type),
        homeNode: i.home_node ?? "—",
        alsoOn: alsoOnByDid.get(i.did) ?? [],
        joined: i.created_at.slice(0, 10),
        votes: 0,
        status: "synced",
      }));

      const totalsByAction = new Map<string, DbTotal[]>();
      for (const t of dbTotals) {
        const list = totalsByAction.get(t.action_id) ?? [];
        list.push(t);
        totalsByAction.set(t.action_id, list);
      }

      const actions: Action[] = dbActions.map((a) => {
        const totals = totalsByAction.get(a.id) ?? [];
        const totalVotes = totals.reduce((sum, t) => sum + t.votes_for + t.votes_against, 0);
        const votesFor = totals.reduce((sum, t) => sum + t.votes_for, 0);
        const approve = totalVotes ? Math.round((votesFor / totalVotes) * 1000) / 10 : 0;
        const oppose = totalVotes ? Math.round((1000 - (votesFor / totalVotes) * 1000)) / 10 : 0;
        return {
          id: a.id,
          title: a.title,
          summary: a.summary ?? "",
          category: "General",
          status: mapActionStatus(a.status),
          approve,
          oppose,
          abstain: 0,
          totalVotes,
          opened: a.created_at.slice(0, 10),
          byNode: totals.map((t) => ({
            node: t.node_slug,
            approval: Number(t.approval),
            votes: t.votes_for + t.votes_against,
          })),
        };
      });

      const networkStats = {
        nodes: nodes.filter((n) => n.status === "live").length,
        participants: identities.filter((i) => i.type !== "agent").length,
        agents: identities.filter((i) => i.type === "agent").length,
        openActions: actions.filter((a) => a.status === "voting").length,
        votes: actions.reduce((sum, a) => sum + a.totalVotes, 0),
        health: nodes.length
          ? Math.round((nodes.filter((n) => n.status === "live").length / nodes.length) * 100)
          : 100,
        lastSync: relativeTime(
          dbNodes
            .map((n) => n.last_seen_at)
            .filter(Boolean)
            .sort()
            .pop() ?? null,
        ),
      };

      return { live: true, nodes, identities, actions, networkStats };
    } catch {
      return mockSnapshot();
    }
  },
);
