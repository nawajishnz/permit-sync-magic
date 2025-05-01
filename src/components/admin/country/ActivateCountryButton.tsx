
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Power, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toggleVisaPackageStatus } from '@/services/visaPackageService';
import { useQueryClient } from '@tanstack/react-query';
import schemaFixService from '@/services/schemaFixService';

interface ActivateCountryButtonProps {
  countryId: string;
  isActive: boolean;
  onStatusChange?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

const ActivateCountryButton = ({ 
  countryId, 
  isActive, 
  onStatusChange,
  variant = 'default'
}: ActivateCountryButtonProps) => {
  const [isActivating, setIsActivating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleToggleActive = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    
    if (!countryId) return;
    
    setIsActivating(true);
    
    try {
      // First try to ensure schema is correct
      const schemaResult = await schemaFixService.fixSchema();
      console.log('Schema fix result:', schemaResult);
      
      if (!schemaResult.success) {
        toast({
          title: 'Database Schema Issue',
          description: 'Please use the Database Updater tool in the admin panel to fix schema issues first.',
          variant: 'destructive',
        });
        setIsActivating(false);
        return;
      }
      
      // Then toggle the package status
      const newStatus = !isActive;
      const result = await toggleVisaPackageStatus(countryId, newStatus);
      
      if (result.success) {
        toast({
          title: newStatus ? 'Country Activated' : 'Country Deactivated',
          description: `Country has been ${newStatus ? 'activated' : 'deactivated'} successfully.`,
        });
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
        queryClient.invalidateQueries({ queryKey: ['countryDetail', countryId] });
        queryClient.invalidateQueries({ queryKey: ['countryVisaPackage', countryId] });
        
        // Notify parent component
        if (onStatusChange) {
          onStatusChange();
        }
      } else {
        toast({
          title: 'Operation Failed',
          description: result.message || 'Failed to update country status.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error toggling country active status:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating country status.',
        variant: 'destructive',
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      className={`gap-2 ${isActive ? 'bg-green-600 hover:bg-green-700' : ''}`}
      onClick={handleToggleActive}
      disabled={isActivating}
    >
      {isActivating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : isActive ? (
        <>
          <CheckCircle className="h-4 w-4" />
          <span>Active</span>
        </>
      ) : (
        <>
          <Power className="h-4 w-4" />
          <span>Activate</span>
        </>
      )}
    </Button>
  );
};

export default ActivateCountryButton;
