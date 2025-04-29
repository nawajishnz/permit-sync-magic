
/**
 * Types for document checklist functionality
 */
export interface DocumentItem {
  id?: string;
  country_id: string;
  name: string;
  document_name: string;
  description?: string;
  document_description?: string;
  required: boolean;
  isNew?: boolean;
  modified?: boolean;
}

export interface DocumentResult {
  success: boolean;
  message: string;
  data?: DocumentItem[];
}

export interface SchemaResult {
  success: boolean;
  message: string;
  count?: number;
}

export interface FixResult {
  success: boolean;
  message: string;
  data?: any;
}
