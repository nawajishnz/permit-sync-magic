import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusCircle, Edit, Trash2, Search, 
  AlertCircle, Check, X, Image, Clock, ArrowUpDown,
  Info
} from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { 
  getAddonServices, 
  createAddonService, 
  updateAddonService, 
  deleteAddonService,
  AddonService 
} from '@/models/addon_services';

const AddonServicesManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<AddonService | null>(null);
  const [formData, setFormData] = useState<Partial<AddonService>>({
    name: '',
    description: '',
    price: '',
    delivery_days: 7,
    discount_percentage: 0,
    image_url: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });

  // Fetch add-on services
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['addon-services'],
    queryFn: getAddonServices,
  });

  // Create add-on service mutation
  const createMutation = useMutation({
    mutationFn: createAddonService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addon-services'] });
      toast({
        title: "Service created",
        description: "Add-on service has been successfully created.",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create service: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update add-on service mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AddonService> }) => 
      updateAddonService(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addon-services'] });
      toast({
        title: "Service updated",
        description: "Add-on service has been successfully updated.",
      });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update service: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete add-on service mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAddonService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addon-services'] });
      toast({
        title: "Service deleted",
        description: "Add-on service has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete service: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      delivery_days: 7,
      discount_percentage: 0,
      image_url: ''
    });
    setCurrentService(null);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData as Omit<AddonService, 'id' | 'created_at' | 'updated_at'>);
  };

  const handleUpdateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentService?.id) {
      updateMutation.mutate({ 
        id: currentService.id, 
        updates: formData 
      });
    }
  };

  const handleDeleteService = () => {
    if (currentService?.id) {
      deleteMutation.mutate(currentService.id);
    }
  };

  const openEditDialog = (service: AddonService) => {
    setCurrentService(service);
    setFormData({
      name: service.name,
      description: service.description,
      long_description: service.long_description,
      price: service.price,
      delivery_days: service.delivery_days,
      discount_percentage: service.discount_percentage || 0,
      image_url: service.image_url,
      requirements: service.requirements,
      process: service.process,
      faqs: service.faqs
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (service: AddonService) => {
    setCurrentService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleSort = (key: keyof AddonService) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Filter and sort services
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Type guard for the sortConfig.key
    const key = sortConfig.key as keyof AddonService;
    
    // Handle null/undefined values
    const valA = a[key] || '';
    const valB = b[key] || '';
    
    if (valA < valB) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-semibold">Error Loading Services</h2>
          </div>
          <p className="text-gray-600 mb-4">
            There was a problem loading the add-on services. Please try again.
          </p>
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['addon-services'] })}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <h1 className="text-2xl font-bold text-gray-900">Add-on Services</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search services..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            className="bg-teal hover:bg-teal/90"
            onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Service
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Button 
                      variant="ghost" 
                      className="flex items-center font-semibold p-0"
                      onClick={() => handleSort('name')}
                    >
                      Service
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="flex items-center font-semibold p-0"
                      onClick={() => handleSort('price')}
                    >
                      Price
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="flex items-center font-semibold p-0"
                      onClick={() => handleSort('delivery_days')}
                    >
                      Delivery
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell>
                        <div className="h-5 bg-gray-200 rounded w-32"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 bg-gray-200 rounded w-48"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 bg-gray-200 rounded w-12"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {service.image_url && (
                              <img 
                                src={service.image_url} 
                                alt={service.name} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span>{service.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{service.description}</TableCell>
                      <TableCell>₹{service.price}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-500" />
                          {service.delivery_days} days
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.discount_percentage ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            {service.discount_percentage}% off
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => openDeleteDialog(service)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Info className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 mb-1">No add-on services found</p>
                        <p className="text-gray-400 text-sm">
                          {searchTerm ? 'Try a different search term' : 'Create a new service to get started'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add service dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new add-on service for visa applications.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateService}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    type="number"
                    min="0"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="delivery_days">Delivery Days</Label>
                  <Input
                    id="delivery_days"
                    name="delivery_days"
                    value={formData.delivery_days}
                    onChange={handleNumberChange}
                    required
                    type="number"
                    min="1"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="discount_percentage">Discount Percentage (%)</Label>
                <Input
                  id="discount_percentage"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleNumberChange}
                  type="number"
                  min="0"
                  max="100"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    required
                    placeholder="URL or path to image"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Browse
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="bg-teal hover:bg-teal/90"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <div className="spinner mr-2" /> Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Create Service
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit service dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the details of this add-on service.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateService}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-name">Service Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input
                    id="edit-price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    type="number"
                    min="0"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-delivery_days">Delivery Days</Label>
                  <Input
                    id="edit-delivery_days"
                    name="delivery_days"
                    value={formData.delivery_days}
                    onChange={handleNumberChange}
                    required
                    type="number"
                    min="1"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-discount_percentage">Discount Percentage (%)</Label>
                <Input
                  id="edit-discount_percentage"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleNumberChange}
                  type="number"
                  min="0"
                  max="100"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-image_url">Image URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="edit-image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    required
                    placeholder="URL or path to image"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Browse
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="spinner mr-2" /> Updating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Update Service
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this add-on service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-4 border border-red-100 bg-red-50 rounded-md">
              <p className="text-red-800 font-medium">
                {currentService?.name}
              </p>
              <p className="text-red-600 text-sm mt-1">
                Price: ₹{currentService?.price} • Delivery: {currentService?.delivery_days} days
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteService}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <div className="spinner mr-2" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Service
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddonServicesManager;
