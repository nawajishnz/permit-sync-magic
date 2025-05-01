
import { useState } from 'react';
import { getCountryVisaPackage } from '@/services/visaPackageService';
import { getDocumentChecklist, DocumentItem } from '@/services/documentChecklistService';
import { VisaPackage } from '@/types/visaPackage';

export const useCountryData = (queryClient?: any) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<VisaPackage | null>(null);
  const [documentData, setDocumentData] = useState<DocumentItem[]>([]);

  const fetchCountryData = async (countryId: string) => {
    if (!countryId) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching country data for:', countryId);
      // Fetch package data
      const fetchedPackage = await getCountryVisaPackage(countryId);
      console.log('Fetched package data:', fetchedPackage);
      setPackageData(fetchedPackage);
      
      // Fetch document data
      let documents: DocumentItem[] = [];
      try {
        documents = await getDocumentChecklist(countryId);
        console.log('Fetched document checklist:', documents);
      } catch (docErr: any) {
        console.error('Error fetching documents:', docErr);
        // Continue even if documents can't be fetched
      }
      setDocumentData(documents);
      
      return {
        packageData: fetchedPackage,
        documentData: documents
      };
      
    } catch (err: any) {
      console.error('Error in fetchCountryData:', err);
      setError(err.message || 'Failed to fetch country data');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    error,
    packageData,
    documentData,
    fetchCountryData,
    setError
  };
};
