
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

export interface VisaDocumentProps {
  name: string; 
  description: string;
  isRequired: boolean;
  // Legacy prop names for backwards compatibility
  documentName?: string;
  documentDescription?: string;
}

const VisaDocument = ({
  name,
  description,
  isRequired,
  documentName,
  documentDescription
}: VisaDocumentProps) => {
  // Support both new and legacy prop names
  const displayName = name || documentName;
  const displayDescription = description || documentDescription;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="font-medium text-gray-900">{displayName}</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">{displayDescription}</p>
          </div>
          <div>
            {isRequired ? (
              <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                Required
              </Badge>
            ) : (
              <Badge variant="outline" className="border-gray-200 text-gray-600">
                Optional
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisaDocument;
