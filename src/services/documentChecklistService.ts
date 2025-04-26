
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
    documents.forEach(doc => {
      // Ensure doc.id is always a string
      const docId = doc.id || `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Skip empty document names - they're probably not meant to be saved
      if (!doc.document_name.trim()) {
        return;
      }
      
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
    });
    
    // Find documents to delete (existing but not in the new list)
    const deleteIds = Array.from(existingIds).filter(id => !processedIds.has(id));

    // Batch operations for efficiency
    const operations = [];
    let success = true;
    let error = null;

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
        error = deleteError;
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
        error = insertError;
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
        error = updateError;
      }
    }

    if (!success) {
      return {
        success: false,
        message: error ? error.message : 'Failed to save documents'
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
    // Perform a simple query to check if the table exists
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
