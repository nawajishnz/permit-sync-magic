import React, { useState, useRef, useEffect } from 'react';
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
  // Empty schema as we'll only handle the image upload
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
      // No fields required
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

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const uploadVisaImage = async (file: File): Promise<string> => {
    try {
      console.log("Uploading file:", file.name, file.type, file.size);
      
      // Create a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Try different bucket names in order
      const bucketNamesToTry = ['images', 'public', 'visa-images', 'uploads', 'media'];
      let uploadSuccessful = false;
      let publicUrl = '';
      
      // Try each bucket in sequence
      for (const bucketName of bucketNamesToTry) {
        try {
          console.log(`Trying to upload to bucket: ${bucketName}`);
          const { error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (!error) {
            // Get the public URL if upload succeeded
            const { data } = supabase.storage
              .from(bucketName)
              .getPublicUrl(fileName);
              
            publicUrl = data.publicUrl;
            console.log(`Upload successful to ${bucketName}, URL:`, publicUrl);
            uploadSuccessful = true;
            break; // Exit the loop if upload succeeds
          } else {
            console.error(`Error uploading to ${bucketName}:`, error);
          }
        } catch (e) {
          console.error(`Exception with bucket ${bucketName}:`, e);
          // Continue to next bucket
        }
      }
      
      // If any of the uploads succeeded, return the URL
      if (uploadSuccessful && publicUrl) {
        return publicUrl;
      }
      
      // If all storage options failed, fall back to base64
      console.log("All storage options failed, using base64 fallback");
      return await getBase64(file);
      
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    // Check file size limit (5MB)
    if (visaImageFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "The image must be smaller than 5MB. Please compress the image or select a different one.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Show a loading toast
      const loadingToast = toast({
        title: "Uploading...",
        description: "Please wait while we upload your visa image.",
      });
      
      // Try to upload the image
      let imageUrl;
      try {
        imageUrl = await uploadVisaImage(visaImageFile);
        console.log("Upload successful:", imageUrl);
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);
        toast({
          title: "Upload failed",
          description: "Could not upload the image. Please try again with a different image.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Add the approved visa record with minimal required fields
      try {
        await addApprovedVisa({
          country: "Not specified",
          destination: "Not specified",
          visa_type: "Not specified",
          visa_category: "Not specified", 
          duration: "Not specified",
          approval_date: new Date().toISOString().split('T')[0],
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
          title: "Success!",
          description: "The approved visa has been added successfully.",
        });
      } catch (dbError: any) {
        console.error("Database error:", dbError);
        toast({
          title: "Database error",
          description: dbError?.message || "Failed to save the record. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error adding approved visa:", error);
      toast({
        title: "Error",
        description: error?.message || "An unexpected error occurred. Please try again.",
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
                      <div>
                        <div 
                          className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                            visaImageUrl 
                              ? 'border-teal-300 bg-teal-50/50' 
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {visaImageUrl ? (
                            <div className="text-center w-full">
                              <div className="bg-white rounded-md p-2 mb-2 shadow-sm mx-auto">
                                <img 
                                  src={visaImageUrl} 
                                  alt="Visa preview" 
                                  className="mx-auto h-64 object-contain" 
                                />
                              </div>
                              <div className="flex items-center justify-center space-x-2 text-sm text-teal-600">
                                <Upload className="h-4 w-4" />
                                <span>Click to change image</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 text-center py-10 w-full">
                              <div className="bg-gray-50 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center">
                                <Upload className="h-10 w-10 text-gray-400" />
                              </div>
                              <div className="text-gray-700 font-medium">
                                Upload visa image
                              </div>
                              <p className="text-xs text-gray-500">
                                Click or drag and drop • PNG, JPG, JPEG
                              </p>
                            </div>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsAddVisaOpen(false);
                            setVisaImageFile(null);
                            setVisaImageUrl("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isSubmitting || !visaImageFile}
                          className="bg-teal hover:bg-teal/90"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center">
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              <span>Saving...</span>
                            </div>
                          ) : "Save Visa"}
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
                    <Card key={visa.id} className="overflow-hidden group relative">
                      <div className="h-64">
                        <img 
                          src={visa.image_url} 
                          alt={`Approved Visa`} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteApprovedVisa(visa.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
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
