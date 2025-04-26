
import { supabase } from '@/integrations/supabase/client';

export async function runDiagnostic(countryId: string): Promise<{ success: boolean; message: string; results?: any }> {
  try {
    const results: any = {
      tableAccess: null,
      packageExists: false,
      rpc: {
        success: false,
        error: null
      }
    };
    
    // Test direct table access
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('visa_packages')
        .select('count(*)')
        .single();
        
      results.tableAccess = {
        success: !tableError,
        error: tableError?.message,
        data: tableData
      };
    } catch (err: any) {
      results.tableAccess = {
        success: false,
        error: err.message
      };
    }
    
    // Check if package exists for this country
    if (countryId) {
      const { data, error } = await supabase
        .from('visa_packages')
        .select('id')
        .eq('country_id', countryId)
        .maybeSingle();
        
      results.packageExists = !error && !!data;
    }
    
    // Try using RPC function for better compatibility
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('save_visa_package', {
        p_country_id: countryId,
        p_name: 'Test Package',
        p_government_fee: 0,
        p_service_fee: 0,
        p_processing_days: 15
      });
      
      results.rpc = {
        success: !rpcError && !!rpcData,
        error: rpcError?.message,
        data: rpcData
      };
    } catch (err: any) {
      results.rpc = {
        success: false,
        error: err.message
      };
    }
    
    return {
      success: results.tableAccess?.success || results.rpc?.success,
      message: "Diagnostic completed",
      results
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Diagnostic failed: ${err.message}`
    };
  }
}
