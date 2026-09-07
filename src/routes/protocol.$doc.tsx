import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { marked } from "marked";
import { documents } from "@/data/network";
import civicMd from "@/content/civic.md?raw";
import capMd from "@/content/cap.md?raw";
import uastcMd from "@/content/uastc.md?raw";

const sources: Record<string, string> = {
  civic: civicMd,
  cap: capMd,
  uastc: uastcMd,
};

export const Route = createFileRoute("/protocol/$doc")({
  loader: ({ params }) => {
    const meta = documents.find((d) => d.id === params.doc);
    const source = sources[params.doc];
    if (!meta || !source) throw notFound();
    return { meta, html: marked.parse(source, { async: false }) as string };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Document not found — CIVIC Protocol" }, { name: "robots", content: "noindex" }],
      };
    }
    const { meta } = loaderData;
    const url = `https://civic.wc.tc/protocol/${encodeURIComponent(meta.id)}`;
    return {
      meta: [
        { title: `${meta.name} ${meta.version} — CIVIC Protocol` },
        { name: "description", content: meta.blurb },
        { property: "og:title", content: `${meta.name} ${meta.version} — CIVIC Protocol` },
        { property: "og:description", content: meta.blurb },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${meta.name} ${meta.version}`,
            description: meta.blurb,
            url,
            isPartOf: { "@type": "WebSite", name: "CIVIC Protocol", url: "https://civic.wc.tc" },
          }),
        },
      ],
    };
  },
  component: DocPage,
});

function DocPage() {
  const { meta, html } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <Link to="/protocol" className="font-mono text-[11px] text-muted-foreground">
        ← protocol
      </Link>
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
          {meta.index} · {meta.version}
        </div>
        <h1 className="mt-2 text-3xl font-bold">{meta.name}</h1>
      </div>
      <article
        className="doc-body max-w-[80ch] text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
