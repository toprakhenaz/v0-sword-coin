import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("SQL dosyası ile tablolar oluşturuluyor")
    const supabase = createServerClient()

    // Önce mevcut tabloları kontrol edelim
    try {
      const { data: userColumns, error: columnsError } = await supabase.rpc("get_table_columns", {
        table_name: "users",
      })

      // Eğer tablo varsa ama first_name sütunu yoksa, sütunu ekleyelim
      if (!columnsError && userColumns && !userColumns.includes("first_name")) {
        console.log("first_name sütunu ekleniyor...")
        await supabase.rpc("exec_sql", {
          sql_query: `ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;`,
        })
        console.log("first_name sütunu eklendi")
      }
    } catch (columnCheckError) {
      console.log("Sütun kontrolü sırasında hata:", columnCheckError)
      // Hata olsa bile devam et
    }

    // Users tablosu
    try {
      console.log("Users tablosu oluşturuluyor...")
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
          );
        `,
      })
      console.log("Users tablosu oluşturuldu veya güncellendi")
    } catch (usersTableError) {
      console.error("Users tablosu oluşturma hatası:", usersTableError)

      // Alternatif yöntem - INSERT ile şema oluştur
      try {
        console.log("Alternatif yöntem deneniyor...")
        const { data: existingUser, error: checkError } = await supabase.from("users").select("id").limit(1)

        if (checkError) {
          // Tablo yok, oluşturalım
          const { error: insertError } = await supabase.from("users").insert({
            telegram_id: "temp_schema_user",
            username: "temp_user",
            first_name: "Temp",
            last_name: "User",
            photo_url: "",
            coins: 1000,
            energy: 100,
            max_energy: 100,
            earn_per_tap: 1,
            hourly_earn: 10,
            league: 1,
          })

          if (insertError) {
            console.error("Alternatif yöntem hatası:", insertError)
          } else {
            console.log("Users tablosu alternatif yöntemle oluşturuldu")
            // Geçici kullanıcıyı sil
            await supabase.from("users").delete().eq("telegram_id", "temp_schema_user")
          }
        } else {
          console.log("Users tablosu zaten var")
        }
      } catch (alternativeError) {
        console.error("Alternatif yöntem hatası:", alternativeError)
      }
    }

    // Diğer tablolar için benzer işlemler...
    // User boosts tablosu
    try {
      console.log("User boosts tablosu oluşturuluyor...")
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
          );
        `,
      })
      console.log("User boosts tablosu oluşturuldu")
    } catch (boostsError) {
      console.error("User boosts tablosu oluşturma hatası:", boostsError)
    }

    // Coin transactions tablosu
    try {
      console.log("Coin transactions tablosu oluşturuluyor...")
      await supabase.rpc("exec_sql", {
        sql_query: `
          CREATE TABLE IF NOT EXISTS coin_transactions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            amount BIGINT NOT NULL,
            type TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })
      console.log("Coin transactions tablosu oluşturuldu")
    } catch (transactionsError) {
      console.error("Coin transactions tablosu oluşturma hatası:", transactionsError)
    }

    // Daily combos tablosu
    try {
      console.log("Daily combos tablosu oluşturuluyor...")
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
          );
        `,
      })
      console.log("Daily combos tablosu oluşturuldu")
    } catch (combosError) {
      console.error("Daily combos tablosu oluşturma hatası:", combosError)
    }

    return NextResponse.json({ success: true, message: "Tablolar oluşturuldu veya güncellendi" })
  } catch (error) {
    console.error("SQL dosyası ile tablo oluşturma hatası:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
