import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash, ArrowLeft, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface VisaTypesManagerProps {
  queryClient?: any;
}

const VisaTypesManager = ({ queryClient }: VisaTypesManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVisaType, setCurrentVisaType] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const localQueryClient = useQueryClient();
  
  // Use the passed queryClient or the local one
  const activeQueryClient = queryClient || localQueryClient;
  
  // Get countryId and countryName from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const countryId = searchParams.get('countryId');
  const countryName = searchParams.get('countryName') || 'All Countries';
  
  const [formData, setFormData] = useState({
    name: '',
    country_id: countryId || '',
    processing_time: '',
    fee: ''
  });

  // Add debug logging
  useEffect(() => {
    console.log('URL Parameters:', { countryId, countryName });
  }, [countryId, countryName]);

  const { 
    data: visaTypes = [], 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['visaTypes', countryId],
    queryFn: async () => {
      console.log('Fetching visa types with countryId:', countryId);
      
      let query = supabase
        .from('visa_types')
        .select(`
          *,
          countries (name)
        `)
        .order('name');
        
      if (countryId) {
        query = query.eq('country_id', countryId);
      }
      
      const { data, error } = await query;
      
      console.log('Visa types response:', { data, error, count: data?.length });
      
      if (error) {
        console.error('Error fetching visa types:', error);
        throw error;
      }
      
      return data || [];
    },
    // Disable stale time to ensure fresh data
    staleTime: 0
  });
  
  // Log visa types when they change
  useEffect(() => {
    console.log('Visa types in component:', visaTypes);
  }, [visaTypes]);

  const handleRefresh = () => {
    console.log('Manually refreshing visa types data...');
    
    // Invalidate ALL visa type queries
    activeQueryClient.invalidateQueries({ queryKey: ['visaTypes'] });
    activeQueryClient.invalidateQueries({ queryKey: ['countryVisaTypes'] });
    
    // Force refetch after a slight delay
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
    setFormData({
      name: 'Tourist Visa',
      country_id: countryId || '',
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
      
      // Refresh the visa types list and other related queries
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
    try {
      // Validate required fields
      if (!formData.country_id) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      // Always set the name to "Tourist Visa"
      const updatedFormData = {
        ...formData,
        name: 'Tourist Visa'
      };
      
      if (isEditMode && currentVisaType) {
        // Update existing visa type
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
        // Create new visa type
        const { error } = await supabase
          .from('visa_types')
          .insert([updatedFormData]);
          
        if (error) throw error;
        
        toast({
          title: "Visa type added",
          description: `Tourist Visa has been successfully added`,
        });
      }
      
      // Close dialog and refresh visa types
      setIsDialogOpen(false);
      
      // Invalidate all queries to ensure UI is updated
      activeQueryClient.invalidateQueries({ queryKey: ['visaTypes'] });
      activeQueryClient.invalidateQueries({ queryKey: ['countryVisaTypes'] });
      activeQueryClient.invalidateQueries({ queryKey: ['countryDetails'] });
      
      // Force refetch
      setTimeout(() => {
        refetch();
      }, 300);
    } catch (error: any) {
      console.error('Error saving visa type:', error);
      toast({
        title: "Error saving visa type",
        description: error.message || "Failed to save visa type data",
        variant: "destructive",
      });
    }
  };

  const goBackToCountries = () => {
    navigate('/admin/countries');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={goBackToCountries} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Countries
          </Button>
          <h1 className="text-2xl font-bold">
            Tourist Visa for {countryName ? decodeURIComponent(countryName) : 'All Countries'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button onClick={handleAddNew} className="bg-teal hover:bg-teal-600">
            <Plus className="mr-2 h-4 w-4" /> Add Tourist Visa
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Tourist Visa</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading visa data. Please try again.</p>
              <p className="text-sm mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          ) : visaTypes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visa Type</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Processing Time</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visaTypes.map((visaType) => (
                    <TableRow key={visaType.id}>
                      <TableCell className="font-medium">Tourist Visa</TableCell>
                      <TableCell>{visaType.countries?.name}</TableCell>
                      <TableCell>{visaType.processing_time}</TableCell>
                      <TableCell>{visaType.fee}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(visaType)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(visaType.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No tourist visa found. Add a tourist visa to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Visa Type Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Tourist Visa' : 'Add Tourist Visa'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Visa Type</Label>
              <Input
                id="name"
                name="name"
                value="Tourist Visa"
                disabled
                className="bg-gray-100"
              />
            </div>
            <input 
              type="hidden" 
              name="country_id" 
              value={formData.country_id} 
            />
            <div className="grid gap-2">
              <Label htmlFor="processing_time">Processing Time</Label>
              <Input
                id="processing_time"
                name="processing_time"
                value={formData.processing_time}
                onChange={handleInputChange}
                placeholder="e.g. 5-7 business days"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fee">Fee</Label>
              <Input
                id="fee"
                name="fee"
                value={formData.fee}
                onChange={handleInputChange}
                placeholder="e.g. $100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-teal hover:bg-teal-600">
              {isEditMode ? 'Update' : 'Add'} Tourist Visa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisaTypesManager;
