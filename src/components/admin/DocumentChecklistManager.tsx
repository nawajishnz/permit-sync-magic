import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import { saveDocumentChecklist } from '@/services/documentChecklistService';

interface DocumentChecklistManagerProps {
  countries: any[];
  selectedCountryId: string | null;
  onSelectCountry: (countryId: string) => void;
  queryClient?: QueryClient;
}

const DocumentChecklistManager: React.FC<DocumentChecklistManagerProps> = ({
  countries,
  selectedCountryId,
  onSelectCountry,
  queryClient: externalQueryClient
}) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const localQueryClient = useQueryClient();
  
  const activeQueryClient = externalQueryClient || localQueryClient;

  const { 
    data: fetchedDocuments = [], 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['documents', selectedCountryId],
    queryFn: async () => {
      if (!selectedCountryId) return [];

      const { data, error } = await supabase
        .from('document_checklist')
        .select('*')
        .eq('country_id', selectedCountryId);
        
      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!selectedCountryId,
  });

  useEffect(() => {
    if (fetchedDocuments.length > 0) {
      setDocuments(fetchedDocuments);
    } else if (selectedCountryId) {
      setDocuments([
        {
          country_id: selectedCountryId,
          document_name: '',
          document_description: '',
          required: true,
          isNew: true
        }
      ]);
    }
  }, [fetchedDocuments, selectedCountryId]);

  const handleAddDocument = () => {
    if (!selectedCountryId) {
      toast({
        title: "No country selected",
        description: "Please select a country first",
        variant: "destructive",
      });
      return;
    }

    setDocuments([
      ...documents,
      {
        country_id: selectedCountryId,
        document_name: '',
        document_description: '',
        required: true,
        isNew: true
      }
    ]);
  };

  const handleRemoveDocument = (index: number) => {
    const newDocuments = [...documents];
    newDocuments.splice(index, 1);
    setDocuments(newDocuments);
  };

  const handleDocumentChange = (index: number, field: string, value: any) => {
    const newDocuments = [...documents];
    newDocuments[index] = { 
      ...newDocuments[index], 
      [field]: value,
      modified: true 
    };
    setDocuments(newDocuments);
  };

  const saveDocuments = async () => {
    if (!selectedCountryId) return;

    try {
      setIsSaving(true);

      for (const doc of documents) {
        if (!doc.document_name.trim()) {
          toast({
            title: "Invalid document",
            description: "Document name cannot be empty",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }

      const result = await saveDocumentChecklist(selectedCountryId, documents);

      if (result.success) {
        toast({
          title: "Documents saved",
          description: "Document checklist has been updated successfully",
        });
        
        refetch();
        
        activeQueryClient.invalidateQueries({ queryKey: ['countryDetail'] });
        activeQueryClient.invalidateQueries({ queryKey: ['countries'] });
        activeQueryClient.invalidateQueries({ queryKey: ['popularCountries'] });
        activeQueryClient.invalidateQueries({ queryKey: ['documents', selectedCountryId] });
      } else {
        toast({
          title: "Error saving documents",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error saving documents",
        description: error.message || "An error occurred while saving documents",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Document Checklist</CardTitle>
          <div className="flex items-center gap-2">
            <Select 
              value={selectedCountryId || ''} 
              onValueChange={onSelectCountry}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddDocument} 
              variant="outline" 
              size="sm" 
              disabled={!selectedCountryId}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Document
            </Button>
            <Button 
              onClick={saveDocuments} 
              className="bg-teal hover:bg-teal-600" 
              size="sm"
              disabled={!selectedCountryId || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedCountryId ? (
          <div className="text-center py-8 text-gray-500">
            <p>Please select a country to manage its document checklist.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No documents found. Add your first document to the checklist.</p>
            <Button onClick={handleAddDocument} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-1" /> Add Document
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Required</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc, index) => (
                <TableRow key={doc.id || `new-${index}`}>
                  <TableCell>
                    <Input
                      value={doc.document_name}
                      onChange={e => handleDocumentChange(index, 'document_name', e.target.value)}
                      placeholder="Document name"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={doc.document_description || ''}
                      onChange={e => handleDocumentChange(index, 'document_description', e.target.value)}
                      placeholder="Document description"
                      rows={2}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Checkbox
                        checked={doc.required}
                        onCheckedChange={value => handleDocumentChange(index, 'required', !!value)}
                        id={`required-${index}`}
                      />
                      <Label htmlFor={`required-${index}`} className="ml-2">
                        Required
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentChecklistManager;
