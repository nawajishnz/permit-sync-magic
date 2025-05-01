
export type VisaPackage = {
  id?: string;
  country_id: string;
  name: string;
  government_fee: number;
  service_fee: number;
  processing_days: number;
  total_price?: number;
  price?: number;
  is_active?: boolean;
  processing_time?: string;
  created_at?: string;
  updated_at?: string;
};

// Database representation with the processing_time field
export type VisaPackageDB = Omit<VisaPackage, 'is_active'> & {
  processing_time: string;
};
