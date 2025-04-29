
import { supabase } from '@/integrations/supabase/client';

export interface DocumentItem {
  id?: string;
  country_id: string;
  name: string;
  document_name: string;
  description?: string;
  document_description?: string;
  required: boolean;
}

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

export const saveDocumentChecklist = async (
  countryId: string,
  documents: DocumentItem[]
): Promise<{
  success: boolean;
  message: string;
  data?: DocumentItem[];
}> => {
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
    const savedDocs = data?.map(item => ({
      id: item.id,
      country_id: item.country_id,
      name: item.document_name,
      document_name: item.document_name,
      description: item.document_description,
      document_description: item.document_description,
      required: item.required ?? true
    })) as DocumentItem[];
    
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

export const refreshDocumentSchema = async (): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> => {
  try {
    console.log('Refreshing document schema...');
    
    // Try to access the document_checklist table
    const { data, error } = await supabase
      .from('document_checklist')
      .select('count(*)')
      .single();
      
    if (error) {
      console.error('Error accessing document_checklist table:', error);
      return {
        success: false,
        message: `Schema refresh failed: ${error.message}`
      };
    }
    
    // Safely handle the count
    const count = data && typeof data === 'object' && data !== null && 'count' in data ?
      (typeof data.count === 'number' ? data.count : 0) : 0;
    
    return {
      success: true,
      message: 'Document schema refreshed successfully',
      count
    };
  } catch (error: any) {
    console.error('Error refreshing document schema:', error);
    return {
      success: false,
      message: `Error refreshing document schema: ${error.message}`
    };
  }
};

export const fixDocumentIssues = async (countryId: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
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
    if (existingDocs && typeof existingDocs === 'object' && existingDocs !== null && 'count' in existingDocs) {
      count = typeof existingDocs.count === 'number' ? existingDocs.count : 0;
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
      data
    };
  } catch (error: any) {
    console.error('Error fixing document issues:', error);
    return {
      success: false,
      message: `Error fixing document issues: ${error.message}`
    };
  }
};
