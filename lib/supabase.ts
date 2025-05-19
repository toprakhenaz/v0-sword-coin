import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the browser
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

// Create a server-side client (for server components and server actions)
export function createServerClient() {
  return createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
}

// Types for database
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          telegram_id: string
          username: string
          first_name: string
          last_name: string | null
          photo_url: string | null
          coins: number
          league: number
          hourly_earn: number
          earn_per_tap: number
          energy: number
          max_energy: number
          last_energy_regen: string
          last_hourly_collect: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          telegram_id: string
          username: string
          first_name: string
          last_name?: string | null
          photo_url?: string | null
          coins?: number
          league?: number
          hourly_earn?: number
          earn_per_tap?: number
          energy?: number
          max_energy?: number
          last_energy_regen?: string
          last_hourly_collect?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          telegram_id?: string
          username?: string
          first_name?: string
          last_name?: string | null
          photo_url?: string | null
          coins?: number
          league?: number
          hourly_earn?: number
          earn_per_tap?: number
          energy?: number
          max_energy?: number
          last_energy_regen?: string
          last_hourly_collect?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_boosts: {
        Row: {
          id: string
          user_id: string
          multi_touch_level: number
          energy_limit_level: number
          charge_speed_level: number
          daily_rockets: number
          max_daily_rockets: number
          energy_full_used: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          multi_touch_level?: number
          energy_limit_level?: number
          charge_speed_level?: number
          daily_rockets?: number
          max_daily_rockets?: number
          energy_full_used?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          multi_touch_level?: number
          energy_limit_level?: number
          charge_speed_level?: number
          daily_rockets?: number
          max_daily_rockets?: number
          energy_full_used?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      daily_combos: {
        Row: {
          id: string
          user_id: string
          card_ids: number[]
          found_card_ids: number[]
          reward: number
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_ids?: number[]
          found_card_ids?: number[]
          reward?: number
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_ids?: number[]
          found_card_ids?: number[]
          reward?: number
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          description?: string | null
          created_at?: string
        }
      }
    }
  }
}
