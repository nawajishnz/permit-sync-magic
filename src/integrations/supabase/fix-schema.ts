
import { supabase } from './client';

/**
 * Fix common schema issues with visa_packages table
 */
export async function fixVisaPackagesSchema() {
  console.log('Attempting to fix visa_packages schema...');
  
  try {
    // Step 1: Check if the table exists using a raw query instead of schema tables
    console.log('Checking if visa_packages table exists...');
    const { data: tablesData, error: tablesError } = await supabase.rpc(
      'get_table_info', 
      { p_table_name: 'visa_packages' }
    ).catch(() => ({ data: null, error: { message: 'Function get_table_info not available' } }));
      
    console.log('Table check result:', { tablesData, tablesError });
    const tableExists = tablesData && Array.isArray(tablesData) && tablesData.length > 0;
    
    // Step 2: Try to direct-insert a record with all fields
    // This will help debug any column issues
    try {
      console.log('Testing visa_packages table structure with insert operation...');
      const { data: testInsert, error: insertError } = await supabase
        .from('visa_packages')
        .insert({
          country_id: '00000000-0000-0000-0000-000000000000', // Invalid UUID, will fail but shows column errors
          name: 'Test Package',
          government_fee: 0,
          service_fee: 0,
          processing_days: 15
        })
        .select();
        
      console.log('Test insert result:', { testInsert, insertError });
    } catch (insertErr) {
      console.log('Test insert exception:', insertErr);
    }
    
    // Step 3: Try to refresh schema cache
    console.log('Attempting to refresh schema cache...');
    try {
      // Make a dummy request to force schema refresh
      await supabase
        .from('visa_packages')
        .select('count(*)')
        .limit(1)
        .throwOnError();
      
      await supabase
        .from('countries')
        .select('count(*)')
        .limit(1)
        .throwOnError();
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
    rpc: { success: false }
  };
  
  try {
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
    
    // Test INSERT
    try {
      // Only try insert if no record exists
      if (!results.select.data || results.select.data.length === 0) {
        const { data, error } = await supabase
          .from('visa_packages')
          .insert({
            country_id: countryId,
            name: 'Test Package',
            government_fee: 0,
            service_fee: 0,
            processing_days: 15
          })
          .select();
          
        results.insert = {
          success: !error,
          data,
          error: error?.message
        };
        
        // Store ID for update test
        if (data && data.length > 0) {
          results.recordId = data[0].id;
        }
      } else {
        results.insert = {
          success: true,
          skipped: 'Record already exists'
        };
        results.recordId = results.select.data[0].id;
      }
    } catch (err: any) {
      results.insert = {
        success: false,
        error: err.message
      };
    }
    
    // Test UPDATE
    try {
      if (results.recordId) {
        const { data, error } = await supabase
          .from('visa_packages')
          .update({
            government_fee: 10,
            updated_at: new Date().toISOString()
          })
          .eq('id', results.recordId)
          .select();
          
        results.update = {
          success: !error,
          data,
          error: error?.message
        };
      } else {
        results.update = {
          success: false,
          skipped: 'No record ID available'
        };
      }
    } catch (err: any) {
      results.update = {
        success: false,
        error: err.message
      };
    }
    
    // Test RPC function
    try {
      const { data, error } = await supabase.rpc('save_visa_package', {
        country_id: countryId,
        government_fee: 20,
        service_fee: 20,
        processing_days: 20
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
      success: results.select.success || results.insert.success || results.update.success || results.rpc.success,
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

