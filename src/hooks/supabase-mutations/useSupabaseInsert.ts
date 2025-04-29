
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MutationConfig } from './types';

// Create a reusable hook for data insertion
export function useSupabaseInsert<T>(config: MutationConfig<T>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { table, queryKey, onSuccess, onError, successMessage, errorMessage } = config;
  
  return useMutation({
    mutationFn: async (insertData: any) => {
      // Using type casting to handle the dynamic table data
      const { data, error } = await supabase
        .from(table)
        .insert(insertData as any)
        .select('*')
        .single();
        
      if (error) throw error;
      return data as T;
    },
    onSuccess: (data) => {
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
      if (onSuccess) onSuccess(data);
    },
    onError: (error: Error) => {
      console.error(`Error inserting into ${table}:`, error);
      
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
