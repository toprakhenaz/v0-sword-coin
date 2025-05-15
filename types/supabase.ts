export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          telegram_id: number
          username: string
          first_name: string
          last_name: string
          coins: number
          energy: number
          energy_max: number
          league: number
          crystals: number
          coins_hourly: number
          coins_per_tap: number
          last_boost_time: string
          daily_boost_count: number
          daily_card_reward_claimed: boolean
          found_cards: string
          daily_reward_date: string
          daily_reward_streak: number
          daily_reward_claimed: boolean
          referrer_id: number | null
          created_at: string
          last_login: string
        }
        Insert: {
          id?: number
          telegram_id: number
          username: string
          first_name: string
          last_name?: string
          coins?: number
          energy?: number
          energy_max?: number
          league?: number
          crystals?: number
          coins_hourly?: number
          coins_per_tap?: number
          last_boost_time?: string
          daily_boost_count?: number
          daily_card_reward_claimed?: boolean
          found_cards?: string
          daily_reward_date?: string
          daily_reward_streak?: number
          daily_reward_claimed?: boolean
          referrer_id?: number | null
          created_at?: string
          last_login?: string
        }
        Update: {
          id?: number
          telegram_id?: number
          username?: string
          first_name?: string
          last_name?: string
          coins?: number
          energy?: number
          energy_max?: number
          league?: number
          crystals?: number
          coins_hourly?: number
          coins_per_tap?: number
          last_boost_time?: string
          daily_boost_count?: number
          daily_card_reward_claimed?: boolean
          found_cards?: string
          daily_reward_date?: string
          daily_reward_streak?: number
          daily_reward_claimed?: boolean
          referrer_id?: number | null
          created_at?: string
          last_login?: string
        }
      }
      user_cards: {
        Row: {
          id: number
          user_id: number
          card_id: number
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          card_id: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          card_id?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: number
          name: string
          image: string
          hourly_income: number
          crystals: number
          upgrade_cost: number
          category: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          image: string
          hourly_income: number
          crystals: number
          upgrade_cost: number
          category: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          image?: string
          hourly_income?: number
          crystals?: number
          upgrade_cost?: number
          category?: string
          created_at?: string
        }
      }
      missions: {
        Row: {
          id: number
          title: string
          description: string
          reward: number
          link: string
          category: string
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          description: string
          reward: number
          link: string
          category: string
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string
          reward?: number
          link?: string
          category?: string
          created_at?: string
        }
      }
      user_missions: {
        Row: {
          id: number
          user_id: number
          mission_id: number
          is_claimed: boolean
          claimed_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          mission_id: number
          is_claimed?: boolean
          claimed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          mission_id?: number
          is_claimed?: boolean
          claimed_at?: string | null
          created_at?: string
        }
      }
      referrals: {
        Row: {
          id: number
          referrer_id: number
          referred_id: number
          referred_name: string
          reward_amount: number
          is_claimed: boolean
          previous_league: number
          created_at: string
        }
        Insert: {
          id?: number
          referrer_id: number
          referred_id: number
          referred_name: string
          reward_amount: number
          is_claimed?: boolean
          previous_league?: number
          created_at?: string
        }
        Update: {
          id?: number
          referrer_id?: number
          referred_id?: number
          referred_name?: string
          reward_amount?: number
          is_claimed?: boolean
          previous_league?: number
          created_at?: string
        }
      }
      daily_combos: {
        Row: {
          id: number
          cards: string
          created_at: string
        }
        Insert: {
          id?: number
          cards: string
          created_at?: string
        }
        Update: {
          id?: number
          cards?: string
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: number
          email: string
          password_hash: string
          name: string
          created_at: string
          last_login: string | null
        }
        Insert: {
          id?: number
          email: string
          password_hash: string
          name: string
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: number
          email?: string
          password_hash?: string
          name?: string
          created_at?: string
          last_login?: string | null
        }
      }
    }
  }
}
