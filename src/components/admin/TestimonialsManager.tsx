
import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { 
  Star, Trash2, CheckCircle, XCircle, Upload, Edit, FileImage, AlertTriangle 
} from 'lucide-react';
import { 
  getTestimonials, getApprovedVisas, addApprovedVisa, 
  updateTestimonialStatus, deleteApprovedVisa, Testimonial, ApprovedVisa 
} from '@/models/testimonials';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

// Form schema for adding approved visas
const approvedVisaSchema = z.object({
  country: z.string().min(2, "Country name is required"),
  destination: z.string().min(2, "Destination is required"),
  visa_type: z.string().min(2, "Visa type is required"),
  visa_category: z.string().min(2, "Category is required"),
  duration: z.string().min(1, "Duration is required"),
  approval_date: z.string().min(1, "Approval date is required"),
});

const TestimonialsManager = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("testimonials");
  const [visaImageFile, setVisaImageFile] = useState<File | null>(null);
  const [visaImageUrl, setVisaImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddVisaOpen, setIsAddVisaOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Forms
  const approvedVisaForm = useForm<z.infer<typeof approvedVisaSchema>>({
    resolver: zodResolver(approvedVisaSchema),
    defaultValues: {
      country: "",
      destination: "",
      visa_type: "",
      visa_category: "",
      duration: "",
      approval_date: new Date().toISOString().split('T')[0],
    },
  });

  // Queries
  const { data: testimonials = [], isLoading: testimonialsLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: () => getTestimonials(false) // Get all testimonials, including unapproved
  });

  const { data: approvedVisas = [], isLoading: visasLoading } = useQuery({
    queryKey: ['admin-approved-visas'],
    queryFn: getApprovedVisas
  });

  // Mutations
  const updateTestimonialStatusMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string, approved: boolean }) => 
      updateTestimonialStatus(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast({
        title: "Testimonial updated",
        description: "The testimonial status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating testimonial",
        description: "There was an error updating the testimonial status.",
        variant: "destructive",
      });
      console.error("Error updating testimonial:", error);
    }
  });

  const deleteApprovedVisaMutation = useMutation({
    mutationFn: (id: string) => deleteApprovedVisa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-approved-visas'] });
      queryClient.invalidateQueries({ queryKey: ['approved-visas'] });
      toast({
        title: "Record deleted",
        description: "The approved visa record has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting record",
        description: "There was an error deleting the approved visa record.",
        variant: "destructive",
      });
      console.error("Error deleting approved visa:", error);
    }
  });

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVisaImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setVisaImageUrl(imageUrl);
    }
  };

  const uploadVisaImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `visa_approvals/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('public').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const onApprovedVisaSubmit = async (values: z.infer<typeof approvedVisaSchema>) => {
    if (!visaImageFile) {
      toast({
        title: "Image required",
        description: "Please upload an image of the approved visa.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload the image
      const imageUrl = await uploadVisaImage(visaImageFile);
      
      // Add the approved visa record
      await addApprovedVisa({
        ...values,
        image_url: imageUrl,
      });
      
      // Reset form and state
      approvedVisaForm.reset();
      setVisaImageFile(null);
      setVisaImageUrl("");
      setIsAddVisaOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-approved-visas'] });
      queryClient.invalidateQueries({ queryKey: ['approved-visas'] });
      
      toast({
        title: "Visa approval added",
        description: "The approved visa has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding approved visa:", error);
      toast({
        title: "Error adding visa approval",
        description: "There was an error adding the approved visa record.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestimonialStatusChange = (id: string, approved: boolean) => {
    updateTestimonialStatusMutation.mutate({ id, approved });
  };

  const handleDeleteApprovedVisa = (id: string) => {
    if (window.confirm("Are you sure you want to delete this approved visa record?")) {
      deleteApprovedVisaMutation.mutate(id);
    }
  };

  // Rendering
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Testimonials & Success Stories</h2>
          <p className="text-gray-500">Manage client testimonials and approved visa records</p>
        </div>
        
        <Button 
          onClick={() => {
            setIsAddVisaOpen(true);
            setActiveTab("approved-visas");
          }}
          className="bg-teal hover:bg-teal/90"
        >
          <FileImage className="mr-2 h-4 w-4" />
          Add Approved Visa
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="testimonials">
            Client Testimonials
          </TabsTrigger>
          <TabsTrigger value="approved-visas">
            Approved Visas Gallery
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle>Client Testimonials</CardTitle>
              <CardDescription>
                Review and manage testimonials submitted by clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testimonialsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading testimonials...</p>
                </div>
              ) : testimonials.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <div className="text-gray-400 mb-2">
                    <AlertTriangle className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">No testimonials found</p>
                  <p className="text-sm text-gray-400 mt-1">Testimonials will appear here once clients submit them</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Country / Visa</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="w-1/3">Comment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testimonials.map((testimonial) => (
                        <TableRow key={testimonial.id}>
                          <TableCell className="font-medium">
                            {testimonial.client_name}
                          </TableCell>
                          <TableCell>
                            {testimonial.country}<br />
                            <span className="text-xs text-gray-500">{testimonial.visa_type}</span>
                          </TableCell>
                          <TableCell>
                            {renderRatingStars(testimonial.rating)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            <div className="line-clamp-2">{testimonial.comment}</div>
                          </TableCell>
                          <TableCell>
                            {testimonial.approved ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {testimonial.approved ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTestimonialStatusChange(testimonial.id, false)}
                                >
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTestimonialStatusChange(testimonial.id, true)}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved-visas">
          <Card>
            <CardHeader>
              <CardTitle>Approved Visas Gallery</CardTitle>
              <CardDescription>
                Showcase of successfully approved visas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isAddVisaOpen} onOpenChange={setIsAddVisaOpen}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add Approved Visa</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...approvedVisaForm}>
                    <form onSubmit={approvedVisaForm.handleSubmit(onApprovedVisaSubmit)} className="space-y-6">
                      {/* Visa Image Upload */}
                      <div className="mb-4">
                        <FormLabel>Visa Image</FormLabel>
                        <div 
                          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                            visaImageUrl ? 'border-gray-300' : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {visaImageUrl ? (
                            <div className="text-center">
                              <img 
                                src={visaImageUrl} 
                                alt="Visa preview" 
                                className="mx-auto h-32 object-contain mb-2" 
                              />
                              <p className="text-xs text-gray-500">
                                Click to change image
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1 text-center">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <p className="pl-1">Upload visa image</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, JPEG up to 5MB
                              </p>
                            </div>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={approvedVisaForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., India" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={approvedVisaForm.control}
                          name="destination"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Destination</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., United States" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={approvedVisaForm.control}
                          name="visa_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Visa Type</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Tourist" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={approvedVisaForm.control}
                          name="visa_category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., B1/B2" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={approvedVisaForm.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 10 years" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={approvedVisaForm.control}
                          name="approval_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Approval Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddVisaOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="bg-teal hover:bg-teal/90"
                        >
                          {isSubmitting ? "Saving..." : "Save Visa"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              {visasLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading approved visas...</p>
                </div>
              ) : approvedVisas.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <div className="text-gray-400 mb-2">
                    <FileImage className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">No approved visas added yet</p>
                  <p className="text-sm text-gray-400 mt-1 mb-4">Add approved visa images to showcase success stories</p>
                  <Button 
                    onClick={() => setIsAddVisaOpen(true)}
                    className="bg-teal hover:bg-teal/90"
                  >
                    <FileImage className="mr-2 h-4 w-4" />
                    Add Approved Visa
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedVisas.map((visa) => (
                    <Card key={visa.id} className="overflow-hidden">
                      <div className="relative h-48">
                        <img 
                          src={visa.image_url} 
                          alt={`${visa.country} Visa`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                          Approved
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg">{visa.country} {visa.visa_type}</h3>
                        <p className="text-sm text-gray-500">
                          {visa.destination} • {visa.visa_category} • {visa.duration}
                        </p>
                        <div className="text-xs text-gray-400 mt-1">
                          Approved: {new Date(visa.approval_date).toLocaleDateString()}
                        </div>
                        
                        <div className="flex justify-end mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteApprovedVisa(visa.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestimonialsManager;
