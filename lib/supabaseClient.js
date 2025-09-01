// lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./supabaseConfig.js";

// ---- Single source of truth for the client
export function getSupabaseClient(opts = {}) {
  const url =
    opts.url ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    supabaseConfig?.url;

  const anonKey =
    opts.anonKey ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    supabaseConfig?.anonKey;

  if (!url || !anonKey || anonKey === "your_anon_key_here") {
    console.warn(
      "[Supabase] Credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
    db: { schema: "public" },
  });
}

/**
 * Test the connection.
 * Prefer creating a tiny public table `_healthcheck` (see SQL below),
 * then this will verify both connectivity and row access.
 * If the table doesn't exist, we still confirm connectivity when we
 * get the PostgREST "relation not found" error (PGRST116).
 */
export async function testSupabaseConnection({ table = "_healthcheck" } = {}) {
  const supabase = getSupabaseClient();
  if (!supabase)
    return { success: false, error: "Supabase client not configured" };

  try {
    // HEAD count (no payload) — cheap and fast if table exists
    const { error, count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (!error) {
      return {
        success: true,
        message: `Connection OK. '${table}' reachable.`,
        table,
        rowCount: count ?? 0,
      };
    }

    // If the relation doesn't exist, it's still a valid connection
    if (error?.code === "PGRST116") {
      return {
        success: true,
        message:
          "Connection OK, but no accessible tables found yet (or healthcheck table missing).",
        note: "Create a small public table (e.g., _healthcheck) to fully verify data access.",
        tableMissing: table,
      };
    }

    // Other errors = actual problem
    return { success: false, error: error.message || "Unknown error" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getTableData(tableName, limit = 10) {
  const supabase = getSupabaseClient();
  if (!supabase)
    return { success: false, error: "Supabase client not configured" };

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .limit(limit);
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
