
export type Database = {
  public: {
    Tables: {
      visa_packages: {
        Row: {
          id: string;
          country_id: string;
          name: string;
          government_fee: number;
          service_fee: number;
          processing_days: number;
          created_at?: string;
          updated_at?: string;
          total_price?: number;
        };
        Insert: {
          id?: string;
          country_id: string;
          name: string;
          government_fee: number;
          service_fee: number;
          processing_days: number;
          total_price?: number;
        };
        Update: {
          id?: string;
          country_id?: string;
          name?: string;
          government_fee?: number;
          service_fee?: number;
          processing_days?: number;
          total_price?: number;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          subject: string;
          status: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          message: string;
          subject?: string;
          status?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          message?: string;
          subject?: string;
          status?: string;
        };
      };
      countries: {
        Row: {
          id: string;
          name: string;
          flag: string;
          banner: string;
          description: string;
          entry_type: string;
          validity: string;
          length_of_stay: string;
          visa_includes: string[];
          visa_assistance: string[];
          embassy_details: any;
          processing_steps: any;
          faq: any;
          requirements_description: string;
          popularity: number;
          min_price?: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          flag?: string;
          banner?: string;
          description?: string;
          entry_type?: string;
          validity?: string;
          length_of_stay?: string;
          visa_includes?: string[];
          visa_assistance?: string[];
          embassy_details?: any;
          processing_steps?: any;
          faq?: any;
          requirements_description?: string;
          popularity?: number;
          min_price?: number;
        };
        Update: {
          id?: string;
          name?: string;
          flag?: string;
          banner?: string;
          description?: string;
          entry_type?: string;
          validity?: string;
          length_of_stay?: string;
          visa_includes?: string[];
          visa_assistance?: string[];
          embassy_details?: any;
          processing_steps?: any;
          faq?: any;
          requirements_description?: string;
          popularity?: number;
          min_price?: number;
        };
      };
    };
    Views: {
      countries_with_packages: {
        Row: {
          country_id: string;
          country_name: string;
          country_flag: string;
          country_banner: string;
          entry_type: string;
          validity: string;
          length_of_stay: string;
          package_id: string | null;
          package_name: string | null;
          government_fee: number | null;
          service_fee: number | null;
          processing_days: number | null;
          total_price: number | null;
        };
      };
    };
    Functions: {
      get_country_packages: {
        Args: { p_country_id: string };
        Returns: {
          country_id: string;
          country_name: string;
          package_id: string | null;
          package_name: string | null;
          government_fee: number | null;
          service_fee: number | null;
          processing_days: number | null;
          total_price: number | null;
        }[];
      };
      save_visa_package: {
        Args: {
          p_country_id: string;
          p_name: string;
          p_government_fee: number;
          p_service_fee: number;
          p_processing_days: number;
        };
        Returns: {
          id: string;
          action: 'created' | 'updated';
          country_id: string;
        };
      };
    };
  };
};
