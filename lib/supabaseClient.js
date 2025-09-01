import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./supabaseConfig.js";

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseConfig.url;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseConfig.anonKey;
  
  if (!url || !anonKey || anonKey === 'your_anon_key_here') {
    console.warn('Supabase credentials not configured. Please set up your environment variables.');
    return null;
  }
  
  return createClient(url, anonKey, { 
    auth: { persistSession: false },
    db: { schema: 'public' }
  });
}

// Test connection function
export async function testSupabaseConnection() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not configured' };
  }
  
  try {
    // First, let's try to get information about available tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      // If we can't query information_schema, try a simple connection test
      const { data, error } = await supabase.from('_dummy_table_').select('*').limit(1);
      
      if (error && error.code === 'PGRST116') {
        return { 
          success: true, 
          message: 'Connection successful! Please create a table in your Supabase dashboard to test data access.',
          tables: []
        };
      }
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    }
    
    // If we can get table info, let's try to get some data from the first table
    if (tables && tables.length > 0) {
      const firstTable = tables[0].table_name;
      const { data, error } = await supabase.from(firstTable).select('*').limit(5);
      
      if (error) {
        return { 
          success: true, 
          message: `Connection successful! Found ${tables.length} table(s): ${tables.map(t => t.table_name).join(', ')}`,
          tables: tables.map(t => t.table_name),
          error: error.message
        };
      }
      
      return { 
        success: true, 
        message: `Connection successful! Found ${tables.length} table(s)`,
        tables: tables.map(t => t.table_name),
        sampleData: data,
        tableName: firstTable
      };
    }
    
    return { 
      success: true, 
      message: 'Connection successful! No tables found in public schema.',
      tables: []
    };
    
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Function to get data from a specific table
export async function getTableData(tableName, limit = 10) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not configured' };
  }
  
  try {
    const { data, error } = await supabase.from(tableName).select('*').limit(limit);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
