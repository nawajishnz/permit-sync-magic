
import { supabase } from '@/integrations/supabase/client';
import { SchemaResult } from './types';

/**
 * Refreshes document schema
 */
export const refreshDocumentSchema = async (): Promise<SchemaResult> => {
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
    let count = 0;
    if (data) {
      if (typeof data === 'object' && data !== null && 'count' in data) {
        const dataCount = data.count;
        if (typeof dataCount === 'number') {
          count = dataCount;
        }
      }
    }
    
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
