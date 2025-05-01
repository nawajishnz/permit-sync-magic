
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { saveVisaPackage } from '@/services/visaPackageService';
import { saveDocumentChecklist, DocumentItem } from '@/services/documentChecklistService';
import { CountryFormData, CountrySubmitData } from '../CountryDialog';

interface CountryFormManagerProps {
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export const useCountryFormManager = ({ onSuccess, onError }: CountryFormManagerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (
    isEditMode: boolean, 
    currentCountryId: string | null,
    submitData: CountrySubmitData
  ) => {
    setIsLoading(true);
    let countryId = isEditMode ? currentCountryId : null;
    let savedCountryName = submitData.name;

    try {
      let flagUrl = submitData.flag;
      let bannerUrl = submitData.banner;

      if (submitData.flagFile) {
        const flagFilename = `flag-${Date.now()}-${submitData.flagFile.name}`;
        const { error: flagError } = await supabase.storage
          .from('country-images')
          .upload(flagFilename, submitData.flagFile);
        if (flagError) throw new Error(`Flag upload failed: ${flagError.message}`);
        flagUrl = supabase.storage.from('country-images').getPublicUrl(flagFilename).data.publicUrl;
      }
      
      if (submitData.bannerFile) {
        const bannerFilename = `banner-${Date.now()}-${submitData.bannerFile.name}`;
        const { error: bannerError } = await supabase.storage
          .from('country-images')
          .upload(bannerFilename, submitData.bannerFile);
        if (bannerError) throw new Error(`Banner upload failed: ${bannerError.message}`);
        bannerUrl = supabase.storage.from('country-images').getPublicUrl(bannerFilename).data.publicUrl;
      }

      const dataToSave = {
        name: submitData.name,
        flag: flagUrl,
        banner: bannerUrl,
        description: submitData.description,
        entry_type: submitData.entry_type || 'Tourist Visa',
        validity: submitData.validity,
        processing_time: submitData.processing_time || '',
        length_of_stay: submitData.length_of_stay,
        requirements_description: submitData.requirements_description,
        visa_includes: submitData.visa_includes,
        visa_assistance: submitData.visa_assistance,
        processing_steps: submitData.processing_steps,
        faq: submitData.faq,
        embassy_details: submitData.embassy_details,
        updated_at: new Date().toISOString()
      };

      if (isEditMode && countryId) {
        const { error } = await supabase
          .from('countries')
          .update(dataToSave)
          .eq('id', countryId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('countries')
          .insert(dataToSave)
          .select('id')
          .single();
        if (error) throw error;
        if (data) countryId = data.id;
      }

      if (countryId && submitData.pricing) {
        try {
          console.log('Handling pricing data for country:', countryId, submitData.pricing);
          const { government_fee, service_fee, processing_days } = submitData.pricing;
          
          const governmentFee = parseFloat(government_fee) || 0;
          const serviceFee = parseFloat(service_fee) || 0;
          const processingDaysValue = parseInt(processing_days) || 15;
          
          console.log('Formatted pricing values:', {
            governmentFee,
            serviceFee,
            processingDaysValue
          });
          
          const pricingResult = await saveVisaPackage({
            country_id: countryId,
            name: submitData.name ? `${submitData.name} Visa` : 'Visa Package',
            government_fee: governmentFee,
            service_fee: serviceFee,
            processing_days: processingDaysValue
          });
          
          console.log('Pricing save result:', pricingResult);
          
          if (!pricingResult.success) {
            console.error('Error saving pricing:', pricingResult.message);
            toast({
              title: "Warning",
              description: "Country saved but pricing data could not be updated: " + pricingResult.message,
              variant: "destructive",
            });
          } else {
            console.log('Pricing saved successfully:', pricingResult.data);
          }
        } catch (pricingError) {
          console.error('Failed to save pricing:', pricingError);
          toast({
            title: "Warning",
            description: "Country saved but there was an error updating pricing data",
            variant: "destructive",
          });
        }
      }

      if (countryId && submitData.documents && submitData.documents.length > 0) {
        try {
          console.log('Handling documents for country:', countryId, submitData.documents);
          
          const documentsToSave: DocumentItem[] = submitData.documents.map(doc => ({
            id: doc.id || `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            country_id: countryId as string,
            name: doc.document_name,
            document_name: doc.document_name,
            description: doc.document_description || '',
            document_description: doc.document_description || '',
            required: !!doc.required,
            isNew: doc.isNew,
            modified: doc.modified
          }));
          
          const docsResult = await saveDocumentChecklist(countryId, documentsToSave);
          
          if (!docsResult.success) {
            console.error('Error saving documents:', docsResult.message);
            toast({
              title: "Warning",
              description: "Country saved but documents could not be updated: " + docsResult.message,
              variant: "destructive",
            });
          } else {
            console.log('Documents saved successfully:', docsResult.data);
          }
        } catch (docsError: any) {
          console.error('Failed to save documents:', docsError);
          toast({
            title: "Warning",
            description: "Country saved but there was an error updating documents",
            variant: "destructive",
          });
        }
      }

      // Force a full data refresh
      queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['countryVisaPackage'] }); 
      queryClient.invalidateQueries({ queryKey: ['documents'] }); 
      if (countryId) {
        queryClient.invalidateQueries({ queryKey: ['country', countryId] });
        queryClient.invalidateQueries({ queryKey: ['countryDetail', countryId] });
        queryClient.invalidateQueries({ queryKey: ['documents', countryId] });
        queryClient.invalidateQueries({ queryKey: ['countryVisaPackage', countryId] });
      }
      
      toast({
        title: isEditMode ? "Country updated" : "Country created",
        description: `${savedCountryName} has been successfully ${isEditMode ? 'updated' : 'created'}.`
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error saving country",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit
  };
};
