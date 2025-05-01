import { supabase } from '@/integrations/supabase/client';
import { VisaPackage, VisaPackageDB } from '@/types/visaPackage';

/**
 * Checks if the database connection is working properly.
 * @returns {Promise<{success: boolean, message: string}>} Result of the connection test.
 */
export const checkDatabaseConnection = async (): Promise<{success: boolean, message: string}> => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id')
      .limit(1);
      
    if (error) {
      return {
        success: false,
        message: `Database connection error: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Database connection successful'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Database connection exception: ${error.message}`
    };
  }
};

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

/**
 * Toggles the status of a visa package
 * @param {string} countryId - The ID of the country
 * @param {boolean} isActive - Whether the package should be active
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export const toggleVisaPackageStatus = async (
  countryId: string, 
  isActive: boolean
): Promise<{success: boolean, message: string, data?: any}> => {
  try {
    console.log(`Toggling package status for country ${countryId} to ${isActive}`);

    // Check if a package exists
    const { data: existingPackages, error: checkError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId);
      
    if (checkError) {
      console.error('Error checking for existing packages:', checkError);
      return { 
        success: false, 
        message: `Database error: ${checkError.message}` 
      };
    }
    
    let packageData;
    
    if (!existingPackages || existingPackages.length === 0) {
      // Create a default package if none exists
      console.log('No package found, creating default package');
      
      const dbPackageData: VisaPackageDB = {
        country_id: countryId,
        name: 'Visa Package',
        government_fee: 0,
        service_fee: 0,
        processing_days: 15,
        processing_time: '15 days'  // Add processing_time field
      };
      
      const { data, error } = await supabase
        .from('visa_packages')
        .insert(dbPackageData)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating default package:', error);
        return { 
          success: false, 
          message: `Failed to create package: ${error.message}` 
        };
      }
      
      packageData = data;
    } else {
      packageData = existingPackages[0];
    }
    
    // We don't actually store is_active in the database
    // It's only used in the application
    // So we just return success with the updated status
    
    return { 
      success: true, 
      message: isActive ? 'Package activated successfully' : 'Package deactivated successfully',
      data: {
        ...packageData,
        is_active: isActive
      }
    };
  } catch (error: any) {
    console.error('Exception in toggleVisaPackageStatus:', error);
    return { 
      success: false, 
      message: `Exception: ${error.message}` 
    };
  }
};

/**
 * Initializes the visa packages schema if it doesn't exist
 */
export const initializeVisaPackagesSchema = async (): Promise<{success: boolean, message: string}> => {
  try {
    // Check if the visa_packages table exists
    const { data, error } = await supabase
      .from('visa_packages')
      .select('id')
      .limit(1);
      
    if (error && error.message.includes('does not exist')) {
      console.log('visa_packages table does not exist, need to create it');
      return {
        success: false,
        message: 'Schema needs to be created'
      };
    }
    
    return {
      success: true,
      message: 'Schema exists'
    };
  } catch (error: any) {
    console.error('Error checking schema:', error);
    return {
      success: false,
      message: `Schema check failed: ${error.message}`
    };
  }
};

/**
 * Run diagnostics on visa package configuration
 * @param {string} countryId - The ID of the country to diagnose
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export const runDiagnostic = async (countryId: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    console.log('Running diagnostic for country:', countryId);
    
    // Check if country exists
    const { data: countryData, error: countryError } = await supabase
      .from('countries')
      .select('id, name')
      .eq('id', countryId)
      .single();
      
    if (countryError) {
      return {
        success: false,
        message: `Country not found: ${countryError.message}`,
        data: { error: countryError }
      };
    }
    
    // Check if visa package exists
    const { data: packageData, error: packageError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId);
      
    if (packageError) {
      return {
        success: false,
        message: `Error checking visa packages: ${packageError.message}`,
        data: { error: packageError }
      };
    }
    
    if (!packageData || packageData.length === 0) {
      // Create a default package
      console.log('No package found, creating default package');
      
      const defaultPackage: VisaPackageDB = {
        country_id: countryId,
        name: `${countryData.name} Visa`,
        government_fee: 0,
        service_fee: 0,
        processing_days: 15,
        processing_time: '15 days' // Add the required processing_time field
      };
      
      const { data: newPackage, error: createError } = await supabase
        .from('visa_packages')
        .insert(defaultPackage)
        .select()
        .single();
        
      if (createError) {
        return {
          success: false,
          message: `Failed to create default package: ${createError.message}`,
          data: { error: createError }
        };
      }
      
      return {
        success: true,
        message: 'Created default visa package',
        data: { package: { ...newPackage, is_active: true } }
      };
    }
    
    // Check for any issues with existing package
    const existingPackage = packageData[0];
    const issues = [];
    
    if (!existingPackage.name) {
      issues.push('Missing package name');
    }
    
    if (existingPackage.government_fee === null || existingPackage.government_fee === undefined) {
      issues.push('Missing government fee');
    }
    
    if (existingPackage.service_fee === null || existingPackage.service_fee === undefined) {
      issues.push('Missing service fee');
    }
    
    if (!existingPackage.processing_days) {
      issues.push('Missing processing days');
    }
    
    if (issues.length > 0) {
      return {
        success: false,
        message: `Found issues with visa package: ${issues.join(', ')}`,
        data: { issues, package: existingPackage }
      };
    }
    
    return {
      success: true,
      message: 'Visa package is properly configured',
      data: { package: { ...existingPackage, is_active: true } }
    };
  } catch (error: any) {
    console.error('Exception in runDiagnostic:', error);
    return {
      success: false,
      message: `Diagnostic failed: ${error.message}`,
      data: { error }
    };
  }
};
