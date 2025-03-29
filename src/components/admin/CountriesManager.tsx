
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CountryTable from './CountryTable';
import CountryDialog from './CountryDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentChecklistManager from './DocumentChecklistManager';
import PricingTierManager from './PricingTierManager';

// Define the CountryFormData interface to match the expected type in CountryDialog
interface CountryFormData {
  name: string;
  flag: string;
  banner: string;
  description: string;
  entry_type: string;
  validity: string;
  processing_time: string;
  length_of_stay: string;
  requirements_description?: string;
  visa_includes: string[];
  visa_assistance: string[];
  processing_steps: any[];
  faq: any[];
  embassy_details: {
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
}

const CountriesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCountry, setCurrentCountry] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('countries');
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<CountryFormData>({
    name: '',
    flag: '',
    banner: '',
    description: '',
    entry_type: '',
    validity: '',
    processing_time: '',
    length_of_stay: '',
    requirements_description: '',
    visa_includes: [] as string[],
    visa_assistance: [] as string[],
    processing_steps: [] as any[],
    faq: [] as any[],
    embassy_details: {
      address: '',
      phone: '',
      email: '',
      hours: ''
    }
  });

  // Fetch countries data with enhanced error handling and debugging
  const { 
    data: countries = [], 
    isLoading, 
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
    refetch();
    
    // Also invalidate the main countries queries to ensure all components get fresh data
    queryClient.invalidateQueries({ queryKey: ['countries'] });
    queryClient.invalidateQueries({ queryKey: ['popularCountries'] });
    queryClient.invalidateQueries({ queryKey: ['popularDestinations'] });
    queryClient.invalidateQueries({ queryKey: ['heroCountries'] });
    
    toast({
      title: "Refreshing data",
      description: "Fetching the latest countries data",
    });
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
    setFormData({
      name: '',
      flag: '',
      banner: '',
      description: '',
      entry_type: '',
      validity: '',
      processing_time: '',
      length_of_stay: '',
      requirements_description: '',
      visa_includes: [],
      visa_assistance: [],
      processing_steps: [],
      faq: [],
      embassy_details: {
        address: '',
        phone: '',
        email: '',
        hours: ''
      }
    });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (country: any) => {
    console.log('Editing country:', country);
    setFormData({
      name: country.name || '',
      flag: country.flag || '',
      banner: country.banner || '',
      description: country.description || '',
      entry_type: country.entry_type || '',
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
      }
    });
    setCurrentCountry(country);
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
      
      // Refresh all country queries to ensure UI is up-to-date everywhere
      queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['popularCountries'] });
      queryClient.invalidateQueries({ queryKey: ['popularDestinations'] });
      queryClient.invalidateQueries({ queryKey: ['heroCountries'] });
    } catch (error: any) {
      console.error('Error deleting country:', error);
      toast({
        title: "Error deleting country",
        description: error.message || "Failed to delete country",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.entry_type) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields and upload images",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Submitting form data:', formData);
      
      if (isEditMode && currentCountry) {
        // Update existing country
        console.log(`Updating country with ID: ${currentCountry.id}`);
        const { data, error } = await supabase
          .from('countries')
          .update(formData)
          .eq('id', currentCountry.id);
          
        console.log('Update response:', { data, error });
          
        if (error) throw error;
        
        toast({
          title: "Country updated",
          description: `${formData.name} has been successfully updated`,
        });
      } else {
        // Create new country
        console.log('Creating new country');
        const { data, error } = await supabase
          .from('countries')
          .insert([formData]);
          
        console.log('Insert response:', { data, error });
          
        if (error) throw error;
        
        toast({
          title: "Country added",
          description: `${formData.name} has been successfully added`,
        });
      }
      
      // Close dialog and refresh countries
      setIsDialogOpen(false);
      
      // Invalidate all country queries to ensure fresh data everywhere in the app
      queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['popularCountries'] });
      queryClient.invalidateQueries({ queryKey: ['popularDestinations'] });
      queryClient.invalidateQueries({ queryKey: ['heroCountries'] });
      
      // After a slight delay, manually refetch to ensure we have the latest data
      setTimeout(() => {
        console.log('Performing delayed refetch after submit');
        refetch();
      }, 500);
    } catch (error: any) {
      console.error('Error saving country:', error);
      toast({
        title: "Error saving country",
        description: error.message || "Failed to save country data",
        variant: "destructive",
      });
    }
  };

  const navigateToVisaTypes = (countryId: string, countryName: string) => {
    navigate(`/admin/visa-types?countryId=${countryId}&countryName=${encodeURIComponent(countryName)}`);
  };

  const navigateToPackages = (countryId: string, countryName: string) => {
    navigate(`/admin/packages?countryId=${countryId}&countryName=${encodeURIComponent(countryName)}`);
  };

  const handleSelectCountry = (countryId: string) => {
    setSelectedCountryId(countryId);
  };

  // Create a typed handler for CountryDialog's onInputChange prop
  const handleFormChange = (newFormData: CountryFormData) => {
    setFormData(newFormData);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Countries Manager</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline">
            Refresh Data
          </Button>
          <Button onClick={handleAddNew} className="bg-teal hover:bg-teal-600">
            <Plus className="mr-2 h-4 w-4" /> Add Country
          </Button>
        </div>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="documents">Document Checklist</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Tiers</TabsTrigger>
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
                navigateToVisaTypes={navigateToVisaTypes}
                navigateToPackages={navigateToPackages}
                isLoading={isLoading}
                isError={isError}
                error={error as Error | null}
                onSelectCountry={handleSelectCountry}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <DocumentChecklistManager
            countries={countries}
            selectedCountryId={selectedCountryId}
            onSelectCountry={handleSelectCountry}
          />
        </TabsContent>
        
        <TabsContent value="pricing">
          <PricingTierManager
            countries={countries}
            selectedCountryId={selectedCountryId}
            onSelectCountry={handleSelectCountry}
          />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Country Dialog */}
      <CountryDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditMode={isEditMode}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        setFormData={handleFormChange}
      />
    </div>
  );
};

export default CountriesManager;
