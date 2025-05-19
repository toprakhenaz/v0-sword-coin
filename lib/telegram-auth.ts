import crypto from "crypto"

// This should match the bot token from BotFather
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ""

// Verify Telegram authentication data
export function verifyTelegramAuth(authData: any): boolean {
  try {
    if (!authData || !authData.hash) return false

    // Geliştirme modunda her zaman doğrula
    if (process.env.NODE_ENV === "development") {
      return true
    }

    const { hash, ...data } = authData

    // Sort keys alphabetically for data_check_string
    const dataCheckArr: string[] = []
    Object.keys(data)
      .sort()
      .forEach((key) => {
        if (data[key]) {
          dataCheckArr.push(`${key}=${data[key]}`)
        }
      })

    const dataCheckString = dataCheckArr.join("\n")
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest()
    const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")

    return calculatedHash === hash
  } catch (error) {
    console.error("Telegram doğrulama hatası:", error)
    // Geliştirme modunda hata olsa bile true döndür
    return process.env.NODE_ENV === "development"
  }
}

// Parse Telegram auth data from URL or initData
export function parseTelegramAuthData(initData: string): any {
  try {
    // initData boş ise geliştirme modunda test verisi döndür
    if (!initData && process.env.NODE_ENV === "development") {
      console.log("Test Telegram verileri oluşturuluyor")
      return {
        id: "test_user_" + Date.now(),
        username: "test_user",
        first_name: "Test",
        last_name: "User",
        photo_url: "",
      }
    }

    if (!initData) {
      console.error("initData boş")
      return null
    }

    const params = new URLSearchParams(initData)
    const authData: Record<string, any> = {}

    for (const [key, value] of params.entries()) {
      if (key === "user") {
        try {
          authData.user = JSON.parse(value)
        } catch (e) {
          console.error("user JSON parse hatası:", e)
          // Geçersiz JSON olsa bile devam et
          authData.user = { id: "unknown_" + Date.now() }
        }
      } else {
        authData[key] = value
      }
    }

    if (authData.user) {
      // Extract user data for easier access
      authData.id = authData.user.id?.toString() || "unknown_" + Date.now()
      authData.first_name = authData.user.first_name || ""
      authData.last_name = authData.user.last_name || ""
      authData.username = authData.user.username || `user_${authData.id}`
      authData.photo_url = authData.user.photo_url || ""
    } else if (process.env.NODE_ENV === "development") {
      // Geliştirme modunda user verisi yoksa test verisi oluştur
      authData.id = "test_user_" + Date.now()
      authData.username = "test_user"
      authData.first_name = "Test"
      authData.last_name = "User"
      authData.photo_url = ""
    } else {
      console.error("Telegram user verisi bulunamadı")
      return null
    }

    return authData
  } catch (error) {
    console.error("Telegram auth verisi ayrıştırma hatası:", error)

    // Geliştirme modunda hata olsa bile test verisi döndür
    if (process.env.NODE_ENV === "development") {
      return {
        id: "test_user_" + Date.now(),
        username: "test_user",
        first_name: "Test",
        last_name: "User",
        photo_url: "",
      }
    }

    return null
  }
}
