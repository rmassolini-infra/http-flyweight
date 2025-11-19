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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      dadosgov_datasets: {
        Row: {
          author: string | null
          author_email: string | null
          created_at: string | null
          extras: Json | null
          groups: Json | null
          id: string
          license_id: string | null
          license_title: string | null
          maintainer: string | null
          maintainer_email: string | null
          metadata_created: string | null
          metadata_modified: string | null
          name: string
          notes: string | null
          num_resources: number | null
          num_tags: number | null
          organization_id: string | null
          organization_name: string | null
          organization_title: string | null
          resources: Json | null
          state: string | null
          tags: Json | null
          title: string
          type: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          author?: string | null
          author_email?: string | null
          created_at?: string | null
          extras?: Json | null
          groups?: Json | null
          id: string
          license_id?: string | null
          license_title?: string | null
          maintainer?: string | null
          maintainer_email?: string | null
          metadata_created?: string | null
          metadata_modified?: string | null
          name: string
          notes?: string | null
          num_resources?: number | null
          num_tags?: number | null
          organization_id?: string | null
          organization_name?: string | null
          organization_title?: string | null
          resources?: Json | null
          state?: string | null
          tags?: Json | null
          title: string
          type?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          author?: string | null
          author_email?: string | null
          created_at?: string | null
          extras?: Json | null
          groups?: Json | null
          id?: string
          license_id?: string | null
          license_title?: string | null
          maintainer?: string | null
          maintainer_email?: string | null
          metadata_created?: string | null
          metadata_modified?: string | null
          name?: string
          notes?: string | null
          num_resources?: number | null
          num_tags?: number | null
          organization_id?: string | null
          organization_name?: string | null
          organization_title?: string | null
          resources?: Json | null
          state?: string | null
          tags?: Json | null
          title?: string
          type?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      dadosgov_sync_metadata: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: number
          last_sync_completed: string | null
          last_sync_started: string | null
          sync_status: string | null
          synced_datasets: number | null
          total_datasets: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: number
          last_sync_completed?: string | null
          last_sync_started?: string | null
          sync_status?: string | null
          synced_datasets?: number | null
          total_datasets?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: number
          last_sync_completed?: string | null
          last_sync_started?: string | null
          sync_status?: string | null
          synced_datasets?: number | null
          total_datasets?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
