
import { supabase } from '@/integrations/supabase/client';
import { DocumentItem } from './types';

/**
 * Fetches document checklist for a specific country
 */
export const getDocumentChecklist = async (countryId: string): Promise<DocumentItem[]> => {
  try {
    console.log('Fetching document checklist for country:', countryId);
    
    const { data, error } = await supabase
      .from('document_checklist')
      .select('*')
      .eq('country_id', countryId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching document checklist:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No documents found, returning empty array');
      return [];
    }
    
    console.log(`Found ${data.length} documents for country ${countryId}`);
    return data.map(doc => ({
      id: doc.id,
      country_id: doc.country_id,
      name: doc.document_name, // Map document_name to name for backwards compatibility
      document_name: doc.document_name,
      description: doc.document_description, // Map document_description to description
      document_description: doc.document_description,
      required: doc.required ?? true
    }));
  } catch (error) {
    console.error('Error in getDocumentChecklist:', error);
    throw error;
  }
};
