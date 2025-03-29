
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, FileCog, Package, ListChecks, TagIcon } from 'lucide-react';

interface CountryTableProps {
  countries: any[];
  onEdit: (country: any) => void;
  onDelete: (id: string) => void;
  navigateToVisaTypes: (countryId: string, countryName: string) => void;
  navigateToPackages: (countryId: string, countryName: string) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onSelectCountry?: (countryId: string) => void;
}

const CountryTable: React.FC<CountryTableProps> = ({
  countries,
  onEdit,
  onDelete,
  navigateToVisaTypes,
  navigateToPackages,
  isLoading,
  isError,
  error,
  onSelectCountry
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading countries. Please try again.</p>
        <p className="text-sm mt-2">{error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No countries found. Add your first country to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Country</TableHead>
            <TableHead>Entry Type</TableHead>
            <TableHead>Processing Time</TableHead>
            <TableHead>Length of Stay</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {countries.map((country) => (
            <TableRow key={country.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onSelectCountry && onSelectCountry(country.id)}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  {country.flag && country.flag.includes('http') ? (
                    <img src={country.flag} alt={country.name} className="w-6 h-6 rounded-full object-cover mr-2" />
                  ) : (
                    <span className="mr-2">{country.flag || '🏳️'}</span>
                  )}
                  {country.name}
                </div>
              </TableCell>
              <TableCell>{country.entry_type}</TableCell>
              <TableCell>{country.processing_time}</TableCell>
              <TableCell>{country.length_of_stay}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToVisaTypes(country.id, country.name);
                    }}
                    title="Manage Visa Types"
                  >
                    <FileCog className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToPackages(country.id, country.name);
                    }}
                    title="Manage Packages"
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(country);
                    }}
                    title="Edit Country"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(country.id);
                    }}
                    title="Delete Country"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CountryTable;
