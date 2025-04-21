
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

// Get table names from the Database type
type TableNames = keyof Database['public']['Tables'];

type MutationConfig<T> = {
  table: TableNames;
  queryKey: string | string[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
};

// Create a reusable hook for data insertion
export const useSupabaseInsert = <T>(config: MutationConfig<T>) => {
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
};

// Create a reusable hook for data updates
export const useSupabaseUpdate = <T>(config: MutationConfig<T>) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { table, queryKey, onSuccess, onError, successMessage, errorMessage } = config;
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      // Using type casting to handle the dynamic table data
      const { data: responseData, error } = await supabase
        .from(table)
        .update(data as any)
        .eq('id', id)
        .select('*')
        .single();
        
      if (error) throw error;
      return responseData as T;
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
      console.error(`Error updating ${table}:`, error);
      
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
};

// Create a reusable hook for data deletion
export const useSupabaseDelete = <T>(config: MutationConfig<T>) => {
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
};
