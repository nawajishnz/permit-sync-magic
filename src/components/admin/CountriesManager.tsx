
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase'; // Updated to use from lib
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CountryTable from './CountryTable';
import CountryDialog, { CountryFormData, CountrySubmitData } from './CountryDialog';
import { fixVisaPackagesSchema } from '@/integrations/supabase/fix-schema';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { saveVisaPackage } from '@/services/visaPackageService';
import { saveDocumentChecklist, DocumentItem } from '@/services/documentChecklistService';
import { getDocumentChecklist } from '@/services/documentChecklistService';

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
  const [schemaFixAttempted, setSchemaFixAttempted] = useState(false);
  const [schemaFixing, setSchemaFixing] = useState(false);

  useEffect(() => {
    const attemptSchemaFix = async () => {
      if (!schemaFixAttempted) {
        setSchemaFixing(true);
        try {
          console.log('Attempting to fix visa_packages schema...');
          const result = await fixVisaPackagesSchema();
          console.log('Schema fix result:', result);
          
          if (result.success) {
            queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
          }
        } catch (err) {
          console.error('Schema fix error:', err);
        } finally {
          setSchemaFixAttempted(true);
          setSchemaFixing(false);
        }
      }
    };
    
    attemptSchemaFix();
  }, [schemaFixAttempted, queryClient]);

  const { 
    data: countries = [], 
    isLoading: countriesLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['adminCountries'],
    queryFn: async () => {
      console.log('Fetching countries data');
      
      try {
        // First test if supabase connection is working
        console.log('Testing supabase connection...');
        const { data: testData, error: testError } = await supabase
          .from('countries')
          .select('count')
          .limit(1);
          
        if (testError) {
          console.error('Supabase connection test failed:', testError);
          throw testError;
        }
        
        console.log('Supabase connection test successful:', testData);
        
        const { data: countriesData, error: countriesError } = await supabase
          .from('countries')
          .select('*');
          
        if (countriesError) {
          console.error('Error fetching countries:', countriesError);
          throw countriesError;
        }
        
        console.log('Countries data fetched:', countriesData?.length || 0, 'countries');
        
        if (!countriesData || countriesData.length === 0) {
          console.warn('No countries found in database');
          return [];
        }
        
        const countriesWithPackages = await Promise.all(
          countriesData.map(async (country) => {
            try {
              const { data: packageData } = await supabase
                .from('visa_packages')
                .select('*')
                .eq('country_id', country.id)
                .maybeSingle();
                
              return {
                ...country,
                visa_packages: packageData ? [packageData] : [],
                has_visa_package: !!packageData
              };
            } catch (err) {
              console.warn(`Could not fetch package for country ${country.id}:`, err);
              return {
                ...country,
                visa_packages: [],
                has_visa_package: false
              };
            }
          })
        );
        
        console.log('Fetched countries with packages:', countriesWithPackages);
        return countriesWithPackages;
      } catch (err) {
        console.error('Error in countries query function:', err);
        throw err;
      }
    },
    staleTime: 0, // Don't cache this data
    retry: 2, // Try up to 3 times (initial + 2 retries)
    refetchOnMount: true, // Always fetch fresh data when component mounts
    refetchOnWindowFocus: true // Refresh when window regains focus
  });

  const handleRefresh = async () => {
    setSchemaFixing(true);
    
    try {
      const result = await fixVisaPackagesSchema();
      console.log('Schema fix result on refresh:', result);
      
      queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
      
      toast({
        title: "Refreshing data",
        description: `Schema check completed. ${result.message} Fetching the latest countries data.`,
      });
    } catch (error) {
      console.error('Error fixing schema during refresh:', error);
      toast({
        title: "Schema check failed",
        description: "There was an issue checking the database schema.",
        variant: "destructive"
      });
    } finally {
      setSchemaFixing(false);
    }
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
            name: isEditMode ? 'Updated Visa Package' : 'Visa Package',
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

      setIsDialogOpen(false);
      
      queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['countryVisaPackage'] }); 
      queryClient.invalidateQueries({ queryKey: ['documents'] }); 
      if (countryId) {
        queryClient.invalidateQueries({ queryKey: ['country', countryId] });
        queryClient.invalidateQueries({ queryKey: ['countryDetail', countryId] });
        queryClient.invalidateQueries({ queryKey: ['documents', countryId] });
      }
      
      refetch();
      
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
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={schemaFixing}
          >
            {schemaFixing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Fixing Schema...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> Refresh Data
              </>
            )}
          </Button>
          <Button onClick={handleAddNew} className="bg-teal hover:bg-teal-600">
            <Plus className="mr-2 h-4 w-4" /> Add Country
          </Button>
        </div>
      </div>
      
      {isError && error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error loading countries</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Unknown error occurred'}. 
            Try using the Refresh Data button to fix schema issues.
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <CountryTable 
            countries={countries}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={countriesLoading || schemaFixing}
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
