
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
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
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${applicationId}_${documentType.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
      const filePath = `visa_documents/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      // Update application_documents in the database
      const { error: updateError } = await supabase
        .from('application_documents')
        .update({
          file_url: publicUrlData.publicUrl,
          status: 'uploaded',
          uploaded_at: new Date().toISOString()
        })
        .eq('application_id', applicationId)
        .eq('document_type', documentType);
      
      if (updateError) throw updateError;
      
      // Add timeline entry
      await supabase
        .from('application_timeline')
        .insert({
          application_id: applicationId,
          event: `Document Uploaded: ${documentType}`,
          date: new Date().toISOString(),
          description: `The ${documentType} document has been uploaded and is pending review.`
        });
      
      onUploadComplete();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while uploading the document');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload {documentType}</DialogTitle>
          <DialogDescription>
            Please upload a clear, legible copy of your {documentType.toLowerCase()}. 
            Accepted formats: PDF, JPG, PNG (max 5MB).
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <input
              id="document-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <label 
              htmlFor="document-upload" 
              className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center w-full cursor-pointer hover:bg-gray-50"
            >
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-gray-600 font-medium">Select a file</span>
              <span className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (max 5MB)</span>
            </label>
          </div>
          
          {file && (
            <div className="flex items-center text-sm bg-blue-50 border border-blue-200 rounded p-2">
              <FileUp className="h-4 w-4 text-blue-500 mr-2" />
              <span className="truncate">{file.name}</span>
              <span className="ml-auto text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <span className="animate-spin mr-2">⟳</span> Uploading...
              </>
            ) : 'Upload Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentDialog;
