
export type VisaPackage = {
  id?: string;
  country_id: string;
  name: string;
  government_fee: number;
  service_fee: number;
  processing_days: number;
  total_price?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};
