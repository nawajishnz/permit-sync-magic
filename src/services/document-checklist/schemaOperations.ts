
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates the document checklist view and RLS policy
 */
export async function createOrFixDocumentChecklistTable() {
  try {
    const { error } = await supabase.rpc('fix_document_checklist');
    if (error) {
      console.error('Error fixing document checklist table:', error);
      return { 
        success: false, 
        message: 'Failed to fix document checklist table. ' + error.message,
        error 
      };
    }
    
    return {
      success: true,
      message: 'Document checklist table fixed successfully'
    };
  } catch (error) {
    console.error('Exception in createOrFixDocumentChecklistTable:', error);
    return { 
      success: false, 
      message: 'Exception occurred while fixing document checklist table',
      error 
    };
  }
}

/**
 * Refreshes the document checklist schema
 */
export async function refreshDocumentChecklistSchema() {
  try {
    // First try to run the schema refresh RPC
    const { data, error } = await supabase.rpc('refresh_document_checklist_schema');
    
    if (error) {
      console.error('Error refreshing document checklist schema via RPC:', error);
      // Fallback to direct fix
      return createOrFixDocumentChecklistTable();
    }
    
    if (data) {
      return {
        success: true,
        message: 'Document checklist schema refreshed successfully',
        data
      };
    }
    
    return {
      success: false,
      message: 'Document checklist schema refresh returned no data'
    };
  } catch (error) {
    console.error('Exception in refreshDocumentChecklistSchema:', error);
    return { 
      success: false, 
      message: 'Exception occurred while refreshing document checklist schema',
      error 
    };
  }
}
