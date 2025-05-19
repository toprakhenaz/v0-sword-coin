import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Check if tables exist
    const { data: tablesExist } = await supabase.from("users").select("id").limit(1)

    // If tables don't exist, create them
    if (!tablesExist) {
      // Create users table
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          telegram_id TEXT UNIQUE NOT NULL,
          username TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          photo_url TEXT,
          coins BIGINT DEFAULT 1000,
          energy INTEGER DEFAULT 100,
          max_energy INTEGER DEFAULT 100,
          earn_per_tap INTEGER DEFAULT 1,
          hourly_earn INTEGER DEFAULT 10,
          league INTEGER DEFAULT 1,
          last_energy_regen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_hourly_collect TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)

      // Create user_boosts table
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS user_boosts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          multi_touch_level INTEGER DEFAULT 1,
          energy_limit_level INTEGER DEFAULT 1,
          charge_speed_level INTEGER DEFAULT 1,
          daily_rockets INTEGER DEFAULT 3,
          max_daily_rockets INTEGER DEFAULT 3,
          energy_full_used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)

      // Create coin_transactions table
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS coin_transactions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          amount BIGINT NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)

      // Create daily_combos table
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS daily_combos (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          card_ids INTEGER[] NOT NULL,
          found_card_ids INTEGER[] DEFAULT '{}',
          reward BIGINT NOT NULL,
          is_completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, date)
        )
      `)
    }

    return NextResponse.json({ success: true, message: "Database initialized" })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, error: "Failed to seed database" }, { status: 500 })
  }
}
