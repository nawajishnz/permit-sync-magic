import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { verifyAllComponents, verifyComponent } from '@/utils/componentChecker';

const AdminComponentTester = () => {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const components = [
    'AdminHome',
    'CountriesManager',
    'VisaTypesManager',
    'PackagesManager',
    'ApplicationsManager',
    'UsersManager',
    'FAQsManager',
    'AddonServicesManager',
    'TestimonialsManager',
    'AnalyticsDashboard'
  ];
  
  const runTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const { results } = await verifyAllComponents();
      setResults(results);
    } catch (err) {
      console.error('Error testing components:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  const testSingleComponent = async (componentName: string) => {
    setTesting(componentName);
    try {
      const result = await verifyComponent(componentName);
      setResults(prev => ({
        ...prev,
        [componentName]: result
      }));
    } catch (err) {
      console.error(`Error testing ${componentName}:`, err);
      setResults(prev => ({
        ...prev,
        [componentName]: {
          success: false,
          message: `Error: ${err instanceof Error ? err.message : String(err)}`
        }
      }));
    } finally {
      setTesting(null);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Admin Component Tester</h1>
          <p className="text-gray-600">Verify that all admin components can be loaded and rendered correctly</p>
        </div>
        <Button 
          onClick={runTest} 
          disabled={loading}
          className="flex items-center"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testing Components...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Test All Components
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-red-800 font-medium">Error Testing Components</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {components.map(component => (
          <Card key={component} className={`overflow-hidden ${
            results[component]?.success ? 'border-green-300 bg-green-50/30' : 
            results[component]?.success === false ? 'border-red-300 bg-red-50/30' : 
            'border-gray-200'
          }`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>{component}</span>
                {results[component]?.success === true && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {results[component]?.success === false && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </CardTitle>
              <CardDescription>
                {results[component]?.message || 'Component not tested yet'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={testing === component}
                onClick={() => testSingleComponent(component)}
              >
                {testing === component ? (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                    Testing...
                  </>
                ) : 'Test Component'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminComponentTester; 