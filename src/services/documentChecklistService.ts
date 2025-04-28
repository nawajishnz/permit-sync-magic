
import { supabase } from '@/integrations/supabase/client';

export interface DocumentItem {
  id: string; // Make id required
  country_id: string;
  document_name: string;
  document_description: string;
  required: boolean;
  isNew?: boolean;
  modified?: boolean;
}

export interface SaveResult {
  success: boolean;
  message: string;
  data?: any;
}

export const getDocumentChecklist = async (countryId: string): Promise<DocumentItem[]> => {
  try {
    console.log('Fetching document checklist for country:', countryId);
    const { data, error } = await supabase
      .from('document_checklist')
      .select('*')
      .eq('country_id', countryId);

    if (error) {
      console.error('Error fetching document checklist:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getDocumentChecklist:', error);
    return [];
  }
};

export const saveDocumentChecklist = async (countryId: string, documents: DocumentItem[]): Promise<SaveResult> => {
  try {
    console.log('Saving document checklist for country:', countryId, 'Documents:', documents);
    
    if (!countryId) {
      return {
        success: false,
        message: 'Country ID is required'
      };
    }

    // First, fetch existing documents for this country
    const { data: existingDocs, error: fetchError } = await supabase
      .from('document_checklist')
      .select('id')
      .eq('country_id', countryId);

    if (fetchError) {
      console.error('Error fetching existing documents:', fetchError);
      return {
        success: false,
        message: `Failed to fetch existing documents: ${fetchError.message}`
      };
    }

    const existingIds = new Set((existingDocs || []).map(doc => doc.id));
    const newDocs: DocumentItem[] = [];
    const updateDocs: DocumentItem[] = [];
    const processedIds = new Set<string>();
    
    // Sort documents into new and updates
    for (const doc of documents) {
      // Skip empty document names - they're probably not meant to be saved
      if (!doc.document_name?.trim()) {
        console.log('Skipping document with empty name:', doc);
        continue;
      }
      
      // Ensure doc.id is always a string
      const docId = doc.id || `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Clone the document to avoid mutating the original
      const cleanDoc = {
        id: docId,
        country_id: countryId,
        document_name: doc.document_name,
        document_description: doc.document_description || '',
        required: !!doc.required
      };
      
      processedIds.add(docId);
      
      if (existingIds.has(docId) && !doc.isNew) {
        updateDocs.push(cleanDoc);
      } else {
        // For new docs, remove the 'id' if it starts with 'new-' or 'temp-'
        if (docId.startsWith('new-') || docId.startsWith('temp-')) {
          delete (cleanDoc as any).id;
        }
        newDocs.push(cleanDoc);
      }
    }
    
    // Find documents to delete (existing but not in the new list)
    const deleteIds = Array.from(existingIds).filter(id => !processedIds.has(id));

    // Track success or error for each operation
    let success = true;
    let errors = [];

    // Delete removed documents
    if (deleteIds.length > 0) {
      console.log('Deleting documents:', deleteIds);
      const { error: deleteError } = await supabase
        .from('document_checklist')
        .delete()
        .in('id', deleteIds);
        
      if (deleteError) {
        console.error('Error deleting documents:', deleteError);
        success = false;
        errors.push(`Delete error: ${deleteError.message}`);
      }
    }

    // Insert new documents
    if (newDocs.length > 0) {
      console.log('Inserting new documents:', newDocs);
      const { error: insertError } = await supabase
        .from('document_checklist')
        .insert(newDocs);
        
      if (insertError) {
        console.error('Error inserting documents:', insertError);
        success = false;
        errors.push(`Insert error: ${insertError.message}`);
      }
    }

    // Update existing documents
    for (const doc of updateDocs) {
      console.log('Updating document:', doc);
      const { error: updateError } = await supabase
        .from('document_checklist')
        .update({
          document_name: doc.document_name,
          document_description: doc.document_description,
          required: doc.required
        })
        .eq('id', doc.id);
        
      if (updateError) {
        console.error('Error updating document:', updateError);
        success = false;
        errors.push(`Update error for document ${doc.document_name}: ${updateError.message}`);
      }
    }

    if (!success) {
      return {
        success: false,
        message: errors.join('; ')
      };
    }

    return {
      success: true,
      message: 'Documents saved successfully',
      data: {
        deleted: deleteIds.length,
        inserted: newDocs.length,
        updated: updateDocs.length
      }
    };
  } catch (error: any) {
    console.error('Error in saveDocumentChecklist:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred'
    };
  }
};

export const refreshDocumentSchema = async (): Promise<SaveResult> => {
  try {
    console.log('Refreshing document schema...');
    
    // Try to create the document_checklist table if it doesn't exist
    // We can't do this directly with SQL, so we'll try an alternative approach
    
    try {
      // First, check if table exists by doing a simple query
      const { data, error } = await supabase
        .from('document_checklist')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error('Error checking document schema:', error);
        return {
          success: false,
          message: `Schema check failed: ${error.message}`
        };
      }
      
      console.log('Document schema check successful');
    } catch (error: any) {
      console.error('Could not access document_checklist table:', error);
      return {
        success: false,
        message: `Could not access document schema: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Document schema is working correctly'
    };
  } catch (error: any) {
    console.error('Error refreshing document schema:', error);
    return {
      success: false,
      message: error.message || 'Failed to refresh document schema'
    };
  }
};

// Create a function to ensure all countries have document checklist records
export const ensureCountryHasDocuments = async (countryId: string): Promise<SaveResult> => {
  try {
    console.log('Ensuring country has document records:', countryId);
    
    // Check if country already has documents
    const { data: docs, error: checkError } = await supabase
      .from('document_checklist')
      .select('count(*)')
      .eq('country_id', countryId)
      .single();
      
    if (checkError) {
      console.error('Error checking for documents:', checkError);
      return {
        success: false,
        message: `Failed to check documents: ${checkError.message}`
      };
    }
    
    const count = docs?.count || 0;
    
    // If country has documents, we're done
    if (count > 0) {
      console.log('Country already has document records:', count);
      return {
        success: true,
        message: `Country already has ${count} document records`,
        data: { count }
      };
    }
    
    // Create default documents for this country
    const defaultDocs = [
      {
        country_id: countryId,
        document_name: 'Passport',
        document_description: 'Valid passport with at least 6 months validity',
        required: true
      },
      {
        country_id: countryId,
        document_name: 'Application Form',
        document_description: 'Completed visa application form',
        required: true
      },
      {
        country_id: countryId,
        document_name: 'Passport Photos',
        document_description: 'Recent passport-sized photographs',
        required: true
      }
    ];
    
    const { error: insertError } = await supabase
      .from('document_checklist')
      .insert(defaultDocs);
      
    if (insertError) {
      console.error('Error creating default documents:', insertError);
      return {
        success: false,
        message: `Failed to create default documents: ${insertError.message}`
      };
    }
    
    return {
      success: true,
      message: 'Default document records created successfully',
      data: { count: defaultDocs.length }
    };
  } catch (error: any) {
    console.error('Error in ensureCountryHasDocuments:', error);
    return {
      success: false,
      message: error.message || 'Failed to ensure country has documents'
    };
  }
};

// Add a function to fix document issues
export const fixDocumentIssues = async (countryId: string): Promise<SaveResult> => {
  try {
    console.log('Attempting to fix document issues for country:', countryId);
    
    // Ensure the table exists and is accessible
    const schemaResult = await refreshDocumentSchema();
    if (!schemaResult.success) {
      return schemaResult;
    }
    
    // Check if country exists
    const { data: country, error: countryError } = await supabase
      .from('countries')
      .select('id')
      .eq('id', countryId)
      .single();
      
    if (countryError || !country) {
      console.error('Country not found:', countryId, countryError);
      return {
        success: false,
        message: `Country not found: ${countryError?.message || 'Invalid country ID'}`
      };
    }
    
    // Ensure country has document records
    return await ensureCountryHasDocuments(countryId);
    
  } catch (error: any) {
    console.error('Error fixing document issues:', error);
    return {
      success: false,
      message: error.message || 'Failed to fix document issues'
    };
  }
};
