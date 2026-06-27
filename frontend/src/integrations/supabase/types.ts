export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      billing_audit_log: {
        Row: {
          action: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          performed_at: string
          performed_by: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string
          performed_by?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string
          performed_by?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          bank_account_number: string | null
          bank_ifsc: string | null
          bank_name: string | null
          company_address: string
          company_email: string
          company_name: string
          company_phone: string
          company_website: string
          created_at: string
          currency: string
          currency_code: string
          default_payment_terms: string
          default_validity_days: number
          enable_discount: boolean
          enable_gst: boolean
          gst_number: string | null
          gst_percentage: number
          id: string
          logo_url: string | null
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          company_address?: string
          company_email?: string
          company_name?: string
          company_phone?: string
          company_website?: string
          created_at?: string
          currency?: string
          currency_code?: string
          default_payment_terms?: string
          default_validity_days?: number
          enable_discount?: boolean
          enable_gst?: boolean
          gst_number?: string | null
          gst_percentage?: number
          id?: string
          logo_url?: string | null
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          company_address?: string
          company_email?: string
          company_name?: string
          company_phone?: string
          company_website?: string
          created_at?: string
          currency?: string
          currency_code?: string
          default_payment_terms?: string
          default_validity_days?: number
          enable_discount?: boolean
          enable_gst?: boolean
          gst_number?: string | null
          gst_percentage?: number
          id?: string
          logo_url?: string | null
          updated_at?: string
          upi_id?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          rate: number
          service_name: string
          sort_order: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id: string
          quantity?: number
          rate?: number
          service_name: string
          sort_order?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          rate?: number
          service_name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          balance_due: number
          client_address: string
          client_business_name: string
          client_email: string
          client_name: string
          client_phone: string
          created_at: string
          created_by: string | null
          discount_amount: number
          discount_type: string
          discount_value: number
          due_date: string
          grand_total: number
          gst_amount: number
          gst_percentage: number
          id: string
          invoice_date: string
          invoice_number: string
          notes: string
          paid_at: string | null
          payment_terms: string
          quotation_id: string | null
          quotation_number: string | null
          sent_at: string | null
          status: string
          subtotal: number
          taxable_amount: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          balance_due?: number
          client_address?: string
          client_business_name?: string
          client_email?: string
          client_name: string
          client_phone?: string
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          discount_type?: string
          discount_value?: number
          due_date: string
          grand_total?: number
          gst_amount?: number
          gst_percentage?: number
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string
          paid_at?: string | null
          payment_terms?: string
          quotation_id?: string | null
          quotation_number?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          taxable_amount?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          balance_due?: number
          client_address?: string
          client_business_name?: string
          client_email?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          discount_type?: string
          discount_value?: number
          due_date?: string
          grand_total?: number
          gst_amount?: number
          gst_percentage?: number
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string
          paid_at?: string | null
          payment_terms?: string
          quotation_id?: string | null
          quotation_number?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          taxable_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          id: number
          title: string
        }
        Insert: {
          id?: never
          title: string
        }
        Update: {
          id?: never
          title?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page_path: string
          referrer: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          client_name: string | null
          content: string | null
          created_at: string
          description: string | null
          display_order: number | null
          featured_image: string | null
          gallery_images: Json | null
          id: string
          project_url: string | null
          slug: string
          status: string
          technologies: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          featured_image?: string | null
          gallery_images?: Json | null
          id?: string
          project_url?: string | null
          slug: string
          status?: string
          technologies?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          featured_image?: string | null
          gallery_images?: Json | null
          id?: string
          project_url?: string | null
          slug?: string
          status?: string
          technologies?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          quantity: number
          quotation_id: string
          rate: number
          service_name: string
          sort_order: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          quantity?: number
          quotation_id: string
          rate?: number
          service_name: string
          sort_order?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          quantity?: number
          quotation_id?: string
          rate?: number
          service_name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          accepted_at: string | null
          client_address: string
          client_business_name: string
          client_email: string
          client_name: string
          client_phone: string
          converted_to_invoice: boolean
          created_at: string
          created_by: string | null
          discount_amount: number
          discount_type: string
          discount_value: number
          grand_total: number
          gst_amount: number
          gst_percentage: number
          id: string
          invoice_id: string | null
          notes: string
          payment_terms: string
          quotation_date: string
          quotation_number: string
          sent_at: string | null
          status: string
          subtotal: number
          taxable_amount: number
          updated_at: string
          valid_until: string
          validity_days: number
        }
        Insert: {
          accepted_at?: string | null
          client_address?: string
          client_business_name?: string
          client_email?: string
          client_name: string
          client_phone?: string
          converted_to_invoice?: boolean
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          discount_type?: string
          discount_value?: number
          grand_total?: number
          gst_amount?: number
          gst_percentage?: number
          id?: string
          invoice_id?: string | null
          notes?: string
          payment_terms?: string
          quotation_date?: string
          quotation_number: string
          sent_at?: string | null
          status?: string
          subtotal?: number
          taxable_amount?: number
          updated_at?: string
          valid_until: string
          validity_days?: number
        }
        Update: {
          accepted_at?: string | null
          client_address?: string
          client_business_name?: string
          client_email?: string
          client_name?: string
          client_phone?: string
          converted_to_invoice?: boolean
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          discount_type?: string
          discount_value?: number
          grand_total?: number
          gst_amount?: number
          gst_percentage?: number
          id?: string
          invoice_id?: string | null
          notes?: string
          payment_terms?: string
          quotation_date?: string
          quotation_number?: string
          sent_at?: string | null
          status?: string
          subtotal?: number
          taxable_amount?: number
          updated_at?: string
          valid_until?: string
          validity_days?: number
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          features: Json | null
          icon: string | null
          id: string
          is_active: boolean
          price_from: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean
          price_from?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean
          price_from?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: Json
          id: string
          section_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          section_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          section_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number | null
          email: string | null
          id: string
          is_active: boolean
          linkedin_url: string | null
          name: string
          photo_url: string | null
          role: string
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number | null
          email?: string | null
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          name: string
          photo_url?: string | null
          role: string
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number | null
          email?: string | null
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          name?: string
          photo_url?: string | null
          role?: string
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_role_audit: {
        Row: {
          action: string
          id: string
          ip_address: string | null
          old_role: Database["public"]["Enums"]["app_role"] | null
          performed_at: string
          performed_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          ip_address?: string | null
          old_role?: Database["public"]["Enums"]["app_role"] | null
          performed_at?: string
          performed_by?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          ip_address?: string | null
          old_role?: Database["public"]["Enums"]["app_role"] | null
          performed_at?: string
          performed_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      team_members_public: {
        Row: {
          bio: string | null
          created_at: string | null
          display_order: number | null
          id: string | null
          is_active: boolean | null
          linkedin_url: string | null
          name: string | null
          photo_url: string | null
          role: string | null
          twitter_url: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name?: string | null
          photo_url?: string | null
          role?: string | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name?: string | null
          photo_url?: string | null
          role?: string | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_invoice_number: { Args: never; Returns: string }
      generate_quotation_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
