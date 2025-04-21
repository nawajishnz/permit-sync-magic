import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Database, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { refreshSchemaCache } from '@/integrations/supabase/refresh-schema';
import { updateSchemaAndFixData, createDatabaseFunctions } from '@/integrations/supabase/update-schema-and-fix-data';

/**
 * DatabaseUpdater component provides UI for updating the database schema
 * and fixing data issues directly from the admin interface
 */
const DatabaseUpdater: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingManually, setIsUpdatingManually] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [functionsResult, setFunctionsResult] = useState<any>(null);
  const { toast } = useToast();
  
  const handleUpdateSchema = async () => {
    setIsLoading(true);
    try {
      const updateResult = await updateSchemaAndFixData();
      setResult(updateResult);
      
      // If schema update was successful, also create database functions
      if (updateResult.success) {
        const funcResult = await createDatabaseFunctions();
        setFunctionsResult(funcResult);
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Unexpected error: ${error.message}`,
        error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSchemaUpdate = async () => {
    setIsUpdatingManually(true);
    try {
      toast({
        title: 'Schema Update',
        description: 'Attempting to update database schema. This may take a moment...',
      });

      // Execute the table recreation SQL using the regular update mechanism first
      await updateSchemaAndFixData();
      
      // Then refresh the schema cache
      await refreshSchemaCache();

      toast({
        title: 'Schema Updated',
        description: 'Database schema has been updated. Refresh the page to see changes.',
      });
      
      // Reload the window after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Error updating schema:', error);
      toast({
        title: 'Schema Update Failed',
        description: error.message || 'An error occurred while updating the schema',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingManually(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleUpdateSchema}
        disabled={isLoading}
        className="w-full justify-between"
      >
        <span className="flex items-center">
          <Database className="h-4 w-4 mr-2" />
          {isLoading ? 'Updating Schema...' : 'Update Schema'}
        </span>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleManualSchemaUpdate}
        disabled={isUpdatingManually}
        className="w-full justify-between bg-amber-50 border-amber-200 hover:bg-amber-100 mt-2"
      >
        <span className="flex items-center">
          <Database className="h-4 w-4 mr-2 text-amber-500" />
          {isUpdatingManually ? 'Force Updating Schema...' : 'Force Fix Schema'}
        </span>
        {isUpdatingManually && <Loader2 className="h-4 w-4 animate-spin" />}
      </Button>
      
      <p className="text-xs text-muted-foreground mt-1">
        <AlertCircle className="h-3 w-3 inline mr-1" />
        If you're seeing pricing schema errors, try the force fix option.
      </p>

      {result && (
        <div className="text-xs mt-2 p-2 rounded bg-muted max-h-32 overflow-auto">
          <div><strong>Status:</strong> {result.success ? 'Success' : 'Failed'}</div>
          {result.message && <div><strong>Message:</strong> {result.message}</div>}
          {result.error && <div><strong>Error:</strong> {result.error.message}</div>}
        </div>
      )}
    </div>
  );
};

export default DatabaseUpdater; 