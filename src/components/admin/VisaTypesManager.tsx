import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash, ArrowLeft, RefreshCw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface VisaTypesManagerProps {
  countries: any[];
  selectedCountryId: string | null;
  onSelectCountry: (countryId: string) => void;
  queryClient?: any;
}

const VisaTypesManager: React.FC<VisaTypesManagerProps> = ({ 
  countries, 
  selectedCountryId, 
  onSelectCountry, 
  queryClient 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVisaType, setCurrentVisaType] = useState<any>(null);
  const { toast } = useToast();
  const localQueryClient = useQueryClient();
  const activeQueryClient = queryClient || localQueryClient;
  
  const countryId = selectedCountryId;
  const selectedCountry = Array.isArray(countries) 
                            ? countries.find(c => c.id === countryId) 
                            : undefined;
  const countryName = selectedCountry?.name || (countryId ? 'Loading...' : 'Selected Country');
  
  const [formData, setFormData] = useState({
    name: 'Tourist Visa',
    country_id: countryId || '',
    processing_time: '',
    fee: ''
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, country_id: countryId || '' }));
  }, [countryId]);

  const { 
    data: visaTypes = [], 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['visaTypes', countryId],
    queryFn: async () => {
      console.log('Fetching visa types with selected countryId:', countryId);
      if (!countryId) return [];
      
      let query = supabase
        .from('visa_types')
        .select(`*`)
        .eq('country_id', countryId)
        .order('name');
              
      const { data, error } = await query;
      
      console.log('Visa types response:', { data, error, count: data?.length });
      if (error) throw error;
      return data || [];
    },
    enabled: !!countryId,
    staleTime: 0
  });
  
  useEffect(() => {
    console.log('Visa types in component:', visaTypes);
  }, [visaTypes]);

  const handleRefresh = () => {
    console.log('Manually refreshing visa types data...');
    
    activeQueryClient.invalidateQueries({ queryKey: ['visaTypes'] });
    activeQueryClient.invalidateQueries({ queryKey: ['countryVisaTypes'] });
    
    setTimeout(() => {
      refetch();
    }, 300);
    
    toast({
      title: "Refreshing data",
      description: "Fetching the latest visa types data",
    });
  };

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast({
        title: "Error fetching visa types",
        description: error.message || "Failed to load visa types data",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    if (!countryId) {
      toast({ title: "Please select a country first", variant: "destructive" });
      return;
    }
    setFormData({
      name: 'Tourist Visa',
      country_id: countryId,
      processing_time: '',
      fee: ''
    });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (visaType: any) => {
    setFormData({
      name: 'Tourist Visa',
      country_id: visaType.country_id || '',
      processing_time: visaType.processing_time || '',
      fee: visaType.fee || ''
    });
    setCurrentVisaType(visaType);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('visa_types')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Visa type deleted",
        description: "Visa type has been successfully removed",
      });
      
      activeQueryClient.invalidateQueries({ queryKey: ['visaTypes'] });
      activeQueryClient.invalidateQueries({ queryKey: ['countryVisaTypes'] });
      refetch();
    } catch (error: any) {
      console.error('Error deleting visa type:', error);
      toast({
        title: "Error deleting visa type",
        description: error.message || "Failed to delete visa type",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!countryId) {
      toast({ title: "Country not selected", variant: "destructive" });
      return;
    }
    
    try {
      const updatedFormData = { ...formData, name: 'Tourist Visa', country_id: countryId };
      
      if (isEditMode && currentVisaType) {
        const { error } = await supabase
          .from('visa_types')
          .update(updatedFormData)
          .eq('id', currentVisaType.id);
          
        if (error) throw error;
        
        toast({
          title: "Visa type updated",
          description: `Tourist Visa has been successfully updated`,
        });
      } else {
        const { error } = await supabase
          .from('visa_types')
          .insert([updatedFormData]);
          
        if (error) throw error;
        
        toast({
          title: "Visa type added",
          description: `Tourist Visa has been successfully added`,
        });
      }
      
      setIsDialogOpen(false);
      activeQueryClient.invalidateQueries({ queryKey: ['visaTypes', countryId] });
      refetch();
    } catch (error: any) {
      console.error('Error saving visa type:', error);
      toast({
        title: "Error saving visa type",
        description: error.message || "Failed to save visa type data",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <CardTitle>Manage Visa Types</CardTitle>
          <div className="flex items-center gap-2">
            <Select 
              value={selectedCountryId || ''} 
              onValueChange={onSelectCountry}
            >
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Select a country..." />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddNew} disabled={!selectedCountryId}>
              <Plus className="mr-2 h-4 w-4" /> Add Visa Type
            </Button>
          </div>
        </div>
        {selectedCountryId && (
          <p className="text-sm text-gray-600">Managing visa types for: <strong>{countryName}</strong></p>
        )}
      </CardHeader>
      <CardContent>
        {!selectedCountryId ? (
          <div className="text-center py-8 text-gray-500">
            <Info className="h-8 w-8 mx-auto mb-2 text-blue-400"/>
            Select a country above to manage its visa types.
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Error loading visa types for {countryName}.
          </div>
        ) : visaTypes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No visa types found for {countryName}. Add the first one.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visa Type</TableHead>
                <TableHead>Processing Time</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visaTypes.map((visaType) => (
                <TableRow key={visaType.id}>
                  <TableCell className="font-medium">{visaType.name}</TableCell>
                  <TableCell>{visaType.processing_time}</TableCell>
                  <TableCell>{visaType.fee}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(visaType)}><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(visaType.id)} className="text-red-500 hover:text-red-700"><Trash className="h-4 w-4 mr-1" /> Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Visa Type' : 'Add Visa Type'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 p-2 bg-gray-100 rounded">Visa Type Name: <strong>Tourist Visa</strong></p>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="processing_time" className="text-right">Processing Time</Label>
              <Input id="processing_time" name="processing_time" value={formData.processing_time} onChange={handleInputChange} className="col-span-3" placeholder="e.g., 5-7 business days"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fee" className="text-right">Fee</Label>
              <Input id="fee" name="fee" value={formData.fee} onChange={handleInputChange} className="col-span-3" placeholder="e.g., $160"/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{isEditMode ? 'Save Changes' : 'Add Visa Type'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default VisaTypesManager;
