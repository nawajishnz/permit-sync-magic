
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Database, AlertCircle, RefreshCw } from 'lucide-react';
import CountryDiagnosticTool from './diagnostics/CountryDiagnosticTool';

interface CountriesToolbarProps {
  countries: any[];
  onRefreshData: () => Promise<void>;
  isRefreshing: boolean;
  queryClient?: any;
}

const CountriesToolbar: React.FC<CountriesToolbarProps> = ({
  countries,
  onRefreshData,
  isRefreshing,
  queryClient
}) => {
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  
  return (
    <div className="flex items-center justify-end space-x-2 mb-4">
      <Button 
        onClick={onRefreshData} 
        variant="outline" 
        className="flex items-center gap-2"
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" /> Refreshing...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" /> Refresh Data
          </>
        )}
      </Button>
      
      <Dialog open={isDiagnosticOpen} onOpenChange={setIsDiagnosticOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Database className="h-4 w-4" /> Diagnostics
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Country Data Diagnostics</DialogTitle>
          </DialogHeader>
          <CountryDiagnosticTool 
            countries={countries} 
            queryClient={queryClient}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CountriesToolbar;
