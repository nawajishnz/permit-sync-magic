
import { supabase } from '@/integrations/supabase/client';
import { VisaPackage } from '@/types/visaPackage';
import { runDiagnostic as runVisaDiagnostic } from '@/services/visaDiagnosticService';

// Export the diagnostic function from the visaPackageService
export const runDiagnostic = runVisaDiagnostic;

export const getCountryVisaPackage = async (countryId: string): Promise<VisaPackage | null> => {
  try {
    console.log('Fetching visa package for country:', countryId);
    
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
      // If we have package data, we'll consider it active if it has pricing set up
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
    
    // Prepare the data to be used for either create or update
    const packageValues = {
      name: packageData.name || 'Visa Package',
      government_fee: packageData.government_fee || 0,
      service_fee: packageData.service_fee || 0,
      processing_days: packageData.processing_days || 15,
      updated_at: new Date().toISOString()
    };
    
    console.log('Package values to save:', packageValues);
    
    if (existingPackage) {
      console.log('Updating existing package with ID:', existingPackage.id);
      // Update existing package - IMPORTANT: total_price is a generated column
      result = await supabase
        .from('visa_packages')
        .update(packageValues)
        .eq('id', existingPackage.id)
        .select();
        
      console.log('Update result:', result);
    } else {
      console.log('Creating new package for country:', packageData.country_id);
      // Create new package - IMPORTANT: total_price is a generated column
      result = await supabase
        .from('visa_packages')
        .insert({
          country_id: packageData.country_id,
          ...packageValues
        })
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
    
    const { data: existingPackage, error: checkError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId)
      .maybeSingle();
      
    if (checkError) throw checkError;

    let result;
    
    if (existingPackage) {
      console.log('Found existing package:', existingPackage);
      
      // "Activate" by ensuring there's a positive price, or "deactivate" by setting fees to 0
      const governmentFee = isActive ? Math.max(existingPackage.government_fee, 1) : 0;
      const serviceFee = isActive ? Math.max(existingPackage.service_fee, 1) : 0;
      
      console.log('Setting fees to:', { governmentFee, serviceFee });
      
      // Update existing package to reflect active/inactive state via pricing
      // IMPORTANT: total_price is a generated column
      result = await supabase
        .from('visa_packages')
        .update({ 
          government_fee: governmentFee,
          service_fee: serviceFee
        })
        .eq('id', existingPackage.id)
        .select();
        
      console.log('Update result:', result);
    } else {
      console.log('No existing package, creating new one');
      
      // Create new package with status represented by pricing
      // IMPORTANT: total_price is a generated column
      result = await supabase
        .from('visa_packages')
        .insert({
          country_id: countryId,
          name: 'Visa Package',
          government_fee: isActive ? 1 : 0,
          service_fee: isActive ? 1 : 0,
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
