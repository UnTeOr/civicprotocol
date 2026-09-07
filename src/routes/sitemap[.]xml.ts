import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://civic.wc.tc";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "hourly", priority: "1.0" },
  { path: "/registry", changefreq: "hourly", priority: "0.8" },
  { path: "/nodes", changefreq: "hourly", priority: "0.8" },
  { path: "/actions", changefreq: "hourly", priority: "0.8" },
  { path: "/protocol", changefreq: "monthly", priority: "0.7" },
  { path: "/protocol/civic", changefreq: "monthly", priority: "0.7" },
  { path: "/protocol/cap", changefreq: "monthly", priority: "0.7" },
  { path: "/protocol/uastc", changefreq: "monthly", priority: "0.7" },
  { path: "/run-a-node", changefreq: "monthly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [...STATIC_ENTRIES];

        // One entry per action currently published by any node. Read with the
        // publishable key through the existing public SELECT policy; if the
        // read fails the static entries still ship.
        try {
          const { civicPublic } = await import("@/lib/civic-db.server");
          const supabase = civicPublic();
          const pageSize = 1000;
          for (let offset = 0; ; offset += pageSize) {
            const { data, error } = await supabase
              .from("actions")
              .select("id")
              .order("id")
              .range(offset, offset + pageSize - 1);
            if (error) throw error;
            entries.push(
              ...(data ?? []).map((row: { id: string }) => ({
                path: `/actions/${encodeURIComponent(row.id)}`,
                changefreq: "daily" as const,
                priority: "0.5",
              })),
            );
            if (!data || data.length < pageSize) break;
          }
        } catch {
          // sitemap still serves static routes when the data layer is down
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
