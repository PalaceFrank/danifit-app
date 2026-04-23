export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type UserRole = 'admin' | 'student'
export type UserStatus = 'pending' | 'active' | 'inactive'
export type TimeBlock = 'morning_a' | 'morning_b' | 'evening_a' | 'evening_b' | 'special'
export type DayOfWeek = 1 | 2 | 3 | 4 | 6 // Mon–Thu, Sat
export type Goal = 'lose_fat' | 'gain_muscle' | 'maintain' | 'endurance'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type PostType = 'general' | 'motivation' | 'result' | 'nutrition' | 'announcement'
export type ReactionEmoji = '💪' | '🔥' | '❤️' | '👏'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          role: UserRole
          status: UserStatus
          invited_at: string | null
          activated_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          status?: UserStatus
          invited_at?: string | null
          activated_at?: string | null
        }
        Update: {
          full_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          status?: UserStatus
          invited_at?: string | null
          activated_at?: string | null
        }
      }
      invitations: {
        Row: {
          id: string
          token: string
          email: string | null
          phone: string | null
          name: string | null
          created_by: string | null
          used_at: string | null
          expires_at: string
          status: 'pending' | 'used' | 'expired'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['invitations']['Row'], 'id' | 'token' | 'created_at'>
        Update: Partial<Database['public']['Tables']['invitations']['Insert']>
      }
      user_body_profiles: {
        Row: {
          id: string
          user_id: string
          birth_date: string | null
          sex: 'male' | 'female' | null
          height_cm: number | null
          initial_weight_kg: number | null
          goal: Goal | null
          activity_level: ActivityLevel | null
          dietary_preferences: string[] | null
          dietary_restrictions: string | null
          target_weight_kg: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_body_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_body_profiles']['Insert']>
      }
      body_measurements: {
        Row: {
          id: string
          user_id: string
          measured_at: string
          weight_kg: number | null
          neck_cm: number | null
          waist_cm: number | null
          hip_cm: number | null
          bicep_cm: number | null
          thigh_cm: number | null
          body_fat_pct: number | null
          notes: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['body_measurements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['body_measurements']['Insert']>
      }
      schedule_sessions: {
        Row: {
          id: string
          week_start: string
          day_of_week: number
          time_block: TimeBlock
          title: string
          description: string | null
          level: 'beginner' | 'intermediate' | 'advanced' | 'all' | null
          materials: string | null
          location: string
          is_cancelled: boolean
          cancellation_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['schedule_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['schedule_sessions']['Insert']>
      }
      attendance: {
        Row: {
          id: string
          user_id: string
          session_id: string
          checked_in_at: string
        }
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'checked_in_at'>
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          image_url: string | null
          post_type: PostType
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }
      post_reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          emoji: ReactionEmoji
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['post_reactions']['Row'], 'id' | 'created_at'>
        Update: never
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          parent_id: string | null
          content: string
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['post_comments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['post_comments']['Insert']>
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth_key: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['push_subscriptions']['Row'], 'id' | 'created_at'>
        Update: never
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string
          data: Json | null
          sent_at: string | null
          read_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
  }
}
