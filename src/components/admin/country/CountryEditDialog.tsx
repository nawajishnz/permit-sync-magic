
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getDocumentChecklist } from '@/services/documentChecklistService';
import CountryDialog, { CountryFormData } from '../CountryDialog';

interface CountryEditDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isEditMode: boolean;
  currentCountryId: string | null;
  onFormSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
}

// Move the function declaration to the top so it's defined before being used
function getInitialFormData(): CountryFormData {
  return {
    name: '',
    flag: '',
    banner: '',
    description: '',
    entry_type: 'Tourist Visa',
    validity: '',
    processing_time: '',
    length_of_stay: '',
    requirements_description: '',
    visa_includes: [],
    visa_assistance: [],
    processing_steps: [],
    faq: [],
    embassy_details: { address: '', phone: '', email: '', hours: '' },
    documents: [],
    pricing: { government_fee: '', service_fee: '', processing_days: '' }
  };
}

export const useCountryEditDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCountryId, setCurrentCountryId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CountryFormData>(getInitialFormData());

  const handleAddNew = () => {
    setFormData(getInitialFormData());
    setCurrentCountryId(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = async (country: any) => {
    console.log('Editing country with data:', country);
    
    let countryWithPackages = country;
    
    if (!country.visa_packages || country.visa_packages.length === 0) {
      console.log('Fetching fresh visa package data for country:', country.id);
      try {
        const { data: freshData, error } = await supabase
          .from('countries')
          .select(`
            *,
            visa_packages(
              id, 
              name, 
              government_fee, 
              service_fee, 
              processing_days,
              total_price
            )
          `)
          .eq('id', country.id)
          .single();
          
        if (!error && freshData) {
          countryWithPackages = freshData;
          console.log('Fetched fresh data:', freshData);
        }
      } catch (err) {
        console.error('Error fetching fresh country data:', err);
      }
    }
    
    const packageData = countryWithPackages.visa_packages?.[0];
    console.log('Package data for form:', packageData);
    
    let documents = [];
    try {
      documents = await getDocumentChecklist(country.id);
      console.log('Fetched documents for country:', documents);
    } catch (err) {
      console.error('Error fetching documents:', err);
      // Continue even if documents can't be fetched
    }
    
    setFormData({
      id: countryWithPackages.id,
      name: countryWithPackages.name || '',
      flag: countryWithPackages.flag || '',
      banner: countryWithPackages.banner || '',
      description: countryWithPackages.description || '',
      entry_type: countryWithPackages.entry_type || 'Tourist Visa',
      validity: countryWithPackages.validity || '',
      processing_time: countryWithPackages.processing_time || '',
      length_of_stay: countryWithPackages.length_of_stay || '',
      requirements_description: countryWithPackages.requirements_description || '',
      visa_includes: countryWithPackages.visa_includes || [],
      visa_assistance: countryWithPackages.visa_assistance || [],
      processing_steps: countryWithPackages.processing_steps || [],
      faq: countryWithPackages.faq || [],
      embassy_details: countryWithPackages.embassy_details || {
        address: '',
        phone: '',
        email: '',
        hours: ''
      },
      documents: documents || [],
      pricing: packageData ? {
        government_fee: packageData.government_fee?.toString() || '',
        service_fee: packageData.service_fee?.toString() || '',
        processing_days: packageData.processing_days?.toString() || ''
      } : { 
        government_fee: '', 
        service_fee: '', 
        processing_days: '' 
      }
    });
    
    setCurrentCountryId(countryWithPackages.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    isEditMode,
    currentCountryId,
    formData,
    setFormData,
    handleAddNew,
    handleEdit
  };
};

export const CountryEditDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  isEditMode,
  currentCountryId,
  onFormSubmit,
  isLoading
}: CountryEditDialogProps) => {
  const [formData, setFormData] = useState<CountryFormData>(getInitialFormData());

  return (
    <CountryDialog
      isOpen={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      isEditMode={isEditMode}
      formData={formData}
      onFormChange={setFormData}
      onSubmit={onFormSubmit}
      isLoading={isLoading}
    />
  );
};
