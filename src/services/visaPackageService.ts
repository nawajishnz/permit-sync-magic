
import { supabase } from '@/lib/supabase'; // Using from lib directory
import { VisaPackage } from '@/types/visaPackage';
import { runDiagnostic as runVisaDiagnostic } from '@/services/visaDiagnosticService';
import { fixVisaPackagesSchema } from '@/integrations/supabase/fix-schema';

// Export the diagnostic function from the visaPackageService
export const runDiagnostic = runVisaDiagnostic;

// Debug function to check database connection and visa_packages table
export const checkDatabaseConnection = async (): Promise<{ success: boolean, message: string }> => {
  try {
    console.log('Testing database connection and visa_packages table structure...');
    
    // Test basic connection with a simple select query instead of RPC
    const { data: testData, error: testError } = await supabase
      .from('visa_packages')
      .select('count')
      .limit(1);
      
    if (testError) {
      console.error('Connection test failed:', testError);
      return { success: false, message: `Connection error: ${testError.message}` };
    }
    
    // Instead of using get_table_info RPC, check if table exists using metadata
    console.log('Database connection test successful');
    return { success: true, message: 'Database connection verified.' };
  } catch (error: any) {
    console.error('Database check failed:', error);
    return { success: false, message: `Check failed: ${error.message || 'Unknown error'}` };
  }
};

export const getCountryVisaPackage = async (countryId: string): Promise<VisaPackage | null> => {
  try {
    console.log('Fetching visa package for country:', countryId);
    
    // First, check database connection
    const connectionCheck = await checkDatabaseConnection();
    if (!connectionCheck.success) {
      console.warn('Database connection issue detected:', connectionCheck.message);
    }
    
    const { data, error } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching visa package:', error);
      throw error;
    }
    
    if (data) {
      console.log('Found existing package:', data);
      // Calculate is_active based on having either government_fee or service_fee > 0
      const isActive = (data.government_fee > 0 || data.service_fee > 0);
      return {
        ...data,
        is_active: isActive
      } as VisaPackage;
    }
    
    // Return a default package template if none exists
    console.log('No package found, returning default template');
    return {
      country_id: countryId,
      name: 'Visa Package',
      government_fee: 0,
      service_fee: 0,
      processing_days: 15,
      total_price: 0,
      is_active: false,
      updated_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error in getCountryVisaPackage:', error);
    throw error;
  }
};

// Initialize the visa package schema to ensure all tables and functions exist
export const initializeVisaPackagesSchema = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  console.log('Initializing visa packages schema...');
  try {
    const result = await fixVisaPackagesSchema();
    console.log('Schema initialization result:', result);
    return result;
  } catch (error: any) {
    console.error('Error initializing schema:', error);
    return {
      success: false,
      message: error.message || 'Failed to initialize visa packages schema'
    };
  }
};

export const saveVisaPackage = async (packageData: VisaPackage): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  console.log('Saving visa package with data:', packageData);
  
  try {
    if (!packageData.country_id) {
      return {
        success: false,
        message: 'Country ID is required'
      };
    }

    // Check if a package already exists
    const { data: existingPackage, error: checkError } = await supabase
      .from('visa_packages')
      .select('id')
      .eq('country_id', packageData.country_id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing package:', checkError);
      
      // Try to fix database schema if there's an error
      console.log('Attempting to fix schema...');
      await initializeVisaPackagesSchema();
      
      // Re-check after fix attempt
      const { data: retryPackage, error: retryError } = await supabase
        .from('visa_packages')
        .select('id')
        .eq('country_id', packageData.country_id)
        .maybeSingle();
      
      if (retryError) {
        console.error('Still error after schema fix:', retryError);
        return {
          success: false,
          message: 'Failed to check or create package: ' + retryError.message
        };
      }
      
      // Update our reference if retry worked
      if (retryPackage) {
        console.log('Successfully found package after schema fix:', retryPackage);
        if (!existingPackage) {
          // Create a new empty object if it doesn't exist
          existingPackage = {};
        }
        existingPackage.id = retryPackage.id;
      }
    }

    // Ensure numeric values - force conversion to numbers
    const packageValues: any = {
      name: packageData.name || 'Visa Package',
      country_id: packageData.country_id,
      government_fee: Number(packageData.government_fee || 0),
      service_fee: Number(packageData.service_fee || 0),
      processing_days: Number(packageData.processing_days || 15),
      updated_at: new Date().toISOString(),
      // Add price field to satisfy the not-null constraint
      price: Number(packageData.government_fee || 0) + Number(packageData.service_fee || 0)
    };
    
    // Add processing_time field if needed (since it's required by the schema)
    packageValues.processing_time = `${packageValues.processing_days} business days`;
    
    console.log('Formatted package values to save:', packageValues);

    let result;
    
    if (existingPackage && existingPackage.id) {
      console.log('Updating existing package with ID:', existingPackage.id);
      
      result = await supabase
        .from('visa_packages')
        .update(packageValues)
        .eq('id', existingPackage.id)
        .select();
        
      console.log('Update result:', result);
    } else {
      console.log('Creating new package for country:', packageData.country_id);
      
      result = await supabase
        .from('visa_packages')
        .insert(packageValues)
        .select();
        
      console.log('Insert result:', result);
    }

    if (result.error) {
      console.error('Error saving package:', result.error);
      return {
        success: false,
        message: `Failed to save package: ${result.error.message}`
      };
    }

    // Calculate active status - a package is active if either fee is > 0
    const isActive = packageValues.government_fee > 0 || packageValues.service_fee > 0;
    console.log(`Package active status: ${isActive ? 'ACTIVE' : 'INACTIVE'} (gov fee: ${packageValues.government_fee}, service fee: ${packageValues.service_fee})`);

    // Update the countries table to reflect has_visa_package status
    try {
      console.log(`Updating country ${packageData.country_id} to has_visa_package=${isActive}`);
      const { error: countryUpdateError } = await supabase
        .from('countries')
        .update({
          has_visa_package: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', packageData.country_id);
      
      if (countryUpdateError) {
        console.warn('Could not update country has_visa_package status:', countryUpdateError);
      }
    } catch (countryUpdateErr) {
      console.warn('Error updating country status:', countryUpdateErr);
    }

    // Verify the update was successful by fetching the latest data
    const { data: verifyData, error: verifyError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', packageData.country_id)
      .maybeSingle();
      
    if (verifyError) {
      console.warn('Could not verify saved data:', verifyError);
    } else {
      console.log('Verified saved data:', verifyData);
    }

    return {
      success: true,
      message: `Visa package ${existingPackage ? 'updated' : 'created'} successfully`,
      data: result.data
    };
    
  } catch (error: any) {
    console.error('Error in saveVisaPackage:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred'
    };
  }
};

export const toggleVisaPackageStatus = async (countryId: string, isActive: boolean): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    console.log(`Toggling package status for country ${countryId} to ${isActive ? 'active' : 'inactive'}`);
    
    // First check if the visa_packages table exists with a simple query
    // instead of using the get_table_info RPC function
    const { data, error: tableCheckError } = await supabase
      .from('visa_packages')
      .select('id')
      .limit(1);
    
    if (tableCheckError) {
      console.error('Error checking visa_packages table:', tableCheckError);
      return {
        success: false,
        message: 'Error checking database schema. Please try refreshing the data.'
      };
    }
    
    // Check if the visa_packages table exists
    const { data: existingPackage, error: checkError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing package:', checkError);
      
      // Try to create the table and schema first
      try {
        await initializeVisaPackagesSchema();
      } catch (schemaError) {
        console.error('Error initializing schema:', schemaError);
      }
      
      return {
        success: false,
        message: 'Error checking package status. Schema may be incompatible.'
      };
    }
    
    // Set reasonable default values for a new package
    const defaultValues: any = {
      country_id: countryId,
      name: existingPackage?.name || 'Visa Package',
      government_fee: isActive ? 20 : 0,
      service_fee: isActive ? 10 : 0,
      processing_days: existingPackage?.processing_days || 15
    };
    
    // Always set processing_time since it's required by the schema
    defaultValues.processing_time = `${defaultValues.processing_days} business days`;
    
    // Add price field to satisfy the not-null constraint
    defaultValues.price = defaultValues.government_fee + defaultValues.service_fee;
    
    let result;
    
    if (existingPackage) {
      console.log('Found existing package:', existingPackage);
      
      // Prepare update data
      const updateData: any = {
        government_fee: isActive ? Math.max(existingPackage.government_fee || 20, 20) : 0,
        service_fee: isActive ? Math.max(existingPackage.service_fee || 10, 10) : 0,
        updated_at: new Date().toISOString()
      };
      
      // Always include processing_time to avoid not-null constraint error
      updateData.processing_time = existingPackage.processing_time || 
                                  `${existingPackage.processing_days || 15} business days`;
      
      // Add price field to satisfy the not-null constraint
      updateData.price = updateData.government_fee + updateData.service_fee;
      
      // Update the existing package with new values
      result = await supabase
        .from('visa_packages')
        .update(updateData)
        .eq('id', existingPackage.id)
        .select();
        
      console.log('Update result:', result);
    } else {
      console.log('No existing package, creating new one with status:', isActive);
      
      // Create a new package
      result = await supabase
        .from('visa_packages')
        .insert(defaultValues)
        .select();
        
      console.log('Insert result:', result);
    }

    if (result.error) {
      console.error('Error toggling package status:', result.error);
      return {
        success: false,
        message: `Failed to update package status: ${result.error.message}`
      };
    }

    // Also update the countries table to reflect the package status
    try {
      console.log(`Updating country ${countryId} to has_visa_package=${isActive}`);
      const { error: countryUpdateError } = await supabase
        .from('countries')
        .update({
          has_visa_package: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', countryId);
      
      if (countryUpdateError) {
        console.warn('Could not update country has_visa_package status:', countryUpdateError);
      }
    } catch (countryUpdateErr) {
      console.warn('Error updating country status:', countryUpdateErr);
    }

    // Verify update was successful
    const { data: verifyData, error: verifyError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId)
      .maybeSingle();
      
    if (verifyError) {
      console.warn('Could not verify saved data:', verifyError);
    } else {
      console.log('Verified saved data:', verifyData);
    }

    return {
      success: true,
      message: `Package status ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: result.data
    };
    
  } catch (error: any) {
    console.error('Error toggling package status:', error);
    return {
      success: false,
      message: error.message || 'Failed to update package status'
    };
  }
};

// NEW: Function to add a complete visa package with one call
export const addCompleteVisaPackage = async (
  countryId: string, 
  packageData: {
    name?: string;
    government_fee: number;
    service_fee: number;
    processing_days?: number;
  }
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    console.log('Adding complete visa package for country:', countryId, packageData);
    
    // First make sure the schema is initialized
    await initializeVisaPackagesSchema();
    
    if (!countryId) {
      return {
        success: false,
        message: 'Country ID is required'
      };
    }
    
    // Ensure numeric values
    const packageToSave: VisaPackage = {
      country_id: countryId,
      name: packageData.name || 'Visa Package',
      government_fee: Number(packageData.government_fee) || 0,
      service_fee: Number(packageData.service_fee) || 0,
      processing_days: Number(packageData.processing_days) || 15
    };
    
    // Calculate if this package should be active
    const isActive = packageToSave.government_fee > 0 || packageToSave.service_fee > 0;
    
    // First try to save the package data
    const saveResult = await saveVisaPackage(packageToSave);
    
    // Then make sure the status is set correctly if save was successful
    if (saveResult.success && isActive) {
      const toggleResult = await toggleVisaPackageStatus(countryId, true);
      if (!toggleResult.success) {
        return {
          success: true,
          message: `Package created but activation failed: ${toggleResult.message}`,
          data: saveResult.data
        };
      }
    }
    
    return {
      success: true,
      message: `Complete visa package ${isActive ? 'activated' : 'created'} successfully`,
      data: saveResult.data
    };
  } catch (error: any) {
    console.error('Error in addCompleteVisaPackage:', error);
    return {
      success: false,
      message: error.message || 'Failed to add complete package'
    };
  }
};
