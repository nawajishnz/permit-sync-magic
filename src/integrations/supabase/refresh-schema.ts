import { supabase } from './client';

/**
 * Refreshes the Supabase client schema cache
 * Call this function after table structure changes
 */
export async function refreshSchemaCache() {
  console.log('Refreshing schema cache...');
  try {
    // First, make a dummy request to ensure connection
    await supabase.from('visa_packages').select('count(*)', { count: 'exact', head: true });
    
    // Force schema cache refresh using rpc method
    const { data: schemaInfo, error: schemaError } = await supabase
      .rpc('get_table_info', {
        p_table_name: 'visa_packages'
      });
    
    if (schemaError) {
      console.error('Error getting schema info:', schemaError);
    } else {
      console.log('Table schema info retrieved:', schemaInfo);
    }
    
    // Now query the real table to refresh the schema
    const { data, error } = await supabase.from('visa_packages').select('*').limit(1);
    
    if (error) {
      console.error('Error during schema refresh:', error);
      return { success: false, error };
    }
    
    console.log('Schema cache refreshed successfully');
    return { success: true, data };
  } catch (error) {
    console.error('Failed to refresh schema cache:', error);
    return { success: false, error };
  }
} 