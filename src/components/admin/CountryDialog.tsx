import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Upload, Plus, Trash, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CountryFormData {
  name: string;
  flag: string;
  banner: string;
  description: string;
  entry_type: string;
  validity: string;
  processing_time: string;
  length_of_stay: string;
  requirements_description?: string;
  visa_includes?: string[];
  visa_assistance?: string[];
  processing_steps?: any[];
  faq?: any[];
  embassy_details?: any;
}

interface CountryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  formData: CountryFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  setFormData: (formData: CountryFormData) => void;
}

const CountryDialog: React.FC<CountryDialogProps> = ({
  isOpen,
  onOpenChange,
  isEditMode,
  formData,
  onInputChange,
  onSubmit,
  setFormData
}) => {
  const [flagFile, setFlagFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [visaIncludes, setVisaIncludes] = useState<string[]>(formData.visa_includes || []);
  const [visaAssistance, setVisaAssistance] = useState<string[]>(formData.visa_assistance || []);
  const [processingSteps, setProcessingSteps] = useState<any[]>(
    formData.processing_steps && formData.processing_steps.length > 0 
      ? formData.processing_steps 
      : [
        { step: 1, title: '', description: '' },
        { step: 2, title: '', description: '' },
        { step: 3, title: '', description: '' },
        { step: 4, title: '', description: '' }
      ]
  );
  const [faqItems, setFaqItems] = useState<any[]>(
    formData.faq || [
      { question: '', answer: '' },
      { question: '', answer: '' }
    ]
  );
  const [embassyDetails, setEmbassyDetails] = useState<any>(
    formData.embassy_details || {
      address: '',
      phone: '',
      email: '',
      hours: ''
    }
  );
  const [activeTab, setActiveTab] = useState("basic-info");
  const { toast } = useToast();

  // Update state when formData changes (e.g., when switching between countries)
  useEffect(() => {
    setVisaIncludes(formData.visa_includes || []);
    setVisaAssistance(formData.visa_assistance || []);
    
    // Make sure processing steps are properly initialized
    if (formData.processing_steps && Array.isArray(formData.processing_steps) && formData.processing_steps.length > 0) {
      setProcessingSteps(formData.processing_steps);
    } else {
      setProcessingSteps([
        { step: 1, title: '', description: '' },
        { step: 2, title: '', description: '' },
        { step: 3, title: '', description: '' },
        { step: 4, title: '', description: '' }
      ]);
    }
    
    setFaqItems(formData.faq || [
      { question: '', answer: '' },
      { question: '', answer: '' }
    ]);
    setEmbassyDetails(formData.embassy_details || {
      address: '',
      phone: '',
      email: '',
      hours: ''
    });
  }, [formData]);

  // Sync form data with local state whenever local state changes
  useEffect(() => {
    const updatedFormData = {
      ...formData,
      visa_includes: visaIncludes,
      visa_assistance: visaAssistance,
      processing_steps: processingSteps,
      faq: faqItems,
      embassy_details: embassyDetails
    };
    setFormData(updatedFormData);
  }, [visaIncludes, visaAssistance, processingSteps, faqItems, embassyDetails]);

  const handleFlagFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFlagFile(e.target.files[0]);
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBannerFile(e.target.files[0]);
    }
  };

  // Array item handlers
  const handleAddVisaInclude = () => {
    setVisaIncludes([...visaIncludes, '']);
  };

  const handleRemoveVisaInclude = (index: number) => {
    const newIncludes = [...visaIncludes];
    newIncludes.splice(index, 1);
    setVisaIncludes(newIncludes);
  };

  const handleVisaIncludeChange = (index: number, value: string) => {
    const newIncludes = [...visaIncludes];
    newIncludes[index] = value;
    setVisaIncludes(newIncludes);
  };

  const handleAddVisaAssistance = () => {
    setVisaAssistance([...visaAssistance, '']);
  };

  const handleRemoveVisaAssistance = (index: number) => {
    const newAssistance = [...visaAssistance];
    newAssistance.splice(index, 1);
    setVisaAssistance(newAssistance);
  };

  const handleVisaAssistanceChange = (index: number, value: string) => {
    const newAssistance = [...visaAssistance];
    newAssistance[index] = value;
    setVisaAssistance(newAssistance);
  };

  // Processing steps handlers
  const handleProcessingStepChange = (index: number, field: string, value: string) => {
    const newSteps = [...processingSteps];
    newSteps[index] = { ...newSteps[index], [field]: field === 'step' ? parseInt(value) : value };
    setProcessingSteps(newSteps);
  };

  const handleAddProcessingStep = () => {
    const nextStep = processingSteps.length + 1;
    setProcessingSteps([...processingSteps, { step: nextStep, title: '', description: '' }]);
  };

  const handleRemoveProcessingStep = (index: number) => {
    if (processingSteps.length > 1) {
      const newSteps = [...processingSteps];
      newSteps.splice(index, 1);
      // Reorder steps after removal
      newSteps.forEach((step, idx) => {
        step.step = idx + 1;
      });
      setProcessingSteps(newSteps);
    }
  };

  // FAQ handlers
  const handleAddFaq = () => {
    setFaqItems([...faqItems, { question: '', answer: '' }]);
  };

  const handleRemoveFaq = (index: number) => {
    const newFaqs = [...faqItems];
    newFaqs.splice(index, 1);
    setFaqItems(newFaqs);
  };

  const handleFaqChange = (index: number, field: string, value: string) => {
    const newFaqs = [...faqItems];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFaqItems(newFaqs);
  };

  // Embassy details handlers
  const handleEmbassyChange = (field: string, value: string) => {
    setEmbassyDetails({ ...embassyDetails, [field]: value });
  };

  const handleFormSubmit = async () => {
    try {
      setIsUploading(true);
      
      // Upload flag image if selected
      if (flagFile) {
        const flagFilename = `flag-${Date.now()}-${flagFile.name}`;
        const { data: flagData, error: flagError } = await supabase.storage
          .from('country-images')
          .upload(flagFilename, flagFile);
          
        if (flagError) throw flagError;
        
        const flagUrl = supabase.storage.from('country-images').getPublicUrl(flagFilename).data.publicUrl;
        formData.flag = flagUrl;
      }
      
      // Upload banner image if selected
      if (bannerFile) {
        const bannerFilename = `banner-${Date.now()}-${bannerFile.name}`;
        const { data: bannerData, error: bannerError } = await supabase.storage
          .from('country-images')
          .upload(bannerFilename, bannerFile);
          
        if (bannerError) throw bannerError;
        
        const bannerUrl = supabase.storage.from('country-images').getPublicUrl(bannerFilename).data.publicUrl;
        formData.banner = bannerUrl;
      }
      
      // Update formData with the final values from all the arrays and objects
      const updatedFormData = {
        ...formData,
        visa_includes: visaIncludes.filter(item => item.trim() !== ''),
        visa_assistance: visaAssistance.filter(item => item.trim() !== ''),
        processing_steps: processingSteps.filter(step => step.title.trim() !== ''),
        faq: faqItems.filter(faq => faq.question.trim() !== ''),
        embassy_details: embassyDetails
      };
      
      setFormData(updatedFormData);
      setIsUploading(false);

      // Call the onSubmit prop with the final data
      onSubmit();
      
      toast({
        title: isEditMode ? "Country updated" : "Country created",
        description: `${formData.name} has been successfully ${isEditMode ? 'updated' : 'added'}`,
      });
    } catch (error: any) {
      setIsUploading(false);
      toast({
        title: "Error uploading images",
        description: error.message || "Failed to upload one or more images",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-navy-800">
            {isEditMode ? 'Edit Country' : 'Add New Country'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to {isEditMode ? 'update' : 'create'} a country. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic-info" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
            <TabsTrigger value="includes">Visa Includes</TabsTrigger>
            <TabsTrigger value="assistance">Assistance</TabsTrigger>
            <TabsTrigger value="process">Process</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
          </TabsList>
          
          {/* Basic Info Tab */}
          <TabsContent value="basic-info" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-medium">Country Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  placeholder="e.g. United States"
                  className="border-gray-300 focus:border-teal-500"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="flag" className="font-medium">Flag Image *</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="flag-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFlagFileChange}
                      className="flex-1 border-gray-300"
                    />
                    {flagFile && (
                      <span className="text-xs text-green-600 font-medium">Selected</span>
                    )}
                  </div>
                  
                  {formData.flag && (
                    <div className="flex items-center gap-2">
                      <img src={formData.flag} alt="Current flag" className="h-8 w-auto object-contain border rounded" />
                      <span className="text-xs text-gray-500">Current image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="banner" className="font-medium">Banner Image *</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="banner-file"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileChange}
                    className="flex-1 border-gray-300"
                  />
                  {bannerFile && (
                    <span className="text-xs text-green-600 font-medium">Selected</span>
                  )}
                </div>
                
                {formData.banner && (
                  <div className="flex items-center gap-2">
                    <img src={formData.banner} alt="Current banner" className="h-12 w-auto object-contain border rounded" />
                    <span className="text-xs text-gray-500">Current image</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description" className="font-medium">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onInputChange}
                placeholder="Country description"
                rows={3}
                className="border-gray-300 focus:border-teal-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="entry_type" className="font-medium">Entry Type *</Label>
                <Input
                  id="entry_type"
                  name="entry_type"
                  value={formData.entry_type}
                  onChange={onInputChange}
                  placeholder="e.g. Visa Required"
                  className="border-gray-300 focus:border-teal-500"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="validity" className="font-medium">Validity</Label>
                <Input
                  id="validity"
                  name="validity"
                  value={formData.validity}
                  onChange={onInputChange}
                  placeholder="e.g. 6 months"
                  className="border-gray-300 focus:border-teal-500"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="processing_time" className="font-medium">Processing Time</Label>
                <Input
                  id="processing_time"
                  name="processing_time"
                  value={formData.processing_time}
                  onChange={onInputChange}
                  placeholder="e.g. 5-7 business days"
                  className="border-gray-300 focus:border-teal-500"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="length_of_stay" className="font-medium">Length of Stay</Label>
                <Input
                  id="length_of_stay"
                  name="length_of_stay"
                  value={formData.length_of_stay}
                  onChange={onInputChange}
                  placeholder="e.g. Up to 90 days"
                  className="border-gray-300 focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="requirements_description" className="font-medium">Requirements Description</Label>
              <Textarea
                id="requirements_description"
                name="requirements_description"
                value={formData.requirements_description || ''}
                onChange={onInputChange}
                placeholder="Describe the visa requirements for this country"
                rows={2}
                className="border-gray-300 focus:border-teal-500"
              />
            </div>
          </TabsContent>
          
          {/* Visa Includes Tab */}
          <TabsContent value="includes">
            <div className="border p-4 rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-lg font-medium text-navy-800">What's Included in Visa</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddVisaInclude}
                  className="h-8 border-teal-500 text-teal-600 hover:bg-teal-50"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {visaIncludes.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No items added yet. Click the Add button to include what comes with the visa.</p>
                </div>
              ) : (
                visaIncludes.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      value={item}
                      onChange={(e) => handleVisaIncludeChange(index, e.target.value)}
                      placeholder="e.g. Entry to Country"
                      className="border-gray-300 focus:border-teal-500"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveVisaInclude(index)}
                      className="text-red-500 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          {/* Permitsy Assistance Tab */}
          <TabsContent value="assistance">
            <div className="border p-4 rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-lg font-medium text-navy-800">Permitsy Assistance</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddVisaAssistance}
                  className="h-8 border-teal-500 text-teal-600 hover:bg-teal-50"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {visaAssistance.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No assistance items added yet. Click the Add button to include support services.</p>
                </div>
              ) : (
                visaAssistance.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      value={item}
                      onChange={(e) => handleVisaAssistanceChange(index, e.target.value)}
                      placeholder="e.g. 24/7 customer support"
                      className="border-gray-300 focus:border-teal-500"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveVisaAssistance(index)}
                      className="text-red-500 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          {/* Processing Steps Tab */}
          <TabsContent value="process">
            <div className="border p-4 rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-lg font-medium text-navy-800">Processing Steps</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddProcessingStep}
                  className="h-8 border-teal-500 text-teal-600 hover:bg-teal-50"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Step
                </Button>
              </div>
              
              {processingSteps.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No steps added yet. Click the Add Step button to create a step-by-step process.</p>
                </div>
              ) : (
                processingSteps.map((step, index) => (
                  <div key={index} className="grid md:grid-cols-8 gap-2 mb-4 items-start p-3 border rounded-md bg-white">
                    <div className="md:col-span-1">
                      <Label className="text-xs mb-1 block">Step #</Label>
                      <Input
                        type="number"
                        min="1"
                        value={step.step}
                        onChange={(e) => handleProcessingStepChange(index, 'step', e.target.value)}
                        placeholder="Step"
                        className="border-gray-300 focus:border-teal-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs mb-1 block">Title</Label>
                      <Input
                        value={step.title}
                        onChange={(e) => handleProcessingStepChange(index, 'title', e.target.value)}
                        placeholder="Title"
                        className="border-gray-300 focus:border-teal-500"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Label className="text-xs mb-1 block">Description</Label>
                      <Textarea
                        value={step.description}
                        onChange={(e) => handleProcessingStepChange(index, 'description', e.target.value)}
                        placeholder="Description"
                        rows={2}
                        className="border-gray-300 focus:border-teal-500"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end justify-center h-full pb-1">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveProcessingStep(index)}
                        className="text-red-500 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-700"
                        disabled={processingSteps.length <= 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          {/* Additional Info Tab */}
          <TabsContent value="additional" className="space-y-6">
            {/* FAQ Section */}
            <div className="border p-4 rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-lg font-medium text-navy-800">Frequently Asked Questions</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddFaq}
                  className="h-8 border-teal-500 text-teal-600 hover:bg-teal-50"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add FAQ
                </Button>
              </div>
              {faqItems.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No FAQs added yet. Click the Add FAQ button to add questions and answers.</p>
                </div>
              ) : (
                faqItems.map((faq, index) => (
                  <div key={index} className="grid gap-2 mb-4 border-b pb-4 last:border-0 last:pb-0 bg-white p-3 rounded-md my-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">FAQ #{index + 1}</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveFaq(index)}
                        className="text-red-500 h-8 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                    <Label className="text-xs">Question</Label>
                    <Input
                      value={faq.question}
                      onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                      placeholder="Question"
                      className="border-gray-300 focus:border-teal-500"
                    />
                    <Label className="text-xs">Answer</Label>
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                      placeholder="Answer"
                      rows={2}
                      className="border-gray-300 focus:border-teal-500"
                    />
                  </div>
                ))
              )}
            </div>

            {/* Embassy Details Section */}
            <div className="border p-4 rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-lg font-medium text-navy-800">Embassy Details</Label>
              </div>
              <div className="grid gap-3 bg-white p-4 rounded-md">
                <div className="grid">
                  <Label className="text-sm mb-1">Address</Label>
                  <Input
                    value={embassyDetails.address}
                    onChange={(e) => handleEmbassyChange('address', e.target.value)}
                    placeholder="Embassy address"
                    className="border-gray-300 focus:border-teal-500"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="grid">
                    <Label className="text-sm mb-1">Phone</Label>
                    <Input
                      value={embassyDetails.phone}
                      onChange={(e) => handleEmbassyChange('phone', e.target.value)}
                      placeholder="Embassy phone"
                      className="border-gray-300 focus:border-teal-500"
                    />
                  </div>
                  <div className="grid">
                    <Label className="text-sm mb-1">Email</Label>
                    <Input
                      value={embassyDetails.email}
                      onChange={(e) => handleEmbassyChange('email', e.target.value)}
                      placeholder="Embassy email"
                      className="border-gray-300 focus:border-teal-500"
                    />
                  </div>
                </div>
                <div className="grid">
                  <Label className="text-sm mb-1">Working Hours</Label>
                  <Input
                    value={embassyDetails.hours}
                    onChange={(e) => handleEmbassyChange('hours', e.target.value)}
                    placeholder="e.g. Monday to Friday, 9:00 AM to 5:00 PM"
                    className="border-gray-300 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-1">
            {activeTab !== "basic-info" && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  const tabs = ["basic-info", "includes", "assistance", "process", "additional"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
              >
                Previous
              </Button>
            )}
            
            {activeTab !== "additional" && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  const tabs = ["basic-info", "includes", "assistance", "process", "additional"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
              >
                Next
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleFormSubmit} 
              className="bg-teal hover:bg-teal-600 gap-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? 'Update' : 'Add'} Country
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CountryDialog;
