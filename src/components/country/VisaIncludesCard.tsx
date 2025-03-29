
import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface VisaIncludesCardProps {
  items: string[];
  title: string;
}

const VisaIncludesCard: React.FC<VisaIncludesCardProps> = ({ items, title }) => {
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <h3 className="font-semibold text-navy mb-4">{title}</h3>
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <div className="bg-teal-50 rounded-full p-1 mr-3 flex-shrink-0">
                <Check className="h-4 w-4 text-teal-600" />
              </div>
              <span className="text-sm text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default VisaIncludesCard;
