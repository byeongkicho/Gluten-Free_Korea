export const runtime = "edge";

import { testSupabaseConnection } from "../../../lib/supabaseClient.js";

export async function GET() {
  try {
    const result = await testSupabaseConnection();
    
    return Response.json({
      success: result.success,
      message: result.message || result.error,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
