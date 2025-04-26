
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';
import { useEffect } from 'react';
import { autoFixSchema } from '@/integrations/supabase/fix-schema';

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
  price?: number; // Calculated from government_fee + service_fee
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
      console.log('[useCountryData] Attempting auto schema fix...');
      autoFixSchema().then(result => {
        console.log('[useCountryData] Schema auto-fix result:', result);
      }).catch(err => {
        console.error('[useCountryData] Schema auto-fix error:', err);
      });
    }
  }, [countryId]);

  return useQuery({
    queryKey: ['countryDetail', countryId],
    queryFn: async (): Promise<CountryData | null> => {
      console.log(`[useCountryData] Hook triggered with countryId: ${countryId}`);

      if (!countryId) {
        console.log(`[useCountryData] countryId is undefined or null, returning null.`);
        return null;
      }

      try {
        const { data: countryBase, error: countryError } = await supabase
          .from('countries')
          .select('*')
          .eq('id', countryId)
          .single();

        if (countryError) console.error(`[useCountryData] Error fetching countries table:`, countryError);
        if (!countryBase) console.log(`[useCountryData] No data found for countryId ${countryId} in countries table.`);

        if (countryError) throw countryError;
        if (!countryBase) return null;

        const { data: documents, error: documentsError } = await supabase
          .from('document_checklist')
          .select('*')
          .eq('country_id', countryId);

        if (documentsError) throw documentsError;

        console.log(`[useCountryData] Querying visa_packages for country_id: ${countryId}`);
        
        let visaPackages = null;
        let packageError = null;
        
        try {
          const timestamp = new Date().getTime();
          
          const { data: packageData, error } = await supabase
            .from('visa_packages')
            .select('*')
            .eq('country_id', countryId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (error) {
            packageError = error;
            console.error('[useCountryData] Error fetching visa packages:', error);
          } else if (packageData) {
            visaPackages = [packageData];
            console.log('[useCountryData] Successfully retrieved package data:', packageData);
          } else {
            console.log('[useCountryData] No package data found, creating fallback...');
            
            try {
              const { data: newPackageData, error: createError } = await supabase.rpc('save_visa_package', {
                p_country_id: countryId,
                p_name: 'Default Package',
                p_government_fee: 0,
                p_service_fee: 0,
                p_processing_days: 15
              });
              
              if (!createError) {
                console.log('[useCountryData] Successfully created default package:', newPackageData);
                
                const { data: updatedPackage } = await supabase
                  .from('visa_packages')
                  .select('*')
                  .eq('country_id', countryId)
                  .single();
                  
                if (updatedPackage) {
                  visaPackages = [updatedPackage];
                }
              }
            } catch (feeErr) {
              console.log('[useCountryData] Fee columns may not exist yet:', feeErr);
            }
          }
        } catch (packageErr: any) {
          console.error('[useCountryData] Error fetching visa packages:', packageErr);
          packageError = packageErr;
        }

        console.log(`[useCountryData] Result from visa_packages query:`, { visaPackages, packageError });

        const selectedPackage: VisaPackage | null = visaPackages && visaPackages.length > 0
          ? {
              id: visaPackages[0].id,
              name: visaPackages[0].name,
              price: (
                (typeof visaPackages[0].government_fee === 'number' ? visaPackages[0].government_fee : 0) + 
                (typeof visaPackages[0].service_fee === 'number' ? visaPackages[0].service_fee : 0)
              ),
              processing_days: visaPackages[0].processing_days || 15,
              government_fee: typeof visaPackages[0].government_fee === 'number' ? visaPackages[0].government_fee : 0,
              service_fee: typeof visaPackages[0].service_fee === 'number' ? visaPackages[0].service_fee : 0,
              total_price: visaPackages[0].total_price,
              country_id: visaPackages[0].country_id
            }
          : null;

        console.log('[useCountryData] Final selectedPackage:', selectedPackage);

        const visa_includes = Array.isArray(countryBase.visa_includes) ? countryBase.visa_includes : [];
        const visa_assistance = Array.isArray(countryBase.visa_assistance) ? countryBase.visa_assistance : [];

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
    retry: 1,
    staleTime: 0,
    ...options
  });
};
