
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, FileText, Package, AlertCircle } from 'lucide-react';

interface CountryTableProps {
  countries: any[];
  onEdit: (country: any) => void;
  onDelete: (id: string) => void;
  navigateToVisaTypes: (countryId: string, countryName: string) => void;
  navigateToPackages: (countryId: string, countryName: string) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const CountryTable: React.FC<CountryTableProps> = ({
  countries,
  onEdit,
  onDelete,
  navigateToVisaTypes,
  navigateToPackages,
  isLoading,
  isError,
  error
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
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p className="font-medium">Error loading countries</p>
        <p className="text-sm mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  if (!countries || countries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No countries found. Add your first country to get started.</p>
        <p className="text-sm mt-2">Click the "Add Country" button above to create your first country.</p>
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
            <TableHead>Validity</TableHead>
            <TableHead>Processing Time</TableHead>
            <TableHead>Related Content</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {countries.map((country) => (
            <TableRow key={country.id}>
              <TableCell className="font-medium">{country.name}</TableCell>
              <TableCell>{country.entry_type}</TableCell>
              <TableCell>{country.validity}</TableCell>
              <TableCell>{country.processing_time}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateToVisaTypes(country.id, country.name)}
                    className="flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Visa Types
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateToPackages(country.id, country.name)}
                    className="flex items-center"
                  >
                    <Package className="h-4 w-4 mr-1" />
                    Packages
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(country)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onDelete(country.id)}
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
