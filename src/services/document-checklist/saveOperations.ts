
import { supabase } from '@/integrations/supabase/client';
import { DocumentItem, DocumentResult } from './types';

/**
 * Saves document checklist for a specific country
 */
export const saveDocumentChecklist = async (
  countryId: string,
  documents: DocumentItem[]
): Promise<DocumentResult> => {
  try {
    if (!countryId) {
      return {
        success: false,
        message: 'Country ID is required'
      };
    }

    if (!documents || documents.length === 0) {
      return {
        success: false,
        message: 'No documents provided'
      };
    }

    console.log(`Saving ${documents.length} documents for country ${countryId}`);

    // First, delete existing documents for this country
    const { error: deleteError } = await supabase
      .from('document_checklist')
      .delete()
      .eq('country_id', countryId);

    if (deleteError) {
      console.error('Error deleting existing documents:', deleteError);
      throw deleteError;
    }

    // Then, insert the new documents
    // Map to the expected database schema fields
    const docsToInsert = documents.map(doc => ({
      country_id: countryId,
      document_name: doc.name || doc.document_name || 'Document',
      document_description: doc.description || doc.document_description || '',
      required: doc.required ?? true
    }));

    const { data, error } = await supabase
      .from('document_checklist')
      .insert(docsToInsert)
      .select();

    if (error) {
      console.error('Error inserting new documents:', error);
      throw error;
    }

    console.log(`Successfully saved ${data?.length || 0} documents`);
    // Convert back to our interface format
    let savedDocs: DocumentItem[] = [];
    if (data) {
      savedDocs = data.map(item => ({
        id: item.id,
        country_id: item.country_id,
        name: item.document_name,
        document_name: item.document_name,
        description: item.document_description,
        document_description: item.document_description,
        required: item.required ?? true
      }));
    }
    
    return {
      success: true,
      message: 'Document checklist saved successfully',
      data: savedDocs
    };
  } catch (error: any) {
    console.error('Error saving document checklist:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred'
    };
  }
};
