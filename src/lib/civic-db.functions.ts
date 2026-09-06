import { createServerFn } from "@tanstack/react-start";
import { CIVIC_SCHEMA, civicPublic } from "./civic-db.server";

/**
 * Health check for the external Supabase connection. Reports whether the
 * API is reachable and whether the `civicprotocol` schema is exposed to
 * the Data API yet (requires `GRANT USAGE ON SCHEMA civicprotocol TO anon;`
 * plus the schema being added to the project's exposed schemas).
 */
export const checkCivicConnection = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const supabase = civicPublic();
      // The `network_meta` table is the planned anchor table. Until the
      // schema is created and exposed, PostgREST returns PGRST errors —
      // we classify them instead of throwing.
      const { error } = await supabase.from("network_meta").select("*").limit(1);
      if (!error) {
        return { ok: true, schemaExposed: true, schema: CIVIC_SCHEMA };
      }
      const schemaMissing =
        error.code === "PGRST106" || // schema not in exposed schemas
        error.code === "42P01" || // table does not exist
        error.code === "PGRST205"; // table not found in schema cache
      return {
        ok: true,
        schemaExposed: !schemaMissing,
        schema: CIVIC_SCHEMA,
        detail: error.code,
      };
    } catch {
      return { ok: false, schemaExposed: false, schema: CIVIC_SCHEMA };
    }
  },
);
