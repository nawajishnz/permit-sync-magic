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
        };
        Insert: {
          id?: string;
          country_id: string;
          name: string;
          government_fee: number;
          service_fee: number;
          processing_days: number;
        };
        Update: {
          id?: string;
          country_id?: string;
          name?: string;
          government_fee?: number;
          service_fee?: number;
          processing_days?: number;
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
          min_price: number;
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
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          order: number;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          order?: number;
          category?: string;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          order?: number;
          category?: string;
        };
      };
      // ... existing tables ...
    },
    Functions: {
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
          action: string;
          country_id: string;
        };
      };
      get_table_info: {
        Args: {
          p_table_name: string
        };
        Returns: {
          column_name: string;
          data_type: string;
          is_nullable: boolean;
        }[];
      };
      // ... existing functions ...
    }
  }
}
