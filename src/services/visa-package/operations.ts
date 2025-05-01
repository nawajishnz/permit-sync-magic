
import { supabase } from '@/integrations/supabase/client';
import { VisaPackage, VisaPackageDB } from '@/types/visaPackage';

/**
 * Gets the visa package data for a specific country.
 * If a visa package doesn't exist, it returns null.
 * @param {string} countryId - The ID of the country to get the visa package for.
 * @returns {Promise<VisaPackage | null>} - The visa package data or null if not found.
 */
export const getCountryVisaPackage = async (countryId: string): Promise<VisaPackage | null> => {
  try {
    if (!countryId) {
      console.log('No countryId provided to getCountryVisaPackage');
      return null;
    }
    
    console.log(`Fetching visa package for country ${countryId}`);
    
    // Get the first active package for this country
    const { data: packages, error } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching country visa package:', error);
      return null;
    }
    
    if (!packages || packages.length === 0) {
      console.log(`No visa package found for country ${countryId}`);
      return null;
    }
    
    // Process the package data before returning
    const packageData = packages[0];
    
    // Calculate total price if not set
    if (packageData && !packageData.total_price) {
      packageData.total_price = (packageData.government_fee || 0) + (packageData.service_fee || 0);
    }
    
    // Add is_active property for application use
    const packageWithIsActive: VisaPackage = {
      ...packageData,
      is_active: true
    };
    
    console.log('Retrieved package data:', packageWithIsActive);
    return packageWithIsActive;
  } catch (error: any) {
    console.error('Exception in getCountryVisaPackage:', error);
    return null;
  }
};

/**
 * Saves a visa package for a country
 * @param {VisaPackage} packageData - The package data to save
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export const saveVisaPackage = async (
  packageData: VisaPackage
): Promise<{success: boolean, message: string, data?: any}> => {
  try {
    if (!packageData.country_id) {
      return { 
        success: false, 
        message: 'Country ID is required' 
      };
    }

    console.log('Saving visa package with data:', packageData);
    
    // Create a database-compatible object without is_active
    const dbPackageData: VisaPackageDB = {
      country_id: packageData.country_id,
      name: packageData.name || 'Visa Package',
      government_fee: Number(packageData.government_fee) || 0,
      service_fee: Number(packageData.service_fee) || 0,
      processing_days: Number(packageData.processing_days) || 15,
      processing_time: packageData.processing_time || `${Number(packageData.processing_days) || 15} days` // Add processing_time field
    };
    
    if (packageData.id) {
      dbPackageData.id = packageData.id;
    }
    
    // Calculate total price
    const totalPrice = dbPackageData.government_fee + dbPackageData.service_fee;
    dbPackageData.total_price = totalPrice;
    
    // Check if a package already exists for this country
    const { data: existingPackages, error: checkError } = await supabase
      .from('visa_packages')
      .select('id')
      .eq('country_id', packageData.country_id);
      
    if (checkError) {
      console.error('Error checking for existing packages:', checkError);
      return { 
        success: false, 
        message: `Database error: ${checkError.message}` 
      };
    }
    
    let result;
    
    if (existingPackages && existingPackages.length > 0 && !packageData.id) {
      // Update the existing package if no specific ID was provided
      result = await supabase
        .from('visa_packages')
        .update(dbPackageData)
        .eq('country_id', packageData.country_id)
        .select()
        .single();
    } else if (packageData.id) {
      // Update the specific package by ID
      result = await supabase
        .from('visa_packages')
        .update(dbPackageData)
        .eq('id', packageData.id)
        .select()
        .single();
    } else {
      // Create a new package
      result = await supabase
        .from('visa_packages')
        .insert(dbPackageData)
        .select()
        .single();
    }
    
    if (result.error) {
      console.error('Error saving visa package:', result.error);
      return { 
        success: false, 
        message: `Database error: ${result.error.message}` 
      };
    }
    
    // Add is_active for our application, using the value from packageData or default to true
    const savedPackage: VisaPackage = {
      ...result.data,
      is_active: packageData.is_active !== undefined ? packageData.is_active : true
    };
    
    console.log('Visa package saved successfully:', savedPackage);
    
    return { 
      success: true, 
      message: 'Visa package saved successfully', 
      data: savedPackage 
    };
  } catch (error: any) {
    console.error('Exception in saveVisaPackage:', error);
    return { 
      success: false, 
      message: `Exception: ${error.message}` 
    };
  }
};
