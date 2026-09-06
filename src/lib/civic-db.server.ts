/**
 * External Supabase connection for the CIVIC Protocol network.
 *
 * All access is scoped to the `civicprotocol` schema in the user's
 * external Supabase project — no other schema in that project is touched.
 *
 * This file is server-only (`*.server.ts`): it is never bundled for the
 * client, and env vars are read inside functions (request-time injection).
 */
import { createClient } from "@supabase/supabase-js";

type CivicClient = ReturnType<typeof createClient>;

export const CIVIC_SCHEMA = "civicprotocol";

/**
 * Read-only client using the publishable key. Respects row-level security
 * as the anonymous role. Use for everything the public dashboard shows.
 */
export function civicPublic(): CivicClient {
  const key = process.env["CIVIC_SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["CIVIC_SUPABASE_URL"]!, key, {
    db: { schema: CIVIC_SCHEMA },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    // New-format sb_ keys are opaque, not JWTs — send apikey only, never
    // an `Authorization: Bearer <key>` header (PostgREST rejects it).
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/**
 * Privileged client using the service-role key. Bypasses RLS — use ONLY
 * inside the node-ingest endpoint, after verifying the caller's node key.
 * Never used for dashboard reads.
 */
export function civicAdmin(): CivicClient {
  const key = process.env["CIVIC_SUPABASE_SERVICE_ROLE_KEY"]!;
  return createClient(process.env["CIVIC_SUPABASE_URL"]!, key, {
    db: { schema: CIVIC_SCHEMA },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}
