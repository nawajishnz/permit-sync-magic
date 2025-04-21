import { supabase } from './client';

/**
 * Since we can't directly run SQL commands through the client, this function
 * simply checks for the existence of the required columns in the visa_packages table 
 * and reports back the current status. This can help diagnose schema issues.
 */
export const updateSchemaAndFixData = async () => {
  console.log('Running schema diagnostic and reporting...');
  
  try {
    // Step 1: Check if tables and columns exist using simple queries
    const databaseStructure = await checkDatabaseStructure();
    console.log('Database structure:', databaseStructure);
    
    // Step 2: Try to use the RPC functions if available
    const rpcFunctionsStatus = await checkRpcFunctions();
    console.log('RPC functions status:', rpcFunctionsStatus);
    
    // Step 3: Create direct workaround functions (that don't require execute_sql)
    const directSaveFunctions = createDirectSaveFunctions();
    console.log('Created direct save functions');
    
    return {
      success: true,
      message: 'Schema diagnostic completed. See console for details.',
      databaseStructure,
      rpcFunctionsStatus,
      columns: databaseStructure.visa_packages?.columns || []
    };
  } catch (error: any) {
    console.error('Error checking schema:', error);
    return {
      success: false,
      message: `Error checking schema: ${error.message}`,
      error
    };
  }
};

/**
 * Check the structure of the database tables and columns
 */
const checkDatabaseStructure = async () => {
  const result: any = {
    visa_packages: { exists: false, columns: [] },
    countries: { exists: false, columns: [] }
  };
  
  // Check visa_packages table
  try {
    const { data: visaPackages, error: vpError } = await supabase
      .from('visa_packages')
      .select('*')
      .limit(1);
      
    if (vpError) {
      console.error('Error checking visa_packages:', vpError);
      result.visa_packages.error = vpError.message;
    } else {
      result.visa_packages.exists = true;
      
      // Check columns
      if (visaPackages && visaPackages.length > 0) {
        result.visa_packages.columns = Object.keys(visaPackages[0]);
        result.visa_packages.sampleData = visaPackages[0];
      } else if (!vpError) {
        // Table exists but is empty
        const { data: columns, error: colError } = await supabase
          .rpc('get_table_info', { p_table_name: 'visa_packages' });
          
        if (!colError && columns) {
          result.visa_packages.columns = columns.map((col: any) => col.column_name);
        }
      }
    }
  } catch (e: any) {
    result.visa_packages.error = e.message;
  }
  
  // Check countries table
  try {
    const { data: countries, error: cError } = await supabase
      .from('countries')
      .select('*')
      .limit(1);
      
    if (cError) {
      console.error('Error checking countries:', cError);
      result.countries.error = cError.message;
    } else {
      result.countries.exists = true;
      
      // Check columns
      if (countries && countries.length > 0) {
        result.countries.columns = Object.keys(countries[0]);
        result.countries.sampleData = countries[0];
      }
    }
  } catch (e: any) {
    result.countries.error = e.message;
  }
  
  // Additional check for relationships
  if (result.visa_packages.exists && result.countries.exists) {
    try {
      const { data: joined, error: joinError } = await supabase
        .from('visa_packages')
        .select('*, countries(*)')
        .limit(1);
        
      if (!joinError) {
        result.relationships = { visa_packages_to_countries: true };
      } else {
        result.relationships = { 
          visa_packages_to_countries: false,
          error: joinError.message
        };
      }
    } catch (e: any) {
      result.relationships = { 
        visa_packages_to_countries: false,
        error: e.message
      };
    }
  }
  
  return result;
};

/**
 * Check if RPC functions are available
 */
const checkRpcFunctions = async () => {
  const result: any = {
    get_table_info: { exists: false },
    save_visa_package: { exists: false }
  };
  
  // Check get_table_info function
  try {
    const { data: tableInfo, error: tiError } = await supabase
      .rpc('get_table_info', { p_table_name: 'visa_packages' });
      
    if (tiError) {
      console.error('Error checking get_table_info function:', tiError);
      result.get_table_info.error = tiError.message;
    } else {
      result.get_table_info.exists = true;
      result.get_table_info.sample_output = tableInfo;
    }
  } catch (e: any) {
    result.get_table_info.error = e.message;
  }
  
  // Check save_visa_package function
  try {
    // We just check if it exists, we don't want to actually save anything yet
    const { data: savePackage, error: spError } = await supabase
      .rpc('save_visa_package', { 
        p_country_id: '00000000-0000-0000-0000-000000000000', // Invalid UUID, should fail but detect function
        p_name: 'Test Package',
        p_government_fee: 0,
        p_service_fee: 0,
        p_processing_days: 0
      });
      
    // If we get a proper PostgreSQL error about the UUID being invalid, the function exists
    if (spError && (spError as any).code === '22P02') {
      result.save_visa_package.exists = true;
      result.save_visa_package.error = 'Expected UUID error (function exists)';
    } else if (spError) {
      // Some other error
      result.save_visa_package.error = spError.message;
    } else {
      // Somehow it worked?
      result.save_visa_package.exists = true;
      result.save_visa_package.sample_output = savePackage;
    }
  } catch (e: any) {
    result.save_visa_package.error = e.message;
  }
  
  return result;
};

/**
 * Create direct save functions that don't rely on RPC
 */
const createDirectSaveFunctions = () => {
  // Add the saveVisaPackageDirectly function to the window object
  // so it can be called from anywhere in the app
  (window as any).saveVisaPackageDirectly = async (
    countryId: string,
    name: string,
    governmentFee: number,
    serviceFee: number,
    processingDays: number
  ) => {
    console.log('Direct save called with:', { 
      countryId, name, governmentFee, serviceFee, processingDays
    });
    
    try {
      // Check if a package already exists for this country
      const { data: existingPackages, error: checkError } = await supabase
        .from('visa_packages')
        .select('id')
        .eq('country_id', countryId);
      
      if (checkError) {
        throw checkError;
      }
      
      const packageExists = existingPackages && existingPackages.length > 0;
      const existingId = packageExists ? existingPackages[0].id : null;
      
      // Prepare data object with minimal fields
      const packageData = {
        country_id: countryId,
        name: name || 'Visa Package',
        government_fee: governmentFee || 0,
        service_fee: serviceFee || 0,
        processing_days: processingDays || 0
      };
      
      // If the database doesn't have these columns, we'll handle the error later
      
      let result;
      
      if (existingId) {
        // Update
        const { data, error } = await supabase
          .from('visa_packages')
          .update(packageData)
          .eq('id', existingId)
          .select();
          
        if (error) throw error;
        result = { success: true, action: 'updated', data };
      } else {
        // Insert
        const { data, error } = await supabase
          .from('visa_packages')
          .insert(packageData)
          .select();
          
        if (error) throw error;
        result = { success: true, action: 'created', data };
      }
      
      console.log('Direct save completed successfully:', result);
      return result;
    } catch (error: any) {
      console.error('Error in direct save:', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error'
      };
    }
  };
  
  return {
    saveVisaPackageDirectly: (window as any).saveVisaPackageDirectly
  };
};

// Export a function that tries to directly interact with visa_packages 
// and adds the missing fields with appropriate data types
export const createDatabaseFunctions = async () => {
  console.log('Attempting direct database fixes...');
  
  // We'll try to add the missing columns directly without using RPC
  // This might not work with all Supabase implementations, but it's worth a try
  try {
    // Add the columns one by one if they don't exist
    // We'll do this with a try/catch for each column
    const columnResults = {
      government_fee: await tryAddColumn('government_fee', 'numeric', '0'),
      service_fee: await tryAddColumn('service_fee', 'numeric', '0'),
      processing_days: await tryAddColumn('processing_days', 'integer', '0')
    };
    
    // Report the results
    return {
      success: Object.values(columnResults).some(r => r.success),
      message: 'Direct database fixes attempted, check console for details',
      columnResults
    };
  } catch (error: any) {
    console.error('Error in direct database fixes:', error);
    return {
      success: false,
      message: `Error in direct database fixes: ${error.message}`,
      error
    };
  }
};

/**
 * Try to add a column directly without RPC
 */
const tryAddColumn = async (
  columnName: string, 
  dataType: string, 
  defaultValue: string
) => {
  try {
    // First check if the column exists
    const { data: sampleData, error: sampleError } = await supabase
      .from('visa_packages')
      .select(columnName)
      .limit(1);
      
    if (!sampleError) {
      // Column exists
      return {
        success: true,
        message: `Column ${columnName} already exists`,
        exists: true
      };
    }
    
    // Attempt to add the column using direct SQL (unlikely to work)
    // This is a desperate attempt, but worth trying
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE visa_packages ADD COLUMN IF NOT EXISTS ${columnName} ${dataType} DEFAULT ${defaultValue};`
    });
    
    if (error) {
      console.error(`Error adding column ${columnName}:`, error);
      return {
        success: false,
        message: `Failed to add column ${columnName}: ${error.message}`,
        error
      };
    }
    
    return {
      success: true,
      message: `Successfully added column ${columnName}`,
      data
    };
  } catch (error: any) {
    console.error(`Error trying to add column ${columnName}:`, error);
    return {
      success: false,
      message: `Error trying to add column ${columnName}: ${error.message}`,
      error
    };
  }
}; 