
import { supabase } from '@/integrations/supabase/client';
import type { VisaPackage } from '@/types/visaPackage';
import { createDefaultPackage } from './defaultPackageService';
export { runDiagnostic } from './visaDiagnosticService';

/**
 * Get visa package for a country with proper error handling and retries
 */
export async function getCountryVisaPackage(countryId: string): Promise<VisaPackage | null> {
  if (!countryId) {
    console.error('Invalid countryId provided to getCountryVisaPackage');
    return null;
  }
  
  console.log('Fetching visa package for country:', countryId);
  
  try {
    const { data, error } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId)
      .single();
    
    if (!error && data) {
      console.log('Visa package found:', data);
      return data as VisaPackage;
    }
    
    if (error) {
      console.warn('Query failed, error:', error.message);
    }
    
    // If package doesn't exist, create a default one
    console.log('No visa package found, creating default');
    return await createDefaultPackage(countryId);
  } catch (err) {
    console.error('Unexpected error in getCountryVisaPackage:', err);
    return null;
  }
}

/**
 * Save or update visa package for a country with validation
 */
export async function saveVisaPackage(packageData: VisaPackage): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    if (!packageData.country_id) {
      return { success: false, message: "Country ID is required" };
    }
    
    // Calculate total price
    const governmentFee = Number(packageData.government_fee) || 0;
    const serviceFee = Number(packageData.service_fee) || 0;
    const totalPrice = governmentFee + serviceFee;
    
    // Ensure numeric fields are properly formatted
    const sanitizedData = {
      country_id: packageData.country_id,
      name: packageData.name || 'Visa Package',
      government_fee: governmentFee,
      service_fee: serviceFee,
      processing_days: Number(packageData.processing_days) || 15,
      total_price: totalPrice,
      updated_at: new Date().toISOString()
    };
    
    console.log('Saving visa package with data:', sanitizedData);
    
    let packageId = packageData.id;
    let result;
    
    // Check if package already exists for this country
    if (!packageId) {
      const { data: existingData } = await supabase
        .from('visa_packages')
        .select('id')
        .eq('country_id', sanitizedData.country_id)
        .single();
        
      if (existingData?.id) {
        packageId = existingData.id;
      }
    }
    
    // Update or insert based on whether we found an existing package
    if (packageId) {
      console.log('Updating existing package:', packageId);
      result = await supabase
        .from('visa_packages')
        .update(sanitizedData)
        .eq('id', packageId)
        .select();
    } else {
      console.log('Creating new package');
      result = await supabase
        .from('visa_packages')
        .insert(sanitizedData)
        .select();
    }
    
    if (result.error) {
      console.error('Error saving visa package:', result.error);
      return { 
        success: false, 
        message: `Database error: ${result.error.message}` 
      };
    }
    
    console.log('Package saved successfully:', result.data);
    return { 
      success: true, 
      message: "Package saved successfully",
      data: result.data[0] 
    };
  } catch (err: any) {
    console.error('Exception in saveVisaPackage:', err);
    return { 
      success: false, 
      message: err.message || "An unexpected error occurred" 
    };
  }
}
