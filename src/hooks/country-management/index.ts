
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCountryQueries } from './useCountryQueries';
import { useCountryData } from './useCountryData';
import { useCountryOperations } from './useCountryOperations';
import { useDiagnostics } from './useDiagnostics';
import { CountryManagementProps, CountryManagementResult } from './types';

export const useCountryManagement = ({ externalQueryClient }: CountryManagementProps = {}): CountryManagementResult => {
  const { toast } = useToast();
  const { invalidateQueries } = useCountryQueries(externalQueryClient);
  
  const {
    loading,
    error,
    packageData,
    documentData,
    setError,
    fetchCountryData
  } = useCountryData(externalQueryClient);
  
  const {
    saving,
    saveCountryData,
    togglePackageAndEnsureDocuments
  } = useCountryOperations(externalQueryClient);
  
  const {
    loading: runningDiagnostic,
    diagnosticResult,
    runCountryDiagnostic,
    refreshSchemaAndData,
    error: diagnosticError
  } = useDiagnostics(externalQueryClient);
  
  return {
    // Data states
    loading,
    saving,
    runningDiagnostic,
    error: error || diagnosticError,
    packageData,
    documentData,
    diagnosticResult,
    
    // Operations
    fetchCountryData,
    saveCountryData,
    togglePackageAndEnsureDocuments,
    runCountryDiagnostic,
    refreshSchemaAndData,
    invalidateQueries,
    setError
  };
};

export * from './types';
export default useCountryManagement;
