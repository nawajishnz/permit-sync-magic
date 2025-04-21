import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, FileCog, Package, CheckCircle, Search, ArrowUpDown, Eye, Globe, FileText, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CountryTableProps {
  countries: any[];
  onEdit: (country: any) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onSelectCountry?: (countryId: string) => void;
}

const CountryTable: React.FC<CountryTableProps> = ({
  countries,
  onEdit,
  onDelete,
  isLoading,
  isError,
  error,
  onSelectCountry
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort countries
  const filteredAndSortedCountries = [...countries]
    .filter((country) => {
      // Filter by search term
      if (searchTerm && !country.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by visibility based on whether country has an active visa package
      if (visibilityFilter !== 'all') {
        const hasVisaPackage = country.visa_packages && country.visa_packages.length > 0;
        if (visibilityFilter === 'active' && !hasVisaPackage) return false;
        if (visibilityFilter === 'inactive' && hasVisaPackage) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Handle special case for entry_type which might be undefined
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });

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

  // Extract filter options for entry types
  const entryTypes = Array.from(new Set(countries.map(country => country.entry_type))).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select 
            value={visibilityFilter} 
            onValueChange={setVisibilityFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="active">Has Visa Package</SelectItem>
              <SelectItem value="inactive">No Visa Package</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px] cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  Country
                  {sortField === 'name' && (
                    <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('entry_type')}>
                <div className="flex items-center gap-1">
                  Entry Type
                  {sortField === 'entry_type' && (
                    <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('processing_time')}>
                <div className="flex items-center gap-1">
                  Processing Time
                  {sortField === 'processing_time' && (
                    <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('length_of_stay')}>
                <div className="flex items-center gap-1">
                  Length of Stay
                  {sortField === 'length_of_stay' && (
                    <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedCountries.map((country) => (
              <TableRow key={country.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onSelectCountry && onSelectCountry(country.id)}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {country.flag && country.flag.includes('http') ? (
                      <img src={country.flag} alt={country.name} className="w-6 h-6 rounded-full object-cover mr-2" />
                    ) : (
                      <span className="mr-2">{country.flag || '🏳️'}</span>
                    )}
                    <div>
                      <div>{country.name}</div>
                      {country.has_visa_package && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Visa Package Ready
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {country.entry_type || 'Not set'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>{country.processing_time || 'Not set'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span>{country.length_of_stay || 'Not set'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={country.visa_packages?.length > 0 ? "default" : "secondary"}
                    className={country.visa_packages?.length > 0 ? "bg-green-100 text-green-800" : ""}
                  >
                    {country.visa_packages?.length > 0 ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col md:flex-row justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/country/${country.id}`, '_blank');
                      }}
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span>View</span>
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(country);
                      }}
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                      <span>Edit</span>
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete ${country.name}?`)) {
                          onDelete(country.id);
                        }
                      }}
                    >
                      <Trash className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Summary */}
      <div className="text-xs text-gray-500 flex justify-between items-center">
        <div>
          Showing {filteredAndSortedCountries.length} of {countries.length} countries
        </div>
        <div>
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default CountryTable;
