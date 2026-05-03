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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      anonymous_blocks: {
        Row: {
          blocked_user_id: string
          blocker_id: string
          created_at: string
          id: string
          match_id: string
        }
        Insert: {
          blocked_user_id: string
          blocker_id: string
          created_at?: string
          id?: string
          match_id: string
        }
        Update: {
          blocked_user_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          match_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_blocks_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "anonymous_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_matches: {
        Row: {
          compatibility_score: number
          created_at: string
          ended_at: string | null
          id: string
          status: string
          user1_id: string
          user1_reveal_level: string
          user2_id: string
          user2_reveal_level: string
        }
        Insert: {
          compatibility_score?: number
          created_at?: string
          ended_at?: string | null
          id?: string
          status?: string
          user1_id: string
          user1_reveal_level?: string
          user2_id: string
          user2_reveal_level?: string
        }
        Update: {
          compatibility_score?: number
          created_at?: string
          ended_at?: string | null
          id?: string
          status?: string
          user1_id?: string
          user1_reveal_level?: string
          user2_id?: string
          user2_reveal_level?: string
        }
        Relationships: []
      }
      anonymous_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "anonymous_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_profiles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          nickname: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          nickname: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          nickname?: string
          user_id?: string
        }
        Relationships: []
      }
      anonymous_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          match_id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          match_id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          match_id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_reports_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "anonymous_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          duration: number | null
          id: string
          sender_id: string
          type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          duration?: number | null
          id?: string
          sender_id: string
          type?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          duration?: number | null
          id?: string
          sender_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accessibility_preferences: string[] | null
          avatar_url: string | null
          bio: string | null
          communication_style: string | null
          contact_number: string | null
          country: string | null
          created_at: string
          disability_percentage: string | null
          disability_type: string | null
          display_name: string | null
          gender_identity: string | null
          id: string
          interests: string[] | null
          location: string | null
          mobility_aids: string | null
          onboarding_completed: boolean | null
          pronouns: string | null
          support_needs: string | null
          updated_at: string
        }
        Insert: {
          accessibility_preferences?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          communication_style?: string | null
          contact_number?: string | null
          country?: string | null
          created_at?: string
          disability_percentage?: string | null
          disability_type?: string | null
          display_name?: string | null
          gender_identity?: string | null
          id: string
          interests?: string[] | null
          location?: string | null
          mobility_aids?: string | null
          onboarding_completed?: boolean | null
          pronouns?: string | null
          support_needs?: string | null
          updated_at?: string
        }
        Update: {
          accessibility_preferences?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          communication_style?: string | null
          contact_number?: string | null
          country?: string | null
          created_at?: string
          disability_percentage?: string | null
          disability_type?: string | null
          display_name?: string | null
          gender_identity?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          mobility_aids?: string | null
          onboarding_completed?: boolean | null
          pronouns?: string | null
          support_needs?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_conversation_with_participant: {
        Args: { _other_user_id: string }
        Returns: string
      }
      get_public_anonymous_profiles: {
        Args: never
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          nickname: string
        }[]
      }
      get_public_profiles: {
        Args: { _ids?: string[] }
        Returns: {
          avatar_url: string
          bio: string
          communication_style: string
          disability_type: string
          display_name: string
          id: string
          interests: string[]
          mobility_aids: string
          support_needs: string
        }[]
      }
      is_anon_match_member: {
        Args: { _match_id: string; _user_id: string }
        Returns: boolean
      }
      is_conversation_member: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      update_own_reveal_level: {
        Args: { _match_id: string; _new_level: string }
        Returns: undefined
      }
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
