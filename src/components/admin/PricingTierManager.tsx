import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash, Save, Loader2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';

interface Feature {
  value: string;
  id: string;
}

interface PricingTierManagerProps {
  countries: any[];
  selectedCountryId: string | null;
  onSelectCountry: (countryId: string) => void;
  queryClient?: QueryClient; // Added queryClient as an optional prop
}

const PricingTierManager: React.FC<PricingTierManagerProps> = ({
  countries,
  selectedCountryId,
  onSelectCountry,
  queryClient: externalQueryClient // Rename to prevent conflict with hook
}) => {
  const [pricingTiers, setPricingTiers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const localQueryClient = useQueryClient();
  
  // Use the passed queryClient or the local one
  const activeQueryClient = externalQueryClient || localQueryClient;

  // Fetch pricing tiers for the selected country
  const { 
    data: fetchedPricingTiers = [], 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['pricingTiers', selectedCountryId],
    queryFn: async () => {
      if (!selectedCountryId) return [];

      const { data, error } = await supabase
        .from('visa_pricing_tiers')
        .select('*')
        .eq('country_id', selectedCountryId);
        
      if (error) {
        console.error('Error fetching pricing tiers:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!selectedCountryId,
  });

  // Update local state when fetched pricing tiers change
  useEffect(() => {
    if (fetchedPricingTiers.length > 0) {
      setPricingTiers(fetchedPricingTiers);
    } else if (selectedCountryId) {
      // If no pricing tiers were found but a country is selected, provide default tiers
      setPricingTiers([
        {
          country_id: selectedCountryId,
          name: 'Standard',
          price: '₹3,999',
          processing_time: '3-5 business days',
          features: ['Document check', 'Application filing', 'Regular processing'],
          is_recommended: false,
          isNew: true
        },
        {
          country_id: selectedCountryId,
          name: 'Express',
          price: '₹5,999',
          processing_time: '24-48 hours',
          features: ['Document check', 'Application filing', 'Priority processing', 'Expedited review'],
          is_recommended: true,
          isNew: true
        },
        {
          country_id: selectedCountryId,
          name: 'Premium',
          price: '₹9,999',
          processing_time: 'Same day',
          features: ['Document check', 'Application filing', 'Urgent processing', 'Dedicated case officer', '24/7 support'],
          is_recommended: false,
          isNew: true
        }
      ]);
    }
  }, [fetchedPricingTiers, selectedCountryId]);

  const handleAddPricingTier = () => {
    if (!selectedCountryId) {
      toast({
        title: "No country selected",
        description: "Please select a country first",
        variant: "destructive",
      });
      return;
    }

    setPricingTiers([
      ...pricingTiers,
      {
        country_id: selectedCountryId,
        name: '',
        price: '',
        processing_time: '',
        features: [],
        is_recommended: false,
        isNew: true
      }
    ]);
  };

  const handleRemovePricingTier = (index: number) => {
    const newPricingTiers = [...pricingTiers];
    newPricingTiers.splice(index, 1);
    setPricingTiers(newPricingTiers);
  };

  const handlePricingTierChange = (index: number, field: string, value: any) => {
    const newPricingTiers = [...pricingTiers];
    
    if (field === 'is_recommended' && value === true) {
      // If setting a tier as recommended, unset any other tier
      newPricingTiers.forEach((tier, i) => {
        if (i !== index) {
          tier.is_recommended = false;
          tier.modified = true;
        }
      });
    }
    
    newPricingTiers[index] = { 
      ...newPricingTiers[index], 
      [field]: value,
      modified: true 
    };
    setPricingTiers(newPricingTiers);
  };

  const handleFeatureChange = (tierIndex: number, featureIndex: number, value: string) => {
    const newPricingTiers = [...pricingTiers];
    const features = [...newPricingTiers[tierIndex].features];
    features[featureIndex] = value;
    newPricingTiers[tierIndex] = { 
      ...newPricingTiers[tierIndex], 
      features,
      modified: true 
    };
    setPricingTiers(newPricingTiers);
  };

  const handleAddFeature = (tierIndex: number) => {
    const newPricingTiers = [...pricingTiers];
    newPricingTiers[tierIndex] = { 
      ...newPricingTiers[tierIndex],
      features: [...newPricingTiers[tierIndex].features, ''],
      modified: true 
    };
    setPricingTiers(newPricingTiers);
  };

  const handleRemoveFeature = (tierIndex: number, featureIndex: number) => {
    const newPricingTiers = [...pricingTiers];
    const features = [...newPricingTiers[tierIndex].features];
    features.splice(featureIndex, 1);
    newPricingTiers[tierIndex] = { 
      ...newPricingTiers[tierIndex], 
      features,
      modified: true 
    };
    setPricingTiers(newPricingTiers);
  };

  const savePricingTiers = async () => {
    if (!selectedCountryId) return;

    try {
      setIsSaving(true);

      // Validate pricing tiers
      for (const tier of pricingTiers) {
        if (!tier.name.trim() || !tier.price.trim() || !tier.processing_time.trim()) {
          toast({
            title: "Invalid pricing tier",
            description: "All fields must be filled",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }

      // Delete existing pricing tiers for this country that aren't in the current list
      const existingIds = pricingTiers
        .filter(tier => tier.id)
        .map(tier => tier.id);

      if (fetchedPricingTiers.length > 0) {
        const tiersToDelete = fetchedPricingTiers
          .filter(tier => !existingIds.includes(tier.id))
          .map(tier => tier.id);

        if (tiersToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('visa_pricing_tiers')
            .delete()
            .in('id', tiersToDelete);

          if (deleteError) throw deleteError;
        }
      }

      // Insert new pricing tiers and update modified ones
      for (const tier of pricingTiers) {
        if (tier.isNew) {
          // Insert new pricing tier
          const { name, price, processing_time, features, is_recommended, country_id } = tier;
          const { error: insertError } = await supabase
            .from('visa_pricing_tiers')
            .insert({ name, price, processing_time, features, is_recommended, country_id });

          if (insertError) throw insertError;
        } else if (tier.modified) {
          // Update existing pricing tier
          const { id, name, price, processing_time, features, is_recommended } = tier;
          const { error: updateError } = await supabase
            .from('visa_pricing_tiers')
            .update({ name, price, processing_time, features, is_recommended })
            .eq('id', id);

          if (updateError) throw updateError;
        }
      }

      toast({
        title: "Pricing tiers saved",
        description: "Pricing tiers have been updated successfully",
      });

      // Refresh data
      refetch();
      activeQueryClient.invalidateQueries({ queryKey: ['countryDetail'] });

    } catch (error: any) {
      toast({
        title: "Error saving pricing tiers",
        description: error.message || "An error occurred while saving pricing tiers",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Pricing Tiers</CardTitle>
          <div className="flex items-center gap-2">
            <Select 
              value={selectedCountryId || ''} 
              onValueChange={onSelectCountry}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddPricingTier} 
              variant="outline" 
              size="sm" 
              disabled={!selectedCountryId}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Tier
            </Button>
            <Button 
              onClick={savePricingTiers} 
              className="bg-teal hover:bg-teal-600" 
              size="sm"
              disabled={!selectedCountryId || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedCountryId ? (
          <div className="text-center py-8 text-gray-500">
            <p>Please select a country to manage its pricing tiers.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full" />
          </div>
        ) : pricingTiers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No pricing tiers found. Add your first pricing tier.</p>
            <Button onClick={handleAddPricingTier} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-1" /> Add Pricing Tier
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {pricingTiers.map((tier, tierIndex) => (
              <div key={tier.id || `new-${tierIndex}`} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg flex items-center">
                    {tier.is_recommended && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-2" />
                    )}
                    {tier.name || 'New Pricing Tier'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePricingTier(tierIndex)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="mb-1.5 block">Tier Name</Label>
                    <Input
                      value={tier.name}
                      onChange={e => handlePricingTierChange(tierIndex, 'name', e.target.value)}
                      placeholder="e.g. Standard"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Price</Label>
                    <Input
                      value={tier.price}
                      onChange={e => handlePricingTierChange(tierIndex, 'price', e.target.value)}
                      placeholder="e.g. ₹3,999"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Processing Time</Label>
                    <Input
                      value={tier.processing_time}
                      onChange={e => handlePricingTierChange(tierIndex, 'processing_time', e.target.value)}
                      placeholder="e.g. 3-5 business days"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <Checkbox
                      checked={tier.is_recommended}
                      onCheckedChange={value => handlePricingTierChange(tierIndex, 'is_recommended', !!value)}
                      id={`recommended-${tierIndex}`}
                    />
                    <Label htmlFor={`recommended-${tierIndex}`} className="ml-2">
                      Mark as Recommended
                    </Label>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Features</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddFeature(tierIndex)}
                      className="h-7 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Feature
                    </Button>
                  </div>
                  
                  {tier.features.map((feature: string, featureIndex: number) => (
                    <div key={featureIndex} className="flex items-center gap-2 mb-2">
                      <Input
                        value={feature}
                        onChange={e => handleFeatureChange(tierIndex, featureIndex, e.target.value)}
                        placeholder="e.g. Document check"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveFeature(tierIndex, featureIndex)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PricingTierManager;
