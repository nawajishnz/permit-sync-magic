
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CountrySelectorProps {
  countries: any[];
  selectedCountryId: string | null;
  onSelectCountry: (countryId: string) => void;
  disabled?: boolean;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  countries,
  selectedCountryId,
  onSelectCountry,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <Label>Select Country</Label>
      <Select 
        value={selectedCountryId || ''} 
        onValueChange={onSelectCountry}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.id} value={country.id}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CountrySelector;
