export const runtime = "edge";

import { getTableData } from "../../../lib/supabaseClient.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('table');
  const limit = parseInt(searchParams.get('limit')) || 10;
  
  if (!tableName) {
    return Response.json({
      success: false,
      error: 'Please provide a table name using ?table=your_table_name',
      example: '/api/table-data?table=your_table_name&limit=5'
    }, { status: 400 });
  }
  
  try {
    const result = await getTableData(tableName, limit);
    
    return Response.json({
      success: result.success,
      tableName,
      limit,
      data: result.data,
      error: result.error,
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
