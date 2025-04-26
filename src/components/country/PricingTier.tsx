
import React from 'react';
import { Check, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface PricingTierProps {
  name: string;
  price: number;
  governmentFee: number;
  serviceFee: number;
  processingDays: number;
}

const PricingTier: React.FC<PricingTierProps> = ({
  name = 'Visa Package',
  price = 0,
  governmentFee = 0,
  serviceFee = 0,
  processingDays = 15
}) => {
  // Calculate total if not provided directly
  const totalPrice = price || (governmentFee + serviceFee);
  
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="mt-2">
          <div className="flex items-center">
            <IndianRupee className="h-5 w-5 text-gray-700 mr-1" />
            <p className="text-3xl font-bold text-gray-900">{totalPrice.toFixed(2)}</p>
          </div>
          <p className="text-sm text-gray-500 mt-1">Processing time: {processingDays} days</p>
        </div>
        
        <ul className="mt-6 space-y-4">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <div>
              <span className="font-medium">Government Fee:</span>
              <div className="flex items-center">
                <IndianRupee className="h-3.5 w-3.5 text-gray-600 mr-0.5" />
                <span>{governmentFee.toFixed(2)}</span>
              </div>
            </div>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <div>
              <span className="font-medium">Service Fee:</span>
              <div className="flex items-center">
                <IndianRupee className="h-3.5 w-3.5 text-gray-600 mr-0.5" />
                <span>{serviceFee.toFixed(2)}</span>
              </div>
            </div>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Processing Time: {processingDays} days</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default PricingTier;
