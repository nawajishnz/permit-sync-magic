
export type VisaPackage = {
  id?: string;
  country_id: string;
  name: string;
  government_fee: number;
  service_fee: number;
  processing_days: number;
  total_price?: number;
  price?: number;
  is_active: boolean; // Used only in application logic, not stored in database
  processing_time?: string;
  created_at?: string;
  updated_at?: string;
};

// Database representation without the is_active field
export type VisaPackageDB = Omit<VisaPackage, 'is_active'>;
