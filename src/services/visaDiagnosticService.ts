import { supabase } from '@/lib/supabase';

// Interface for diagnostic result
interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

// Check if the visa_packages table has the expected structure
export const checkTableStructure = async (): Promise<DiagnosticResult> => {
  try {
    console.log('Checking visa_packages table structure...');
    
    // Call the utility function to get table info
    const { data: tableInfo, error } = await supabase
      .rpc('get_table_info', { p_table_name: 'visa_packages' });
      
    if (error) {
      console.error('Error checking table structure:', error);
      return {
        success: false,
        message: `Failed to check table structure: ${error.message}`,
        details: { error },
        timestamp: new Date().toISOString()
      };
    }
    
    // Check if required columns exist
    const requiredColumns = [
      'id', 'country_id', 'name', 'government_fee', 
      'service_fee', 'processing_days', 'total_price'
    ];
    
    const missingColumns = requiredColumns.filter(col => 
      !tableInfo || !Array.isArray(tableInfo) || 
      !tableInfo.some((column: any) => column.column_name === col)
    );
    
    if (missingColumns.length > 0) {
      return {
        success: false,
        message: `Missing required columns: ${missingColumns.join(', ')}`,
        details: { tableInfo, missingColumns },
        timestamp: new Date().toISOString()
      };
    }
    
    // Check for total_price as a generated column
    const totalPriceColumn = Array.isArray(tableInfo) && 
      tableInfo.find((column: any) => column.column_name === 'total_price');
      
    if (!totalPriceColumn) {
      return {
        success: false,
        message: 'total_price column is missing',
        details: { tableInfo },
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: true,
      message: 'Table structure appears valid',
      details: { tableInfo },
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error in checkTableStructure:', error);
    return {
      success: false,
      message: error.message || 'Unknown error checking table structure',
      details: { error: error.toString() },
      timestamp: new Date().toISOString()
    };
  }
};

// Check if a specific country has a valid visa package
export const checkCountryPackage = async (countryId: string): Promise<DiagnosticResult> => {
  try {
    console.log('Checking visa package for country:', countryId);
    
    if (!countryId) {
      return {
        success: false,
        message: 'Country ID is required',
        timestamp: new Date().toISOString()
      };
    }
    
    // Check if country exists
    const { data: country, error: countryError } = await supabase
      .from('countries')
      .select('id, name')
      .eq('id', countryId)
      .single();
      
    if (countryError || !country) {
      return {
        success: false,
        message: countryError ? countryError.message : 'Country not found',
        details: { countryId, error: countryError },
        timestamp: new Date().toISOString()
      };
    }
    
    // Check if package exists
    const { data: packageData, error: packageError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId)
      .maybeSingle();
      
    if (packageError) {
      return {
        success: false,
        message: `Error fetching package: ${packageError.message}`,
        details: { countryId, error: packageError },
        timestamp: new Date().toISOString()
      };
    }
    
    if (!packageData) {
      // Create default package
      const { data: newPackage, error: createError } = await supabase
        .from('visa_packages')
        .insert({
          country_id: countryId,
          name: `${country.name} Visa Package`,
          government_fee: 0,
          service_fee: 0,
          processing_days: 15
        })
        .select()
        .single();
        
      if (createError) {
        return {
          success: false,
          message: `Failed to create default package: ${createError.message}`,
          details: { countryId, error: createError },
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        success: true,
        message: 'Created a default visa package for this country',
        details: { countryId, createdPackage: newPackage },
        timestamp: new Date().toISOString()
      };
    }
    
    // Package exists, check if it's properly configured
    const totalPrice = (packageData.government_fee || 0) + (packageData.service_fee || 0);
    const isActive = totalPrice > 0;
    
    return {
      success: true,
      message: isActive 
        ? 'Visa package is properly configured and active' 
        : 'Visa package exists but is not active (fees are zero)',
      details: { 
        countryId,
        packageData,
        isActive,
        totalPrice
      },
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error in checkCountryPackage:', error);
    return {
      success: false,
      message: error.message || 'Unknown error checking country package',
      details: { error: error.toString(), countryId },
      timestamp: new Date().toISOString()
    };
  }
};

// Run all diagnostic checks
export const runDiagnostic = async (countryId?: string): Promise<DiagnosticResult> => {
  console.log('Running visa package diagnostics', countryId ? `for country ${countryId}` : 'for all components');
  
  try {
    // First check table structure
    const structureResult = await checkTableStructure();
    if (!structureResult.success) {
      return structureResult;
    }
    
    // If countryId provided, check that specific country
    if (countryId) {
      return await checkCountryPackage(countryId);
    }
    
    // Otherwise return successful structure check
    return structureResult;
  } catch (error: any) {
    console.error('Error running diagnostics:', error);
    return {
      success: false,
      message: error.message || 'Unknown error during diagnostic',
      details: { error: error.toString() },
      timestamp: new Date().toISOString()
    };
  }
};

// Run schema fixes, typically called by the fix-schema module
export const fixVisaPackageSchema = async (): Promise<DiagnosticResult> => {
  console.log('Attempting to fix visa package schema...');
  
  try {
    // Fetch SQL from the database (leveraging RPC function that might be set up)
    const { data, error } = await supabase
      .rpc('get_visa_package_fix_sql');
      
    if (!error && data) {
      console.log('Retrieved fix SQL from database');
      
      // Execute the SQL directly
      const { error: execError } = await supabase.rpc('exec_sql', { sql: data });
      if (execError) {
        return {
          success: false,
          message: `Failed to execute fix SQL: ${execError.message}`,
          details: { error: execError },
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        success: true,
        message: 'Successfully applied schema fixes from database',
        timestamp: new Date().toISOString()
      };
    }
    
    // If we couldn't get SQL from the database, just run diagnostics
    console.log('Could not retrieve fix SQL, running diagnostics instead');
    const diagnosticResult = await runDiagnostic();
    
    return {
      ...diagnosticResult,
      message: 'Ran diagnostics but no automatic fixes were applied. ' + diagnosticResult.message
    };
  } catch (error: any) {
    console.error('Error fixing visa package schema:', error);
    return {
      success: false,
      message: error.message || 'Unknown error fixing schema',
      details: { error: error.toString() },
      timestamp: new Date().toISOString()
    };
  }
};
