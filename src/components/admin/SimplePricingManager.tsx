import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PricingForm from './pricing/PricingForm';
import PackageStatusToggle from './pricing/PackageStatusToggle';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Save, RefreshCw } from 'lucide-react';
import { useVisaPackage } from '@/hooks/useVisaPackage';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface SimplePricingManagerProps {
  countryId: string;
  countryName: string;
  existingPackage?: any;
  onSaved?: () => void;
}

const SimplePricingManager: React.FC<SimplePricingManagerProps> = ({ 
  countryId,
  countryName,
  existingPackage = null,
  onSaved
}) => {
  const [formData, setFormData] = useState({
    government_fee: '',
    service_fee: '',
    processing_days: ''
  });
  
  const [isActive, setIsActive] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const { toast } = useToast();
  
  const { 
    saveVisaPackageData, 
    togglePackageStatus,
    runVisaDiagnostic,
    packageData,
    loading,
    saving,
    runningDiagnostic,
    diagnosticResult,
    error
  } = useVisaPackage({});
  
  // Initialize form with existing data or default values
  useEffect(() => {
    console.log('SimplePricingManager - Initializing with existing package:', existingPackage);
    
    if (existingPackage) {
      setFormData({
        government_fee: String(existingPackage.government_fee || ''),
        service_fee: String(existingPackage.service_fee || ''),
        processing_days: String(existingPackage.processing_days || '15')
      });
      
      // Calculate if package is active based on having non-zero fees
      const active = 
        (existingPackage.government_fee > 0 || 
         existingPackage.service_fee > 0);
      
      setIsActive(active);
    }
  }, [existingPackage]);
  
  // Also update when packageData changes
  useEffect(() => {
    if (packageData) {
      setFormData({
        government_fee: String(packageData.government_fee || ''),
        service_fee: String(packageData.service_fee || ''),
        processing_days: String(packageData.processing_days || '15')
      });
      
      // Update active status
      setIsActive(!!packageData.is_active);
    }
  }, [packageData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async () => {
    if (!countryId) {
      toast({
        title: "Error",
        description: "Country ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const packageToSave = {
        country_id: countryId,
        name: `${countryName} Visa Package`,
        government_fee: Number(formData.government_fee) || 0,
        service_fee: Number(formData.service_fee) || 0,
        processing_days: Number(formData.processing_days) || 15,
        is_active: isActive  // Add is_active field with the current status
      };
      
      const result = await saveVisaPackageData(packageToSave);
      
      if (result && result.success) {
        toast({
          title: "Success",
          description: "Pricing information saved successfully"
        });
        
        // If pricing is non-zero, make sure the package is active
        if ((packageToSave.government_fee > 0 || packageToSave.service_fee > 0) && !isActive) {
          await handleToggleStatus(true);
        }
        
        if (onSaved) onSaved();
      } else {
        toast({
          title: "Error",
          description: result?.message || "Failed to save pricing information",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred while saving",
        variant: "destructive"
      });
    }
  };
  
  const handleToggleStatus = async (newStatus: boolean) => {
    try {
      if (!countryId) return;
      
      const result = await togglePackageStatus(countryId, newStatus);
      
      if (result && result.success) {
        setIsActive(newStatus);
        toast({
          title: "Status updated",
          description: `Package is now ${newStatus ? 'active' : 'inactive'}`
        });
        
        if (onSaved) onSaved();
      } else {
        toast({
          title: "Error toggling status",
          description: result?.message || "Failed to update status",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred while toggling status",
        variant: "destructive"
      });
    }
  };
  
  const handleRunDiagnostic = async () => {
    try {
      if (!countryId) return;
      
      await runVisaDiagnostic(countryId);
      setShowDiagnostic(true);
    } catch (err) {
      // Error handling in hook
    }
  };
  
  const totalPrice = 
    (parseFloat(formData.government_fee) || 0) + 
    (parseFloat(formData.service_fee) || 0);

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          {countryName} Visa Package
        </CardTitle>
        
        <div className="flex items-center space-x-3">
          <PackageStatusToggle 
            isActive={isActive}
            onToggle={handleToggleStatus}
            disabled={saving || loading}
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRunDiagnostic}
            disabled={runningDiagnostic}
            className="ml-2"
          >
            {runningDiagnostic ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Diagnose
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {showDiagnostic && diagnosticResult && (
          <Alert 
            variant={diagnosticResult.success ? "default" : "destructive"} 
            className={`mb-4 ${diagnosticResult.success ? "border-green-300" : ""}`}
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Diagnostic Result</AlertTitle>
            <AlertDescription>
              <div>{diagnosticResult.message}</div>
              {diagnosticResult.details && (
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                  {JSON.stringify(diagnosticResult.details, null, 2)}
                </pre>
              )}
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDiagnostic(false)}
              className="mt-2"
            >
              Hide
            </Button>
          </Alert>
        )}
        
        <div className={isActive ? '' : 'opacity-50'}>
          <PricingForm 
            formData={formData}
            onChange={handleInputChange}
            disabled={!isActive || saving || loading}
          />
          
          <div className="border-t mt-6 pt-4">
            <div className="text-lg font-medium mb-4">
              Total Price: ₹{totalPrice.toFixed(2)}
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={saving || loading || !isActive}
              className="bg-teal hover:bg-teal-600"
            >
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
        
        {!isActive && (
          <div className="mt-4 text-yellow-600 text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Activate this package to edit pricing details
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimplePricingManager;
