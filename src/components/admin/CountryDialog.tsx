import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Upload, Plus, Trash, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

export interface CountryFormData {
  id?: string;
  name: string;
  flag: string;
  banner: string;
  description: string;
  entry_type: string;
  validity: string;
  processing_time: string;
  length_of_stay: string;
  requirements_description?: string;
  visa_includes: string[];
  visa_assistance: string[];
  processing_steps: Array<{ step: number; title: string; description: string }>;
  faq: Array<{ question: string; answer: string }>;
  embassy_details: { address: string; phone: string; email: string; hours: string };
  documents?: Array<{ document_name: string; document_description: string; required: boolean; isNew?: boolean }>;
  pricing?: { 
    government_fee: string; 
    service_fee: string; 
    processing_days: string 
  };
}

export interface CountrySubmitData extends CountryFormData {
  flagFile?: File | null;
  bannerFile?: File | null;
}

interface CountryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  formData: CountryFormData;
  onFormChange: (updatedData: CountryFormData) => void;
  onSubmit: (submitData: CountrySubmitData) => void;
  isLoading: boolean;
}

const CountryDialog: React.FC<CountryDialogProps> = ({
  isOpen,
  onOpenChange,
  isEditMode,
  formData,
  onFormChange,
  onSubmit,
  isLoading
}) => {
  const [flagFile, setFlagFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("basic-info");
  const { toast } = useToast();

  const updateFormData = (field: keyof CountryFormData, value: any) => {
    onFormChange({ ...formData, [field]: value });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData(name as keyof CountryFormData, value);
  };

  const handleFlagFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFlagFile(file);
    if (file) updateFormData('flag', '');
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBannerFile(file);
    if (file) updateFormData('banner', '');
  };

  const handleAddVisaInclude = () => {
    updateFormData('visa_includes', [...(formData.visa_includes || []), '']);
  };

  const handleRemoveVisaInclude = (index: number) => {
    const newIncludes = [...(formData.visa_includes || [])];
    newIncludes.splice(index, 1);
    updateFormData('visa_includes', newIncludes);
  };

  const handleVisaIncludeChange = (index: number, value: string) => {
    const newIncludes = [...(formData.visa_includes || [])];
    newIncludes[index] = value;
    updateFormData('visa_includes', newIncludes);
  };

  const handleAddVisaAssistance = () => {
    updateFormData('visa_assistance', [...(formData.visa_assistance || []), '']);
  };

  const handleRemoveVisaAssistance = (index: number) => {
    const newAssistance = [...(formData.visa_assistance || [])];
    newAssistance.splice(index, 1);
    updateFormData('visa_assistance', newAssistance);
  };

  const handleVisaAssistanceChange = (index: number, value: string) => {
    const newAssistance = [...(formData.visa_assistance || [])];
    newAssistance[index] = value;
    updateFormData('visa_assistance', newAssistance);
  };

  const handleProcessingStepChange = (index: number, field: 'title' | 'description', value: string) => {
    const newSteps = [...(formData.processing_steps || [])];
    newSteps[index] = { ...newSteps[index], [field]: value };
    updateFormData('processing_steps', newSteps);
  };

  const handleAddProcessingStep = () => {
    const nextStep = (formData.processing_steps?.length || 0) + 1;
    updateFormData('processing_steps', [
      ...(formData.processing_steps || []),
      { step: nextStep, title: '', description: '' },
    ]);
  };

  const handleRemoveProcessingStep = (index: number) => {
    if ((formData.processing_steps?.length || 0) > 1) {
      const newSteps = [...(formData.processing_steps || [])];
      newSteps.splice(index, 1);
      newSteps.forEach((step, idx) => { step.step = idx + 1; });
      updateFormData('processing_steps', newSteps);
    }
  };

  const handleAddFaq = () => {
    updateFormData('faq', [...(formData.faq || []), { question: '', answer: '' }]);
  };

  const handleRemoveFaq = (index: number) => {
    const newFaqs = [...(formData.faq || [])];
    newFaqs.splice(index, 1);
    updateFormData('faq', newFaqs);
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...(formData.faq || [])];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    updateFormData('faq', newFaqs);
  };

  const handleAddDocument = () => {
    updateFormData('documents', [
      ...(formData.documents || []),
      { document_name: '', document_description: '', required: false, isNew: true }
    ]);
  };

  const handleRemoveDocument = (index: number) => {
    const newDocs = [...(formData.documents || [])];
    newDocs.splice(index, 1);
    updateFormData('documents', newDocs);
  };

  const handleDocumentChange = (index: number, field: string, value: string | boolean) => {
    const newDocs = [...(formData.documents || [])];
    newDocs[index] = { ...newDocs[index], [field]: value };
    updateFormData('documents', newDocs);
  };

  const handleEmbassyChange = (field: keyof CountryFormData['embassy_details'], value: string) => {
    updateFormData('embassy_details', { 
      ...(formData.embassy_details),
      [field]: value 
    });
  };

  const handlePricingChange = (field: keyof NonNullable<CountryFormData['pricing']>, value: string) => {
    updateFormData('pricing', {
      ...(formData.pricing),
      [field]: value
    });
  };

  const handleFormSubmit = () => {
    const submitData: CountrySubmitData = {
      ...formData,
      flagFile: flagFile,
      bannerFile: bannerFile,
      visa_includes: (formData.visa_includes || []).filter(item => item?.trim()),
      visa_assistance: (formData.visa_assistance || []).filter(item => item?.trim()),
      processing_steps: (formData.processing_steps || []).filter(step => step?.title?.trim()),
      faq: (formData.faq || []).filter(item => item?.question?.trim())
    };
    
    if (formData.pricing) {
      submitData.pricing = {
        government_fee: formData.pricing.government_fee || '0',
        service_fee: formData.pricing.service_fee || '0',
        processing_days: formData.pricing.processing_days || '15'
      };
    }
    
    onSubmit(submitData);
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
            <TabsTrigger value="includes">Includes</TabsTrigger>
            <TabsTrigger value="assistance">Assistance</TabsTrigger>
            <TabsTrigger value="process">Process</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="embassy">Embassy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic-info" className="space-y-4 pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-medium">Country Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. United States"
                  className="border-gray-300 focus:border-teal-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="validity">Validity</Label>
                <Input
                  id="validity"
                  name="validity"
                  value={formData.validity || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. 6 months"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="length_of_stay" className="font-medium">Length of Stay</Label>
                <Input
                  id="length_of_stay"
                  name="length_of_stay"
                  value={formData.length_of_stay || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. Up to 90 days"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="processing_time">Processing Time (Display)</Label>
                <Input
                  id="processing_time"
                  name="processing_time"
                  value={formData.processing_time || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. 3-5 business days"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="flag" className="font-medium">
                  Flag Image *
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="flag-file"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      onChange={handleFlagFileChange}
                      className="flex-1 border-gray-300"
                    />
                    {flagFile && (
                      <span className="text-xs text-green-600 font-medium">New file selected</span>
                    )}
                  </div>
                  {formData.flag && !flagFile && (
                    <div className="flex items-center gap-2">
                      <img src={formData.flag} alt="Current flag" className="h-8 w-auto object-contain border rounded" />
                      <span className="text-xs text-gray-500">Current image</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="banner" className="font-medium">
                  Banner Image *
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="banner-file"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleBannerFileChange}
                      className="flex-1 border-gray-300"
                    />
                    {bannerFile && (
                      <span className="text-xs text-green-600 font-medium">New file selected</span>
                    )}
                  </div>
                  {formData.banner && !bannerFile && (
                    <div className="flex items-center gap-2">
                      <img src={formData.banner} alt="Current banner" className="h-12 w-auto object-contain border rounded" />
                      <span className="text-xs text-gray-500">Current image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="font-medium">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Country description"
                rows={3}
                className="border-gray-300 focus:border-teal-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requirements_description">Requirements Overview</Label>
              <Textarea
                id="requirements_description"
                name="requirements_description"
                value={formData.requirements_description || ''}
                onChange={handleInputChange}
                placeholder="Brief description of general visa requirements"
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="includes" className="space-y-4 pt-4">
            <Label className="font-medium">Visa Includes</Label>
            {(formData.visa_includes || []).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleVisaIncludeChange(index, e.target.value)}
                  placeholder={`Included feature ${index + 1}`}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => handleRemoveVisaInclude(index)}>
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddVisaInclude}>
              <Plus className="h-4 w-4 mr-1" /> Add Include
            </Button>
          </TabsContent>

          <TabsContent value="assistance" className="space-y-4 pt-4">
            <Label className="font-medium">Visa Assistance</Label>
            {(formData.visa_assistance || []).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleVisaAssistanceChange(index, e.target.value)}
                  placeholder={`Assistance feature ${index + 1}`}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => handleRemoveVisaAssistance(index)}>
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddVisaAssistance}>
              <Plus className="h-4 w-4 mr-1" /> Add Assistance
            </Button>
          </TabsContent>

          <TabsContent value="process" className="space-y-4 pt-4">
            <Label className="font-medium">Processing Steps</Label>
            {(formData.processing_steps || []).map((step, index) => (
              <div key={index} className="p-3 border rounded space-y-2">
                <Label>Step {step.step}</Label>
                <Input
                  value={step.title}
                  onChange={(e) => handleProcessingStepChange(index, 'title', e.target.value)}
                  placeholder={`Step ${step.step} Title`}
                  className="mb-1"
                />
                <Textarea
                  value={step.description}
                  onChange={(e) => handleProcessingStepChange(index, 'description', e.target.value)}
                  placeholder={`Step ${step.step} Description`}
                  rows={2}
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveProcessingStep(index)} 
                  disabled={(formData.processing_steps?.length || 0) <= 1}
                  className="text-red-500 hover:text-red-700 float-right"
                >
                  <Trash className="h-4 w-4 mr-1" /> Remove Step
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddProcessingStep}>
              <Plus className="h-4 w-4 mr-1" /> Add Step
            </Button>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4 pt-4">
            <Label className="font-medium">Required Documents Checklist</Label>
            {(formData.documents || []).map((doc, index) => (
              <div key={index} className="p-3 border rounded space-y-2 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    value={doc.document_name}
                    onChange={(e) => handleDocumentChange(index, 'document_name', e.target.value)}
                    placeholder={`Document ${index + 1} Name`}
                  />
                  <Textarea
                    value={doc.document_description}
                    onChange={(e) => handleDocumentChange(index, 'document_description', e.target.value)}
                    placeholder={`Document ${index + 1} Description`}
                    rows={1}
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`required-${index}`}
                      checked={doc.required}
                      onCheckedChange={(checked) => handleDocumentChange(index, 'required', !!checked)}
                    />
                    <label htmlFor={`required-${index}`} className="text-sm font-medium">Required</label>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveDocument(index)}>
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddDocument}>
              <Plus className="h-4 w-4 mr-1" /> Add Document Item
            </Button>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4 pt-4">
            <Label className="font-medium">Default Visa Package Pricing</Label>
            <div className="grid md:grid-cols-3 gap-4 p-4 border rounded">
              <div className="grid gap-1.5">
                <Label htmlFor="government_fee">Government Fee *</Label>
                <Input
                  id="government_fee"
                  name="government_fee"
                  type="number"
                  value={formData.pricing?.government_fee || ''}
                  onChange={(e) => handlePricingChange('government_fee', e.target.value)}
                  placeholder="e.g., 150"
                  min="0"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="service_fee">Service Fee *</Label>
                <Input
                  id="service_fee"
                  name="service_fee"
                  type="number"
                  value={formData.pricing?.service_fee || ''}
                  onChange={(e) => handlePricingChange('service_fee', e.target.value)}
                  placeholder="e.g., 50"
                  min="0"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="processing_days">Processing Days *</Label>
                <Input
                  id="processing_days"
                  name="processing_days"
                  type="number"
                  value={formData.pricing?.processing_days || ''}
                  onChange={(e) => handlePricingChange('processing_days', e.target.value)}
                  placeholder="e.g., 10"
                  min="1"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">This sets the initial pricing for the default visa package when a country is created. You can manage more complex pricing tiers separately.</p>
          </TabsContent>
          
          <TabsContent value="embassy" className="space-y-4 pt-4">
            <Label className="font-medium">Embassy Details</Label>
            <div className="grid md:grid-cols-2 gap-4 p-4 border rounded">
              <div className="grid gap-1.5">
                <Label htmlFor="embassy_address">Address</Label>
                <Input
                  id="embassy_address"
                  value={formData.embassy_details?.address || ''}
                  onChange={(e) => handleEmbassyChange('address', e.target.value)}
                  placeholder="Embassy Address"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="embassy_phone">Phone</Label>
                <Input
                  id="embassy_phone"
                  value={formData.embassy_details?.phone || ''}
                  onChange={(e) => handleEmbassyChange('phone', e.target.value)}
                  placeholder="Embassy Phone Number"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="embassy_email">Email</Label>
                <Input
                  id="embassy_email"
                  type="email"
                  value={formData.embassy_details?.email || ''}
                  onChange={(e) => handleEmbassyChange('email', e.target.value)}
                  placeholder="Embassy Email Address"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="embassy_hours">Working Hours</Label>
                <Input
                  id="embassy_hours"
                  value={formData.embassy_details?.hours || ''}
                  onChange={(e) => handleEmbassyChange('hours', e.target.value)}
                  placeholder="e.g., Mon-Fri 9am-5pm"
                />
              </div>
            </div>
          </TabsContent>
          
        </Tabs>

        <DialogFooter className="mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleFormSubmit} 
            disabled={isLoading} 
            className="bg-teal hover:bg-teal-600 text-white"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? 'Update Country' : 'Create Country'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CountryDialog;
