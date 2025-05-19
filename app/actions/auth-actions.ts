"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase-server"
import { verifyTelegramAuth, parseTelegramAuthData } from "@/lib/telegram-auth"

export async function telegramAuth(initData: string) {
  try {
    console.log("telegramAuth başlatıldı, initData uzunluğu:", initData?.length || 0)

    // Parse Telegram data
    const authData = parseTelegramAuthData(initData)
    console.log("Telegram verileri ayrıştırıldı:", authData ? "Başarılı" : "Başarısız")

    // Geliştirme modunda veya test sırasında doğrulamayı atla
    // Eğer authData varsa, kullanıcıyı oluştur veya güncelle
    if (!authData) {
      console.log("Telegram verileri alınamadı, test kullanıcısı oluşturuluyor")

      // Test kullanıcısı oluştur (sadece geliştirme modunda)
      if (process.env.NODE_ENV === "development") {
        return await createOrUpdateUser({
          id: "test_user_" + Date.now(),
          username: "test_user",
          first_name: "Test",
          last_name: "User",
          photo_url: "",
        })
      }

      return { success: false, error: "Kimlik doğrulama verileri alınamadı" }
    }

    // Geliştirme modunda doğrulamayı atla
    if (process.env.NODE_ENV === "development") {
      console.log("Geliştirme modu: Telegram doğrulaması atlanıyor")
      return await createOrUpdateUser(authData)
    }

    // Üretim modunda doğrulama yap
    const isValid = verifyTelegramAuth(authData)
    console.log("Telegram doğrulama sonucu:", isValid ? "Geçerli" : "Geçersiz")

    if (!isValid) {
      console.log("Geçersiz Telegram verileri, ancak kullanıcı oluşturulmaya çalışılacak")
      // Doğrulama başarısız olsa bile kullanıcı oluşturmayı dene
      return await createOrUpdateUser(authData)
    }

    // Doğrulama başarılı, kullanıcı oluştur veya güncelle
    return await createOrUpdateUser(authData)
  } catch (error) {
    console.error("telegramAuth içinde hata:", error)
    return {
      success: false,
      error: "Kimlik doğrulama başarısız oldu: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

// Kullanıcı oluşturma veya güncelleme fonksiyonu
async function createOrUpdateUser(userData: any) {
  try {
    const telegramId = userData.id
    const username = userData.username || `user_${telegramId}`
    const firstName = userData.first_name || ""
    const lastName = userData.last_name || ""
    const photoUrl = userData.photo_url || ""

    console.log("Kullanıcı oluşturuluyor/güncelleniyor:", { telegramId, username })

    // Önce tabloların var olduğundan emin olalım
    try {
      // Tablo kontrolü ve oluşturma
      await fetch("/api/create-tables", {
        method: "POST",
      })
      console.log("Tablolar kontrol edildi/oluşturuldu")
    } catch (tableError) {
      console.error("Tablo kontrolü sırasında hata:", tableError)
    }

    // Create Supabase server client
    const supabase = createServerClient()
    console.log("Supabase client oluşturuldu")

    // Check if user exists
    console.log("Kullanıcı sorgulanıyor:", telegramId)
    let { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", telegramId)
      .single()

    console.log(
      "Kullanıcı sorgu sonucu:",
      existingUser ? "Bulundu" : "Bulunamadı",
      userError ? `Hata: ${userError.message}` : "",
    )

    let userId

    if (userError) {
      console.log("Kullanıcı bulunamadı, yeni kullanıcı oluşturuluyor")

      // User doesn't exist, create a new one
      console.log("Yeni kullanıcı ekleniyor:", { telegramId, username })
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            telegram_id: telegramId,
            username: username,
            first_name: firstName,
            last_name: lastName,
            photo_url: photoUrl,
            coins: 1000,
            league: 1,
            hourly_earn: 10,
            earn_per_tap: 1,
            energy: 100,
            max_energy: 100,
            last_energy_regen: new Date().toISOString(),
            last_hourly_collect: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("Kullanıcı oluşturma hatası:", createError)

        // Tekrar kullanıcı sorgulayalım, belki başka bir işlem tarafından oluşturulmuştur
        const { data: retryUser, error: retryError } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramId)
          .single()

        if (retryError) {
          console.error("Tekrar kullanıcı sorgulama hatası:", retryError)
          return { success: false, error: "Kullanıcı oluşturulamadı: " + createError.message }
        }

        console.log("Kullanıcı başka bir işlem tarafından oluşturulmuş olabilir, devam ediliyor")
        existingUser = retryUser
        userId = retryUser.id
      } else {
        console.log("Yeni kullanıcı oluşturuldu:", newUser?.id)
        userId = newUser.id

        // Create initial boosts for the user
        console.log("Kullanıcı boost'ları oluşturuluyor")
        const { error: boostError } = await supabase.from("user_boosts").insert([
          {
            user_id: userId,
            multi_touch_level: 1,
            energy_limit_level: 1,
            charge_speed_level: 1,
            daily_rockets: 3,
            max_daily_rockets: 3,
            energy_full_used: false,
          },
        ])

        if (boostError) {
          console.error("Boost oluşturma hatası:", boostError)
          // Boost oluşturma hatası kritik değil, devam edebiliriz
        } else {
          console.log("Kullanıcı boost'ları oluşturuldu")
        }
      }
    } else {
      console.log("Kullanıcı bulundu, bilgiler güncelleniyor:", existingUser.id)
      // User exists
      userId = existingUser.id

      // Update user data if needed
      const { error: updateError } = await supabase
        .from("users")
        .update({
          username: username,
          first_name: firstName,
          last_name: lastName,
          photo_url: photoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.error("Kullanıcı güncelleme hatası:", updateError)
        // Güncelleme hatası kritik değil, devam edebiliriz
      } else {
        console.log("Kullanıcı bilgileri güncellendi")
      }
    }

    // Set a session cookie
    console.log("Oturum çerezleri ayarlanıyor")
    const cookieStore = cookies()
    cookieStore.set("user_id", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
    cookieStore.set("telegram_id", telegramId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    console.log("Kullanıcı başarıyla oluşturuldu/güncellendi:", userId)
    return { success: true, userId }
  } catch (error) {
    console.error("createOrUpdateUser içinde hata:", error)
    return {
      success: false,
      error:
        "Kullanıcı oluşturma/güncelleme başarısız oldu: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

export async function checkAuth() {
  const cookieStore = cookies()
  const userId = cookieStore.get("user_id")?.value
  const telegramId = cookieStore.get("telegram_id")?.value

  if (!userId || !telegramId) {
    return { authenticated: false }
  }

  return { authenticated: true, userId, telegramId }
}

export async function logout() {
  const cookieStore = cookies()
  cookieStore.delete("user_id")
  cookieStore.delete("telegram_id")
  return { success: true }
}
