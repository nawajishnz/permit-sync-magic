
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MutationConfig } from './types';

// Create a reusable hook for data deletion
export function useSupabaseDelete<T>(config: MutationConfig<T>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { table, queryKey, onSuccess, onError, successMessage, errorMessage } = config;
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      // Invalidate related queries to refetch data
      if (Array.isArray(queryKey)) {
        queryClient.invalidateQueries({ queryKey });
      } else {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      }
      
      // Show success toast if message is provided
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
      
      // Call custom success handler if provided
      if (onSuccess) onSuccess(id as unknown as T);
    },
    onError: (error: Error) => {
      console.error(`Error deleting from ${table}:`, error);
      
      // Show error toast if message is provided
      if (errorMessage) {
        toast({
          title: "Error",
          description: errorMessage || error.message,
          variant: "destructive",
        });
      }
      
      // Call custom error handler if provided
      if (onError) onError(error);
    }
  });
}
