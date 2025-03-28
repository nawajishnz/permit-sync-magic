
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
}

const CountryDialog: React.FC<CountryDialogProps> = ({
  isOpen,
  onOpenChange,
  isEditMode,
  formData,
  onInputChange,
  onSubmit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onChange={onInputChange}
              placeholder="e.g. United States"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="flag">Flag URL</Label>
            <Input
              id="flag"
              name="flag"
              value={formData.flag}
              onChange={onInputChange}
              placeholder="URL to country flag image"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="banner">Banner URL</Label>
            <Input
              id="banner"
              name="banner"
              value={formData.banner}
              onChange={onInputChange}
              placeholder="URL to country banner image"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} className="bg-teal hover:bg-teal-600">
            {isEditMode ? 'Update' : 'Add'} Country
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CountryDialog;
