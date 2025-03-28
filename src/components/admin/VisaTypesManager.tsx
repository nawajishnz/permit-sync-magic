
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const VisaTypesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVisaType, setCurrentVisaType] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
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

  const { 
    data: visaTypes = [], 
    isLoading, 
    isError,
    error
  } = useQuery({
    queryKey: ['visaTypes', countryId],
    queryFn: async () => {
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
      if (error) throw error;
      
      return data || [];
    }
  });

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
      name: '',
      country_id: countryId || '',
      processing_time: '',
      fee: ''
    });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (visaType: any) => {
    setFormData({
      name: visaType.name || '',
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
      
      // Refresh the visa types list
      queryClient.invalidateQueries({ queryKey: ['visaTypes', countryId] });
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
      if (!formData.name || !formData.country_id) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      if (isEditMode && currentVisaType) {
        // Update existing visa type
        const { error } = await supabase
          .from('visa_types')
          .update(formData)
          .eq('id', currentVisaType.id);
          
        if (error) throw error;
        
        toast({
          title: "Visa type updated",
          description: `${formData.name} has been successfully updated`,
        });
      } else {
        // Create new visa type
        const { error } = await supabase
          .from('visa_types')
          .insert([formData]);
          
        if (error) throw error;
        
        toast({
          title: "Visa type added",
          description: `${formData.name} has been successfully added`,
        });
      }
      
      // Close dialog and refresh visa types
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['visaTypes', countryId] });
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
            Visa Types for {countryName ? decodeURIComponent(countryName) : 'All Countries'}
          </h1>
        </div>
        <Button onClick={handleAddNew} className="bg-teal hover:bg-teal-600">
          <Plus className="mr-2 h-4 w-4" /> Add Visa Type
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Visa Types</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full" />
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
                      <TableCell className="font-medium">{visaType.name}</TableCell>
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
              <p>No visa types found. Add your first visa type to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Visa Type Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Visa Type' : 'Add New Visa Type'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Visa Type Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Tourist Visa"
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
              {isEditMode ? 'Update' : 'Add'} Visa Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisaTypesManager;
