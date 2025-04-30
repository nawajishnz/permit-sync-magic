
import { useState } from 'react';
import { runDiagnostic } from '@/services/visaDiagnosticService';

export interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
  // Add any other properties that might be used
}

export const useDiagnostics = () => {
  const [loading, setLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCountryDiagnostic = async (countryId: string) => {
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
  
  return {
    runCountryDiagnostic,
    loading,
    diagnosticResult,
    error
  };
};

export default useDiagnostics;
