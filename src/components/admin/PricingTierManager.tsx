import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash, Save, Loader2, Star, X, Info, HelpCircle, AlertCircle, CheckCircle, DatabaseIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Database } from '@/types/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import DatabaseUpdater from './DatabaseUpdater';
import { updateSchemaAndFixData } from '@/integrations/supabase/update-schema-and-fix-data';
import { refreshSchemaCache } from '@/integrations/supabase/refresh-schema';

// Database type from generated types
type DatabaseVisaPackage = Database['public']['Tables']['visa_packages']['Row'];

// Extended type for UI with additional state flags
interface VisaPackageUI extends DatabaseVisaPackage {
  isNew?: boolean;
  modified?: boolean;
}

interface PricingTierManagerProps {
  countries: any[];
  selectedCountryId: string | null;
  onSelectCountry: (countryId: string) => void;
  queryClient?: QueryClient;
}

type DatabaseFunctions = {
  get_table_info: {
    Args: { p_table_name: string };
    Returns: Array<{
      column_name: string;
      data_type: string;
      is_nullable: boolean;
    }>;
  };
};

const PricingTierManager: React.FC<PricingTierManagerProps> = ({
  countries,
  selectedCountryId,
  onSelectCountry,
  queryClient: externalQueryClient
}) => {
  const [singleTier, setSingleTier] = useState<VisaPackageUI | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const localQueryClient = useQueryClient();
  const activeQueryClient = externalQueryClient || localQueryClient;
  const [showDebug, setShowDebug] = useState(false);
  const [isFixingPricing, setIsFixingPricing] = useState(false);
  const [dbDiagnostics, setDbDiagnostics] = useState<any>(null);
  const [isSavingDirectly, setIsSavingDirectly] = useState(false);
  const [isRefreshingSchema, setIsRefreshingSchema] = useState(false);

  useEffect(() => {
    // Run diagnostics on mount
    runDatabaseDiagnostics();
    
    // Also run schema diagnostic to set up direct save function
    updateSchemaAndFixData().then(result => {
      console.log("Schema diagnostic result:", result);
    }).catch(err => {
      console.error("Error in schema diagnostic:", err);
    });
  }, []);

  const { data: fetchedTiers = [], isLoading, refetch } = useQuery({
    queryKey: ['visaPackages', selectedCountryId],
    queryFn: async () => {
      if (!selectedCountryId) return [];
      
      console.log(`Fetching visa packages for country ID: ${selectedCountryId}`);
      
      const { data, error } = await supabase
        .from('visa_packages')
        .select('*')
        .eq('country_id', selectedCountryId);
        
      if (error) {
        console.error('Error fetching visa packages:', error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} visa packages:`, data);
      return data || [];
    },
    enabled: !!selectedCountryId,
  });

  useEffect(() => {
    if (isLoading) return;
    
    console.log('Setting package state from fetched data:', { fetchedTiers, selectedCountryId });
    
    if (fetchedTiers.length > 0) {
      console.log('Using first visa package from data:', fetchedTiers[0]);
      // Make sure we create a new object without extra modified/isNew flags
      const cleanPackage: VisaPackageUI = {
        id: fetchedTiers[0].id,
        country_id: fetchedTiers[0].country_id,
        name: fetchedTiers[0].name || 'Visa Package',
        government_fee: fetchedTiers[0].government_fee || 0,
        service_fee: fetchedTiers[0].service_fee || 0,
        processing_days: fetchedTiers[0].processing_days || 0,
        created_at: fetchedTiers[0].created_at,
        updated_at: fetchedTiers[0].updated_at,
        isNew: false,
        modified: false
      };
      console.log('Setting package state to:', cleanPackage);
      setSingleTier(cleanPackage);
    } else if (selectedCountryId) {
      console.log('Creating new visa package for country:', selectedCountryId);
      const newPackage: VisaPackageUI = {
        id: '',
        country_id: selectedCountryId,
        name: 'Visa Package',
        government_fee: 0,
        service_fee: 0,
        processing_days: 0,
        created_at: undefined,
        updated_at: undefined,
        isNew: true,
        modified: false
      };
      console.log('Setting package state to new package:', newPackage);
      setSingleTier(newPackage);
    } else {
      console.log('No country selected, setting package state to null');
      setSingleTier(null);
    }
  }, [fetchedTiers, selectedCountryId, isLoading]);

  const handleDeleteTier = async () => {
    if (!singleTier || !singleTier.id) {
        toast({ title: "Cannot delete unsaved tier", variant: "destructive" });
        return;
    }
    if (!selectedCountryId) return;

    try {
        setIsSaving(true);
        const { error } = await supabase
            .from('visa_packages')
            .delete()
            .eq('id', singleTier.id);

        if (error) throw error;

        toast({ title: "Visa Package deleted" });
        setSingleTier({
            id: '',
            country_id: selectedCountryId,
            name: 'Visa Package',
            government_fee: 0,
            service_fee: 0,
            processing_days: 0,
            created_at: undefined,
            updated_at: undefined,
            isNew: true,
            modified: false
        });
        activeQueryClient.invalidateQueries({ queryKey: ['visaPackages', selectedCountryId] });
        activeQueryClient.invalidateQueries({ queryKey: ['countryDetail', selectedCountryId] });
    } catch (error: any) {
        toast({ title: "Error deleting tier", description: error.message, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  const handleTierChange = (field: keyof VisaPackageUI, value: any) => {
    console.log(`Changing field ${String(field)} to:`, value);
    setSingleTier(prev => {
      if (!prev) return null;
      
      // Create new state with the modified flag explicitly set
      const newState = { 
        ...prev, 
        [field]: value, 
        modified: true,
        isNew: prev.isNew || !prev.id
      };
      
      console.log('Updated tier state:', newState);
      return newState;
    });
  };

  const handleFeatureChange = (featureIndex: number, value: string) => {
    // Remove this function as features are no longer used
  };

  const handleAddFeature = () => {
    // Remove this function as features are no longer used
  };

  const handleRemoveFeature = (featureIndex: number) => {
    // Remove this function as features are no longer used
  };

  const saveSingleTier = async () => {
    if (!selectedCountryId || !singleTier) return;

    console.log('Attempting to save package:', singleTier);
    console.log('Is modified:', singleTier.modified);
    console.log('Is new:', singleTier.isNew);
    console.log('Country ID:', selectedCountryId);

    if (!singleTier.name?.trim()) {
        toast({ title: "Missing Fields", description: "Name is required.", variant: "destructive" });
        return;
    }

    try {
      setIsSaving(true);
      
      // Prepare data for insert/update - only include fields that exist in the database
      const packageData = {
        country_id: selectedCountryId,
        name: singleTier.name,
        government_fee: Number(singleTier.government_fee) || 0,
        service_fee: Number(singleTier.service_fee) || 0,
        processing_days: Number(singleTier.processing_days) || 0
      };

      console.log("Clean data for save:", packageData);

      // Try using the RPC function first which should handle schema issues
      try {
        console.log("Trying to save via RPC function");
        const { data: rpcData, error: rpcError } = await supabase.rpc('save_visa_package', {
          p_country_id: selectedCountryId,
          p_name: singleTier.name,
          p_government_fee: Number(singleTier.government_fee) || 0,
          p_service_fee: Number(singleTier.service_fee) || 0,
          p_processing_days: Number(singleTier.processing_days) || 0
        });
          
        if (rpcError) {
          console.warn("RPC save failed, falling back to regular method:", rpcError);
        } else {
          console.log("RPC save successful:", rpcData);
          toast({ 
            title: "Success", 
            description: `Visa package ${rpcData.action}` 
          });
          
          // Invalidate queries to refresh data
          activeQueryClient.invalidateQueries({ queryKey: ['visaPackages'] });
          activeQueryClient.invalidateQueries({ queryKey: ['visaPackages', selectedCountryId] });
          activeQueryClient.invalidateQueries({ queryKey: ['countryDetail'] });
          activeQueryClient.invalidateQueries({ queryKey: ['countryDetail', selectedCountryId] });
          
          // Force refetch to refresh the data
          setTimeout(() => refetch(), 200);
          
          // Reset modified state
          setSingleTier(prev => prev ? { 
            ...prev, 
            isNew: false, 
            modified: false 
          } : null);
          
          setIsSaving(false);
          return;
        }
      } catch (rpcErr) {
        console.warn("RPC save threw an exception, falling back to regular method:", rpcErr);
      }

      // Fall back to standard insert/update if RPC failed
      if (singleTier.isNew || !singleTier.id) {
        console.log("Inserting new package:", packageData);
        
        const { data, error: insertError } = await supabase
          .from('visa_packages')
          .insert(packageData)
          .select();
          
        if (insertError) {
          console.error("Insert error details:", insertError);
          throw insertError;
        }
        console.log("Insert response:", data);
        toast({ title: "Visa Package Added" });
      } else {
        console.log("Updating existing package:", singleTier.id);
        
        const { data, error: updateError } = await supabase
          .from('visa_packages')
          .update(packageData)
          .eq('id', singleTier.id)
          .select();
          
        if (updateError) {
          console.error("Update error details:", updateError);
          throw updateError;
        }
        console.log("Update response:", data);
        toast({ title: "Visa Package Updated" });
      }

      // Invalidate queries to refresh data
      console.log("Invalidating queries");
      activeQueryClient.invalidateQueries({ queryKey: ['visaPackages'] });
      activeQueryClient.invalidateQueries({ queryKey: ['visaPackages', selectedCountryId] });
      activeQueryClient.invalidateQueries({ queryKey: ['countryDetail'] });
      activeQueryClient.invalidateQueries({ queryKey: ['countryDetail', selectedCountryId] });
      
      // Force refetch to refresh the data
      setTimeout(() => refetch(), 200);

      // Reset modified state
      setSingleTier(prev => prev ? { 
        ...prev, 
        isNew: false, 
        modified: false 
      } : null);

    } catch (error: any) {
      console.error("Error saving visa package:", error);
      toast({ 
        title: "Error Saving Package", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Force fix pricing for specific country
  const forceFixPricing = async () => {
    if (!selectedCountryId || !singleTier) {
      toast({ title: "Error", description: "No country or pricing tier selected", variant: "destructive" });
      return;
    }
    
    setIsFixingPricing(true);
    
    try {
      console.log("Force-fixing pricing for country:", selectedCountryId);
      
      // Try using the RPC function to ensure schema correctness
      const { data: rpcData, error: rpcError } = await supabase.rpc('save_visa_package', {
        p_country_id: selectedCountryId,
        p_name: singleTier.name,
        p_government_fee: Number(singleTier.government_fee) || 0,
        p_service_fee: Number(singleTier.service_fee) || 0,
        p_processing_days: Number(singleTier.processing_days) || 0
      });
        
      if (rpcError) {
        console.error("Error fixing pricing via RPC:", rpcError);
        throw rpcError;
      }
      
      console.log("Force update result:", rpcData);
      
      toast({ 
        title: "Pricing Fixed", 
        description: "The pricing has been force-updated."
      });
      
      // Force a complete refresh
      activeQueryClient.invalidateQueries();
      refetch();
      
    } catch (error: any) {
      console.error("Error fixing pricing:", error);
      toast({ 
        title: "Error Fixing Pricing", 
        description: error.message, 
        variant: "destructive"
      });
    } finally {
      setIsFixingPricing(false);
    }
  };

  // Database diagnostics function
  const runDatabaseDiagnostics = async () => {
    console.log("🔍 RUNNING DATABASE DIAGNOSTICS");
    
    const results: Array<{
      name: string;
      status: string;
      message: string;
      details?: any;
    }> = [];
    
    try {
      setDbDiagnostics({ status: "running" });
      
      // Test table access
      console.log("🔍 DIAGNOSTICS: Testing table access");
      const { data: fetchedTiers, error: fetchError } = await supabase
        .from('visa_packages')
        .select('*')
        .limit(5);
        
      if (fetchError) {
        console.error("❌ DIAGNOSTICS: Error accessing table:", fetchError);
        results.push({
          name: "Table Access",
          status: "error",
          message: `Error accessing visa_packages table: ${fetchError.message}`,
          details: fetchError
        });
      } else {
        console.log("✅ DIAGNOSTICS: Successfully accessed table, found", fetchedTiers?.length, "records");
        results.push({
          name: "Table Access",
          status: "success",
          message: `Successfully accessed visa_packages table, found ${fetchedTiers?.length} records`,
          details: fetchedTiers
        });
      }
      
      // Check schema information
      console.log("🔍 DIAGNOSTICS: Checking schema information");
      try {
        const { data: schemaInfo, error: schemaError } = await supabase
          .rpc('get_table_info', {
            p_table_name: 'visa_packages'
          });
        
        if (schemaError) throw schemaError;
        
        console.log("✅ DIAGNOSTICS: Successfully retrieved schema info:", schemaInfo);
        results.push({
          name: "Schema Check",
          status: "success",
          message: "Successfully retrieved schema information",
          details: schemaInfo
        });
      } catch (schemaError: any) {
        console.error("❌ DIAGNOSTICS: Error in schema check:", schemaError);
        results.push({
          name: "Schema Check",
          status: "error",
          message: `Error during schema check: ${schemaError.message || 'Unknown error'}`,
          details: schemaError
        });
      }
      
      // Prepare diagnostic results
      const resultsObj = {
        status: "complete",
        timestamp: new Date().toISOString(),
        tableExists: results.some(r => r.name === "Table Access" && r.status === "success"),
        results: results
      };
      
      console.log("✅ DIAGNOSTICS: Diagnostics complete:", resultsObj);
      setDbDiagnostics(resultsObj);
      
      toast({ 
        title: "Database diagnostics complete",
        description: "Check the console for detailed results"
      });
    } catch (error: any) {
      console.error("❌ DIAGNOSTICS: Unexpected error in diagnostics:", error);
      setDbDiagnostics({
        status: "error",
        error: error,
        message: `Unexpected error: ${error.message || 'Unknown error'}`
      });
      
      toast({ 
        title: "Diagnostics failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  // Add a function to refresh the schema cache
  const handleRefreshSchema = async () => {
    setIsRefreshingSchema(true);
    try {
      const result = await refreshSchemaCache();
      if (result.success) {
        toast({
          title: "Schema refreshed",
          description: "The schema cache has been refreshed."
        });
        // Force run diagnostics again
        await runDatabaseDiagnostics();
      } else {
        toast({
          title: "Schema refresh failed",
          description: "Failed to refresh schema cache. See console for details.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error refreshing schema:", error);
      toast({
        title: "Schema refresh error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingSchema(false);
    }
  };

  const getSingleTierDisplay = () => {
    if (!singleTier) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Visa Package</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={saveSingleTier}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>
        
        <div className="p-4 border rounded-md">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={singleTier.name}
                onChange={(e) => handleTierChange('name', e.target.value)}
                placeholder="Enter package name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="government_fee">Government Fee</Label>
              <Input
                id="government_fee"
                type="number"
                value={singleTier.government_fee}
                onChange={(e) => handleTierChange('government_fee', Number(e.target.value))}
                placeholder="Enter government fee"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service_fee">Service Fee</Label>
              <Input
                id="service_fee"
                type="number"
                value={singleTier.service_fee}
                onChange={(e) => handleTierChange('service_fee', Number(e.target.value))}
                placeholder="Enter service fee"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="processing_days">Processing Days</Label>
              <Input
                id="processing_days"
                type="number"
                value={singleTier.processing_days}
                onChange={(e) => handleTierChange('processing_days', Number(e.target.value))}
                placeholder="Enter processing days"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="pt-0">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Pricing Tiers</span>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs"
            >
              {showDebug ? 'Hide Debug' : 'Debug'}
            </Button>
            {selectedCountryId && (
              <Select
                value={selectedCountryId}
                onValueChange={onSelectCountry}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showDebug && (
          <div className="mb-6">
            <Alert variant="default" className="mb-4 bg-gray-100 border-gray-200">
              <AlertTitle className="flex items-center gap-2">
                <DatabaseIcon className="h-4 w-4" />
                Database Tools
              </AlertTitle>
              <AlertDescription>
                <p className="mb-2 text-sm">
                  If you're experiencing issues with the database schema or missing columns, 
                  use the database updater below to fix schema issues.
                </p>
                <div className="flex flex-col gap-2">
                  <DatabaseUpdater />
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshSchema}
                      disabled={isRefreshingSchema}
                      className="text-xs flex items-center gap-1"
                    >
                      {isRefreshingSchema ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Refresh Schema Cache
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={runDatabaseDiagnostics}
                      className="text-xs"
                    >
                      Run Diagnostics
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {singleTier && (
              <div className="mt-4 p-4 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                <p className="font-bold">Debug Info:</p>
                <div>
                  <p>ID: {singleTier.id || 'New tier'}</p>
                  <p>Modified: {singleTier.modified ? 'Yes' : 'No'}</p>
                  <p>Is New: {singleTier.isNew ? 'Yes' : 'No'}</p>
                  <p>Government fee: {singleTier.government_fee}</p>
                  <p>Service fee: {singleTier.service_fee}</p>
                  <p>Processing days: {singleTier.processing_days}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={forceFixPricing}
                    disabled={isFixingPricing}
                    className="mt-2 bg-red-100 text-red-800 hover:bg-red-200 text-xs"
                  >
                    {isFixingPricing ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Fixing...
                      </>
                    ) : (
                      'Force Fix Pricing'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {!selectedCountryId && (
          <Alert variant="default" className="mb-4">
            <Info className="h-4 w-4" />
            <p>Please select a country to manage pricing tiers.</p>
          </Alert>
        )}
        
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        
        {!isLoading && selectedCountryId && singleTier && getSingleTierDisplay()}
      </CardContent>
    </Card>
  );
};

export default PricingTierManager;
