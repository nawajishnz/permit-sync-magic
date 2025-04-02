
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type CountryFiltersProps = {
  searchTerm: string;
  continent: string;
  visaType: string;
  onSearchChange: (value: string) => void;
  onContinentChange: (value: string) => void;
  onVisaTypeChange: (value: string) => void;
  onClearFilters: () => void;
  className?: string;
};

const CountryFilters = ({
  searchTerm,
  continent,
  visaType,
  onSearchChange,
  onContinentChange,
  onVisaTypeChange,
  onClearFilters,
  className = ''
}: CountryFiltersProps) => {
  const hasFilters = searchTerm || continent || visaType;

  return (
    <div className={`bg-white p-4 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-auto flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <Input
            placeholder="Search countries or visa types..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rounded-md"
          />
        </div>
        
        <div className="w-full md:w-auto flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">Continent</label>
          <Select value={continent} onValueChange={onContinentChange}>
            <SelectTrigger className="rounded-md">
              <SelectValue placeholder="All Continents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Continents</SelectItem>
              <SelectItem value="Asia">Asia</SelectItem>
              <SelectItem value="Europe">Europe</SelectItem>
              <SelectItem value="North America">North America</SelectItem>
              <SelectItem value="South America">South America</SelectItem>
              <SelectItem value="Africa">Africa</SelectItem>
              <SelectItem value="Oceania">Oceania</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-auto flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
          <Select value={visaType} onValueChange={onVisaTypeChange}>
            <SelectTrigger className="rounded-md">
              <SelectValue placeholder="All Visa Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visa Types</SelectItem>
              <SelectItem value="Tourist">Tourist</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Transit">Transit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {hasFilters && (
          <div className="w-full md:w-auto flex items-end">
            <Button 
              variant="outline" 
              className="w-full md:w-auto rounded-md h-10"
              onClick={onClearFilters}
            >
              <X size={16} className="mr-1" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryFilters;
