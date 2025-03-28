
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const CountriesManager = () => {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCountry, setCurrentCountry] = useState<any>(null);
  const { toast } = useToast();
  
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

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('countries')
        .select('*')
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
    } finally {
      setLoading(false);
    }
  };

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
      fetchCountries();
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
      fetchCountries();
    } catch (error: any) {
      console.error('Error saving country:', error);
      toast({
        title: "Error saving country",
        description: error.message || "Failed to save country data",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Countries Manager</h1>
        <Button onClick={handleAddNew} className="bg-teal hover:bg-teal-600">
          <Plus className="mr-2 h-4 w-4" /> Add Country
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Countries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full" />
            </div>
          ) : countries.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Entry Type</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Processing Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countries.map((country) => (
                    <TableRow key={country.id}>
                      <TableCell className="font-medium">{country.name}</TableCell>
                      <TableCell>{country.entry_type}</TableCell>
                      <TableCell>{country.validity}</TableCell>
                      <TableCell>{country.processing_time}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(country)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(country.id)}
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
              <p>No countries found. Add your first country to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Country Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Country' : 'Add New Country'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Country Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. United States"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="flag">Flag URL</Label>
              <Input
                id="flag"
                name="flag"
                value={formData.flag}
                onChange={handleInputChange}
                placeholder="URL to country flag image"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="banner">Banner URL</Label>
              <Input
                id="banner"
                name="banner"
                value={formData.banner}
                onChange={handleInputChange}
                placeholder="URL to country banner image"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Country description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entry_type">Entry Type *</Label>
              <Input
                id="entry_type"
                name="entry_type"
                value={formData.entry_type}
                onChange={handleInputChange}
                placeholder="e.g. Visa Required"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="validity">Validity</Label>
              <Input
                id="validity"
                name="validity"
                value={formData.validity}
                onChange={handleInputChange}
                placeholder="e.g. 6 months"
              />
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
              <Label htmlFor="length_of_stay">Length of Stay</Label>
              <Input
                id="length_of_stay"
                name="length_of_stay"
                value={formData.length_of_stay}
                onChange={handleInputChange}
                placeholder="e.g. Up to 90 days"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-teal hover:bg-teal-600">
              {isEditMode ? 'Update' : 'Add'} Country
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CountriesManager;
