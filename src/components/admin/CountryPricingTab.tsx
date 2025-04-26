
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import SimplePricingManager from './SimplePricingManager';

interface CountryPricingTabProps {
  countries: any[];
}

const CountryPricingTab: React.FC<CountryPricingTabProps> = ({ countries }) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  
  const handleCountryChange = (value: string) => {
    setSelectedCountryId(value);
  };
  
  const selectedCountry = countries.find(c => c.id === selectedCountryId);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Country Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Select Country</Label>
              <Select value={selectedCountryId} onValueChange={handleCountryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedCountryId && selectedCountry && (
              <SimplePricingManager
                countryId={selectedCountryId}
                countryName={selectedCountry.name}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CountryPricingTab;
