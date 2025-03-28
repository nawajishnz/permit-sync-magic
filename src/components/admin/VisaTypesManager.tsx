
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VisaTypesManager = () => {
  const [visaTypes, setVisaTypes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVisaType, setCurrentVisaType] = useState<any>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    country_id: '',
    processing_time: '',
    fee: ''
  });

  useEffect(() => {
    fetchVisaTypes();
    fetchCountries();
  }, []);

  const fetchVisaTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visa_types')
        .select(`
          *,
          countries (name)
        `)
        .order('name');
        
      if (error) throw error;
      
      setVisaTypes(data || []);
    } catch (error: any) {
      console.error('Error fetching visa types:', error);
      toast({
        title: "Error fetching visa types",
        description: error.message || "Failed to load visa types data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      
      setCountries(data || []);
    } catch (error: any) {
      console.error('Error fetching countries:', error);
      toast({
        title: "Error fetching countries",
        description: error.message || "Failed to load countries data",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setFormData({
      name: '',
      country_id: '',
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
      fetchVisaTypes();
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
      fetchVisaTypes();
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Visa Types Manager</h1>
        <Button onClick={handleAddNew} className="bg-teal hover:bg-teal-600">
          <Plus className="mr-2 h-4 w-4" /> Add Visa Type
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Visa Types</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
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
            <div className="grid gap-2">
              <Label htmlFor="country_id">Country *</Label>
              <Select
                value={formData.country_id}
                onValueChange={(value) => handleSelectChange('country_id', value)}
              >
                <SelectTrigger id="country_id">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
