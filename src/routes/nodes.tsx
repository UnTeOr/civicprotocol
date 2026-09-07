import { createFileRoute, Link } from "@tanstack/react-router";
import { Panel, SectionHead } from "@/components/site-shell";
import { useI18n } from "@/lib/i18n";
import { useNetworkData } from "@/lib/use-network-data";

export const Route = createFileRoute("/nodes")({
  head: () => ({
    meta: [
      { title: "Node Directory — CIVIC Protocol" },
      {
        name: "description",
        content:
          "Every platform connected to the CIVIC Protocol, with live sync status, registered identity counts and links to join.",
      },
      { property: "og:title", content: "Node Directory — CIVIC Protocol" },
      {
        property: "og:description",
        content: "Connected CIVIC nodes, their sync state, and where to sign up and take part.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://civic.wc.tc/nodes" },
    ],
    links: [{ rel: "canonical", href: "https://civic.wc.tc/nodes" }],
  }),
  component: Nodes,
});

function Nodes() {
  const { t } = useI18n();
  const n = new Intl.NumberFormat();
  const { nodes } = useNetworkData();

  return (
    <div className="space-y-6">
      <SectionHead
        kicker="Directory"
        title={t("home.nodes")}
        lede="Nodes are the places where people, organizations and agents actually sign up, hold profiles and vote. This site only mirrors what they publish."
        action={
          <Link
            to="/run-a-node"
            className="rounded-md bg-primary px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-primary-foreground"
          >
            {t("nav.node")} →
          </Link>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {nodes.map((node) => (
          <Panel key={node.id} className="p-5">
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${node.status === "live" ? "sync-dot bg-primary" : "bg-muted-foreground"}`}
              />
              <h3 className="text-base font-semibold">{node.name}</h3>
              <span className="ms-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {node.status}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-y-2 font-mono text-[11px]">
              <dt className="text-muted-foreground">node id</dt>
              <dd className="text-end">{node.id}</dd>
              <dt className="text-muted-foreground">region</dt>
              <dd className="text-end">{node.region}</dd>
              <dt className="text-muted-foreground">identities</dt>
              <dd className="text-end tabular-nums">{n.format(node.identities)}</dd>
              <dt className="text-muted-foreground">latency</dt>
              <dd className="text-end tabular-nums">
                {node.latencyMs ? `${node.latencyMs}ms` : "—"}
              </dd>
              <dt className="text-muted-foreground">last sync</dt>
              <dd className="text-end">{node.lastSync}</dd>
            </dl>
            {node.status === "live" ? (
              <a
                href={node.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block font-mono text-[11px] text-primary"
              >
                {t("common.openNode")} ↗
              </a>
            ) : (
              <span className="mt-4 inline-block font-mono text-[11px] text-muted-foreground">
                provisioning
              </span>
            )}
          </Panel>
        ))}

        <Panel className="border-dashed p-5">
          <h3 className="text-base font-semibold">Add your node</h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Any platform that meets the minimum protocol criteria can publish to the network and
            appear here.
          </p>
          <Link to="/run-a-node" className="mt-4 inline-block font-mono text-[11px] text-primary">
            {t("nav.node")} →
          </Link>
        </Panel>
      </div>
    </div>
  );
}
