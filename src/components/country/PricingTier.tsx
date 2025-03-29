
import React from 'react';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PricingTierProps {
  name: string;
  price: string;
  processingTime: string;
  features: string[];
  isRecommended?: boolean;
  onSelect: () => void;
  isSelected: boolean;
}

const PricingTier: React.FC<PricingTierProps> = ({
  name,
  price,
  processingTime,
  features,
  isRecommended = false,
  onSelect,
  isSelected
}) => {
  return (
    <div 
      className={cn(
        "border rounded-xl overflow-hidden transition-all duration-200",
        isSelected 
          ? "border-teal-500 shadow-md" 
          : "border-gray-200 hover:border-gray-300",
        isRecommended ? "relative" : ""
      )}
      onClick={onSelect}
    >
      {isRecommended && (
        <div className="absolute top-0 inset-x-0 bg-teal-500 text-white text-xs font-medium py-1 text-center">
          <div className="flex items-center justify-center">
            <Star className="h-3 w-3 fill-white mr-1" />
            <span>RECOMMENDED</span>
          </div>
        </div>
      )}
      
      <div className={cn("p-5", isRecommended ? "pt-8" : "")}>
        <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
        <div className="flex items-baseline mt-2">
          <span className="text-2xl font-bold text-teal-700">{price}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Processing: {processingTime}</p>
        
        <ul className="mt-4 space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <Check className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-5">
          <Button 
            className={cn(
              "w-full", 
              isSelected ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingTier;
