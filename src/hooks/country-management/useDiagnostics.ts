
import { useState } from 'react';
import { runDiagnostic, fixVisaPackageSchema } from '@/services/visaDiagnosticService';

export interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
  recommendations?: string[];
  results?: {
    tableAccess?: { success: boolean; message?: string };
    packageExists?: boolean;
    packageActive?: boolean;
    documentsExist?: boolean;
    documentsCount?: number;
    documentTableAccess?: { success: boolean; message?: string };
  };
  // Add any other properties that might be used
  schemaFixed?: boolean;
}

export const useDiagnostics = (queryClient?: any) => {
  const [loading, setLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCountryDiagnostic = async (countryId: string): Promise<DiagnosticResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await runDiagnostic(countryId);
      setDiagnosticResult(result);
      
      // Make sure we don't access properties that might not exist
      const hasDetails = result.details && typeof result.details === 'object';
      
      return result;
    } catch (err: any) {
      console.error('Error running diagnostic:', err);
      setError(err.message || 'Failed to run diagnostic check');
      return {
        success: false,
        message: err.message || 'Error running diagnostic',
        timestamp: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  };
  
  const refreshSchemaAndData = async (countryId: string): Promise<DiagnosticResult> => {
    setLoading(true);
    setError(null);
    
    try {
      // First fix the schema
      const schemaResult = await fixVisaPackageSchema();
      
      if (!schemaResult.success) {
        setError(`Schema fix failed: ${schemaResult.message}`);
        return {
          ...schemaResult,
          timestamp: new Date().toISOString(),
          schemaFixed: false
        };
      }
      
      // Then run the diagnostic again to check the results
      const diagResult = await runCountryDiagnostic(countryId);
      
      return {
        ...diagResult,
        schemaFixed: true
      };
    } catch (err: any) {
      console.error('Error refreshing schema and data:', err);
      setError(err.message || 'Failed to refresh schema and data');
      return {
        success: false,
        message: err.message || 'Error refreshing schema and data',
        timestamp: new Date().toISOString(),
        schemaFixed: false
      };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    runCountryDiagnostic,
    refreshSchemaAndData,
    loading,
    diagnosticResult,
    error
  };
};

export default useDiagnostics;
