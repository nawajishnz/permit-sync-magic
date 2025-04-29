
import { useState } from 'react';
import { runDiagnostic } from '@/services/visaPackageService';
import { refreshDocumentSchema } from '@/services/document-checklist';
import { fixDocumentIssues } from '@/services/document-checklist';
import { useCountryQueries } from './useCountryQueries';
import { useCountryData } from './useCountryData';

export const useDiagnostics = (queryClient?: any) => {
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  
  const { invalidateQueries } = useCountryQueries(queryClient);
  const { fetchCountryData, setError } = useCountryData(queryClient);
  
  // Run diagnostic with enhanced functionality
  const runCountryDiagnostic = async (countryId: string) => {
    setRunningDiagnostic(true);
    
    try {
      // Run visa package diagnostic
      const result = await runDiagnostic(countryId);
      setDiagnosticResult(result);
      
      // If there are issues, try to fix them
      if (!result.success || (result.recommendations && result.recommendations.length > 0)) {
        // Try to fix document issues
        await fixDocumentIssues(countryId);
      }
      
      return result;
    } catch (err: any) {
      console.error("Error in runCountryDiagnostic:", err);
      setError(err.message || "Failed to run diagnostic");
      throw err;
    } finally {
      setRunningDiagnostic(false);
    }
  };
  
  // Refresh schema and data
  const refreshSchemaAndData = async (countryId: string) => {
    try {
      // Refresh document schema
      await refreshDocumentSchema();
      
      // Invalidate queries
      invalidateQueries(countryId);
      
      // Refresh data
      return await fetchCountryData(countryId);
    } catch (err: any) {
      console.error("Error refreshing schema and data:", err);
      throw err;
    }
  };
  
  return {
    runningDiagnostic,
    diagnosticResult,
    runCountryDiagnostic,
    refreshSchemaAndData
  };
};
