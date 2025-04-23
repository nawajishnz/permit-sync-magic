
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

export interface VisaDocumentProps {
  documentName: string;
  documentDescription: string;
  isRequired: boolean;
}

const VisaDocument: React.FC<VisaDocumentProps> = ({ documentName, documentDescription, isRequired }) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className={`flex-shrink-0 mr-3 p-2 rounded-full ${isRequired ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <FileText className={`h-5 w-5 ${isRequired ? 'text-blue-600' : 'text-gray-500'}`} />
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <h4 className="font-medium text-gray-900">{documentName}</h4>
            {isRequired ? (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                Required
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                Optional
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600">{documentDescription}</p>
          
          {isRequired && (
            <div className="mt-2 flex items-center text-xs text-amber-700">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              <span>Must be submitted for your application to proceed</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VisaDocument;
