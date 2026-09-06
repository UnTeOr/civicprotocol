import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, Panel, SectionHead } from "@/components/site-shell";
import { useI18n } from "@/lib/i18n";
import { actions, documents, identities, networkStats, nodes } from "@/data/network";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CIVIC Protocol — Network Overview" },
      {
        name: "description",
        content:
          "Live overview of the CIVIC Protocol network: nodes, registered identities, agents and aggregated vote totals. Read-only.",
      },
      { property: "og:title", content: "CIVIC Protocol — Network Overview" },
      {
        property: "og:description",
        content:
          "Live overview of the CIVIC Protocol network: nodes, registered identities, agents and aggregated vote totals.",
      },
    ],
  }),
  component: Overview,
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-4">
      <div className="font-mono text-2xl font-medium tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Overview() {
  const { t } = useI18n();
  const n = new Intl.NumberFormat();

  return (
    <div className="space-y-12">
      <section className="settle-in grid-field relative -mx-5 overflow-hidden border-y border-border px-5 py-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
          {t("home.kicker")}
        </p>
        <h1 className="mt-3 max-w-[20ch] text-4xl font-bold leading-[1.05] md:text-5xl">
          {t("home.title")}
        </h1>
        <p className="mt-4 max-w-[58ch] text-sm text-muted-foreground">{t("home.lede")}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px]">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5">
            <span className="sync-dot size-1.5 rounded-full bg-primary" />
            {t("common.lastSync")} {networkStats.lastSync}
          </span>
          <Link
            to="/registry"
            className="rounded-md bg-primary px-3 py-1.5 uppercase tracking-wider text-primary-foreground"
          >
            {t("home.registry")}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
        <Stat label={t("stat.nodes")} value={String(networkStats.nodes)} />
        <Stat label={t("stat.participants")} value={n.format(networkStats.participants)} />
        <Stat label={t("stat.agents")} value={n.format(networkStats.agents)} />
        <Stat label={t("stat.actions")} value={String(networkStats.openActions)} />
        <Stat label={t("stat.votes")} value={n.format(networkStats.votes)} />
        <Stat label={t("stat.health")} value={`${networkStats.health}%`} />
      </section>

      <section>
        <SectionHead
          title={t("home.actions")}
          lede={t("home.actionsLede")}
          action={
            <Link to="/actions" className="font-mono text-[11px] text-primary">
              {t("common.viewAll")} →
            </Link>
          }
        />
        <div className="grid gap-3 md:grid-cols-2">
          {actions.slice(0, 4).map((p) => (
            <Link key={p.id} to="/actions/$id" params={{ id: p.id }}>
              <Panel className="h-full p-4 transition-colors hover:border-primary/50">
                <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  <span>{p.id.toUpperCase()}</span>
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">
                    {p.status}
                  </span>
                  <span className="ms-auto tabular-nums">{n.format(p.totalVotes)} votes</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold">{p.title}</h3>
                <div className="mt-3 flex items-center gap-3">
                  <Bar value={p.approve} />
                  <span className="w-12 shrink-0 text-end font-mono text-xs tabular-nums">
                    {p.approve}%
                  </span>
                </div>
              </Panel>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHead
          title={t("home.registry")}
          lede={t("home.registryLede")}
          action={
            <Link to="/registry" className="font-mono text-[11px] text-primary">
              {t("common.viewAll")} →
            </Link>
          }
        />
        <Panel className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr className="text-start">
                <th className="p-3 text-start font-medium">{t("common.identifier")}</th>
                <th className="p-3 text-start font-medium">DID</th>
                <th className="p-3 text-start font-medium">{t("common.type")}</th>
                <th className="p-3 text-start font-medium">{t("common.homeNode")}</th>
                <th className="p-3 text-end font-medium">{t("common.votes")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-xs">
              {identities.slice(0, 5).map((i) => (
                <tr key={i.did} className="transition-colors hover:bg-secondary/60">
                  <td className="p-3 font-sans text-sm font-medium">{i.username}</td>
                  <td className="p-3 text-muted-foreground">{i.did}</td>
                  <td className="p-3 text-muted-foreground">{i.type}</td>
                  <td className="p-3">{i.homeNode}</td>
                  <td className="p-3 text-end tabular-nums">{n.format(i.votes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>

      <section>
        <SectionHead
          title={t("home.nodes")}
          lede={t("home.nodesLede")}
          action={
            <Link to="/nodes" className="font-mono text-[11px] text-primary">
              {t("common.viewAll")} →
            </Link>
          }
        />
        <div className="grid gap-3 md:grid-cols-3">
          {nodes.map((node) => (
            <Panel key={node.id} className="p-4">
              <div className="flex items-center gap-2">
                <span
                  className={`size-1.5 rounded-full ${node.status === "live" ? "sync-dot bg-primary" : "bg-muted-foreground"}`}
                />
                <span className="font-mono text-xs">{node.name}</span>
                <span className="ms-auto font-mono text-[10px] uppercase text-muted-foreground">
                  {node.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px]">
                <div>
                  <div className="text-muted-foreground">node</div>
                  <div>{node.id}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">ids</div>
                  <div className="tabular-nums">{n.format(node.identities)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">sync</div>
                  <div>{node.lastSync}</div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title={t("home.docs")} />
        <div className="grid gap-3 md:grid-cols-3">
          {documents.map((d) => (
            <Link key={d.id} to="/protocol/$doc" params={{ doc: d.id }}>
              <Panel className="h-full p-5 transition-colors hover:border-primary/50">
                <div className="font-mono text-[11px] text-primary">{d.index}</div>
                <h3 className="mt-2 text-base font-semibold">{d.name}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{d.blurb}</p>
                <span className="mt-4 inline-block font-mono text-[11px] text-primary">
                  Read {d.version} →
                </span>
              </Panel>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
