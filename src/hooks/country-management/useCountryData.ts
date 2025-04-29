
import { useState } from 'react';
import { getCountryVisaPackage } from '@/services/visaPackageService';
import { getDocumentChecklist } from '@/services/documentChecklistService';
import { DocumentItem } from '@/services/documentChecklistService';
import { VisaPackage } from '@/types/visaPackage';
import { useCountryQueries } from './useCountryQueries';

export const useCountryData = (queryClient?: any) => {
  const [loading, setLoading] = useState(false);
  const [packageData, setPackageData] = useState<VisaPackage | null>(null);
  const [documentData, setDocumentData] = useState<DocumentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const { invalidateQueries } = useCountryQueries(queryClient);
  
  // Fetch both package and document data
  const fetchCountryData = async (countryId: string) => {
    if (!countryId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both in parallel
      const [packageData, documentData] = await Promise.all([
        getCountryVisaPackage(countryId),
        getDocumentChecklist(countryId)
      ]);
      
      setPackageData(packageData);
      setDocumentData(documentData);
      
      return {
        packageData,
        documentData
      };
    } catch (err: any) {
      console.error("Error fetching country data:", err);
      setError(err.message || "An error occurred while fetching country data");
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    packageData,
    documentData,
    error,
    setError,
    fetchCountryData,
    invalidateQueries
  };
};
