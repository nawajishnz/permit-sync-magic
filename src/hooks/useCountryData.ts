
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

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  processing_time: string;
  features: string[];
  is_recommended: boolean;
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

export interface CountryData {
  id: string;
  name: string;
  flag: string;
  banner: string;
  description: string;
  entry_type: string;
  validity: string;
  processing_time: string;
  length_of_stay: string;
  visa_includes: string[];
  visa_assistance: string[];
  processing_steps: ProcessStep[];
  faq: FAQItem[];
  embassy_details: EmbassyDetails;
  requirements_description: string;
  documents: DocumentChecklistItem[];
  pricingTiers: PricingTier[];
}

export const useCountryData = (countryId: string | undefined) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['countryDetail', countryId],
    queryFn: async (): Promise<CountryData | null> => {
      if (!countryId) return null;

      try {
        // Fetch country data
        const { data: country, error: countryError } = await supabase
          .from('countries')
          .select('*')
          .eq('id', countryId)
          .single();

        if (countryError) throw countryError;
        if (!country) return null;

        // Fetch document checklist
        const { data: documents, error: documentsError } = await supabase
          .from('document_checklist')
          .select('*')
          .eq('country_id', countryId);

        if (documentsError) throw documentsError;

        // Fetch pricing tiers
        const { data: pricingTiers, error: pricingError } = await supabase
          .from('visa_pricing_tiers')
          .select('*')
          .eq('country_id', countryId);

        if (pricingError) throw pricingError;

        // Parse JSON fields with proper type casting
        const processingSteps: ProcessStep[] = Array.isArray(country.processing_steps) 
          ? country.processing_steps.map((step: any) => ({
              step: Number(step.step) || 0,
              title: String(step.title || ''),
              description: String(step.description || '')
            }))
          : [];
          
        const faq: FAQItem[] = Array.isArray(country.faq) 
          ? country.faq.map((item: any) => ({
              question: String(item.question || ''),
              answer: String(item.answer || '')
            }))
          : [];
          
        // Handle embassy_details properly with better type checking
        let embassyDetails: EmbassyDetails = {
          address: '',
          phone: '',
          email: '',
          hours: ''
        };
        
        if (country.embassy_details && 
            typeof country.embassy_details === 'object' && 
            !Array.isArray(country.embassy_details)) {
          // Now TypeScript knows this is an object, not an array
          const details = country.embassy_details as Record<string, Json>;
          embassyDetails = {
            address: details.address ? String(details.address) : '',
            phone: details.phone ? String(details.phone) : '',
            email: details.email ? String(details.email) : '',
            hours: details.hours ? String(details.hours) : ''
          };
        }

        // Combine all data
        return {
          ...country,
          documents: documents || [],
          pricingTiers: pricingTiers || [],
          processing_steps: processingSteps,
          faq: faq,
          embassy_details: embassyDetails,
          visa_includes: country.visa_includes || [],
          visa_assistance: country.visa_assistance || []
        };
      } catch (error: any) {
        console.error('Error fetching country data:', error);
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
