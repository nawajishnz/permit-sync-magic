
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PricingTierProps {
  name: string;
  price: number;
  governmentFee: number;
  serviceFee: number;
  processingDays: number;
}

const PricingTier: React.FC<PricingTierProps> = ({
  name,
  price,
  governmentFee,
  serviceFee,
  processingDays
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="mt-2">
          <p className="text-3xl font-bold text-gray-900">${price.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Processing time: {processingDays} days</p>
        </div>
        
        <ul className="mt-6 space-y-4">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Government Fee: ${governmentFee.toFixed(2)}</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Service Fee: ${serviceFee.toFixed(2)}</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Processing Time: {processingDays} days</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PricingTier;
