
import { supabase } from '@/lib/supabase'; // Using from lib directory
import { VisaPackage } from '@/types/visaPackage';
import { runDiagnostic as runVisaDiagnostic } from '@/services/visaDiagnosticService';

// Export the diagnostic function from the visaPackageService
export const runDiagnostic = runVisaDiagnostic;

// Debug function to check database connection and visa_packages table
export const checkDatabaseConnection = async (): Promise<{ success: boolean, message: string }> => {
  try {
    console.log('Testing database connection and visa_packages table structure...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('visa_packages')
      .select('count')
      .limit(1);
      
    if (testError) {
      console.error('Connection test failed:', testError);
      return { success: false, message: `Connection error: ${testError.message}` };
    }
    
    // Get table structure
    const { data: structureData, error: structureError } = await supabase
      .rpc('get_table_info', { p_table_name: 'visa_packages' });
      
    if (structureError) {
      console.error('Failed to check table structure:', structureError);
      return { success: false, message: `Structure check error: ${structureError.message}` };
    }
    
    console.log('Database connection test successful. Table structure:', structureData);
    return { success: true, message: 'Database connection and table structure verified.' };
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
      const isActive = data.total_price > 0 || (data.government_fee > 0 || data.service_fee > 0);
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
      throw checkError;
    }

    let result;
    
    // Ensure all numeric values are properly converted to numbers
    const packageValues = {
      name: packageData.name || 'Visa Package',
      country_id: packageData.country_id,
      government_fee: Number(packageData.government_fee) || 0,
      service_fee: Number(packageData.service_fee) || 0,
      processing_days: Number(packageData.processing_days) || 15,
      updated_at: new Date().toISOString()
    };
    
    console.log('Package values to save:', packageValues);
    
    if (existingPackage && existingPackage.id) {
      console.log('Updating existing package with ID:', existingPackage.id);
      
      // IMPORTANT: We MUST NOT include the total_price field as it's a generated column
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
      throw result.error;
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
    
    // First, check database connection
    const connectionCheck = await checkDatabaseConnection();
    if (!connectionCheck.success) {
      console.warn('Database connection issue detected during toggle:', connectionCheck.message);
    }
    
    const { data: existingPackage, error: checkError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId)
      .maybeSingle();
      
    if (checkError) throw checkError;

    let result;
    
    if (existingPackage) {
      console.log('Found existing package:', existingPackage);
      
      // IMPROVED: Set more reasonable default values when activating
      // "Activate" by ensuring there's a positive price, or "deactivate" by setting fees to 0
      const governmentFee = isActive ? Math.max(existingPackage.government_fee || 0, 10) : 0;
      const serviceFee = isActive ? Math.max(existingPackage.service_fee || 0, 5) : 0;
      
      console.log('Setting fees to:', { governmentFee, serviceFee });
      
      // Use RPC function to ensure proper handling of generated columns
      result = await supabase
        .rpc('save_visa_package', {
          p_country_id: countryId,
          p_name: existingPackage.name || 'Visa Package',
          p_government_fee: governmentFee,
          p_service_fee: serviceFee,
          p_processing_days: existingPackage.processing_days || 15
        });
        
      console.log('Toggle via RPC result:', result);
      
      // If RPC fails, fallback to direct update
      if (result.error) {
        console.warn('RPC failed, falling back to direct update:', result.error);
        
        result = await supabase
          .from('visa_packages')
          .update({ 
            government_fee: governmentFee,
            service_fee: serviceFee,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPackage.id)
          .select();
          
        console.log('Fallback update result:', result);
      }
    } else {
      console.log('No existing package, creating new one');
      
      // Create new package with status represented by pricing
      result = await supabase
        .from('visa_packages')
        .insert({
          country_id: countryId,
          name: 'Visa Package',
          government_fee: isActive ? 10 : 0,
          service_fee: isActive ? 5 : 0,
          processing_days: 15,
          updated_at: new Date().toISOString()
        })
        .select();
        
      console.log('Insert result:', result);
    }

    if (result.error) {
      console.error('Error updating package status:', result.error);
      throw result.error;
    }

    // Verify the update was successful
    const { data: verifyData, error: verifyError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId)
      .maybeSingle();
      
    if (verifyError) {
      console.warn('Could not verify status update:', verifyError);
    } else {
      console.log('Verified status update:', verifyData);
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
