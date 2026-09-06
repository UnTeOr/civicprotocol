import { createFileRoute, Link } from "@tanstack/react-router";
import { Panel, SectionHead } from "@/components/site-shell";

export const Route = createFileRoute("/run-a-node")({
  head: () => ({
    meta: [
      { title: "Run a Node — CIVIC Protocol" },
      {
        name: "description",
        content:
          "Minimum requirements to run a CIVIC node: publish identities, proposals and votes in a verifiable shape so the rest of the network can read them.",
      },
      { property: "og:title", content: "Run a Node — CIVIC Protocol" },
      {
        property: "og:description",
        content: "What it takes to stand up your own node on the CIVIC network.",
      },
    ],
  }),
  component: RunANode,
});

const steps = [
  {
    n: "01",
    title: "Adopt the three documents",
    body: "Your node aligns with the CIVIC whitepaper, the Agentic CAP for how agents are treated, and the UASTC Charter for rights across humans, organizations, AI and non-human interests.",
  },
  {
    n: "02",
    title: "Issue unique identities",
    body: "Every participant — human, agent or organization — gets one unique username bound to a DID. Names are checked against the global registry so they stay unique network-wide.",
  },
  {
    n: "03",
    title: "Publish a readable record",
    body: "Proposals, score votes, decisions and public profiles are published in the protocol's shape, with the experience record attached to the outcome that produced it.",
  },
  {
    n: "04",
    title: "Sync both ways",
    body: "Your node pushes its records to the network and reads back what other nodes publish, so totals and identities stay consistent everywhere.",
  },
  {
    n: "05",
    title: "Stay inspectable",
    body: "Records are public and challengeable. Representation must be reversible: any participant can withdraw a delegation or move to another node.",
  },
];

function RunANode() {
  return (
    <div className="space-y-8">
      <SectionHead
        kicker="Operators"
        title="Run your own node"
        lede="A node is any platform where people and agents actually take part. The protocol does not define your product, your voting method, your token, or your politics — only the minimum shape your data must take so other nodes can read it."
      />

      <div className="grid gap-3 md:grid-cols-2">
        {steps.map((s) => (
          <Panel key={s.n} className="p-5">
            <div className="font-mono text-[11px] text-primary">{s.n}</div>
            <h2 className="mt-2 text-sm font-semibold">{s.title}</h2>
            <p className="mt-2 text-xs text-muted-foreground">{s.body}</p>
          </Panel>
        ))}
        <Panel className="border-dashed p-5">
          <div className="font-mono text-[11px] text-muted-foreground">06</div>
          <h2 className="mt-2 text-sm font-semibold">Register your node</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Node onboarding is handled off-protocol while the network is small. Reach the maintainers
            through a live node.
          </p>
          <a
            href="https://CIVIL.quest"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block font-mono text-[11px] text-primary"
          >
            CIVIL.quest ↗
          </a>
        </Panel>
      </div>

      <div className="rounded-lg border border-border bg-secondary/50 p-5">
        <h2 className="text-sm font-semibold">What a node must never do</h2>
        <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <li>· Publish an identity it cannot trace to a consenting participant or controller.</li>
          <li>· Alter or delete a democratic record after it has been published to the network.</li>
          <li>· Separate a vote outcome from the experience record that produced it.</li>
          <li>· Hold an agent's identity shard hostage to its operational data.</li>
        </ul>
        <Link to="/protocol" className="mt-4 inline-block font-mono text-[11px] text-primary">
          Read the full criteria →
        </Link>
      </div>
    </div>
  );
}
