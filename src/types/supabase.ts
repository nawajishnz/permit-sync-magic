
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
      application_documents: {
        Row: {
          id: string;
          application_id: string;
          document_type: string;
          file_url?: string;
          status: string;
          feedback?: string;
          uploaded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          document_type: string;
          file_url?: string;
          status?: string;
          feedback?: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          document_type?: string;
          file_url?: string;
          status?: string;
          feedback?: string;
          uploaded_at?: string;
        };
      };
      application_timeline: {
        Row: {
          id: string;
          application_id: string;
          event: string;
          description?: string;
          date: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          event: string;
          description?: string;
          date: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          event?: string;
          description?: string;
          date?: string;
        };
      };
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
      update_application_document: {
        Args: {
          p_application_id: string;
          p_document_type: string;
          p_file_url: string;
          p_status: string;
        };
        Returns: {
          success: boolean;
        };
      };
      add_application_timeline: {
        Args: {
          p_application_id: string;
          p_event: string;
          p_description: string;
          p_date: string;
        };
        Returns: {
          success: boolean;
        };
      };
      submit_contact_message: {
        Args: {
          p_name: string;
          p_email: string;
          p_message: string;
          p_subject: string;
        };
        Returns: {
          success: boolean;
        };
      };
    }
  }
}
