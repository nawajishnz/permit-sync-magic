
import React from 'react';
import { DocumentChecklistItem } from '@/hooks/useCountryData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import VisaDocument from './VisaDocument';

interface DocumentChecklistProps {
  requirementsDescription: string;
  documents: DocumentChecklistItem[];
}

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ 
  requirementsDescription, 
  documents 
}) => {
  const requiredDocuments = documents.filter(doc => doc.required);
  const optionalDocuments = documents.filter(doc => !doc.required);

  if (!documents || documents.length === 0) {
    return (
      <div className="my-6">
        <h3 className="text-xl font-semibold mb-4">Required Documents</h3>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No document requirements have been specified for this visa.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold mb-4">Required Documents</h3>
      
      {requirementsDescription && (
        <p className="mb-6 text-gray-600">{requirementsDescription}</p>
      )}
      
      <div className="grid gap-4 mb-6">
        {requiredDocuments.map((doc) => (
          <VisaDocument
            key={doc.id}
            name={doc.document_name}
            description={doc.document_description}
            required={true}
          />
        ))}
      </div>
      
      {optionalDocuments.length > 0 && (
        <>
          <h4 className="text-lg font-medium mt-6 mb-3">Optional Documents</h4>
          <div className="grid gap-4">
            {optionalDocuments.map((doc) => (
              <VisaDocument
                key={doc.id}
                name={doc.document_name}
                description={doc.document_description}
                required={false}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentChecklist;
