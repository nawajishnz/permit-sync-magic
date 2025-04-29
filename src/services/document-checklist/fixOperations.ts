
import { supabase } from '@/integrations/supabase/client';
import { DocumentItem, FixResult } from './types';
import { getDocumentChecklist } from './fetchOperations';
import { saveDocumentChecklist } from './saveOperations';

/**
 * Fixes document issues for a country
 */
export const fixDocumentIssues = async (countryId: string): Promise<FixResult> => {
  try {
    console.log('Fixing document issues for country:', countryId);
    
    // Check if documents exist
    const existingDocs = await getDocumentChecklist(countryId);
    
    // If documents already exist, we're good
    if (existingDocs && existingDocs.length > 0) {
      console.log('Documents already exist, no fix needed');
      return {
        success: true,
        message: 'No fix required - documents already exist'
      };
    }
    
    console.log('No documents found, creating default documents');
    
    // Create default documents
    const defaultDocs: DocumentItem[] = [
      {
        country_id: countryId,
        name: 'Valid Passport',
        document_name: 'Valid Passport',
        description: 'A valid passport with at least 6 months validity remaining',
        document_description: 'A valid passport with at least 6 months validity remaining',
        required: true
      },
      {
        country_id: countryId,
        name: 'Passport Photos',
        document_name: 'Passport Photos',
        description: 'Two recent passport-size color photographs with white background',
        document_description: 'Two recent passport-size color photographs with white background',
        required: true
      },
      {
        country_id: countryId,
        name: 'Visa Application Form',
        document_name: 'Visa Application Form',
        description: 'Completed and signed visa application form',
        document_description: 'Completed and signed visa application form',
        required: true
      }
    ];
    
    // Save the default documents
    const result = await saveDocumentChecklist(countryId, defaultDocs);
    
    if (!result.success) {
      return {
        success: false,
        message: `Failed to create default documents: ${result.message}`
      };
    }
    
    return {
      success: true,
      message: 'Created default documents successfully',
      data: result.data
    };
  } catch (error: any) {
    console.error('Error fixing document issues:', error);
    return {
      success: false,
      message: `Error fixing document issues: ${error.message}`
    };
  }
};
