
import { supabase } from './client';

/**
 * Fix common schema issues with visa_packages table
 */
export async function fixVisaPackagesSchema() {
  console.log('Attempting to fix visa_packages schema...');
  
  try {
    // Step 1: Check if the table exists using a custom RPC function
    console.log('Checking if visa_packages table exists...');
    const { data: tablesData, error: tablesError } = await supabase.rpc(
      'get_table_info', 
      { p_table_name: 'visa_packages' }
    ).catch(() => ({ data: null, error: { message: 'Function get_table_info not available' } }));
      
    console.log('Table check result:', { tablesData, tablesError });
    const tableExists = tablesData && Array.isArray(tablesData) && tablesData.length > 0;
    
    // Step 2: Create a default package if none exists
    try {
      if (tableExists) {
        console.log('Testing visa_packages table with save_visa_package RPC...');
        
        // Try to use the RPC function that's defined in fix-visa-packages.sql
        const { data: testSave, error: saveError } = await supabase.rpc(
          'save_visa_package',
          {
            p_country_id: '00000000-0000-0000-0000-000000000000',
            p_name: 'Test Default Package',
            p_government_fee: 0,
            p_service_fee: 0, 
            p_processing_days: 15
          }
        );
        
        console.log('RPC test result:', { testSave, saveError });
      }
    } catch (saveErr) {
      console.log('RPC test exception:', saveErr);
    }
    
    // Step 3: Try to refresh schema cache
    console.log('Attempting to refresh schema cache...');
    try {
      // Make a dummy request to force schema refresh
      await supabase
        .from('countries_with_packages')
        .select('count(*)')
        .limit(1)
        .catch(() => {
          console.log('countries_with_packages view may not exist yet, trying direct table access');
          // If view doesn't exist, try direct table access
          return supabase
            .from('visa_packages')
            .select('count(*)')
            .limit(1);
        });
      
      await supabase
        .from('countries')
        .select('count(*)')
        .limit(1);
    } catch (refreshErr) {
      console.log('Schema refresh exception:', refreshErr);
    }
    
    return {
      success: true,
      message: 'Schema fix attempted. See console for results.',
      details: 'Run the SQL script in supabase/fix-visa-packages.sql for a permanent fix.',
      tableExists
    };
  } catch (err: any) {
    console.error('Error in fixVisaPackagesSchema:', err);
    return {
      success: false,
      message: `Error fixing schema: ${err.message}`,
      error: err
    };
  }
}

/**
 * Function to attempt direct DB operations to test what's working
 */
export async function testVisaPackagesOperations(countryId: string) {
  console.log(`Testing visa_packages operations for country ${countryId}...`);
  
  const results: any = {
    select: { success: false },
    insert: { success: false },
    update: { success: false },
    rpc: { success: false },
    view: { success: false }
  };
  
  try {
    // Test VIEW first (preferred approach)
    try {
      const { data, error } = await supabase
        .from('countries_with_packages')
        .select('country_id, package_id, package_name, government_fee, service_fee')
        .eq('country_id', countryId)
        .limit(1);
        
      results.view = {
        success: !error,
        data,
        error: error?.message
      };
    } catch (err: any) {
      results.view = {
        success: false,
        error: err.message
      };
    }
    
    // Test SELECT
    try {
      const { data, error } = await supabase
        .from('visa_packages')
        .select('id, country_id')
        .eq('country_id', countryId)
        .limit(1);
        
      results.select = {
        success: !error,
        data,
        error: error?.message
      };
    } catch (err: any) {
      results.select = {
        success: false,
        error: err.message
      };
    }
    
    // Test RPC function
    try {
      const { data, error } = await supabase.rpc('save_visa_package', {
        p_country_id: countryId,
        p_name: 'RPC Test Package',
        p_government_fee: 20,
        p_service_fee: 20,
        p_processing_days: 20
      });
      
      results.rpc = {
        success: !error,
        data,
        error: error?.message
      };
    } catch (err: any) {
      results.rpc = {
        success: false,
        error: err.message
      };
    }
    
    return {
      success: results.view.success || results.select.success || results.rpc.success,
      message: 'Tests completed. See results for details.',
      results
    };
  } catch (err: any) {
    console.error('Error in testVisaPackagesOperations:', err);
    return {
      success: false,
      message: `Error testing operations: ${err.message}`,
      error: err
    };
  }
}
