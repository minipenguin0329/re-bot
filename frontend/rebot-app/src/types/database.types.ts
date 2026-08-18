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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          created_at: string
          id: string
          model_name: string
          selected_candidate_id: string | null
          selection_status: string
          status: string
          symptom_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_name: string
          selected_candidate_id?: string | null
          selection_status?: string
          status: string
          symptom_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          model_name?: string
          selected_candidate_id?: string | null
          selection_status?: string
          status?: string
          symptom_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_selected_candidate_id_fkey"
            columns: ["selected_candidate_id"]
            isOneToOne: false
            referencedRelation: "analysis_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyses_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptoms"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_candidates: {
        Row: {
          analysis_id: string
          confirmation_question: string
          created_at: string
          evidence: Json
          id: string
          is_custom: boolean
          rank: number
          reason: string
          title: string
        }
        Insert: {
          analysis_id: string
          confirmation_question: string
          created_at?: string
          evidence?: Json
          id?: string
          is_custom?: boolean
          rank: number
          reason: string
          title: string
        }
        Update: {
          analysis_id?: string
          confirmation_question?: string
          created_at?: string
          evidence?: Json
          id?: string
          is_custom?: boolean
          rank?: number
          reason?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_candidates_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          alcohol: boolean | null
          caffeine_count: number | null
          created_at: string
          date: string
          exercise_minutes: number | null
          id: string
          meal_note: string | null
          memo: string | null
          sleep_hours: number | null
          sleep_irregular: boolean
          stress_level: number | null
          updated_at: string
          user_id: string
          water_ml: number | null
        }
        Insert: {
          alcohol?: boolean | null
          caffeine_count?: number | null
          created_at?: string
          date?: string
          exercise_minutes?: number | null
          id?: string
          meal_note?: string | null
          memo?: string | null
          sleep_hours?: number | null
          sleep_irregular?: boolean
          stress_level?: number | null
          updated_at?: string
          user_id: string
          water_ml?: number | null
        }
        Update: {
          alcohol?: boolean | null
          caffeine_count?: number | null
          created_at?: string
          date?: string
          exercise_minutes?: number | null
          id?: string
          meal_note?: string | null
          memo?: string | null
          sleep_hours?: number | null
          sleep_irregular?: boolean
          stress_level?: number | null
          updated_at?: string
          user_id?: string
          water_ml?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price_krw: number | null
          purchase_url: string | null
          tags: Json
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_krw?: number | null
          purchase_url?: string | null
          tags?: Json
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_krw?: number | null
          purchase_url?: string | null
          tags?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          average_sleep_hours: number | null
          birth_year: number | null
          created_at: string
          gender: string | null
          id: string
          job: string | null
          nickname: string
          special_notes: string | null
          special_notes_classification: Json
          updated_at: string
        }
        Insert: {
          average_sleep_hours?: number | null
          birth_year?: number | null
          created_at?: string
          gender?: string | null
          id: string
          job?: string | null
          nickname: string
          special_notes?: string | null
          special_notes_classification?: Json
          updated_at?: string
        }
        Update: {
          average_sleep_hours?: number | null
          birth_year?: number | null
          created_at?: string
          gender?: string | null
          id?: string
          job?: string | null
          nickname?: string
          special_notes?: string | null
          special_notes_classification?: Json
          updated_at?: string
        }
        Relationships: []
      }
      recommendation_feedback: {
        Row: {
          created_at: string
          feedback: string
          id: string
          reason: string | null
          recommendation_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback: string
          id?: string
          reason?: string | null
          recommendation_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          reason?: string | null
          recommendation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_feedback_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          action: string
          additional_solutions: Json
          alternative: string | null
          analysis_id: string
          candidate_id: string | null
          created_at: string
          difficulty: string | null
          duration_minutes: number | null
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          action: string
          additional_solutions?: Json
          alternative?: string | null
          analysis_id: string
          candidate_id?: string | null
          created_at?: string
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          action?: string
          additional_solutions?: Json
          alternative?: string | null
          analysis_id?: string
          candidate_id?: string | null
          created_at?: string
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "analysis_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          period_end: string
          period_start: string
          period_type: string
          statistics: Json
          summary: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          period_type: string
          statistics?: Json
          summary?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          statistics?: Json
          summary?: Json
          user_id?: string
        }
        Relationships: []
      }
      symptoms: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_path: string | null
          is_repeated: boolean
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_path?: string | null
          is_repeated?: boolean
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          is_repeated?: boolean
          user_id?: string
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
