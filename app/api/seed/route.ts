import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Veritabanı başlatma işlemi başlatıldı")
    const supabase = createServerClient()
    console.log("Supabase client oluşturuldu")

    // Check if tables exist
    console.log("Tablolar kontrol ediliyor")
    const { data: tablesExist, error: checkError } = await supabase.from("users").select("id").limit(1)

    if (checkError) {
      console.log("Tablolar bulunamadı, oluşturuluyor:", checkError.message)
    } else {
      console.log("Tablolar zaten var, işlem atlanıyor")
      return NextResponse.json({ success: true, message: "Tablolar zaten var" })
    }

    // If tables don't exist, create them
    console.log("Tablolar oluşturuluyor...")

    try {
      // Create users table
      console.log("users tablosu oluşturuluyor")
      await supabase.rpc("exec_sql", {
        sql_query: `
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
        `,
      })
      console.log("users tablosu oluşturuldu")

      // Create user_boosts table
      console.log("user_boosts tablosu oluşturuluyor")
      await supabase.rpc("exec_sql", {
        sql_query: `
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
        `,
      })
      console.log("user_boosts tablosu oluşturuldu")

      // Create coin_transactions table
      console.log("coin_transactions tablosu oluşturuluyor")
      await supabase.rpc("exec_sql", {
        sql_query: `
          CREATE TABLE IF NOT EXISTS coin_transactions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            amount BIGINT NOT NULL,
            type TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `,
      })
      console.log("coin_transactions tablosu oluşturuldu")

      // Create daily_combos table
      console.log("daily_combos tablosu oluşturuluyor")
      await supabase.rpc("exec_sql", {
        sql_query: `
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
        `,
      })
      console.log("daily_combos tablosu oluşturuldu")
    } catch (createError) {
      console.error("Tablo oluşturma hatası:", createError)

      // Alternatif yöntem deneyelim - SQL dosyası ile tabloları oluşturalım
      try {
        console.log("Alternatif yöntem deneniyor - SQL dosyası ile tablolar oluşturuluyor")

        // Supabase SQL dosyası ile tabloları oluştur
        const response = await fetch("/api/create-tables", {
          method: "POST",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        console.log("Tablolar SQL dosyası ile oluşturuldu")
      } catch (alternativeError) {
        console.error("Alternatif yöntem hatası:", alternativeError)
        return NextResponse.json(
          { success: false, error: "Tablolar oluşturulamadı: " + String(createError) },
          { status: 500 },
        )
      }
    }

    console.log("Veritabanı başarıyla başlatıldı")
    return NextResponse.json({ success: true, message: "Veritabanı başlatıldı" })
  } catch (error) {
    console.error("Veritabanı başlatma hatası:", error)
    return NextResponse.json({ success: false, error: "Veritabanı başlatılamadı: " + String(error) }, { status: 500 })
  }
}
