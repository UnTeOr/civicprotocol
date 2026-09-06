/**
 * Schema ownership check for the CIVIC Protocol platform.
 *
 * This project owns ONLY the `civicprotocol` schema (plus approved shared
 * tables in `public`). This script scans THIS repository only — it never
 * touches the database or another platform's code.
 *
 * Run: `bun scripts/check-schema-ownership.mjs`
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const PLATFORM = "civicprotocol";

/** Other known platform schemas in the shared Supabase project. */
export const FOREIGN_SCHEMAS = [
  "cabreraverse",
  "harmoni",
  "livingnews",
  "med",
  "civilquest",
  "size",
];

/** Edge functions that are intentionally shared by every platform. */
export const APPROVED_SHARED_FUNCTIONS = [
  "_shared",
  "translate",
  "root",
  "stripe-checkout",
  "stripe-portal",
  "stripe-reprice",
  "stripe-webhook",
  "synap-backup",
  "apply-synap-password",
];

/** Migrations that predate this protection are grandfathered in. */
export const GRANDFATHERED_MIGRATIONS = [];

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".output",
  ".vinxi",
  ".nitro",
  ".lovable",
  ".workspace",
  "scripts",
  "src/content",
]);
const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|sql)$/;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full).split(sep).join("/");
    if (SKIP_DIRS.has(entry) || SKIP_DIRS.has(rel)) continue;
    if (statSync(full).isDirectory()) walk(full, files);
    else if (CODE_EXT.test(entry) && !entry.endsWith("routeTree.gen.ts")) files.push(rel);
  }
  return files;
}

export function checkSchemaOwnership() {
  const violations = [];
  const files = walk(ROOT);

  for (const rel of files) {
    const text = readFileSync(join(ROOT, rel), "utf8");
    const lines = text.split("\n");

    lines.forEach((line, i) => {
      const at = `${rel}:${i + 1}`;

      // 1. .schema("x") calls naming anything but our schema or public
      const schemaCall = line.match(/\.schema\(\s*["'`]([\w-]+)["'`]\s*\)/);
      if (schemaCall && ![PLATFORM, "public"].includes(schemaCall[1])) {
        violations.push(`${at} — Supabase .schema("${schemaCall[1]}") is not owned by this platform.`);
      }

      // 2 & 4. schema-qualified access to a foreign platform schema
      // (comments are ignored: only real qualified references count)
      const code = line.replace(/--.*$/, "").replace(/\/\/.*$/, "").replace(/\*.*$/, "");
      for (const foreign of FOREIGN_SCHEMAS) {
        const re = new RegExp(
          `(?:^|[^\\w."'\`-])${foreign}\\.[a-z_]|["'\`]${foreign}\\.[a-z_]|db:\\s*{\\s*schema:\\s*["'\`]${foreign}["'\`]`,
          "i",
        );
        if (re.test(code)) {
          violations.push(`${at} — references foreign platform schema "${foreign}".`);
        }
      }
    });

    // 3. new migrations must declare the platform
    if (
      rel.startsWith("supabase/migrations/") &&
      !GRANDFATHERED_MIGRATIONS.includes(rel) &&
      !text.includes(`SET LOCAL app.platform = '${PLATFORM}';`)
    ) {
      violations.push(`${rel} — missing header: SET LOCAL app.platform = '${PLATFORM}';`);
    }

    // 8. no database-wide enforcement installed from this project
    if (rel.endsWith(".sql") && /CREATE\s+EVENT\s+TRIGGER|ALTER\s+DATABASE|ALTER\s+DEFAULT\s+PRIVILEGES\s+(?!IN\s+SCHEMA\s+civicprotocol)/i.test(text)) {
      violations.push(`${rel} — contains a database-wide statement (event trigger / ALTER DATABASE / global default privileges).`);
    }
  }

  // 5. edge function directories must be platform-prefixed
  try {
    for (const dir of readdirSync(join(ROOT, "supabase/functions"))) {
      if (dir.startsWith(`${PLATFORM}-`) || APPROVED_SHARED_FUNCTIONS.includes(dir)) continue;
      violations.push(`supabase/functions/${dir} — edge function must be named "${PLATFORM}-${dir}".`);
    }
  } catch {
    /* no edge functions in this project */
  }

  return violations;
}

if (import.meta.main || process.argv[1]?.includes("check-schema-ownership")) {
  const violations = checkSchemaOwnership();
  if (violations.length) {
    console.error(`Schema ownership check FAILED (${violations.length} violation(s)):`);
    for (const v of violations) console.error(`  - ${v}`);
    console.error(
      `\nFix inside this project only: keep all platform data in the "${PLATFORM}" schema, ` +
        `recreate anything needed from another platform locally, and never edit another platform's schema.`,
    );
    process.exit(1);
  }
  console.log(`Schema ownership check passed — this project only touches "${PLATFORM}" and approved shared "public".`);
}
