
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe, RefreshCw } from 'lucide-react';

type EmptyStateProps = {
  searchTerm: string;
  onClearSearch: () => void;
};

const EmptyState = ({ searchTerm, onClearSearch }: EmptyStateProps) => {
  return (
    <div className="text-center py-16 md:py-20 border border-dashed border-gray-200 rounded-lg bg-gray-50">
      <Globe className="h-12 w-12 md:h-16 md:w-16 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">No countries found</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {searchTerm ? `No countries match "${searchTerm}"` : 'We\'re updating our database with new countries. Please check back soon!'}
      </p>
      {searchTerm && (
        <Button 
          onClick={onClearSearch} 
          variant="outline"
          className="rounded-md"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Clear Search
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
