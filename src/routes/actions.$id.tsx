import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Bar, Panel } from "@/components/site-shell";
import { proposals } from "@/data/network";

export const Route = createFileRoute("/actions/$id")({
  loader: ({ params }) => {
    const proposal = proposals.find((p) => p.id === params.id);
    if (!proposal) throw notFound();
    return { proposal };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Proposal not found — CIVIC Protocol" }, { name: "robots", content: "noindex" }],
      };
    }
    const { proposal } = loaderData;
    return {
      meta: [
        { title: `${proposal.title} — CIVIC Protocol` },
        { name: "description", content: proposal.summary },
        { property: "og:title", content: `${proposal.title} — CIVIC Protocol` },
        { property: "og:description", content: proposal.summary },
      ],
    };
  },
  component: ProposalDetail,
});

function ProposalDetail() {
  const { proposal } = Route.useLoaderData();
  const n = new Intl.NumberFormat();

  return (
    <div className="space-y-6">
      <Link to="/proposals" className="font-mono text-[11px] text-muted-foreground">
        ← proposals
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <span>{proposal.id.toUpperCase()}</span>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">
            {proposal.category}
          </span>
          <span className="rounded border border-border px-1.5 py-0.5">{proposal.status}</span>
          <span>opened {proposal.opened}</span>
        </div>
        <h1 className="mt-3 max-w-[24ch] text-3xl font-bold">{proposal.title}</h1>
        <p className="mt-3 max-w-[70ch] text-sm text-muted-foreground">{proposal.summary}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel className="p-5">
          <h2 className="text-sm font-semibold">Aggregate result</h2>
          <div className="mt-4 space-y-4">
            {[
              { label: "Approve", value: proposal.approve, tone: "primary" as const },
              { label: "Oppose", value: proposal.oppose, tone: "muted" as const },
              { label: "Abstain", value: proposal.abstain, tone: "muted" as const },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between font-mono text-[11px] tabular-nums">
                  <span>{row.label}</span>
                  <span>{row.value}%</span>
                </div>
                <div className="mt-1.5">
                  <Bar value={row.value} tone={row.tone} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 font-mono text-[11px] text-muted-foreground">
            {n.format(proposal.totalVotes)} votes counted across the network
          </p>
        </Panel>

        <Panel className="p-5">
          <h2 className="text-sm font-semibold">Per-node breakdown</h2>
          <div className="mt-4 space-y-3">
            {proposal.byNode.map((b) => (
              <div key={b.node} className="flex items-center gap-3">
                <span className="w-20 shrink-0 font-mono text-[11px] text-muted-foreground">
                  {b.node}
                </span>
                <div className="flex-1">
                  <Bar value={b.approval} tone={b.approval >= 50 ? "primary" : "warn"} />
                </div>
                <span className="w-12 shrink-0 text-end font-mono text-[11px] tabular-nums">
                  {b.approval}%
                </span>
                <span className="w-16 shrink-0 text-end font-mono text-[11px] tabular-nums text-muted-foreground">
                  {n.format(b.votes)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Voting happens on nodes, never here. Open a node to cast or change your score vote.
          </p>
        </Panel>
      </div>
    </div>
  );
}
