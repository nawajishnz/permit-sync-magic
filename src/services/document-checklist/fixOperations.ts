
import { supabase } from '@/integrations/supabase/client';
import { FixResult } from './types';

/**
 * Fixes document issues for a specific country
 */
export const fixDocumentIssues = async (countryId: string): Promise<FixResult> => {
  try {
    if (!countryId) {
      return {
        success: false,
        message: 'Country ID is required'
      };
    }
    
    console.log('Checking for document issues for country:', countryId);
    
    // Check if documents exist for this country
    const { data: existingDocs, error: checkError } = await supabase
      .from('document_checklist')
      .select('count(*)')
      .eq('country_id', countryId)
      .single();
      
    if (checkError) {
      console.warn('Error checking existing documents:', checkError);
      // Continue with fix attempt despite error
    }
    
    // Safely handle the count
    let count = 0;
    if (existingDocs) {
      if (typeof existingDocs === 'object' && existingDocs !== null && 'count' in existingDocs) {
        const dataCount = existingDocs.count;
        if (typeof dataCount === 'number') {
          count = dataCount;
        }
      }
    }
    
    const hasDocuments = count > 0;
    
    if (hasDocuments) {
      console.log('Country already has document checklist items');
      return {
        success: true,
        message: 'Country already has document checklist items',
        data: { count }
      };
    }
    
    // If no documents, add default ones
    console.log('Adding default document checklist for country');
    
    const defaultDocuments = [
      {
        country_id: countryId,
        document_name: 'Valid Passport',
        document_description: 'Passport must be valid for at least 6 months beyond your stay',
        required: true
      },
      {
        country_id: countryId,
        document_name: 'Passport Photos',
        document_description: 'Recent passport-sized photos with white background',
        required: true
      },
      {
        country_id: countryId,
        document_name: 'Travel Itinerary',
        document_description: 'Flight bookings and travel plan',
        required: true
      }
    ];
    
    const { data, error } = await supabase
      .from('document_checklist')
      .insert(defaultDocuments)
      .select();
      
    if (error) {
      console.error('Error adding default documents:', error);
      return {
        success: false,
        message: `Failed to add default documents: ${error.message}`
      };
    }
    
    console.log('Successfully added default documents:', data);
    return {
      success: true,
      message: 'Default documents added successfully',
      data: data || [] // Safe handling of potentially null data
    };
  } catch (error: any) {
    console.error('Error fixing document issues:', error);
    return {
      success: false,
      message: `Error fixing document issues: ${error.message}`
    };
  }
};
