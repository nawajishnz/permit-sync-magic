
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
          total_price: packageData.total_price,
          updated_at: packageData.updated_at || new Date().toISOString()
        };
      }
    } catch (rpcErr) {
      console.error('RPC function threw an error:', rpcErr);
    }
    
    // If we get here, no package was found - return an empty default package
    // This allows the UI to show and edit data for inactive countries
    console.log('No package found for country, returning default template:', countryId);
    return {
      country_id: countryId,
      name: 'Visa Package',
      government_fee: 0,
      service_fee: 0,
      processing_days: 15,
      total_price: 0,
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

    // First, try the direct method
    let result;
    let saveSuccess = false;
    let errorMessage = '';
    let savedData = null;

    // Check if a package already exists for this country
    const { data: existingPackage, error: checkError } = await supabase
      .from('visa_packages')
      .select('id')
      .eq('country_id', packageData.country_id)
      .maybeSingle();
      
    if (checkError) {
      console.warn('Error checking for existing package:', checkError);
      errorMessage = checkError.message;
    } else {
      try {
        if (existingPackage) {
          // Update existing package
          console.log('Updating existing package:', existingPackage.id);
          
          const { data: updateData, error: updateError } = await supabase
            .from('visa_packages')
            .update({
              name: packageData.name || 'Visa Package',
              government_fee: packageData.government_fee || 0,
              service_fee: packageData.service_fee || 0,
              processing_days: packageData.processing_days || 15,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingPackage.id)
            .select();
            
          if (updateError) {
            console.error('Error updating existing package:', updateError);
            errorMessage = updateError.message;
          } else {
            console.log('Successfully updated package:', updateData);
            saveSuccess = true;
            savedData = { id: existingPackage.id, action: 'updated' };
          }
        } else {
          // Create new package
          console.log('Creating new package for country:', packageData.country_id);
          
          const { data: insertData, error: insertError } = await supabase
            .from('visa_packages')
            .insert({
              country_id: packageData.country_id,
              name: packageData.name || 'Visa Package',
              government_fee: packageData.government_fee || 0,
              service_fee: packageData.service_fee || 0,
              processing_days: packageData.processing_days || 15,
              updated_at: new Date().toISOString()
            })
            .select();
            
          if (insertError) {
            console.error('Error creating new package:', insertError);
            errorMessage = insertError.message;
          } else {
            console.log('Successfully created package:', insertData);
            saveSuccess = true;
            savedData = { id: insertData[0]?.id, action: 'created' };
          }
        }
      } catch (directSaveErr: any) {
        console.error('Error in direct save:', directSaveErr);
        errorMessage = directSaveErr.message;
      }
    }

    // If direct method failed, try using RPC function
    if (!saveSuccess) {
      console.log('Direct save failed, trying RPC method...');
      try {
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

        if (rpcError) {
          console.error('RPC save method failed:', rpcError);
          return {
            success: false,
            message: `Failed to save visa package: ${errorMessage || rpcError.message}`
          };
        } else {
          console.log('RPC save successful:', rpcResult);
          return {
            success: true, 
            message: `Visa package ${rpcResult.action || 'saved'} successfully`,
            data: rpcResult
          };
        }
      } catch (rpcErr: any) {
        console.error('RPC save threw an error:', rpcErr);
        return {
          success: false,
          message: `Failed to save visa package: ${errorMessage || rpcErr.message}`
        };
      }
    } else {
      // Direct save was successful
      return {
        success: true,
        message: `Visa package ${savedData?.action || 'saved'} successfully`,
        data: savedData
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
    // Test direct table access first (more reliable)
    try {
      console.log('Testing direct table access...');
      const { data: existingPackage, error: checkError } = await supabase
        .from('visa_packages')
        .select('id')
        .eq('country_id', countryId)
        .maybeSingle();
        
      if (checkError) {
        console.warn('Error checking for existing package:', checkError);
        results.table = { success: false, error: checkError.message || 'Unknown error' };
      } else {
        // Try to update or create a test entry
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
              processing_days: 10,
              updated_at: new Date().toISOString()
            })
            .select();
            
          results.table = { success: !insertError, error: insertError?.message || null };
        }
        
        if (results.table.success) {
          console.log('Direct table access is working');
        }
      }
    } catch (tableErr: any) {
      results.table = { success: false, error: tableErr.message };
    }
    
    // Test RPC function
    try {
      console.log('Testing RPC function...');
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
      
      if (rpcError) {
        results.rpc = { success: false, error: rpcError.message || 'Unknown RPC error' };
      } else {
        results.rpc = { success: true, error: null };
        console.log('RPC function is working');
      }
    } catch (rpcErr: any) {
      results.rpc = { success: false, error: rpcErr.message };
    }
    
    // Overall diagnostic result
    const success = results.table.success; // Prioritize direct table access over RPC
    const message = success
      ? 'Diagnostic successful. Direct table access is working.'
      : 'Diagnostic failed. Cannot access or update visa packages table.';
      
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
