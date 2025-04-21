
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

export interface VisaDocumentProps {
  documentName: string;
  documentDescription: string;
  isRequired: boolean;
}

const VisaDocument = ({
  documentName,
  documentDescription,
  isRequired
}: VisaDocumentProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="font-medium text-gray-900">{documentName}</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">{documentDescription}</p>
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
