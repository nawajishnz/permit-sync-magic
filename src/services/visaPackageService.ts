
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all visa packages.
 * @returns {Promise<{ success: boolean; data?: any[]; message?: string }>}
 */
export const getAllVisaPackages = async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
  try {
    const { data, error } = await supabase
      .from('visa_packages')
      .select('*');

    if (error) {
      console.error('Error fetching visa packages:', error);
      return { success: false, message: 'Failed to fetch visa packages', data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Unexpected error fetching visa packages:', error);
    return { success: false, message: error.message || 'Unexpected error', data: [] };
  }
};

/**
 * Fetches a visa package by its ID.
 * @param {string} id - The ID of the visa package to fetch.
 * @returns {Promise<{ success: boolean; data?: any; message?: string }>}
 */
export const getVisaPackageById = async (id: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const { data, error } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching visa package by ID:', error);
      return { success: false, message: 'Failed to fetch visa package', data: null };
    }

    return { success: true, data: data || null };
  } catch (error: any) {
    console.error('Unexpected error fetching visa package by ID:', error);
    return { success: false, message: error.message || 'Unexpected error', data: null };
  }
};

/**
 * Fetches visa packages by country ID.
 * @param {string} countryId - The ID of the country to fetch visa packages for.
 * @returns {Promise<{ success: boolean; data?: any[]; message?: string }>}
 */
export const getVisaPackagesByCountryId = async (countryId: string): Promise<{ success: boolean; data?: any[]; message?: string }> => {
  try {
    const { data, error } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId);

    if (error) {
      console.error('Error fetching visa packages by country ID:', error);
      return { success: false, message: 'Failed to fetch visa packages for the country', data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Unexpected error fetching visa packages by country ID:', error);
    return { success: false, message: error.message || 'Unexpected error', data: [] };
  }
};

/**
 * Creates a new visa package.
 * @param {any} packageData - The data for the new visa package.
 * @returns {Promise<{ success: boolean; data?: any; message?: string }>}
 */
export const createVisaPackage = async (packageData: any): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    // Ensure price field is properly calculated
    if (!packageData.price && (packageData.government_fee || packageData.service_fee)) {
      packageData.price = (packageData.government_fee || 0) + (packageData.service_fee || 0);
    }

    const { data, error } = await supabase
      .from('visa_packages')
      .insert([packageData])
      .select()
      .single();

    if (error) {
      console.error('Error creating visa package:', error);
      return { success: false, message: 'Failed to create visa package', data: null };
    }

    return { success: true, data: data || null };
  } catch (error: any) {
    console.error('Unexpected error creating visa package:', error);
    return { success: false, message: error.message || 'Unexpected error', data: null };
  }
};

/**
 * Updates an existing visa package.
 * @param {string} id - The ID of the visa package to update.
 * @param {any} packageData - The updated data for the visa package.
 * @returns {Promise<{ success: boolean; data?: any; message?: string }>}
 */
export const updateVisaPackage = async (id: string, packageData: any): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    // Ensure price field is properly calculated
    if (!packageData.price && (packageData.government_fee || packageData.service_fee)) {
      packageData.price = (packageData.government_fee || 0) + (packageData.service_fee || 0);
    }

    const { data, error } = await supabase
      .from('visa_packages')
      .update(packageData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating visa package:', error);
      return { success: false, message: 'Failed to update visa package', data: null };
    }

    return { success: true, data: data || null };
  } catch (error: any) {
    console.error('Unexpected error updating visa package:', error);
    return { success: false, message: error.message || 'Unexpected error', data: null };
  }
};

/**
 * Deletes a visa package by its ID.
 * @param {string} id - The ID of the visa package to delete.
 * @returns {Promise<{ success: boolean; message?: string }>}
 */
export const deleteVisaPackage = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('visa_packages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting visa package:', error);
      return { success: false, message: 'Failed to delete visa package' };
    }

    return { success: true, message: 'Visa package deleted successfully' };
  } catch (error: any) {
    console.error('Unexpected error deleting visa package:', error);
    return { success: false, message: error.message || 'Unexpected error' };
  }
};

/**
 * Toggles the active status of a visa package for a country.
 * @param {string} countryId - The ID of the country to toggle package status for.
 * @param {boolean} isActive - The new active status.
 * @returns {Promise<{ success: boolean; message?: string }>}
 */
export const toggleVisaPackageStatus = async (
  countryId: string,
  isActive: boolean
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    console.log(`Toggling package status for country ${countryId} to ${isActive ? 'active' : 'inactive'}`);
    
    if (isActive) {
      // Check if visa package already exists
      const { data: existingPackages, error: checkError } = await supabase
        .from('visa_packages')
        .select('*')
        .eq('country_id', countryId)
        .limit(1);
      
      if (checkError) {
        console.error('Error checking existing packages:', checkError);
        return { 
          success: false, 
          message: `Failed to check existing packages: ${checkError.message}`,
          data: null
        };
      }
      
      // If we have an existing package, update it instead of creating a new one
      if (existingPackages && existingPackages.length > 0) {
        const packageToUpdate = existingPackages[0];
        
        const { error: updateError } = await supabase
          .from('visa_packages')
          .update({
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', packageToUpdate.id);
        
        if (updateError) {
          console.error('Error updating existing package:', updateError);
          return { 
            success: false, 
            message: `Failed to update package: ${updateError.message}`,
            data: null
          };
        }
        
        return { success: true, message: 'Package activated successfully', data: packageToUpdate };
      }
      
      // No existing package, create a new one with all required fields
      const defaultPackage = {
        country_id: countryId,
        name: 'Standard Visa',
        government_fee: 0,
        service_fee: 0,
        processing_days: 15,
        price: 0, // Make sure price is included
        processing_time: '15 business days',
        is_active: true
      };
      
      const { data, error: insertError } = await supabase
        .from('visa_packages')
        .insert(defaultPackage)
        .select();
      
      if (insertError) {
        console.error('Error creating package:', insertError);
        return { 
          success: false, 
          message: `Failed to create package: ${insertError.message}`,
          data: null
        };
      }
      
      return { success: true, message: 'New package created and activated', data };
    } else {
      // Deactivate all packages for this country
      const { error: updateError } = await supabase
        .from('visa_packages')
        .update({ is_active: false })
        .eq('country_id', countryId);
      
      if (updateError) {
        console.error('Error deactivating packages:', updateError);
        return { 
          success: false, 
          message: `Failed to deactivate packages: ${updateError.message}`,
          data: null
        };
      }
      
      return { success: true, message: 'Packages deactivated successfully', data: null };
    }
  } catch (error: any) {
    console.error('Exception in toggleVisaPackageStatus:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      data: null
    };
  }
};

/**
 * Gets the visa package data for a specific country.
 * If a visa package doesn't exist, it returns null.
 * @param {string} countryId - The ID of the country to get the visa package for.
 * @returns {Promise<any>} - The visa package data or null if not found.
 */
export const getCountryVisaPackage = async (countryId: string): Promise<any> => {
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
    
    console.log('Retrieved package data:', packageData);
    return packageData;
  } catch (error: any) {
    console.error('Exception in getCountryVisaPackage:', error);
    return null;
  }
};

/**
 * Saves (creates or updates) a visa package.
 * @param {any} packageData - The visa package data to save.
 * @returns {Promise<{ success: boolean; data?: any; message?: string }>}
 */
export const saveVisaPackage = async (packageData: any): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    if (!packageData) {
      return { 
        success: false, 
        message: 'No package data provided', 
        data: null 
      };
    }
    
    // Calculate total price and set price field
    packageData.price = (packageData.government_fee || 0) + (packageData.service_fee || 0);
    
    // If we have an ID, it's an update operation
    if (packageData.id) {
      return updateVisaPackage(packageData.id, packageData);
    }
    
    // Otherwise, it's a create operation
    return createVisaPackage(packageData);
  } catch (error: any) {
    console.error('Error in saveVisaPackage:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      data: null
    };
  }
};

/**
 * Runs diagnostic operations for a country's visa package.
 * @param {string} countryId - The ID of the country to diagnose.
 * @returns {Promise<{ success: boolean; data?: any; message: string }>}
 */
export const runDiagnostic = async (countryId: string): Promise<{ success: boolean; data?: any; message: string }> => {
  try {
    // Check if visa packages table exists
    const { error: schemaError } = await supabase
      .rpc('check_table_exists', { table_name: 'visa_packages' });
    
    if (schemaError) {
      return { 
        success: false, 
        message: `Schema issue: ${schemaError.message}`,
        data: { schema_error: schemaError }
      };
    }
    
    // Check for package data
    const packageData = await getCountryVisaPackage(countryId);
    
    return {
      success: true,
      message: packageData ? 'Visa package exists' : 'No visa package found',
      data: {
        package_exists: !!packageData,
        package_data: packageData
      }
    };
  } catch (error: any) {
    console.error('Error in runDiagnostic:', error);
    return {
      success: false,
      message: error.message || 'Diagnostic failed',
      data: { error_details: error }
    };
  }
};

/**
 * Checks database connection.
 * @returns {Promise<{ success: boolean; message: string }>}
 */
export const checkDatabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase.from('visa_packages').select('id').limit(1);
    
    if (error) {
      return {
        success: false,
        message: `Database connection issue: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Database connection successful'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Database connection error: ${error.message || 'Unknown error'}`
    };
  }
};

/**
 * Initializes visa packages schema if it doesn't exist.
 * @returns {Promise<{ success: boolean; message: string; data?: any }>}
 */
export const initializeVisaPackagesSchema = async (): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // Import the schema fix service
    const schemaFixService = await import('@/services/schemaFixService');
    
    // Call the fixSchema method from the imported service
    const result = await schemaFixService.default.fixSchema();
    
    return {
      success: result.success,
      message: result.message || 'Schema initialization complete',
      data: result.data
    };
  } catch (error: any) {
    console.error('Error initializing schema:', error);
    return {
      success: false,
      message: error.message || 'Failed to initialize schema',
      data: null
    };
  }
};
