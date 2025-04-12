import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

/**
 * Configuration for mutation hooks
 */
type MutationConfig<TData, TVariables, TError> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKeysToInvalidate?: string | string[] | (string | string[])[];
  onSuccessMessage?: string;
  onErrorMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
};

/**
 * A custom hook for handling mutations with consistent patterns for toast messages,
 * query invalidation, and error handling.
 */
export function useApiMutation<TData, TVariables, TError = Error>({
  mutationFn,
  queryKeysToInvalidate,
  onSuccessMessage,
  onErrorMessage,
  onSuccess,
  onError,
}: MutationConfig<TData, TVariables, TError>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<TData, TError, TVariables>({
    mutationFn,
    
    onSuccess: (data, variables) => {
      // Invalidate queries to refetch data
      if (queryKeysToInvalidate) {
        if (Array.isArray(queryKeysToInvalidate)) {
          queryKeysToInvalidate.forEach(key => {
            if (Array.isArray(key)) {
              queryClient.invalidateQueries({ queryKey: key });
            } else {
              queryClient.invalidateQueries({ queryKey: [key] });
            }
          });
        } else {
          queryClient.invalidateQueries({ queryKey: [queryKeysToInvalidate] });
        }
      }
      
      // Show success toast if configured
      if (onSuccessMessage) {
        toast({
          title: "Success",
          description: onSuccessMessage,
        });
      }
      
      // Call custom onSuccess handler if provided
      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    
    onError: (error, variables) => {
      console.error("Mutation error:", error);
      
      // Show error toast if configured
      if (onErrorMessage) {
        toast({
          title: "Error",
          description: onErrorMessage,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        // If no specific message is provided but we have an Error object
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
      
      // Call custom onError handler if provided
      if (onError) {
        onError(error, variables);
      }
    },
  });
} 