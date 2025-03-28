
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash, PlusCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PackagesManager = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<any>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    country_id: '',
    price: '',
    processing_time: '',
    features: ['']
  });

  useEffect(() => {
    fetchPackages();
    fetchCountries();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      // Fetch packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('visa_packages')
        .select(`
          *,
          countries (name)
        `)
        .order('name');
        
      if (packagesError) throw packagesError;
      
      // Fetch features for each package
      if (packagesData) {
        const packagesWithFeatures = await Promise.all(packagesData.map(async (pkg) => {
          const { data: features, error: featuresError } = await supabase
            .from('package_features')
            .select('*')
            .eq('package_id', pkg.id)
            .order('created_at');
            
          if (featuresError) console.error('Error fetching features:', featuresError);
          
          return {
            ...pkg,
            features: features || []
          };
        }));
        
        setPackages(packagesWithFeatures);
      }
    } catch (error: any) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error fetching packages",
        description: error.message || "Failed to load packages data",
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

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  const addFeatureField = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeatureField = (index: number) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleAddNew = () => {
    setFormData({
      name: '',
      country_id: '',
      price: '',
      processing_time: '',
      features: ['']
    });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = async (pkg: any) => {
    setFormData({
      name: pkg.name || '',
      country_id: pkg.country_id || '',
      price: pkg.price || '',
      processing_time: pkg.processing_time || '',
      features: pkg.features.length > 0 
        ? pkg.features.map((f: any) => f.feature_text) 
        : ['']
    });
    setCurrentPackage(pkg);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete package features first
      const { error: featuresError } = await supabase
        .from('package_features')
        .delete()
        .eq('package_id', id);
        
      if (featuresError) throw featuresError;
      
      // Then delete the package
      const { error } = await supabase
        .from('visa_packages')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Package deleted",
        description: "Package has been successfully removed",
      });
      
      // Refresh the packages list
      fetchPackages();
    } catch (error: any) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error deleting package",
        description: error.message || "Failed to delete package",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.country_id || !formData.price) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      // Filter out empty features
      const validFeatures = formData.features.filter(f => f.trim() !== '');
      
      let packageId;
      
      if (isEditMode && currentPackage) {
        // Update existing package
        const { data, error } = await supabase
          .from('visa_packages')
          .update({
            name: formData.name,
            country_id: formData.country_id,
            price: formData.price,
            processing_time: formData.processing_time
          })
          .eq('id', currentPackage.id)
          .select();
          
        if (error) throw error;
        
        packageId = currentPackage.id;
        
        // Delete existing features
        const { error: deleteError } = await supabase
          .from('package_features')
          .delete()
          .eq('package_id', packageId);
          
        if (deleteError) throw deleteError;
      } else {
        // Create new package
        const { data, error } = await supabase
          .from('visa_packages')
          .insert([{
            name: formData.name,
            country_id: formData.country_id,
            price: formData.price,
            processing_time: formData.processing_time
          }])
          .select();
          
        if (error) throw error;
        
        packageId = data?.[0]?.id;
      }
      
      // Add features
      if (packageId && validFeatures.length > 0) {
        const featuresToInsert = validFeatures.map(feature => ({
          package_id: packageId,
          feature_text: feature
        }));
        
        const { error: featuresError } = await supabase
          .from('package_features')
          .insert(featuresToInsert);
          
        if (featuresError) throw featuresError;
      }
      
      toast({
        title: isEditMode ? "Package updated" : "Package added",
        description: `${formData.name} has been successfully ${isEditMode ? 'updated' : 'added'}`,
      });
      
      // Close dialog and refresh packages
      setIsDialogOpen(false);
      fetchPackages();
    } catch (error: any) {
      console.error('Error saving package:', error);
      toast({
        title: "Error saving package",
        description: error.message || "Failed to save package data",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Packages Manager</h1>
        <Button onClick={handleAddNew} className="bg-teal hover:bg-teal-600">
          <Plus className="mr-2 h-4 w-4" /> Add Package
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Service Packages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full" />
            </div>
          ) : packages.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Processing Time</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>{pkg.countries?.name}</TableCell>
                      <TableCell>{pkg.price}</TableCell>
                      <TableCell>{pkg.processing_time}</TableCell>
                      <TableCell>
                        {pkg.features.length > 0 ? (
                          <ul className="list-disc list-inside text-sm">
                            {pkg.features.map((feature: any, index: number) => (
                              <li key={index}>{feature.feature_text}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500">No features listed</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(pkg)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(pkg.id)}
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
              <p>No packages found. Add your first package to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Package Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Package' : 'Add New Package'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Standard"
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
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g. $100"
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
              <Label>Features</Label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="e.g. 24/7 Support"
                    className="flex-1"
                  />
                  {formData.features.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFeatureField(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addFeatureField}
                className="mt-2"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Add Feature
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-teal hover:bg-teal-600">
              {isEditMode ? 'Update' : 'Add'} Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackagesManager;
