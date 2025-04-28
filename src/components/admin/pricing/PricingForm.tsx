
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PricingFormData {
  government_fee: string;
  service_fee: string;
  processing_days: string;
}

interface PricingFormProps {
  formData: PricingFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const PricingForm: React.FC<PricingFormProps> = ({
  formData,
  onChange,
  disabled = false
}) => {
  const totalPrice = 
    (parseFloat(formData.government_fee) || 0) + 
    (parseFloat(formData.service_fee) || 0);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="government_fee">Government Fee (₹)</Label>
          <Input
            id="government_fee"
            name="government_fee"
            type="number"
            value={formData.government_fee}
            onChange={onChange}
            placeholder="0"
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="service_fee">Service Fee (₹)</Label>
          <Input
            id="service_fee"
            name="service_fee"
            type="number"
            value={formData.service_fee}
            onChange={onChange}
            placeholder="0"
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="processing_days">Processing Days</Label>
          <Input
            id="processing_days"
            name="processing_days"
            type="number"
            value={formData.processing_days}
            onChange={onChange}
            placeholder="15"
            disabled={disabled}
          />
        </div>
      </div>
      
      <div className="text-sm text-gray-700 font-medium">
        Total Price: ₹{totalPrice.toFixed(2)}
      </div>
    </div>
  );
};

export default PricingForm;
