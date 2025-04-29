
import { Database } from '@/integrations/supabase/types';
import { PostgrestError } from '@supabase/supabase-js';

// Get table names from the Database type
export type TableNames = keyof Database['public']['Tables'];

export interface MutationConfig<T> {
  table: TableNames;
  queryKey: string | string[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export interface InsertMutationResult<T> {
  mutate: (data: any) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  data?: T;
}

export interface UpdateMutationResult<T> {
  mutate: (params: { id: string; data: any }) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  data?: T;
}

export interface DeleteMutationResult<T> {
  mutate: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  data?: T;
}
