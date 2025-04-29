import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, Wrench, Database } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ErrorDisplay from '@/components/shared/ErrorDisplay';
import { useToast } from '@/hooks/use-toast';
import { useCountryManagement } from '@/hooks/useCountryManagement';

interface CountryDiagnosticToolProps {
  countries: any[];
  queryClient?: any;
}

const CountryDiagnosticTool: React.FC<CountryDiagnosticToolProps> = ({ 
  countries, 
  queryClient 
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const { toast } = useToast();
  
  const { 
    runCountryDiagnostic,
    refreshSchemaAndData,
    togglePackageAndEnsureDocuments,
    fetchCountryData,
    runningDiagnostic,
    error,
    diagnosticResult,
    setError
  } = useCountryManagement({ externalQueryClient: queryClient });
  
  const handleRunDiagnostic = async () => {
    if (!selectedCountryId) {
      toast({ 
        title: "No country selected", 
        description: "Please select a country to run diagnostic" 
      });
      return;
    }
    
    try {
      const result = await runCountryDiagnostic(selectedCountryId);
      
      toast({
        title: result.success ? 'Success' : 'Warning',
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
      
    } catch (err: any) {
      toast({
        title: "Diagnostic failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  const handleFixIssues = async () => {
    if (!selectedCountryId) {
      toast({ 
        title: "No country selected", 
        description: "Please select a country to fix issues" 
      });
      return;
    }
    
    setIsFixing(true);
    try {
      // Step 1: Refresh schema
      await refreshSchemaAndData(selectedCountryId);
      
      // Step 2: Ensure the country has an active package
      await togglePackageAndEnsureDocuments(selectedCountryId, true);
      
      // Step 3: Run diagnostic again to verify fixes
      const result = await runCountryDiagnostic(selectedCountryId);
      
      toast({
        title: result.success ? "Issues fixed" : "Some issues remain",
        description: result.success 
          ? "Country data has been fixed and is now ready to use" 
          : "Some issues could not be automatically fixed",
        variant: result.success ? "default" : "destructive"
      });
    } catch (err: any) {
      toast({
        title: "Fix failed",
        description: err.message,
        variant: "destructive"
      });
      setError(err.message);
    } finally {
      setIsFixing(false);
    }
  };
  
  const handleRefresh = async () => {
    if (!selectedCountryId) {
      toast({ 
        title: "No country selected", 
        description: "Please select a country to refresh data" 
      });
      return;
    }
    
    try {
      await refreshSchemaAndData(selectedCountryId);
      
      toast({
        title: "Data refreshed",
        description: "Country data has been refreshed"
      });
    } catch (err: any) {
      toast({
        title: "Refresh failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  const selectedCountry = countries.find(c => c.id === selectedCountryId);
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Country Diagnostic Tool</span>
          <Select 
            value={selectedCountryId || ''} 
            onValueChange={value => setSelectedCountryId(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
        <CardDescription>
          Diagnose and fix issues with country pricing and documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ErrorDisplay error={error} />
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleRunDiagnostic}
            disabled={!selectedCountryId || runningDiagnostic}
          >
            {runningDiagnostic ? (
              <LoadingIndicator size="sm" text="Running..." />
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Run Diagnostic
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={!selectedCountryId}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          
          <Button 
            variant={diagnosticResult && !diagnosticResult.success ? "destructive" : "outline"}
            onClick={handleFixIssues}
            disabled={!selectedCountryId || isFixing || !diagnosticResult}
          >
            {isFixing ? (
              <LoadingIndicator size="sm" text="Fixing..." />
            ) : (
              <>
                <Wrench className="mr-2 h-4 w-4" />
                Fix Issues
              </>
            )}
          </Button>
        </div>
        
        {diagnosticResult && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium">Diagnostic Results</h3>
              <Badge variant={diagnosticResult.success ? "outline" : "destructive"}>
                {diagnosticResult.success ? "OK" : "Issues Found"}
              </Badge>
            </div>
            
            {diagnosticResult.message && (
              <Alert variant={diagnosticResult.success ? "default" : "destructive"}>
                {diagnosticResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>Status</AlertTitle>
                <AlertDescription>{diagnosticResult.message}</AlertDescription>
              </Alert>
            )}
            
            {diagnosticResult.recommendations && diagnosticResult.recommendations.length > 0 && (
              <div className="rounded-md border p-4">
                <h4 className="font-medium mb-2">Recommendations:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {diagnosticResult.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {diagnosticResult.results && (
              <div className="rounded-md border p-4">
                <h4 className="font-medium mb-2">Detailed Results:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Table Access:</span>
                    <Badge variant={diagnosticResult.results.tableAccess?.success ? "outline" : "destructive"}>
                      {diagnosticResult.results.tableAccess?.success ? "OK" : "Issue"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Package Exists:</span>
                    <Badge variant={diagnosticResult.results.packageExists ? "outline" : "default"}>
                      {diagnosticResult.results.packageExists ? "Yes" : "No"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Package Active:</span>
                    <Badge variant={diagnosticResult.results.packageActive ? "outline" : "default"}>
                      {diagnosticResult.results.packageActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Documents Exist:</span>
                    <Badge variant={diagnosticResult.results.documentsExist ? "outline" : "default"}>
                      {diagnosticResult.results.documentsExist ? `Yes (${diagnosticResult.results.documentsCount})` : "No"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Document Table Access:</span>
                    <Badge variant={diagnosticResult.results.documentTableAccess?.success ? "outline" : "destructive"}>
                      {diagnosticResult.results.documentTableAccess?.success ? "OK" : "Issue"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {!selectedCountryId && (
          <div className="text-center py-8 text-gray-500">
            <p>Select a country to begin diagnostic</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CountryDiagnosticTool;
