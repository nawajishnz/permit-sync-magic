
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUp, X, Check, AlertCircle, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DocumentUploadProps {
  formData: any;
  updateFormData: (data: any) => void;
}

interface FileStatus {
  file: File | null;
  status: 'pending' | 'uploading' | 'success' | 'error';
  message?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ formData, updateFormData }) => {
  const [files, setFiles] = useState<Record<string, FileStatus>>({
    passport: { file: null, status: 'pending' },
    photo: { file: null, status: 'pending' },
    financialProof: { file: null, status: 'pending' },
    itinerary: { file: null, status: 'pending' },
    accommodation: { file: null, status: 'pending' },
    insurance: { file: null, status: 'pending' },
  });
  
  const [additionalDocuments, setAdditionalDocuments] = useState<FileStatus[]>([]);

  const requiredDocuments = [
    { id: 'passport', label: 'Passport Copy', description: 'First and last page of your passport (PDF)' },
    { id: 'photo', label: 'Passport Size Photo', description: 'Recent photo with white background (JPG/PNG)' },
    { id: 'financialProof', label: 'Financial Proof', description: 'Bank statements for the last 3 months (PDF)' },
  ];
  
  const additionalRequiredDocuments = [
    { id: 'itinerary', label: 'Travel Itinerary', description: 'Flight bookings and travel plans (PDF)' },
    { id: 'accommodation', label: 'Accommodation Proof', description: 'Hotel reservations or accommodation details (PDF)' },
    { id: 'insurance', label: 'Travel Insurance', description: 'Valid travel insurance for your trip (PDF)' },
  ];

  const handleFileChange = (documentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Simulate file upload
      const newFiles = { ...files };
      newFiles[documentId] = { file, status: 'uploading' };
      setFiles(newFiles);
      
      // Simulate API call
      setTimeout(() => {
        const updatedFiles = { ...files };
        updatedFiles[documentId] = { file, status: 'success' };
        setFiles(updatedFiles);
        
        // Update form data
        updateFormData({
          ...formData,
          [documentId]: file,
        });
      }, 1500);
    }
  };
  
  const handleAdditionalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Add file to additional documents
      const newDocument: FileStatus = { file, status: 'uploading' };
      setAdditionalDocuments([...additionalDocuments, newDocument]);
      
      // Simulate API call
      setTimeout(() => {
        setAdditionalDocuments(prev => 
          prev.map(doc => 
            doc.file === file ? { ...doc, status: 'success' } : doc
          )
        );
        
        // Update form data
        updateFormData({
          ...formData,
          additionalDocuments: [
            ...(formData.additionalDocuments || []),
            file
          ],
        });
      }, 1500);
    }
  };
  
  const removeFile = (documentId: string) => {
    const newFiles = { ...files };
    newFiles[documentId] = { file: null, status: 'pending' };
    setFiles(newFiles);
    
    // Update form data
    updateFormData({
      ...formData,
      [documentId]: null,
    });
  };
  
  const removeAdditionalFile = (index: number) => {
    const newAdditionalDocuments = [...additionalDocuments];
    newAdditionalDocuments.splice(index, 1);
    setAdditionalDocuments(newAdditionalDocuments);
    
    // Update form data
    const updatedAdditionalDocs = [...(formData.additionalDocuments || [])];
    updatedAdditionalDocs.splice(index, 1);
    updateFormData({
      ...formData,
      additionalDocuments: updatedAdditionalDocs,
    });
  };

  const renderFileStatus = (fileStatus: FileStatus) => {
    if (fileStatus.status === 'uploading') {
      return (
        <div className="flex items-center text-blue-500">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
          <span>Uploading...</span>
        </div>
      );
    } else if (fileStatus.status === 'success') {
      return (
        <div className="flex items-center text-green-500">
          <Check className="h-4 w-4 mr-2" />
          <span>Uploaded successfully</span>
        </div>
      );
    } else if (fileStatus.status === 'error') {
      return (
        <div className="flex items-center text-red-500">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>{fileStatus.message || 'Upload failed'}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Document Guidelines</AlertTitle>
        <AlertDescription className="text-blue-700">
          All documents must be clear, legible and in PDF, JPG, or PNG format. Maximum file size is 5MB per document.
        </AlertDescription>
      </Alert>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
        <div className="space-y-4">
          {requiredDocuments.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{doc.label} <span className="text-red-500">*</span></h4>
                    <p className="text-sm text-gray-500">{doc.description}</p>
                    {files[doc.id].file && (
                      <div className="text-sm mt-2">
                        <div className="flex items-center text-gray-700">
                          <FileUp className="h-4 w-4 mr-2" />
                          <span>{files[doc.id].file?.name}</span>
                        </div>
                        {renderFileStatus(files[doc.id])}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {files[doc.id].file ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(doc.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="flex items-center">
                        <input
                          type="file"
                          id={`file-${doc.id}`}
                          className="hidden"
                          onChange={(e) => handleFileChange(doc.id, e)}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label 
                          htmlFor={`file-${doc.id}`} 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 px-3 rounded-md cursor-pointer flex items-center"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Required Documents</h3>
        <div className="space-y-4">
          {additionalRequiredDocuments.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{doc.label}</h4>
                    <p className="text-sm text-gray-500">{doc.description}</p>
                    {files[doc.id].file && (
                      <div className="text-sm mt-2">
                        <div className="flex items-center text-gray-700">
                          <FileUp className="h-4 w-4 mr-2" />
                          <span>{files[doc.id].file?.name}</span>
                        </div>
                        {renderFileStatus(files[doc.id])}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {files[doc.id].file ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(doc.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="flex items-center">
                        <input
                          type="file"
                          id={`file-${doc.id}`}
                          className="hidden"
                          onChange={(e) => handleFileChange(doc.id, e)}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label 
                          htmlFor={`file-${doc.id}`} 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 px-3 rounded-md cursor-pointer flex items-center"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Supporting Documents (Optional)</h3>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Upload any additional documents that may support your visa application, such as invitation letters, employment proof, or educational certificates.
              </p>
              
              {additionalDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-700">
                      <FileUp className="h-4 w-4 mr-2" />
                      <span>{doc.file?.name}</span>
                    </div>
                    {renderFileStatus(doc)}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeAdditionalFile(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex justify-center pt-2">
                <input
                  type="file"
                  id="additional-file"
                  className="hidden"
                  onChange={handleAdditionalFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label 
                  htmlFor="additional-file" 
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center w-full cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-gray-600 font-medium">Click to upload additional documents</span>
                  <span className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (max 5MB)</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentUpload;
