import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CountryTable from './CountryTable';
import CountryDialog, { CountryFormData, CountrySubmitData } from './CountryDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentChecklistManager from './DocumentChecklistManager';
import PricingTierManager from './PricingTierManager';
import VisaTypesManager from './VisaTypesManager';
import VisaPackagesManager from './VisaPackagesManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { z } from 'zod';
import { refreshSchemaCache } from '@/integrations/supabase/refresh-schema';

// Initial empty form data structure
const getInitialFormData = (): CountryFormData => ({
  name: '',
  flag: '',
  banner: '',
  description: '',
  entry_type: 'Tourist Visa', // Default entry type
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

interface CountriesManagerProps {
  queryClient?: any;
}

// Define a form schema using zod
const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Country name is required"),
  code: z.string().min(2, "Country code is required").max(2),
  flag_url: z.string().optional(),
  description: z.string().optional(),
  entry_type: z.string().optional(),
  processing_time: z.string().optional(),
  is_active: z.boolean().default(true),
  pricing: z.array(
    z.object({
      visa_type: z.string(),
      government_fee: z.union([z.string(), z.number()]),
      service_fee: z.union([z.string(), z.number()]),
      processing_days: z.union([z.string(), z.number()]),
      length_of_stay: z.union([z.string(), z.number()]),
    })
  ).optional()
});

const CountriesManager = ({ queryClient }: CountriesManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCountryId, setCurrentCountryId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('countries');
  const [selectedCountryIdForTabs, setSelectedCountryIdForTabs] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const localQueryClient = useQueryClient();
  
  // Use the passed queryClient or the local one
  const activeQueryClient = queryClient || localQueryClient;
  
  // Single source of truth for form data
  const [formData, setFormData] = useState<CountryFormData>(getInitialFormData());

  // Fetch countries data with enhanced error handling and debugging
  const { 
    data: countries = [], 
    isLoading: countriesLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['adminCountries'],
    queryFn: async () => {
      console.log('Fetching countries for admin...');
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name');
        
      console.log('Countries response:', { data, error, count: data?.length });
      
      if (error) {
        console.error('Error fetching countries:', error);
        throw error;
      }
      
      return data || [];
    },
    // Disable stale time to ensure fresh data
    staleTime: 0
  });

  // Debug log countries when data changes
  useEffect(() => {
    console.log('Countries data in admin component:', countries);
  }, [countries]);

  // Add a manual refresh capability for testing
  const handleRefresh = () => {
    console.log('Manually refreshing countries data...');
    
    // Invalidate ALL country-related queries to ensure complete refresh
    invalidateAllCountryQueries();
    
    toast({
      title: "Refreshing data",
      description: "Fetching the latest countries data",
    });
  };

  // Helper function to invalidate all country-related queries
  const invalidateAllCountryQueries = () => {
    // Invalidate all the country queries
    activeQueryClient.invalidateQueries({ queryKey: ['adminCountries'] });
    activeQueryClient.invalidateQueries({ queryKey: ['countries'] });
    activeQueryClient.invalidateQueries({ queryKey: ['popularCountries'] });
    activeQueryClient.invalidateQueries({ queryKey: ['popularDestinations'] });
    activeQueryClient.invalidateQueries({ queryKey: ['heroCountries'] });
    activeQueryClient.invalidateQueries({ queryKey: ['countryDetails'] });
    activeQueryClient.invalidateQueries({ queryKey: ['visaPackages'] });
    
    // Force refetch after a slight delay to ensure we have fresh data
    setTimeout(() => {
      refetch();
    }, 300);
  };

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast({
        title: "Error fetching countries",
        description: error.message || "Failed to load countries data",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setFormData(getInitialFormData());
    setCurrentCountryId(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (country: any) => {
    console.log('Editing country:', country);
    setFormData({
      id: country.id,
      name: country.name || '',
      flag: country.flag || '',
      banner: country.banner || '',
      description: country.description || '',
      entry_type: country.entry_type || 'Tourist Visa',
      validity: country.validity || '',
      processing_time: country.processing_time || '',
      length_of_stay: country.length_of_stay || '',
      requirements_description: country.requirements_description || '',
      visa_includes: country.visa_includes || [],
      visa_assistance: country.visa_assistance || [],
      processing_steps: country.processing_steps || [],
      faq: country.faq || [],
      embassy_details: country.embassy_details || {
        address: '',
        phone: '',
        email: '',
        hours: ''
      },
      documents: country.documents || [],
      pricing: { government_fee: '', service_fee: '', processing_days: '' }
    });
    setCurrentCountryId(country.id);
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
      
      // Refresh all country queries
      invalidateAllCountryQueries();
    } catch (error: any) {
      console.error('Error deleting country:', error);
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

      // 1. Handle Image Uploads (if new files provided)
      if (submitData.flagFile) {
        const flagFilename = `flag-${Date.now()}-${submitData.flagFile.name}`;
        const { data, error } = await supabase.storage.from('country-images').upload(flagFilename, submitData.flagFile);
        if (error) throw new Error(`Flag upload failed: ${error.message}`);
        flagUrl = supabase.storage.from('country-images').getPublicUrl(flagFilename).data.publicUrl;
      }
      if (submitData.bannerFile) {
        const bannerFilename = `banner-${Date.now()}-${submitData.bannerFile.name}`;
        const { data, error } = await supabase.storage.from('country-images').upload(bannerFilename, submitData.bannerFile);
        if (error) throw new Error(`Banner upload failed: ${error.message}`);
        bannerUrl = supabase.storage.from('country-images').getPublicUrl(bannerFilename).data.publicUrl;
      }
      
      // 2. Prepare Country Data for Save
      const { 
        pricing, 
        documents, 
        flagFile, 
        bannerFile,
        id, // Exclude id from direct data save object
        ...countryFields 
      } = submitData;
      
      const dataToSave = {
          ...countryFields,
          flag: flagUrl,
          banner: bannerUrl,
          entry_type: countryFields.entry_type || 'Tourist Visa',
          processing_time: countryFields.processing_time || 'N/A',
          updated_at: new Date().toISOString()
      };

      // 3. Validate (basic example)
      if (!dataToSave.name || !dataToSave.flag || !dataToSave.banner || !dataToSave.description) {
        throw new Error("Missing required fields: Name, Flag, Banner, Description.");
      }

      // 4. Save Country Data (Insert or Update)
      let countryError = null;
      if (isEditMode && countryId) {
        console.log(`Updating country ${countryId} with data:`, dataToSave);
        const { error } = await supabase.from('countries').update(dataToSave).eq('id', countryId);
        countryError = error;
      } else {
        console.log("Creating new country with data:", dataToSave);
        const { data: newData, error } = await supabase.from('countries').insert(dataToSave).select('id').single();
        countryError = error;
        if (!error && newData) {
          countryId = newData.id;
        }
      }

      if (countryError) {
         console.error("Error saving country:", countryError);
         throw new Error(`Failed to save country: ${countryError.message}`);
      }
      
      toast({ title: isEditMode ? "Country Updated" : "Country Created", description: `${savedCountryName} saved successfully.` });

      // 5. Save Pricing Data via RPC (if country save succeeded and pricing exists)
      if (countryId && pricing && (pricing.government_fee || pricing.service_fee || pricing.processing_days)) {
          try {
            // console.log('Attempting to refresh schema cache before saving pricing...');
            // await refreshSchemaCache(); // <-- Temporarily remove this call
            // console.log('Schema cache refresh attempted.');

            const govFee = parseFloat(pricing.government_fee) || 0;
            const serviceFee = parseFloat(pricing.service_fee) || 0;
            const processingDays = parseInt(pricing.processing_days) || 0;
            
            if (govFee > 0 || serviceFee > 0 || processingDays > 0) {
                console.log(`Calling save_visa_package for country ${countryId} using positional arguments`);
                const { data: rpcData, error: rpcError } = await supabase.rpc('save_visa_package', 
                    [countryId, 'Visa Package', govFee, serviceFee, processingDays]
                );

                if (rpcError) {
                    console.error("Error saving visa package via RPC:", rpcError);
                    throw new Error(`Failed to save pricing: ${rpcError.message}`);
                } else {
                    console.log("Visa package saved successfully via RPC:", rpcData);
                    toast({ title: "Pricing Saved", description: `Default pricing for ${savedCountryName} saved.` });
                }
            }
          } catch (pricingError: any) {
            console.error("Error processing pricing data:", pricingError);
            toast({ 
                title: "Warning: Pricing Issue", 
                description: `Country ${savedCountryName} saved, but pricing failed: ${pricingError.message}`, 
                variant: "destructive" 
            });
          }
      }
      
      // 6. Handle Documents (Example, can be expanded)
      if (documents && documents.length > 0 && countryId) {
          console.log("Document handling logic would go here.");
      }

      // 7. Close Dialog & Refresh Queries
      setIsDialogOpen(false);
      invalidateAllCountryQueries();

    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast({ 
          title: "Save Failed", 
          description: error.message || "An unexpected error occurred", 
          variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCountryForTabs = (countryId: string) => {
    setSelectedCountryIdForTabs(countryId);
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
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-4 grid w-full grid-cols-4">
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="visatypes">Visa Types</TabsTrigger>
        </TabsList>
        
        <TabsContent value="countries">
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
                onSelectCountry={handleSelectCountryForTabs}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <DocumentChecklistManager
            countries={countries}
            selectedCountryId={selectedCountryIdForTabs}
            onSelectCountry={handleSelectCountryForTabs}
            queryClient={activeQueryClient}
          />
        </TabsContent>
        
        <TabsContent value="pricing">
          <PricingTierManager
            countries={countries}
            selectedCountryId={selectedCountryIdForTabs}
            onSelectCountry={handleSelectCountryForTabs}
            queryClient={activeQueryClient}
          />
        </TabsContent>
        
        <TabsContent value="visatypes">
          <VisaTypesManager
            countries={countries}
            selectedCountryId={selectedCountryIdForTabs}
            onSelectCountry={handleSelectCountryForTabs}
            queryClient={activeQueryClient}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog - Pass simplified props */}
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
