export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addon_services: {
        Row: {
          created_at: string
          delivery_days: number
          description: string
          discount_percentage: number | null
          faqs: Json | null
          id: string
          image_url: string
          long_description: string | null
          name: string
          price: string
          process: string[] | null
          requirements: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_days: number
          description: string
          discount_percentage?: number | null
          faqs?: Json | null
          id?: string
          image_url: string
          long_description?: string | null
          name: string
          price: string
          process?: string[] | null
          requirements?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_days?: number
          description?: string
          discount_percentage?: number | null
          faqs?: Json | null
          id?: string
          image_url?: string
          long_description?: string | null
          name?: string
          price?: string
          process?: string[] | null
          requirements?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          application_id: string | null
          created_at: string
          date: string
          id: string
          location: string
          time: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          date: string
          id?: string
          location: string
          time: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          date?: string
          id?: string
          location?: string
          time?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "visa_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      approved_visas: {
        Row: {
          approval_date: string
          client_id: string | null
          country: string
          created_at: string
          destination: string
          duration: string
          id: string
          image_url: string
          updated_at: string | null
          visa_category: string
          visa_type: string
        }
        Insert: {
          approval_date?: string
          client_id?: string | null
          country: string
          created_at?: string
          destination: string
          duration: string
          id?: string
          image_url: string
          updated_at?: string | null
          visa_category: string
          visa_type: string
        }
        Update: {
          approval_date?: string
          client_id?: string | null
          country?: string
          created_at?: string
          destination?: string
          duration?: string
          id?: string
          image_url?: string
          updated_at?: string | null
          visa_category?: string
          visa_type?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          banner: string
          created_at: string
          description: string
          embassy_details: Json | null
          entry_type: string
          faq: Json | null
          flag: string
          id: string
          length_of_stay: string
          name: string
          processing_steps: Json | null
          processing_time: string
          requirements_description: string | null
          updated_at: string
          validity: string
          visa_assistance: string[] | null
          visa_includes: string[] | null
        }
        Insert: {
          banner: string
          created_at?: string
          description: string
          embassy_details?: Json | null
          entry_type: string
          faq?: Json | null
          flag: string
          id?: string
          length_of_stay: string
          name: string
          processing_steps?: Json | null
          processing_time: string
          requirements_description?: string | null
          updated_at?: string
          validity: string
          visa_assistance?: string[] | null
          visa_includes?: string[] | null
        }
        Update: {
          banner?: string
          created_at?: string
          description?: string
          embassy_details?: Json | null
          entry_type?: string
          faq?: Json | null
          flag?: string
          id?: string
          length_of_stay?: string
          name?: string
          processing_steps?: Json | null
          processing_time?: string
          requirements_description?: string | null
          updated_at?: string
          validity?: string
          visa_assistance?: string[] | null
          visa_includes?: string[] | null
        }
        Relationships: []
      }
      document_checklist: {
        Row: {
          country_id: string
          created_at: string | null
          document_description: string | null
          document_name: string
          id: string
          required: boolean | null
        }
        Insert: {
          country_id: string
          created_at?: string | null
          document_description?: string | null
          document_name: string
          id?: string
          required?: boolean | null
        }
        Update: {
          country_id?: string
          created_at?: string | null
          document_description?: string | null
          document_name?: string
          id?: string
          required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "document_checklist_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      package_features: {
        Row: {
          created_at: string
          feature_text: string
          id: string
          package_id: string
        }
        Insert: {
          created_at?: string
          feature_text: string
          id?: string
          package_id: string
        }
        Update: {
          created_at?: string
          feature_text?: string
          id?: string
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_features_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "visa_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      required_documents: {
        Row: {
          country_id: string
          created_at: string
          document_name: string
          id: string
        }
        Insert: {
          country_id: string
          created_at?: string
          document_name: string
          id?: string
        }
        Update: {
          country_id?: string
          created_at?: string
          document_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "required_documents_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          approved: boolean
          avatar_url: string | null
          client_name: string
          comment: string
          country: string
          created_at: string
          id: string
          rating: number
          updated_at: string | null
          visa_type: string
        }
        Insert: {
          approved?: boolean
          avatar_url?: string | null
          client_name: string
          comment: string
          country: string
          created_at?: string
          id?: string
          rating: number
          updated_at?: string | null
          visa_type: string
        }
        Update: {
          approved?: boolean
          avatar_url?: string | null
          client_name?: string
          comment?: string
          country?: string
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string | null
          visa_type?: string
        }
        Relationships: []
      }
      visa_applications: {
        Row: {
          created_at: string
          id: string
          next_step: string | null
          package_id: string
          status: string
          submitted_date: string
          updated_at: string
          user_id: string
          visa_type_id: string
          form_data: {
            personalInfo: {
              firstName: string
              lastName: string
              email: string
              phoneNumber: string
              dateOfBirth: string
              nationality: string
              gender: string
              maritalStatus: string
              address: {
                street: string
                city: string
                state: string
                postalCode: string
                country: string
              }
            }
            travelInfo: {
              purposeOfTravel: string
              departureDate: string
              returnDate: string
              bookingOption: string
              accommodation: {
                type: string
                name: string
                address: string
                bookingReference: string
              }
              previousVisits: boolean
              previousVisitDetails: string
            }
            passportInfo: {
              passportNumber: string
              issuingCountry: string
              issueDate: string
              expiryDate: string
              hasOtherPassports: boolean
              otherPassportDetails: string
            }
            documents: {
              passport: any
              photo: any
              financialProof: any
              itinerary: any
              accommodation: any
              insurance: any
              additionalDocuments: any[]
            }
          } | null
        }
        Insert: {
          created_at?: string
          id?: string
          next_step?: string | null
          package_id: string
          status?: string
          submitted_date?: string
          updated_at?: string
          user_id: string
          visa_type_id: string
          form_data?: {
            personalInfo: {
              firstName: string
              lastName: string
              email: string
              phoneNumber: string
              dateOfBirth: string
              nationality: string
              gender: string
              maritalStatus: string
              address: {
                street: string
                city: string
                state: string
                postalCode: string
                country: string
              }
            }
            travelInfo: {
              purposeOfTravel: string
              departureDate: string
              returnDate: string
              bookingOption: string
              accommodation: {
                type: string
                name: string
                address: string
                bookingReference: string
              }
              previousVisits: boolean
              previousVisitDetails: string
            }
            passportInfo: {
              passportNumber: string
              issuingCountry: string
              issueDate: string
              expiryDate: string
              hasOtherPassports: boolean
              otherPassportDetails: string
            }
            documents: {
              passport: any
              photo: any
              financialProof: any
              itinerary: any
              accommodation: any
              insurance: any
              additionalDocuments: any[]
            }
          } | null
        }
        Update: {
          created_at?: string
          id?: string
          next_step?: string | null
          package_id?: string
          status?: string
          submitted_date?: string
          updated_at?: string
          user_id?: string
          visa_type_id?: string
          form_data?: {
            personalInfo: {
              firstName: string
              lastName: string
              email: string
              phoneNumber: string
              dateOfBirth: string
              nationality: string
              gender: string
              maritalStatus: string
              address: {
                street: string
                city: string
                state: string
                postalCode: string
                country: string
              }
            }
            travelInfo: {
              purposeOfTravel: string
              departureDate: string
              returnDate: string
              bookingOption: string
              accommodation: {
                type: string
                name: string
                address: string
                bookingReference: string
              }
              previousVisits: boolean
              previousVisitDetails: string
            }
            passportInfo: {
              passportNumber: string
              issuingCountry: string
              issueDate: string
              expiryDate: string
              hasOtherPassports: boolean
              otherPassportDetails: string
            }
            documents: {
              passport: any
              photo: any
              financialProof: any
              itinerary: any
              accommodation: any
              insurance: any
              additionalDocuments: any[]
            }
          } | null
        }
        Relationships: [
          {
            foreignKeyName: "visa_applications_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "visa_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_applications_visa_type_id_fkey"
            columns: ["visa_type_id"]
            isOneToOne: false
            referencedRelation: "visa_types"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_packages: {
        Row: {
          country_id: string
          created_at: string
          id: string
          name: string
          government_fee: number
          service_fee: number
          total_price: number
          processing_days: number
          updated_at: string
        }
        Insert: {
          country_id: string
          created_at?: string
          id?: string
          name: string
          government_fee: number
          service_fee: number
          processing_days: number
          updated_at?: string
        }
        Update: {
          country_id?: string
          created_at?: string
          id?: string
          name?: string
          government_fee?: number
          service_fee?: number
          processing_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visa_packages_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          }
        ]
      }
      visa_pricing_tiers: {
        Row: {
          country_id: string
          created_at: string | null
          features: string[] | null
          id: string
          is_recommended: boolean | null
          name: string
          price: string
          processing_time: string
        }
        Insert: {
          country_id: string
          created_at?: string | null
          features?: string[] | null
          id?: string
          is_recommended?: boolean | null
          name: string
          price: string
          processing_time: string
        }
        Update: {
          country_id?: string
          created_at?: string | null
          features?: string[] | null
          id?: string
          is_recommended?: boolean | null
          name?: string
          price?: string
          processing_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "visa_pricing_tiers_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_requirements: {
        Row: {
          created_at: string
          id: string
          requirement_text: string
          visa_type_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          requirement_text: string
          visa_type_id: string
        }
        Update: {
          created_at?: string
          id?: string
          requirement_text?: string
          visa_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visa_requirements_visa_type_id_fkey"
            columns: ["visa_type_id"]
            isOneToOne: false
            referencedRelation: "visa_types"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_types: {
        Row: {
          country_id: string
          created_at: string
          fee: string
          id: string
          name: string
          processing_time: string
          updated_at: string
        }
        Insert: {
          country_id: string
          created_at?: string
          fee: string
          id?: string
          name: string
          processing_time: string
          updated_at?: string
        }
        Update: {
          country_id?: string
          created_at?: string
          fee?: string
          id?: string
          name?: string
          processing_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visa_types_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_pages: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          last_updated?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
