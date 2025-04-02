
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Filter, Search, Globe, Ticket } from 'lucide-react';

export interface CountryFiltersProps {
  searchTerm: string;
  continent: string;
  visaType: string;
  showAddons?: boolean;
  onSearchChange: React.Dispatch<React.SetStateAction<string>>;
  onContinentChange: React.Dispatch<React.SetStateAction<string>>;
  onVisaTypeChange: React.Dispatch<React.SetStateAction<string>>;
  onShowAddonsChange?: React.Dispatch<React.SetStateAction<boolean>>;
  onClearFilters: () => void;
  className?: string;
}

const CountryFilters: React.FC<CountryFiltersProps> = ({
  searchTerm,
  continent,
  visaType,
  showAddons = false,
  onSearchChange,
  onContinentChange,
  onVisaTypeChange,
  onShowAddonsChange,
  onClearFilters,
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-lg space-y-5 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Continent Filter */}
        <div>
          <Select value={continent} onValueChange={onContinentChange}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="All Continents" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Continents</SelectItem>
              <SelectItem value="Asia">Asia</SelectItem>
              <SelectItem value="Europe">Europe</SelectItem>
              <SelectItem value="North America">North America</SelectItem>
              <SelectItem value="South America">South America</SelectItem>
              <SelectItem value="Africa">Africa</SelectItem>
              <SelectItem value="Oceania">Oceania</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Visa Type Filter */}
        <div>
          <Select value={visaType} onValueChange={onVisaTypeChange}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Ticket className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="All Visa Types" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Visa Types</SelectItem>
              <SelectItem value="Tourist">Tourist Visa</SelectItem>
              <SelectItem value="Business">Business Visa</SelectItem>
              <SelectItem value="Student">Student Visa</SelectItem>
              <SelectItem value="Work">Work Visa</SelectItem>
              <SelectItem value="Transit">Transit Visa</SelectItem>
              <SelectItem value="eVisa">e-Visa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={onClearFilters} 
            className="w-full"
            disabled={!searchTerm && !continent && !visaType}
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CountryFilters;
