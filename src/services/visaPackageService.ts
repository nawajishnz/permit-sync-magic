
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
      return data as VisaPackage;
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

    // Calculate total price
    const totalPrice = (packageData.government_fee || 0) + (packageData.service_fee || 0);

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
    
    if (existingPackage) {
      // Update existing package
      result = await supabase
        .from('visa_packages')
        .update({
          name: packageData.name || 'Visa Package',
          government_fee: packageData.government_fee || 0,
          service_fee: packageData.service_fee || 0,
          processing_days: packageData.processing_days || 15,
          total_price: totalPrice,
          is_active: packageData.is_active !== undefined ? packageData.is_active : true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPackage.id)
        .select();
    } else {
      // Create new package
      result = await supabase
        .from('visa_packages')
        .insert({
          country_id: packageData.country_id,
          name: packageData.name || 'Visa Package',
          government_fee: packageData.government_fee || 0,
          service_fee: packageData.service_fee || 0,
          processing_days: packageData.processing_days || 15,
          total_price: totalPrice,
          is_active: packageData.is_active !== undefined ? packageData.is_active : true,
          updated_at: new Date().toISOString()
        })
        .select();
    }

    if (result.error) {
      console.error('Error saving package:', result.error);
      throw result.error;
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
    const { data: existingPackage, error: checkError } = await supabase
      .from('visa_packages')
      .select('id')
      .eq('country_id', countryId)
      .maybeSingle();
      
    if (checkError) throw checkError;

    let result;
    
    if (existingPackage) {
      // Update existing package status
      result = await supabase
        .from('visa_packages')
        .update({ is_active: isActive })
        .eq('id', existingPackage.id)
        .select();
    } else {
      // Create new package with status
      result = await supabase
        .from('visa_packages')
        .insert({
          country_id: countryId,
          name: 'Visa Package',
          government_fee: 0,
          service_fee: 0,
          processing_days: 15,
          total_price: 0,
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .select();
    }

    if (result.error) throw result.error;

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
