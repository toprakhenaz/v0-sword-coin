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

      // Create transactions table
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          amount BIGINT NOT NULL,
          transaction_type TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)

      // Create daily_combo table
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS daily_combo (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          day_date DATE NOT NULL,
          found_card_ids INTEGER[] DEFAULT '{}',
          reward BIGINT NOT NULL,
          is_completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, day_date)
        )
      `)

      // Create tasks table
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT,
          reward BIGINT NOT NULL,
          category TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)

      // Create items table
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          category TEXT,
          image TEXT,
          base_hourly_income BIGINT DEFAULT 0,
          base_upgrade_cost BIGINT DEFAULT 0,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)

      // Create user_items table
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS user_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          item_id UUID REFERENCES items(id) ON DELETE CASCADE,
          level INTEGER DEFAULT 1,
          hourly_income BIGINT DEFAULT 0,
          upgrade_cost BIGINT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, item_id)
        )
      `)

      // Create daily_rewards table
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS daily_rewards (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          day INTEGER NOT NULL,
          reward BIGINT NOT NULL,
          claimed BOOLEAN DEFAULT FALSE,
          claimed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)

      // Create user_tasks table
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS user_tasks (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
          progress INTEGER DEFAULT 0,
          is_completed BOOLEAN DEFAULT FALSE,
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, task_id)
        )
      `)

      // Create referrals table
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS referrals (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
          referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
          reward_amount BIGINT DEFAULT 0,
          is_claimed BOOLEAN DEFAULT FALSE,
          claimed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(referrer_id, referred_id)
        )
      `)
    }

    return NextResponse.json({ success: true, message: "Database initialized" })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, error: "Failed to seed database" }, { status: 500 })
  }
}
