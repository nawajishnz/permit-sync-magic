
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { refreshSchemaCache, runVisaPackagesDiagnostic } from '@/integrations/supabase/refresh-schema';

interface CountryDataFallbackProps {
  countryId: string;
  error: Error | null;
  onRetry: () => void;
}

const CountryDataFallback = ({ countryId, error, onRetry }: CountryDataFallbackProps) => {
  const { toast } = useToast();
  const [isFixing, setIsFixing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  const handleRefreshSchema = async () => {
    setIsFixing(true);
    try {
      const result = await refreshSchemaCache();
      toast({
        title: result.success ? 'Schema refreshed' : 'Schema refresh failed',
        description: result.message || (result.success ? 'Schema has been refreshed, try loading the page again.' : 'Could not refresh schema.'),
        variant: result.success ? 'default' : 'destructive',
      });
      
      if (result.success) {
        onRetry();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to refresh schema',
        variant: 'destructive',
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleRunDiagnostic = async () => {
    setIsFixing(true);
    try {
      const result = await runVisaPackagesDiagnostic(countryId);
      setDiagnosticResult(result);
      
      toast({
        title: result.success ? 'Diagnostic completed' : 'Diagnostic failed',
        description: result.message || (result.success ? 'Diagnostic tests have been completed.' : 'Failed to run diagnostic tests.'),
        variant: result.success ? 'default' : 'destructive',
      });
      
      if (result.success) {
        onRetry();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to run diagnostic',
        variant: 'destructive',
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading country data</AlertTitle>
        <AlertDescription>
          {error?.message || 'There was an issue loading the country information.'}
        </AlertDescription>
      </Alert>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Visa Package Schema Issue</h2>
        <p className="mb-4">
          There appears to be an issue with the visa packages schema. This can happen if the database
          structure has been changed or if this is a new installation.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button 
            onClick={handleRefreshSchema} 
            disabled={isFixing}
            className="flex items-center"
          >
            {isFixing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Schema
          </Button>
          
          <Button 
            onClick={handleRunDiagnostic} 
            variant="outline" 
            disabled={isFixing}
          >
            Run Diagnostic
          </Button>
          
          <Button 
            onClick={onRetry} 
            variant="secondary" 
            disabled={isFixing}
          >
            Try Again
          </Button>
        </div>
        
        {diagnosticResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm overflow-auto max-h-60">
            <pre>{JSON.stringify(diagnosticResult, null, 2)}</pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600 mt-4">
          <p>If the issue persists, please run the fix-visa-packages.sql script in your Supabase project.</p>
        </div>
      </Card>
    </div>
  );
};

export default CountryDataFallback;
