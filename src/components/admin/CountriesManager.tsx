
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

const CountriesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCountry, setCurrentCountry] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    flag: '',
    banner: '',
    description: '',
    entry_type: '',
    validity: '',
    processing_time: '',
    length_of_stay: ''
  });

  // Fetch countries data with enhanced error handling and debugging
  const { 
    data: countries = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      console.log('Fetching countries...');
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
    console.log('Countries data in component:', countries);
  }, [countries]);

  // Add a manual refresh capability for testing
  const handleRefresh = () => {
    console.log('Manually refreshing countries data...');
    refetch();
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
      length_of_stay: ''
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
      length_of_stay: country.length_of_stay || ''
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
      
      // Refresh the countries list
      queryClient.invalidateQueries({ queryKey: ['countries'] });
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
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      if (isEditMode && currentCountry) {
        // Update existing country
        const { error } = await supabase
          .from('countries')
          .update(formData)
          .eq('id', currentCountry.id);
          
        if (error) throw error;
        
        toast({
          title: "Country updated",
          description: `${formData.name} has been successfully updated`,
        });
      } else {
        // Create new country
        const { error } = await supabase
          .from('countries')
          .insert([formData]);
          
        if (error) throw error;
        
        toast({
          title: "Country added",
          description: `${formData.name} has been successfully added`,
        });
      }
      
      // Close dialog and refresh countries
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['countries'] });
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
          />
        </CardContent>
      </Card>

      {/* Add/Edit Country Dialog */}
      <CountryDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditMode={isEditMode}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CountriesManager;
