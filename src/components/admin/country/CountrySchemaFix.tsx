
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fixVisaPackagesSchema } from '@/integrations/supabase/fix-schema';
import { useToast } from '@/hooks/use-toast';

interface CountrySchemaFixProps {
  onSchemaFixStatusChange: (status: boolean) => void;
}

export const useCountrySchemaFix = ({ onSchemaFixStatusChange }: CountrySchemaFixProps) => {
  const [schemaFixAttempted, setSchemaFixAttempted] = useState(false);
  const [schemaFixing, setSchemaFixing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const attemptSchemaFix = async () => {
      if (!schemaFixAttempted) {
        setSchemaFixing(true);
        onSchemaFixStatusChange(true);
        
        try {
          console.log('Attempting to fix visa_packages schema...');
          const result = await fixVisaPackagesSchema();
          console.log('Schema fix result:', result);
          
          if (result.success) {
            queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
          }
        } catch (err) {
          console.error('Schema fix error:', err);
        } finally {
          setSchemaFixAttempted(true);
          setSchemaFixing(false);
          onSchemaFixStatusChange(false);
        }
      }
    };
    
    attemptSchemaFix();
  }, [schemaFixAttempted, queryClient, onSchemaFixStatusChange]);

  const handleRefresh = async () => {
    setSchemaFixing(true);
    onSchemaFixStatusChange(true);
    
    try {
      const result = await fixVisaPackagesSchema();
      console.log('Schema fix result on refresh:', result);
      
      queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
      
      toast({
        title: "Refreshing data",
        description: `Schema check completed. ${result.message} Fetching the latest countries data.`,
      });
    } catch (error) {
      console.error('Error fixing schema during refresh:', error);
      toast({
        title: "Schema check failed",
        description: "There was an issue checking the database schema.",
        variant: "destructive"
      });
    } finally {
      setSchemaFixing(false);
      onSchemaFixStatusChange(false);
    }
  };

  return {
    schemaFixing,
    handleRefresh
  };
};
