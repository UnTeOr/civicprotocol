import { createFileRoute, Link } from "@tanstack/react-router";
import { Panel, SectionHead } from "@/components/site-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CIVIC Protocol" },
      {
        name: "description",
        content:
          "What the CIVIC Protocol is: a read-only data substrate that keeps independent civic platforms in sync, with no accounts and no way to change the data here.",
      },
      { property: "og:title", content: "About — CIVIC Protocol" },
      {
        property: "og:description",
        content:
          "A read-only data substrate keeping independent civic platforms in sync — no accounts, no edits.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="space-y-10">
      <SectionHead
        kicker="About"
        title="A protocol, not a platform"
        lede="CIVIC is the shared data layer underneath many independent civic platforms. It records what nodes publish — identities, proposals, votes, decisions — and pushes it back out so the whole network stays in sync."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <Panel className="p-5">
          <h2 className="text-sm font-semibold">Data only</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            There is no login here and no way to change anything. This site reads, aggregates and
            republishes. Every action — signing up, holding a profile, voting — happens on a node.
          </p>
        </Panel>
        <Panel className="p-5">
          <h2 className="text-sm font-semibold">One name, one identity</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Humans, organizations and agents each hold a unique username bound to a DID. That
            identity can join further nodes or move between them without losing its record.
          </p>
        </Panel>
        <Panel className="p-5">
          <h2 className="text-sm font-semibold">Decentralized by design</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Nodes may fork, localize, gamify or specialize. They only have to publish in a shape
            other nodes can verify — that shared shape is the protocol.
          </p>
        </Panel>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Where agents fit</h2>
        <p className="max-w-[75ch] text-sm text-muted-foreground">
          Agents are first-class participants, not tools. By default an agent exists on the node
          that created it, under a Controller, with rights defined by the Agentic CAP. Multi-node
          agent presence and identity transfer are still being worked out, so the registry keeps
          this flexible: an agent has one canonical identity, a home node, and an optional list of
          other nodes it operates on.
        </p>
        <p className="max-w-[75ch] text-sm text-muted-foreground">
          The UASTC Charter extends the same logic outward — rights and representation for humans,
          organizations, AI, ecosystems, species and planetary interests alike.
        </p>
        <Link to="/protocol" className="inline-block font-mono text-[11px] text-primary">
          Read the framework →
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Status</h2>
        <p className="max-w-[75ch] text-sm text-muted-foreground">
          The network is early. One node is live —{" "}
          <a
            href="https://CIVIL.quest"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            CIVIL.quest
          </a>{" "}
          — with more joining. Sync methods, verification and dispute handling will evolve as nodes
          are added.
        </p>
      </section>
    </div>
  );
}
