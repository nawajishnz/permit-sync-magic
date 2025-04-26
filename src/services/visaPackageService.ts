
import { supabase } from '@/integrations/supabase/client';
import { VisaPackage } from '@/types/visaPackage';

export const getCountryVisaPackage = async (countryId: string): Promise<VisaPackage | null> => {
  try {
    console.log('Fetching visa package for country:', countryId);
    
    // Try to get from the visa_packages table directly first
    const { data: directData, error: directError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId)
      .maybeSingle();
    
    if (directError) {
      console.warn('Direct query error:', directError);
    } else if (directData) {
      console.log('Found visa package via direct query:', directData);
      return directData as VisaPackage;
    }
    
    // If direct query failed, try the RPC function
    try {
      console.log('Trying RPC function...');
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_country_packages',
        { p_country_id: countryId }
      );
      
      if (rpcError) {
        console.warn('RPC function error:', rpcError);
      } else if (rpcData && rpcData.length > 0) {
        const packageData = rpcData[0];
        console.log('Found package via RPC:', packageData);
        
        return {
          id: packageData.package_id,
          country_id: packageData.country_id,
          name: packageData.package_name || 'Visa Package',
          government_fee: packageData.government_fee || 0,
          service_fee: packageData.service_fee || 0,
          processing_days: packageData.processing_days || 15,
          total_price: packageData.total_price
        };
      }
    } catch (rpcErr) {
      console.error('RPC function threw an error:', rpcErr);
    }
    
    // If we get here, no package was found
    console.log('No package found for country:', countryId);
    return null;
    
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

    // First try using the RPC function
    try {
      console.log('Attempting to save via RPC function...');
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'save_visa_package',
        {
          p_country_id: packageData.country_id,
          p_name: packageData.name || 'Visa Package',
          p_government_fee: packageData.government_fee || 0,
          p_service_fee: packageData.service_fee || 0,
          p_processing_days: packageData.processing_days || 15
        }
      );
      
      if (!rpcError && rpcResult) {
        console.log('Successfully saved visa package via RPC:', rpcResult);
        return {
          success: true,
          message: 'Visa package saved successfully',
          data: rpcResult
        };
      } else {
        console.warn('RPC function failed:', rpcError);
      }
    } catch (rpcErr) {
      console.error('RPC function threw an error:', rpcErr);
    }
    
    // If RPC fails, try direct table operation
    console.log('Falling back to direct table operation...');
    
    // Check if a package already exists for this country
    const { data: existingPackage, error: checkError } = await supabase
      .from('visa_packages')
      .select('id')
      .eq('country_id', packageData.country_id)
      .maybeSingle();
      
    if (checkError) {
      console.warn('Error checking for existing package:', checkError);
    }
    
    let result;
    
    if (existingPackage) {
      // Update existing package
      console.log('Updating existing package:', existingPackage.id);
      
      result = await supabase
        .from('visa_packages')
        .update({
          name: packageData.name || 'Visa Package',
          government_fee: packageData.government_fee || 0,
          service_fee: packageData.service_fee || 0,
          processing_days: packageData.processing_days || 15,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPackage.id);
        
      if (result.error) {
        console.error('Error updating existing package:', result.error);
        return {
          success: false,
          message: `Failed to update visa package: ${result.error.message}`
        };
      }
      
      return {
        success: true,
        message: 'Visa package updated successfully',
        data: { id: existingPackage.id, action: 'updated' }
      };
      
    } else {
      // Create new package
      console.log('Creating new package for country:', packageData.country_id);
      
      result = await supabase
        .from('visa_packages')
        .insert({
          country_id: packageData.country_id,
          name: packageData.name || 'Visa Package',
          government_fee: packageData.government_fee || 0,
          service_fee: packageData.service_fee || 0,
          processing_days: packageData.processing_days || 15
        })
        .select();
        
      if (result.error) {
        console.error('Error creating new package:', result.error);
        return {
          success: false,
          message: `Failed to create visa package: ${result.error.message}`
        };
      }
      
      return {
        success: true,
        message: 'Visa package created successfully',
        data: { id: result.data?.[0]?.id, action: 'created' }
      };
    }
    
  } catch (error: any) {
    console.error('Error in saveVisaPackage:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred'
    };
  }
};

// For diagnostic purposes
export const runDiagnostic = async (countryId: string) => {
  const results = {
    rpc: { success: false, error: null },
    table: { success: false, error: null }
  };
  
  try {
    // Test RPC function
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'save_visa_package',
        {
          p_country_id: countryId,
          p_name: 'Diagnostic Test',
          p_government_fee: 100,
          p_service_fee: 50,
          p_processing_days: 10
        }
      );
      
      if (!rpcError) {
        results.rpc = { success: true, error: null };
      } else {
        results.rpc = { success: false, error: rpcError.message };
      }
    } catch (rpcErr: any) {
      results.rpc = { success: false, error: rpcErr.message };
    }
    
    // Test direct table access
    try {
      const { data: existingPackage } = await supabase
        .from('visa_packages')
        .select('id')
        .eq('country_id', countryId)
        .maybeSingle();
        
      if (existingPackage) {
        const { error: updateError } = await supabase
          .from('visa_packages')
          .update({
            name: 'Diagnostic Test',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPackage.id);
          
        results.table = { success: !updateError, error: updateError?.message || null };
      } else {
        const { error: insertError } = await supabase
          .from('visa_packages')
          .insert({
            country_id: countryId,
            name: 'Diagnostic Test',
            government_fee: 100,
            service_fee: 50,
            processing_days: 10
          });
          
        results.table = { success: !insertError, error: insertError?.message || null };
      }
    } catch (tableErr: any) {
      results.table = { success: false, error: tableErr.message };
    }
    
    // Overall diagnostic result
    const success = results.rpc.success || results.table.success;
    const message = success
      ? 'Diagnostic successful. At least one method works for saving packages.'
      : 'Diagnostic failed. Neither RPC nor direct table access is working.';
      
    return {
      success,
      message,
      results
    };
    
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Diagnostic failed unexpectedly',
      results
    };
  }
};
