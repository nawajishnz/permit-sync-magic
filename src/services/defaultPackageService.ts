
import { supabase } from '@/integrations/supabase/client';
import type { VisaPackage, VisaPackageDB } from '@/types/visaPackage';

/**
 * Create a default package for a country if none exists
 */
export async function createDefaultPackage(countryId: string): Promise<VisaPackage | null> {
  console.log('Creating default package for country:', countryId);
  
  try {
    // Create a database-compatible object without is_active
    const dbPackageData: VisaPackageDB = {
      country_id: countryId,
      name: 'Visa Package',
      government_fee: 0,
      service_fee: 0,
      processing_days: 15,
      processing_time: '15 days', // Add the required processing_time field
      price: 0 // Add the required price field
    };
    
    // Insert the database-compatible object
    const { data, error } = await supabase
      .from('visa_packages')
      .insert(dbPackageData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating default package:', error);
      
      // Return applicationPackageData with is_active for our app
      const applicationPackageData: VisaPackage = {
        ...dbPackageData,
        is_active: true
      };
      
      return applicationPackageData;
    }
    
    console.log('Default package created successfully:', data);
    
    // Add is_active for our application
    const packageWithIsActive: VisaPackage = {
      ...data,
      is_active: true
    };
    
    return packageWithIsActive;
  } catch (err) {
    console.error('Failed to create default package:', err);
    return null;
  }
}
