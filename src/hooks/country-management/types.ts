
import { DocumentItem } from '@/services/documentChecklistService';
import { VisaPackage } from '@/types/visaPackage';
import { DiagnosticResult } from './useDiagnostics';

export interface CountryManagementProps {
  externalQueryClient?: any;
}

export interface CountryManagementState {
  loading: boolean;
  saving: boolean;
  runningDiagnostic: boolean;
  error: string | null;
  packageData: VisaPackage | null;
  documentData: DocumentItem[];
  diagnosticResult: DiagnosticResult | null;
}

export interface CountryManagementResult extends CountryManagementState {
  fetchCountryData: (countryId: string) => Promise<{
    packageData: VisaPackage;
    documentData: DocumentItem[];
  } | null>;
  saveCountryData: (
    countryId: string,
    packageToSave: VisaPackage,
    documentsToSave?: DocumentItem[]
  ) => Promise<any>;
  togglePackageAndEnsureDocuments: (countryId: string, isActive: boolean) => Promise<any>;
  runCountryDiagnostic: (countryId: string) => Promise<DiagnosticResult>;
  refreshSchemaAndData: (countryId: string) => Promise<DiagnosticResult & { schemaFixed?: boolean }>;
  invalidateQueries: (countryId: string) => void;
  setError: (error: string | null) => void;
}
