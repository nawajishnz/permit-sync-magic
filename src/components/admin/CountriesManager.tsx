import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CountryTable from './CountryTable';
import CountryDialog, { CountryFormData, CountrySubmitData } from './CountryDialog';

const getInitialFormData = (): CountryFormData => ({
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
});

const CountriesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCountryId, setCurrentCountryId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CountryFormData>(getInitialFormData());

  const { 
    data: countries = [], 
    isLoading: countriesLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['adminCountries'],
    queryFn: async () => {
      console.log('Fetching countries with pricing details');
      const { data, error } = await supabase
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
        `);
        
      if (error) {
        console.error('Error fetching countries:', error);
        throw error;
      }
      
      console.log('Countries data with packages:', data);
      return data || [];
    },
    staleTime: 0
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
    toast({
      title: "Refreshing data",
      description: "Fetching the latest countries data",
    });
  };

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
      documents: countryWithPackages.documents || [],
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

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('countries')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Country deleted",
        description: "Country has been successfully removed",
      });
      
      queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
    } catch (error: any) {
      toast({
        title: "Error deleting country",
        description: error.message || "Failed to delete country",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (submitData: CountrySubmitData) => {
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
        processing_time: submitData.processing_time,
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
        const { government_fee, service_fee, processing_days } = submitData.pricing;
        
        if (government_fee || service_fee || processing_days) {
          const packageData = {
            country_id: countryId,
            name: 'Visa Package',
            government_fee: parseFloat(government_fee) || 0,
            service_fee: parseFloat(service_fee) || 0,
            processing_days: parseInt(processing_days) || 15
          };

          try {
            const { data: existingPackage, error: checkError } = await supabase
              .from('visa_packages')
              .select('id')
              .eq('country_id', countryId)
              .maybeSingle();

            if (checkError) {
              console.warn('Error checking for existing package:', checkError);
            }

            let result;
            if (existingPackage?.id) {
              result = await supabase
                .from('visa_packages')
                .update(packageData)
                .eq('id', existingPackage.id);
            } else {
              result = await supabase
                .from('visa_packages')
                .insert(packageData);
            }

            if (result.error) {
              console.error('Error saving pricing:', result.error);
              throw result.error;
            }
            
            console.log('Pricing saved successfully');
          } catch (pricingError) {
            console.error('Failed to save pricing:', pricingError);
          }
        }
      }

      setIsDialogOpen(false);
      
      queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      if (countryId) {
        queryClient.invalidateQueries({ queryKey: ['country', countryId] });
        queryClient.invalidateQueries({ queryKey: ['countryDetail', countryId] });
      }
      
      toast({
        title: isEditMode ? "Country updated" : "Country created",
        description: `${savedCountryName} has been successfully ${isEditMode ? 'updated' : 'created'}.`
      });

    } catch (error: any) {
      toast({
        title: "Error saving country",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Countries Manager</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh Data
          </Button>
          <Button onClick={handleAddNew} className="bg-teal hover:bg-teal-600">
            <Plus className="mr-2 h-4 w-4" /> Add Country
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <CountryTable 
            countries={countries}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={countriesLoading}
            isError={isError}
            error={error as Error | null}
          />
        </CardContent>
      </Card>

      <CountryDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditMode={isEditMode}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CountriesManager;
