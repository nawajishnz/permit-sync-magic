
import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface VisaDocumentProps {
  name: string;
  description?: string;
  required: boolean;
}

const VisaDocument: React.FC<VisaDocumentProps> = ({ name, description, required }) => {
  return (
    <div className="flex items-start p-4 border border-gray-100 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
      <div className={`flex-shrink-0 p-1 rounded-full mr-3 ${required ? 'bg-teal-50' : 'bg-amber-50'}`}>
        {required ? (
          <Check className="h-5 w-5 text-teal-600" />
        ) : (
          <AlertCircle className="h-5 w-5 text-amber-600" />
        )}
      </div>
      <div>
        <h4 className="font-medium text-gray-900 mb-1">{name}</h4>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        {!required && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full mt-1 inline-block">Recommended</span>}
      </div>
    </div>
  );
};

export default VisaDocument;
