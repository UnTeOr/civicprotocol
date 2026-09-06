import { createFileRoute, Link } from "@tanstack/react-router";
import { Panel, SectionHead } from "@/components/site-shell";
import { documents } from "@/data/network";

export const Route = createFileRoute("/protocol/")({
  head: () => ({
    meta: [
      { title: "Protocol Documents — CIVIC Protocol" },
      {
        name: "description",
        content:
          "The three founding documents of the CIVIC Protocol: the whitepaper, the Agentic CAP, and the Universal AI Seeding & Transition Charter.",
      },
      { property: "og:title", content: "Protocol Documents — CIVIC Protocol" },
      {
        property: "og:description",
        content: "Whitepaper, Agentic CAP and UASTC Charter — the framework behind the network.",
      },
    ],
  }),
  component: ProtocolIndex,
});

function ProtocolIndex() {
  return (
    <div className="space-y-6">
      <SectionHead
        kicker="Framework"
        title="Three documents, one protocol"
        lede="The protocol defines the minimum criteria by which decentralized democratic nodes publish, verify, exchange, challenge, recognize and preserve democratic information."
      />
      <div className="grid gap-3 md:grid-cols-3">
        {documents.map((d) => (
          <Link key={d.id} to="/protocol/$doc" params={{ doc: d.id }}>
            <Panel className="h-full p-5 transition-colors hover:border-primary/50">
              <div className="font-mono text-[11px] text-primary">{d.index}</div>
              <h2 className="mt-2 text-base font-semibold">{d.name}</h2>
              <p className="mt-2 text-xs text-muted-foreground">{d.blurb}</p>
              <span className="mt-4 inline-block font-mono text-[11px] text-primary">
                Read {d.version} →
              </span>
            </Panel>
          </Link>
        ))}
      </div>
    </div>
  );
}
