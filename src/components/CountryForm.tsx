
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CountryFormProps {
  countryId?: string;
  onSuccess: () => void;
}

const CountryForm = ({ countryId, onSuccess }: CountryFormProps) => {
  const [name, setName] = useState('');
  const [flag, setFlag] = useState('');
  const [banner, setBanner] = useState('');
  const [description, setDescription] = useState('');
  const [entryType, setEntryType] = useState('');
  const [lengthOfStay, setLengthOfStay] = useState('');
  const [validity, setValidity] = useState('');
  const [processingTime, setProcessingTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<string[]>(['']);
  const isEditMode = !!countryId;

  useEffect(() => {
    if (countryId) {
      fetchCountry();
      fetchDocuments();
    }
  }, [countryId]);

  const fetchCountry = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('id', countryId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setName(data.name);
        setFlag(data.flag);
        setBanner(data.banner);
        setDescription(data.description);
        setEntryType(data.entry_type);
        setLengthOfStay(data.length_of_stay);
        setValidity(data.validity);
        setProcessingTime(data.processing_time);
      }
    } catch (error: any) {
      toast({
        title: "Error loading country",
        description: error.message || "Failed to load country data",
        variant: "destructive",
      });
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('required_documents')
        .select('document_name')
        .eq('country_id', countryId);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setDocuments(data.map(doc => doc.document_name));
      }
    } catch (error: any) {
      toast({
        title: "Error loading documents",
        description: error.message || "Failed to load document data",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate
      if (!name || !flag || !banner || !description) {
        throw new Error("Please fill in all required fields");
      }

      // Create or update country
      let countryResult;
      if (isEditMode) {
        countryResult = await supabase
          .from('countries')
          .update({
            name,
            flag,
            banner,
            description,
            entry_type: entryType,
            length_of_stay: lengthOfStay,
            validity,
            processing_time: processingTime,
            updated_at: new Date().toISOString()
          })
          .eq('id', countryId)
          .select()
          .single();
      } else {
        countryResult = await supabase
          .from('countries')
          .insert({
            name,
            flag,
            banner,
            description,
            entry_type: entryType,
            length_of_stay: lengthOfStay,
            validity,
            processing_time: processingTime
          })
          .select()
          .single();
      }

      if (countryResult.error) {
        throw countryResult.error;
      }

      const currentCountryId = isEditMode ? countryId : countryResult.data.id;

      // Handle documents - if editing, remove all existing documents first
      if (isEditMode) {
        await supabase
          .from('required_documents')
          .delete()
          .eq('country_id', currentCountryId);
      }

      // Insert new documents
      const validDocuments = documents.filter(doc => doc.trim() !== '');
      if (validDocuments.length > 0) {
        const documentsToInsert = validDocuments.map(doc => ({
          country_id: currentCountryId,
          document_name: doc
        }));

        const { error: docsError } = await supabase
          .from('required_documents')
          .insert(documentsToInsert);

        if (docsError) {
          throw docsError;
        }
      }

      toast({
        title: isEditMode ? "Country updated" : "Country created",
        description: `${name} has been successfully ${isEditMode ? 'updated' : 'added'}.`,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error saving country",
        description: error.message || "An error occurred while saving",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentChange = (index: number, value: string) => {
    const newDocuments = [...documents];
    newDocuments[index] = value;
    setDocuments(newDocuments);
  };

  const addDocument = () => {
    setDocuments([...documents, '']);
  };

  const removeDocument = (index: number) => {
    if (documents.length > 1) {
      const newDocuments = [...documents];
      newDocuments.splice(index, 1);
      setDocuments(newDocuments);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Country Name*</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. United States"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="flag">Flag (emoji or URL)*</Label>
          <Input
            id="flag"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            placeholder="e.g. 🇺🇸 or URL"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="banner">Banner Image URL*</Label>
        <Input
          id="banner"
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          placeholder="https://example.com/image.jpg"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description*</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide a description of visa requirements for this country"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="entryType">Entry Type</Label>
          <Input
            id="entryType"
            value={entryType}
            onChange={(e) => setEntryType(e.target.value)}
            placeholder="e.g. Single/Multiple"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lengthOfStay">Length of Stay</Label>
          <Input
            id="lengthOfStay"
            value={lengthOfStay}
            onChange={(e) => setLengthOfStay(e.target.value)}
            placeholder="e.g. 30-90 days"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="validity">Validity</Label>
          <Input
            id="validity"
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
            placeholder="e.g. 10 years"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="processingTime">Processing Time</Label>
          <Input
            id="processingTime"
            value={processingTime}
            onChange={(e) => setProcessingTime(e.target.value)}
            placeholder="e.g. 3-5 business days"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Required Documents</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addDocument}
          >
            Add Document
          </Button>
        </div>
        
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={doc}
              onChange={(e) => handleDocumentChange(index, e.target.value)}
              placeholder="e.g. Valid passport"
            />
            {documents.length > 1 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => removeDocument(index)}
                className="text-red-500"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onSuccess}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-teal hover:bg-teal-600"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : isEditMode ? 'Update Country' : 'Add Country'}
        </Button>
      </div>
    </form>
  );
};

export default CountryForm;
