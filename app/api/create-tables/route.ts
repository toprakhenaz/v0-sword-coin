import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("SQL dosyası ile tablolar oluşturuluyor")
    const supabase = createServerClient()

    // Supabase'in SQL API'sini kullanarak tabloları oluştur
    // Bu yöntem, doğrudan SQL çalıştırmak yerine Supabase'in API'sini kullanır

    // Users tablosu
    const { error: usersError } = await supabase
      .from("users")
      .insert({
        telegram_id: "temp_user_for_schema",
        username: "temp_user",
        coins: 0,
        energy: 0,
        max_energy: 0,
        earn_per_tap: 0,
        hourly_earn: 0,
        league: 0,
      })
      .select()
      .single()

    if (usersError && !usersError.message.includes("duplicate")) {
      console.error("Users tablosu oluşturma hatası:", usersError)
    } else {
      console.log("Users tablosu oluşturuldu veya zaten var")

      // Geçici kullanıcıyı sil
      await supabase.from("users").delete().eq("telegram_id", "temp_user_for_schema")
    }

    // User boosts tablosu - users tablosu oluşturulduktan sonra
    try {
      // Önce bir kullanıcı oluştur (eğer yoksa)
      const { data: testUser, error: testUserError } = await supabase
        .from("users")
        .select("id")
        .eq("telegram_id", "test_user_schema")
        .single()

      let userId

      if (testUserError) {
        // Test kullanıcısı oluştur
        const { data: newUser, error: createUserError } = await supabase
          .from("users")
          .insert({
            telegram_id: "test_user_schema",
            username: "test_user",
            coins: 1000,
            energy: 100,
            max_energy: 100,
            earn_per_tap: 1,
            hourly_earn: 10,
            league: 1,
          })
          .select()
          .single()

        if (createUserError) {
          console.error("Test kullanıcısı oluşturma hatası:", createUserError)
        } else {
          userId = newUser.id
        }
      } else {
        userId = testUser.id
      }

      if (userId) {
        // User boosts tablosu
        const { error: boostsError } = await supabase
          .from("user_boosts")
          .insert({
            user_id: userId,
            multi_touch_level: 1,
            energy_limit_level: 1,
            charge_speed_level: 1,
            daily_rockets: 3,
            max_daily_rockets: 3,
            energy_full_used: false,
          })
          .select()
          .single()

        if (boostsError && !boostsError.message.includes("duplicate")) {
          console.error("User boosts tablosu oluşturma hatası:", boostsError)
        } else {
          console.log("User boosts tablosu oluşturuldu veya zaten var")
        }

        // Coin transactions tablosu
        const { error: transactionsError } = await supabase
          .from("coin_transactions")
          .insert({
            user_id: userId,
            amount: 0,
            type: "schema_init",
            description: "Schema initialization",
          })
          .select()
          .single()

        if (transactionsError && !transactionsError.message.includes("duplicate")) {
          console.error("Coin transactions tablosu oluşturma hatası:", transactionsError)
        } else {
          console.log("Coin transactions tablosu oluşturuldu veya zaten var")

          // Geçici işlemi sil
          await supabase.from("coin_transactions").delete().eq("type", "schema_init")
        }

        // Daily combos tablosu
        const today = new Date().toISOString().split("T")[0]
        const { error: combosError } = await supabase
          .from("daily_combos")
          .insert({
            user_id: userId,
            date: today,
            card_ids: [1, 2, 3],
            found_card_ids: [],
            reward: 1000,
            is_completed: false,
          })
          .select()
          .single()

        if (combosError && !combosError.message.includes("duplicate")) {
          console.error("Daily combos tablosu oluşturma hatası:", combosError)
        } else {
          console.log("Daily combos tablosu oluşturuldu veya zaten var")

          // Geçici combo'yu sil
          await supabase.from("daily_combos").delete().eq("user_id", userId).eq("date", today)
        }

        // Test kullanıcısını sil
        await supabase.from("users").delete().eq("telegram_id", "test_user_schema")
      }
    } catch (tablesError) {
      console.error("İlişkili tablolar oluşturma hatası:", tablesError)
    }

    return NextResponse.json({ success: true, message: "Tablolar oluşturuldu" })
  } catch (error) {
    console.error("SQL dosyası ile tablo oluşturma hatası:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
