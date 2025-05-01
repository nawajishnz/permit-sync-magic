
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase'; 
import { useQueryClient } from '@tanstack/react-query';
import CountryTable from './CountryTable';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useCountriesQuery } from './country/useCountriesQuery';
import { useCountrySchemaFix } from './country/CountrySchemaFix';
import { useCountryEditDialog } from './country/CountryEditDialog';
import { useCountryFormManager } from './country/CountryFormManager';
import CountryDialog from './CountryDialog';

const CountriesManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Schema fixing state
  const [isSchemaFixing, setIsSchemaFixing] = useState(false);
  const { schemaFixing, handleRefresh } = useCountrySchemaFix({ 
    onSchemaFixStatusChange: setIsSchemaFixing 
  });

  // Dialog and form state
  const {
    isDialogOpen, 
    setIsDialogOpen,
    isEditMode,
    currentCountryId,
    formData,
    setFormData,
    handleAddNew,
    handleEdit
  } = useCountryEditDialog();

  // Form submission handling
  const { 
    isLoading: formSubmitLoading, 
    handleSubmit 
  } = useCountryFormManager({
    onSuccess: () => {
      setIsDialogOpen(false);
      refetch(); // Refresh the data
    },
    onError: (error) => console.error('Submission error:', error)
  });

  // Countries data fetching
  const { 
    data: countries = [], 
    isLoading: countriesLoading, 
    isError, 
    error,
    refetch 
  } = useCountriesQuery();

  // Set overall loading state
  useEffect(() => {
    setIsLoading(formSubmitLoading || countriesLoading || schemaFixing);
  }, [formSubmitLoading, countriesLoading, schemaFixing]);

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

  const handleFormSubmit = (submitData: any) => {
    return handleSubmit(isEditMode, currentCountryId, submitData);
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
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CountriesManager;
