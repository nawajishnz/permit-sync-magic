
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
