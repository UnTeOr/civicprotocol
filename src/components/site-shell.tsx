import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useI18n, LOCALES } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { networkStats } from "@/data/network";

const navItems = [
  { to: "/", key: "nav.overview" },
  { to: "/registry", key: "nav.registry" },
  { to: "/nodes", key: "nav.nodes" },
  { to: "/proposals", key: "nav.proposals" },
  { to: "/protocol", key: "nav.protocol" },
  { to: "/run-a-node", key: "nav.node" },
  { to: "/about", key: "nav.about" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-5">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="grid size-6 place-items-center rounded-[5px] bg-primary">
              <span className="size-1.5 rounded-full bg-primary-foreground" />
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight">CIVIC</span>
            <span className="hidden font-mono text-[10px] tracking-widest text-muted-foreground sm:inline">
              /PROTOCOL
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-secondary text-foreground" }}
                className="rounded-md px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-md border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground md:flex">
              <span className="sync-dot size-1.5 rounded-full bg-primary" />
              {t("common.readonly")}
            </span>
            <select
              aria-label="Language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as never)}
              className="h-8 rounded-md border border-border bg-card px-2 font-mono text-[11px] text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid size-8 place-items-center rounded-md border border-border font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>
        </div>
      </header>

      <div className="lg:hidden">
        <nav className="flex gap-1 overflow-x-auto border-b border-border px-5 py-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              className="whitespace-nowrap rounded-md px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </div>

      <main className="mx-auto max-w-[1400px] px-5 py-10">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-8 font-mono text-[11px] text-muted-foreground md:flex-row md:items-center">
          <p>
            CIVIC Protocol · read-only data layer · {networkStats.nodes} node
            {networkStats.nodes === 1 ? "" : "s"} synced · {networkStats.lastSync}
          </p>
          <div className="flex items-center gap-4 md:ms-auto">
            <a
              href="https://CIVIL.quest"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              CIVIL.quest
            </a>
            <Link to="/run-a-node" className="hover:text-foreground">
              {t("nav.node")}
            </Link>
            <Link to="/about" className="hover:text-foreground">
              {t("nav.about")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function SectionHead({
  kicker,
  title,
  lede,
  action,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{kicker}</p>
        ) : null}
        <h2 className="text-lg font-semibold">{title}</h2>
        {lede ? (
          <p className="mt-1 max-w-[62ch] text-sm text-muted-foreground">{lede}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card ${className}`}>{children}</div>
  );
}

export function Bar({ value, tone = "primary" }: { value: number; tone?: "primary" | "muted" | "warn" }) {
  const bg =
    tone === "primary" ? "bg-primary" : tone === "warn" ? "bg-warn" : "bg-muted-foreground/50";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className={`h-full rounded-full ${bg}`} style={{ width: `${value}%` }} />
    </div>
  );
}
