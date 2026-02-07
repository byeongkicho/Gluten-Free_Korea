export const runtime = "edge";

import { getSupabaseClient } from "@/lib/supabaseClient.js";

export async function GET() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return Response.json(
      { success: false, error: "Supabase client not configured" },
      { status: 503 }
    );
  }

  const { data, error } = await supabase.from("restaurants").select("*").limit(1);
  return Response.json({ success: !error, data, error });
}
