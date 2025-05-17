import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Telegram Bot Token'ınızı güvenli bir şekilde saklayın (örn. .env dosyasında)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ""

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json()

    if (!initData) {
      return NextResponse.json({ error: "initData eksik" }, { status: 400 })
    }

    // initData'yı parse et
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get("hash")
    urlParams.delete("hash")

    // Parametreleri alfabetik sıraya diz
    const paramArray: string[] = []
    urlParams.sort()
    urlParams.forEach((value, key) => {
      paramArray.push(`${key}=${value}`)
    })
    const dataCheckString = paramArray.join("\n")

    // HMAC-SHA-256 ile hash oluştur
    const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest()

    const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")

    // Hash'leri karşılaştır
    if (hash !== calculatedHash) {
      return NextResponse.json({ error: "Geçersiz hash" }, { status: 403 })
    }

    // Kullanıcı bilgilerini çıkar
    const user = JSON.parse(urlParams.get("user") || "{}")

    // Auth date kontrolü (isteğe bağlı)
    const authDate = Number.parseInt(urlParams.get("auth_date") || "0", 10)
    const currentTime = Math.floor(Date.now() / 1000)

    // 24 saatten eski ise reddet (isteğe bağlı)
    if (currentTime - authDate > 86400) {
      return NextResponse.json({ error: "Kimlik doğrulama süresi doldu" }, { status: 403 })
    }

    return NextResponse.json({
      verified: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    })
  } catch (error) {
    console.error("Doğrulama hatası:", error)
    return NextResponse.json({ error: "Doğrulama başarısız oldu" }, { status: 500 })
  }
}
