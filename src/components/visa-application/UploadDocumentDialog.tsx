
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  documentType: string;
  applicationId: string;
}

const UploadDocumentDialog: React.FC<UploadDocumentDialogProps> = ({
  open,
  onClose,
  onUploadComplete,
  documentType,
  applicationId
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB. Please select a smaller file.');
        setFile(null);
        return;
      }
      
      // Check file type (allow only PDF, JPG, PNG)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please select a PDF, JPG or PNG file.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${applicationId}/${documentType.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${fileExt}`;
      const filePath = `application-documents/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('visa-documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('visa-documents')
        .getPublicUrl(filePath);

      // Update the application document record
      const { error: updateError } = await supabase
        .from('application_documents')
        .update({
          file_url: publicUrl,
          status: 'uploaded',
          uploaded_at: new Date().toISOString()
        })
        .eq('document_type', documentType)
        .eq('application_id', applicationId);

      if (updateError) {
        throw updateError;
      }

      // Add a timeline event for the document upload
      await supabase
        .from('application_timeline')
        .insert({
          application_id: applicationId,
          event: `${documentType} uploaded`,
          description: `Document "${documentType}" was uploaded and is pending review.`,
          date: new Date().toISOString()
        });

      toast({
        title: "Document uploaded",
        description: "Your document has been successfully uploaded.",
      });

      onUploadComplete();
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload {documentType}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="document-file">Select File</Label>
            <Input 
              id="document-file" 
              type="file" 
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={isUploading}
            />
            <p className="text-xs text-gray-500">
              Maximum file size: 5MB. Accepted formats: PDF, JPG, PNG.
            </p>
          </div>

          {file && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium">Selected file:</p>
              <p className="text-sm truncate">{file.name}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className="ml-2"
          >
            {isUploading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-100 border-t-white" />
            )}
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentDialog;
