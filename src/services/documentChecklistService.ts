
import { supabase } from '@/integrations/supabase/client';

interface DocumentItem {
  id?: string;
  country_id: string;
  document_name: string;
  document_description?: string;
  required: boolean;
  isNew?: boolean;
  modified?: boolean;
}

/**
 * Saves document checklist items for a country
 * @param countryId The country ID
 * @param documents List of document items to save
 * @returns Result of the operation
 */
export async function saveDocumentChecklist(
  countryId: string, 
  documents: DocumentItem[]
): Promise<{ success: boolean; message: string; data?: any }> {
  console.log('Saving document checklist for country:', countryId, documents);
  
  try {
    if (!countryId) {
      return { 
        success: false, 
        message: 'Country ID is required to save documents' 
      };
    }

    // Filter out any invalid documents
    const validDocuments = documents.filter(doc => doc.document_name?.trim());
    
    if (validDocuments.length === 0) {
      console.log('No valid documents to save');
      return { 
        success: true, 
        message: 'No documents to save' 
      };
    }

    // Get existing documents for comparison
    const { data: existingDocs, error: fetchError } = await supabase
      .from('document_checklist')
      .select('id')
      .eq('country_id', countryId);
      
    if (fetchError) {
      console.error('Error fetching existing documents:', fetchError);
      return { 
        success: false, 
        message: `Error checking existing documents: ${fetchError.message}` 
      };
    }

    // Delete documents that aren't in the new list
    const existingIds = existingDocs?.map(doc => doc.id) || [];
    const newIds = validDocuments.filter(doc => doc.id).map(doc => doc.id);
    const docsToDelete = existingIds.filter(id => !newIds.includes(id));
    
    if (docsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('document_checklist')
        .delete()
        .in('id', docsToDelete);
        
      if (deleteError) {
        console.error('Error deleting documents:', deleteError);
        return { 
          success: false, 
          message: `Error removing old documents: ${deleteError.message}` 
        };
      }
    }

    // Process new and updated documents
    let updated = 0;
    let created = 0;

    for (const doc of validDocuments) {
      if (doc.isNew || !doc.id) {
        // Create new document
        const { document_name, document_description, required } = doc;
        const { error: insertError } = await supabase
          .from('document_checklist')
          .insert({ 
            country_id: countryId,
            document_name, 
            document_description: document_description || '',
            required: required || false
          });

        if (insertError) {
          console.error('Error creating document:', insertError);
          return { 
            success: false, 
            message: `Error creating document: ${insertError.message}` 
          };
        }
        
        created++;
      } else if (doc.modified) {
        // Update existing document
        const { id, document_name, document_description, required } = doc;
        const { error: updateError } = await supabase
          .from('document_checklist')
          .update({ 
            document_name, 
            document_description: document_description || '', 
            required: required || false 
          })
          .eq('id', id);

        if (updateError) {
          console.error('Error updating document:', updateError);
          return { 
            success: false, 
            message: `Error updating document: ${updateError.message}` 
          };
        }
        
        updated++;
      }
    }

    console.log(`Documents saved: ${created} created, ${updated} updated, ${docsToDelete.length} deleted`);
    return { 
      success: true, 
      message: `Documents saved successfully: ${created} created, ${updated} updated, ${docsToDelete.length} deleted`,
      data: { created, updated, deleted: docsToDelete.length }
    };
  } catch (error: any) {
    console.error('Error saving document checklist:', error);
    return { 
      success: false, 
      message: `Error saving documents: ${error.message}` 
    };
  }
}
