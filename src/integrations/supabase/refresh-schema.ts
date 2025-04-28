
import { supabase } from './client';

// Simple function to refresh schema cache by performing some queries
export const refreshDocumentSchema = async () => {
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
    
    console.log('Document schema refreshed successfully');
    return {
      success: true,
      message: 'Document schema refreshed successfully',
      count: data?.count
    };
  } catch (error: any) {
    console.error('Error refreshing document schema:', error);
    return {
      success: false,
      message: `Error refreshing document schema: ${error.message}`,
      error
    };
  }
};

// Function to check if tables exist and are accessible
export const checkTablesExist = async () => {
  try {
    const results: Record<string, any> = {};
    
    // Check visa_packages table
    try {
      const { data: packages, error: packagesError } = await supabase
        .from('visa_packages')
        .select('count(*)')
        .single();
        
      results.visa_packages = {
        exists: !packagesError,
        error: packagesError?.message,
        count: packages?.count
      };
    } catch (err: any) {
      results.visa_packages = {
        exists: false,
        error: err.message
      };
    }
    
    // Check document_checklist table
    try {
      const { data: docs, error: docsError } = await supabase
        .from('document_checklist')
        .select('count(*)')
        .single();
        
      results.document_checklist = {
        exists: !docsError,
        error: docsError?.message,
        count: docs?.count
      };
    } catch (err: any) {
      results.document_checklist = {
        exists: false,
        error: err.message
      };
    }
    
    // Check countries table
    try {
      const { data: countries, error: countriesError } = await supabase
        .from('countries')
        .select('count(*)')
        .single();
        
      results.countries = {
        exists: !countriesError,
        error: countriesError?.message,
        count: countries?.count
      };
    } catch (err: any) {
      results.countries = {
        exists: false,
        error: err.message
      };
    }
    
    const allExist = Object.values(results).every((r: any) => r.exists);
    
    return {
      success: allExist,
      message: allExist ? 'All tables exist and are accessible' : 'Some tables have issues',
      results
    };
  } catch (error: any) {
    console.error('Error checking tables:', error);
    return {
      success: false,
      message: `Error checking tables: ${error.message}`,
      error
    };
  }
};
