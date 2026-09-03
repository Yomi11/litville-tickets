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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          capacity: number
          city: string
          created_at: string
          description: string
          doors_open: string | null
          headliner: string
          id: string
          poster_url: string | null
          slug: string
          starts_at: string
          status: string
          supporting_acts: string | null
          title: string
          venue: string
        }
        Insert: {
          capacity?: number
          city?: string
          created_at?: string
          description?: string
          doors_open?: string | null
          headliner: string
          id?: string
          poster_url?: string | null
          slug: string
          starts_at: string
          status?: string
          supporting_acts?: string | null
          title: string
          venue: string
        }
        Update: {
          capacity?: number
          city?: string
          created_at?: string
          description?: string
          doors_open?: string | null
          headliner?: string
          id?: string
          poster_url?: string | null
          slug?: string
          starts_at?: string
          status?: string
          supporting_acts?: string | null
          title?: string
          venue?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_kobo: number
          buyer_email: string
          buyer_name: string
          buyer_phone: string | null
          created_at: string
          event_id: string
          id: string
          paid_at: string | null
          payment_reference: string
          quantity: number
          split_count: number
          status: string
          ticket_code: string | null
          tier_id: string
          zone_name: string | null
        }
        Insert: {
          amount_kobo: number
          buyer_email: string
          buyer_name: string
          buyer_phone?: string | null
          created_at?: string
          event_id: string
          id?: string
          paid_at?: string | null
          payment_reference: string
          quantity?: number
          split_count?: number
          status?: string
          ticket_code?: string | null
          tier_id: string
          zone_name?: string | null
        }
        Update: {
          amount_kobo?: number
          buyer_email?: string
          buyer_name?: string
          buyer_phone?: string | null
          created_at?: string
          event_id?: string
          id?: string
          paid_at?: string | null
          payment_reference?: string
          quantity?: number
          split_count?: number
          status?: string
          ticket_code?: string | null
          tier_id?: string
          zone_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "ticket_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          rating: number
          subject_title: string
          subject_type: string
        }
        Insert: {
          author_name: string
          body?: string
          created_at?: string
          id?: string
          rating: number
          subject_title: string
          subject_type?: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          rating?: number
          subject_title?: string
          subject_type?: string
        }
        Relationships: []
      }
      ticket_tiers: {
        Row: {
          created_at: string
          description: string
          event_id: string
          id: string
          name: string
          perks: string[]
          price_kobo: number
          quantity: number
          sold: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string
          event_id: string
          id?: string
          name: string
          perks?: string[]
          price_kobo: number
          quantity?: number
          sold?: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string
          event_id?: string
          id?: string
          name?: string
          perks?: string[]
          price_kobo?: number
          quantity?: number
          sold?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_zones: {
        Row: {
          description: string
          event_id: string
          id: string
          name: string
          sort_order: number
          tier_name: string | null
        }
        Insert: {
          description?: string
          event_id: string
          id?: string
          name: string
          sort_order?: number
          tier_name?: string | null
        }
        Update: {
          description?: string
          event_id?: string
          id?: string
          name?: string
          sort_order?: number
          tier_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_zones_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
