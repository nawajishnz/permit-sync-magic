
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

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
  price: number; // Changed from government_fee/service_fee
  processing_days: number;
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
  visa_includes: string[];
  visa_assistance: string[];
  processing_steps: ProcessStep[];
  faq: FAQItem[];
  embassy_details: EmbassyDetails;
  requirements_description: string;
  documents: DocumentChecklistItem[];
  packageDetails: VisaPackage | null;
}

export const useCountryData = (countryId: string | undefined) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['countryDetail', countryId],
    queryFn: async (): Promise<CountryData | null> => {
      // Log the incoming countryId
      console.log(`[useCountryData] Hook triggered with countryId: ${countryId}`);

      if (!countryId) {
        console.log(`[useCountryData] countryId is undefined or null, returning null.`);
        return null;
      }

      try {
        // Fetch country data
        const { data: countryBase, error: countryError } = await supabase
          .from('countries')
          .select('*')
          .eq('id', countryId)
          .single();

        // Log country fetch result
        if (countryError) console.error(`[useCountryData] Error fetching countries table:`, countryError);
        if (!countryBase) console.log(`[useCountryData] No data found for countryId ${countryId} in countries table.`);

        if (countryError) throw countryError;
        if (!countryBase) return null;

        // Fetch document checklist
        const { data: documents, error: documentsError } = await supabase
          .from('document_checklist')
          .select('*')
          .eq('country_id', countryId);

        if (documentsError) throw documentsError;

        // Fetch the relevant visa package for this country
        // Updated to match actual database schema
        console.log(`[useCountryData] Querying visa_packages for country_id: ${countryId}`);
        const { data: visaPackages, error: packageError } = await supabase
          .from('visa_packages')
          .select('id, name, price, processing_days, country_id') // Updated column names
          .eq('country_id', countryId);

        // Log the package query result immediately
        console.log(`[useCountryData] Result from visa_packages query:`, { visaPackages, packageError });

        if (packageError) throw packageError;

        // Select the first package found
        const selectedPackage: VisaPackage | null = visaPackages && visaPackages.length > 0
          ? {
              id: visaPackages[0].id,
              name: visaPackages[0].name,
              price: visaPackages[0].price, // Use price instead of separate fees
              processing_days: visaPackages[0].processing_days,
              total_price: visaPackages[0].price, // Set total_price to price
              country_id: visaPackages[0].country_id
            }
          : null;

        // Log the final selected package
        console.log('[useCountryData] Final selectedPackage:', selectedPackage);

        // Parse JSON fields with proper type casting and ensure they have default values
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

        const visa_includes = Array.isArray(countryBase.visa_includes) ? countryBase.visa_includes : [];
        const visa_assistance = Array.isArray(countryBase.visa_assistance) ? countryBase.visa_assistance : [];

        // Destructure countryBase - visa_type_id is not here
        const { processing_steps, faq: faqRaw, embassy_details: embassyRaw, visa_includes: viRaw, visa_assistance: vaRaw, ...restOfCountryData } = countryBase;

        // Combine data
        const countryData: CountryData = {
          ...restOfCountryData,
          documents: documents || [],
          packageDetails: selectedPackage,
          processing_steps: processingSteps,
          faq: faq,
          embassy_details: embassyDetails,
          visa_includes: visa_includes,
          visa_assistance: visa_assistance
        };

        // Final check before returning
        if (!selectedPackage) {
          console.warn(`[useCountryData] No packageDetails found for country ${countryId}. Returning null for packageDetails.`);
          countryData.packageDetails = null;
        }

        return countryData;
      } catch (error: any) {
        console.error('[useCountryData] Catch block error:', error);
        toast({
          title: "Error loading country data",
          description: error.message || "Failed to load country information",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!countryId,
  });
};
