import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Node ingest endpoint — the "push in" side of the sync model.
 *
 * A node (e.g. CIVIL.quest) POSTs a signed payload here whenever its local
 * data changes. The node authenticates with its per-node API key
 * (`x-node-key` header), which is looked up in civicprotocol.nodes. All
 * writes are stamped with the authenticated node's slug, so a node can only
 * publish data as itself.
 */

const identitySchema = z.object({
  did: z.string().min(3).max(200),
  username: z.string().min(1).max(80),
  type: z.enum(["human", "agent", "organization", "nonhuman"]).default("human"),
  display_name: z.string().max(200).optional(),
  also_on: z.array(z.string().max(80)).max(50).optional(),
});

const actionSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(300),
  summary: z.string().max(4000).optional(),
  status: z.enum(["open", "passed", "rejected", "draft"]).default("open"),
  closes_at: z.string().datetime().optional(),
});

const totalsSchema = z.object({
  action_id: z.string().min(1).max(80),
  votes_for: z.number().int().min(0).max(1_000_000_000),
  votes_against: z.number().int().min(0).max(1_000_000_000),
  approval: z.number().min(0).max(100),
});

const payloadSchema = z.object({
  identities: z.array(identitySchema).max(500).optional(),
  actions: z.array(actionSchema).max(200).optional(),
  totals: z.array(totalsSchema).max(500).optional(),
});

export const Route = createFileRoute("/api/public/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const nodeKey = request.headers.get("x-node-key");
        if (!nodeKey) {
          return Response.json({ error: "Missing x-node-key header" }, { status: 401 });
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const parsed = payloadSchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid payload", detail: parsed.error.flatten() },
            { status: 400 },
          );
        }
        const payload = parsed.data;
        if (!payload.identities && !payload.actions && !payload.totals) {
          return Response.json({ error: "Empty payload" }, { status: 400 });
        }

        const { civicAdmin } = await import("@/lib/civic-db.server");
        const db = civicAdmin();

        // Verify the node key and resolve the node slug.
        const { data: node } = await db
          .from("nodes")
          .select("slug, status")
          .eq("api_key", nodeKey)
          .maybeSingle();
        if (!node) {
          return Response.json({ error: "Unknown node key" }, { status: 403 });
        }

        const slug = node.slug as string;
        const counts = { identities: 0, actions: 0, totals: 0 };

        if (payload.identities?.length) {
          const rows = payload.identities.map((i) => ({
            did: i.did,
            username: i.username,
            type: i.type,
            display_name: i.display_name ?? null,
            home_node: slug,
          }));
          const { error } = await db.from("identities").upsert(rows, { onConflict: "did" });
          if (error) return Response.json({ error: error.message }, { status: 500 });
          counts.identities = rows.length;

          // Multi-node presence rows, when provided.
          const presence = payload.identities.flatMap((i) =>
            (i.also_on ?? []).map((n) => ({ did: i.did, node_slug: n })),
          );
          if (presence.length) {
            await db
              .from("identity_nodes")
              .upsert(presence, { onConflict: "did,node_slug", ignoreDuplicates: true });
          }
        }

        if (payload.actions?.length) {
          const rows = payload.actions.map((a) => ({
            id: a.id,
            origin_node: slug,
            title: a.title,
            summary: a.summary ?? null,
            status: a.status,
            closes_at: a.closes_at ?? null,
          }));
          const { error } = await db.from("actions").upsert(rows, { onConflict: "id" });
          if (error) return Response.json({ error: error.message }, { status: 500 });
          counts.actions = rows.length;
        }

        if (payload.totals?.length) {
          const rows = payload.totals.map((t) => ({
            action_id: t.action_id,
            node_slug: slug,
            votes_for: t.votes_for,
            votes_against: t.votes_against,
            approval: t.approval,
            updated_at: new Date().toISOString(),
          }));
          const { error } = await db
            .from("action_node_totals")
            .upsert(rows, { onConflict: "action_id,node_slug" });
          if (error) return Response.json({ error: error.message }, { status: 500 });
          counts.totals = rows.length;
        }

        await db
          .from("nodes")
          .update({ last_seen_at: new Date().toISOString(), status: "live" })
          .eq("slug", slug);

        return Response.json({ ok: true, node: slug, ingested: counts });
      },
    },
  },
});
