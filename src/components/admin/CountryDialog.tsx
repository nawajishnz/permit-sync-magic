
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CountryFormData {
  name: string;
  flag: string;
  banner: string;
  description: string;
  entry_type: string;
  validity: string;
  processing_time: string;
  length_of_stay: string;
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
  const { toast } = useToast();

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
        setFormData({ ...formData, flag: flagUrl });
      }
      
      // Upload banner image if selected
      if (bannerFile) {
        const bannerFilename = `banner-${Date.now()}-${bannerFile.name}`;
        const { data: bannerData, error: bannerError } = await supabase.storage
          .from('country-images')
          .upload(bannerFilename, bannerFile);
          
        if (bannerError) throw bannerError;
        
        const bannerUrl = supabase.storage.from('country-images').getPublicUrl(bannerFilename).data.publicUrl;
        setFormData({ ...formData, banner: bannerUrl });
      }
      
      setIsUploading(false);
      onSubmit();
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Country' : 'Add New Country'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Country Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              placeholder="e.g. United States"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="flag">Flag Image *</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  id="flag-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFlagFileChange}
                  className="flex-1"
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
              
              <div className="text-xs text-gray-500 flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Recommended: Square format (1:1), minimum 64x64px, PNG or SVG format for best quality.</span>
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="banner">Banner Image *</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  id="banner-file"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileChange}
                  className="flex-1"
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
              
              <div className="text-xs text-gray-500 flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Recommended: Wide format (16:9 or 3:1), minimum 1200x400px. High quality JPG or PNG format.</span>
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
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
              onChange={onInputChange}
              placeholder="e.g. Visa Required"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="validity">Validity</Label>
            <Input
              id="validity"
              name="validity"
              value={formData.validity}
              onChange={onInputChange}
              placeholder="e.g. 6 months"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="processing_time">Processing Time</Label>
            <Input
              id="processing_time"
              name="processing_time"
              value={formData.processing_time}
              onChange={onInputChange}
              placeholder="e.g. 5-7 business days"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="length_of_stay">Length of Stay</Label>
            <Input
              id="length_of_stay"
              name="length_of_stay"
              value={formData.length_of_stay}
              onChange={onInputChange}
              placeholder="e.g. Up to 90 days"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleFormSubmit} 
            className="bg-teal hover:bg-teal-600"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                Uploading...
              </>
            ) : (
              <>{isEditMode ? 'Update' : 'Add'} Country</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CountryDialog;
