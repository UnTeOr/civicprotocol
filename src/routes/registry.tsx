import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Panel, SectionHead } from "@/components/site-shell";
import { useI18n } from "@/lib/i18n";
import type { IdentityType } from "@/data/network";
import { useNetworkData } from "@/lib/use-network-data";

export const Route = createFileRoute("/registry")({
  head: () => ({
    meta: [
      { title: "Identity Registry — CIVIC Protocol" },
      {
        name: "description",
        content:
          "Search the global CIVIC registry of unique usernames and DIDs for humans, agents, organizations and non-human interests across every node.",
      },
      { property: "og:title", content: "Identity Registry — CIVIC Protocol" },
      {
        property: "og:description",
        content:
          "Search every unique username and DID registered across the CIVIC network.",
      },
    ],
  }),
  component: Registry,
});

const filters: (IdentityType | "all")[] = ["all", "human", "agent", "organization", "non-human"];

function Registry() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<IdentityType | "all">("all");
  const n = new Intl.NumberFormat();
  const { identities } = useNetworkData();

  const rows = useMemo(
    () =>
      identities.filter((i) => {
        const matchType = type === "all" || i.type === type;
        const q = query.trim().toLowerCase();
        const matchQuery =
          !q ||
          i.username.toLowerCase().includes(q) ||
          i.did.toLowerCase().includes(q) ||
          i.homeNode.toLowerCase().includes(q);
        return matchType && matchQuery;
      }),
    [query, type, identities],
  );

  return (
    <div className="space-y-6">
      <SectionHead
        kicker="Registry"
        title={t("home.registry")}
        lede="Every unique name in the network resolves to one DID. Names are issued by nodes and reserved globally, so an identity can move between nodes without losing its record."
      />

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("common.search")}
          className="h-9 w-72 rounded-md border border-border bg-card px-3 font-mono text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <div className="flex flex-wrap gap-1 font-mono text-[11px]">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setType(f)}
              className={`rounded px-2.5 py-1.5 transition-colors ${
                type === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="ms-auto font-mono text-[11px] text-muted-foreground">
          {n.format(rows.length)} records
        </span>
      </div>

      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3 text-start font-medium">{t("common.identifier")}</th>
              <th className="p-3 text-start font-medium">DID</th>
              <th className="p-3 text-start font-medium">{t("common.type")}</th>
              <th className="p-3 text-start font-medium">{t("common.homeNode")}</th>
              <th className="p-3 text-start font-medium">joined</th>
              <th className="p-3 text-end font-medium">{t("common.votes")}</th>
              <th className="p-3 text-end font-medium">{t("common.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono text-xs">
            {rows.map((i) => (
              <tr key={i.did} className="transition-colors hover:bg-secondary/60">
                <td className="p-3 font-sans text-sm font-medium">{i.username}</td>
                <td className="p-3 text-muted-foreground">{i.did}</td>
                <td className="p-3 text-muted-foreground">{i.type}</td>
                <td className="p-3">{i.homeNode}</td>
                <td className="p-3 text-muted-foreground">{i.joined}</td>
                <td className="p-3 text-end tabular-nums">{n.format(i.votes)}</td>
                <td className="p-3 text-end">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={`size-1.5 rounded-full ${i.status === "synced" ? "sync-dot bg-primary" : "bg-muted-foreground"}`}
                    />
                    {i.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center font-sans text-sm text-muted-foreground">
                  {t("common.noResults")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Panel>

      <p className="max-w-[70ch] text-xs text-muted-foreground">
        This registry is read-only. To claim a name, join or switch nodes, or change your profile,
        use a node — the protocol only records what nodes publish.
      </p>
    </div>
  );
}
