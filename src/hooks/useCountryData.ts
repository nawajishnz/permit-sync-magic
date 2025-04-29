
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';
import { useEffect } from 'react';
import { fixSchemaIfNeeded } from '@/integrations/supabase/fix-schema';
import { getDocumentChecklist, DocumentItem } from '@/services/document-checklist';

export interface DocumentChecklistItem {
  id: string;
  document_name: string;
  document_description: string;
  required: boolean;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface EmbassyDetails {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

export interface VisaPackage {
  id: string;
  name: string;
  price?: number;
  processing_days: number;
  government_fee?: number;
  service_fee?: number;
  total_price?: number;
  country_id: string;
}

export interface CountryData {
  id: string;
  name: string;
  flag: string;
  banner: string;
  description: string;
  entry_type: string;
  validity: string;
  length_of_stay: string;
  processing_time?: string;
  visa_includes: string[];
  visa_assistance: string[];
  processing_steps: ProcessStep[];
  faq: FAQItem[];
  embassy_details: EmbassyDetails;
  requirements_description: string;
  documents: DocumentChecklistItem[];
  packageDetails: VisaPackage | null;
}

export const useCountryData = (countryId: string | undefined, options = {}) => {
  const { toast } = useToast();

  useEffect(() => {
    if (countryId) {
      console.log('[useCountryData] Running schema fix check...');
      fixSchemaIfNeeded().catch(err => {
        console.error('[useCountryData] Schema auto-fix error:', err);
      });
    }
  }, [countryId]);

  return useQuery({
    queryKey: ['countryDetail', countryId],
    queryFn: async (): Promise<CountryData | null> => {
      console.log(`[useCountryData] Fetching data for countryId: ${countryId}`);

      if (!countryId) {
        return null;
      }

      try {
        // First, fetch the country base data
        const { data: countryBase, error: countryError } = await supabase
          .from('countries')
          .select('*')
          .eq('id', countryId)
          .single();

        if (countryError) {
          console.error(`[useCountryData] Error fetching country:`, countryError);
          throw countryError;
        }
        
        if (!countryBase) {
          console.log(`[useCountryData] No data found for countryId ${countryId}`);
          return null;
        }

        // Fetch document checklist using the dedicated service 
        const documentsData = await getDocumentChecklist(countryId);
        console.log("[useCountryData] Fetched documents:", documentsData);
        
        // Convert DocumentItem to DocumentChecklistItem
        const documents: DocumentChecklistItem[] = documentsData.map(doc => ({
          id: doc.id || '',
          document_name: doc.document_name || doc.name || '',
          document_description: doc.document_description || doc.description || '',
          required: !!doc.required
        }));

        if (!documents || documents.length === 0) {
          console.warn('[useCountryData] No documents found for country');
        }

        // Fetch visa package data using direct service call
        const { getCountryVisaPackage } = await import('@/services/visaPackageService');
        const packageData = await getCountryVisaPackage(countryId);
        console.log('[useCountryData] Visa package data:', packageData);
        
        // Process package data into the expected format
        const selectedPackage: VisaPackage | null = packageData ? {
          id: packageData.id || 'default',
          name: packageData.name || 'Visa Package',
          price: (packageData.government_fee || 0) + (packageData.service_fee || 0),
          processing_days: packageData.processing_days || 15,
          government_fee: packageData.government_fee || 0,
          service_fee: packageData.service_fee || 0,
          total_price: packageData.total_price || ((packageData.government_fee || 0) + (packageData.service_fee || 0)),
          country_id: packageData.country_id
        } : null;

        // Parse arrays and objects from JSON if needed
        const visa_includes = Array.isArray(countryBase.visa_includes) ? countryBase.visa_includes : [];
        const visa_assistance = Array.isArray(countryBase.visa_assistance) ? countryBase.visa_assistance : [];

        // Parse processing steps
        let processingSteps: ProcessStep[] = [];
        if (countryBase.processing_steps) {
          const stepsData = typeof countryBase.processing_steps === 'string'
            ? JSON.parse(countryBase.processing_steps)
            : countryBase.processing_steps;

          if (Array.isArray(stepsData)) {
            processingSteps = stepsData.map((step: any) => ({
              step: Number(step.step) || 0,
              title: String(step.title || ''),
              description: String(step.description || '')
            }));
          }
        }

        // Parse FAQ items
        let faq: FAQItem[] = [];
        if (countryBase.faq) {
          const faqData = typeof countryBase.faq === 'string'
            ? JSON.parse(countryBase.faq)
            : countryBase.faq;

          if (Array.isArray(faqData)) {
            faq = faqData.map((item: any) => ({
              question: String(item.question || ''),
              answer: String(item.answer || '')
            }));
          }
        }

        // Parse embassy details
        let embassyDetails: EmbassyDetails = { address: '', phone: '', email: '', hours: '' };
        if (countryBase.embassy_details && typeof countryBase.embassy_details === 'object' && !Array.isArray(countryBase.embassy_details)) {
          const details = countryBase.embassy_details as Record<string, Json>;
          embassyDetails = {
            address: details.address ? String(details.address) : '',
            phone: details.phone ? String(details.phone) : '',
            email: details.email ? String(details.email) : '',
            hours: details.hours ? String(details.hours) : ''
          };
        }

        // Build the full country data object
        const countryData: CountryData = {
          id: countryBase.id,
          name: countryBase.name,
          flag: countryBase.flag,
          banner: countryBase.banner,
          description: countryBase.description,
          entry_type: countryBase.entry_type,
          validity: countryBase.validity,
          length_of_stay: countryBase.length_of_stay,
          processing_time: countryBase.processing_time,
          documents: documents || [],
          packageDetails: selectedPackage,
          processing_steps: processingSteps,
          faq: faq,
          embassy_details: embassyDetails,
          visa_includes: visa_includes,
          visa_assistance: visa_assistance,
          requirements_description: countryBase.requirements_description || ''
        };

        return countryData;
      } catch (error: any) {
        console.error('[useCountryData] Error fetching country data:', error);
        toast({
          title: "Error loading country data",
          description: error.message || "Failed to load country information",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!countryId,
    retry: 1,
    staleTime: 0,
    ...options
  });
};
