import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, Panel, SectionHead } from "@/components/site-shell";
import { useI18n } from "@/lib/i18n";
import { useNetworkData } from "@/lib/use-network-data";

export const Route = createFileRoute("/actions/")({
  head: () => ({
    meta: [
      { title: "Actions & Vote Totals — CIVIC Protocol" },
      {
        name: "description",
        content:
          "Aggregated score-vote output for every action across all CIVIC nodes: approval percentages, participation and per-node breakdown.",
      },
      { property: "og:title", content: "Actions & Vote Totals — CIVIC Protocol" },
      {
        property: "og:description",
        content: "Approval percentages and per-node vote breakdowns across the CIVIC network.",
      },
    ],
  }),
  component: Actions,
});

const states = ["all", "voting", "ratified", "closed"] as const;

function Actions() {
  const { t } = useI18n();
  const [state, setState] = useState<(typeof states)[number]>("all");
  const [query, setQuery] = useState("");
  const n = new Intl.NumberFormat();
  const { actions } = useNetworkData();

  const rows = useMemo(
    () =>
      actions.filter(
        (p) =>
          (state === "all" || p.status === state) &&
          (!query.trim() || p.title.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [state, query, actions],
  );

  return (
    <div className="space-y-6">
      <SectionHead
        kicker="Ledger"
        title={t("home.actions")}
        lede={t("home.actionsLede")}
      />

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions…"
          className="h-9 w-72 rounded-md border border-border bg-card px-3 font-mono text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <div className="flex gap-1 font-mono text-[11px]">
          {states.map((s) => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={`rounded px-2.5 py-1.5 transition-colors ${
                state === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((p) => (
          <Link key={p.id} to="/actions/$id" params={{ id: p.id }} className="block">
            <Panel className="p-4 transition-colors hover:border-primary/50">
              <div className="grid gap-4 md:grid-cols-[1fr_240px] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    <span>{p.id.toUpperCase()}</span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">
                      {p.category}
                    </span>
                    <span className="rounded border border-border px-1.5 py-0.5">{p.status}</span>
                    <span>{n.format(p.totalVotes)} votes</span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold">{p.title}</h3>
                  <p className="mt-1 max-w-[70ch] text-xs text-muted-foreground">{p.summary}</p>
                </div>
                <div>
                  <div className="flex items-baseline justify-between font-mono text-[11px]">
                    <span className="text-muted-foreground">{t("common.approval")}</span>
                    <span className="tabular-nums">{p.approve}%</span>
                  </div>
                  <div className="mt-1.5">
                    <Bar value={p.approve} tone={p.approve >= 50 ? "primary" : "warn"} />
                  </div>
                </div>
              </div>
            </Panel>
          </Link>
        ))}
        {rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">{t("common.noResults")}</p>
        ) : null}
      </div>
    </div>
  );
}
