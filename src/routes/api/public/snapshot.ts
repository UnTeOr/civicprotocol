import { createFileRoute } from "@tanstack/react-router";

/**
 * Network snapshot endpoint — the "push back out" side of the sync model.
 *
 * Any node (or anyone) can GET the full merged network state: every node,
 * identity, action, and per-node vote total across the whole network.
 * Nodes poll this to reconcile their local copy with the global totals.
 *
 * Reads go through the publishable key (anonymous role) — the data is
 * public by design, so no authentication is needed.
 */
export const Route = createFileRoute("/api/public/snapshot")({
  server: {
    handlers: {
      GET: async () => {
        const { civicPublic } = await import("@/lib/civic-db.server");
        const db = civicPublic() as any;

        const [nodes, identities, identityNodes, actions, totals] = await Promise.all([
          db.from("nodes").select("slug, name, url, status, last_seen_at, created_at"),
          db.from("identities").select("did, username, type, display_name, home_node, created_at"),
          db.from("identity_nodes").select("did, node_slug"),
          db.from("actions").select("id, origin_node, title, summary, status, closes_at, created_at"),
          db.from("action_node_totals").select("action_id, node_slug, votes_for, votes_against, approval, updated_at"),
        ]);

        const firstError =
          nodes.error ?? identities.error ?? identityNodes.error ?? actions.error ?? totals.error;
        if (firstError) {
          return Response.json({ error: firstError.message }, { status: 502 });
        }

        return Response.json(
          {
            generated_at: new Date().toISOString(),
            nodes: nodes.data ?? [],
            identities: identities.data ?? [],
            identity_nodes: identityNodes.data ?? [],
            actions: actions.data ?? [],
            action_node_totals: totals.data ?? [],
          },
          { headers: { "cache-control": "public, max-age=15" } },
        );
      },
    },
  },
});
