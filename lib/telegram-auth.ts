import crypto from "crypto"

// This should match the bot token from BotFather
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ""

// Verify Telegram authentication data
export function verifyTelegramAuth(authData: any): boolean {
  if (!authData) return false

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
}

// Parse Telegram auth data from URL or initData
export function parseTelegramAuthData(initData: string): any {
  try {
    const params = new URLSearchParams(initData)
    const authData: Record<string, any> = {}

    for (const [key, value] of params.entries()) {
      if (key === "user") {
        authData.user = JSON.parse(value)
      } else {
        authData[key] = value
      }
    }

    if (authData.user) {
      // Extract user data for easier access
      authData.id = authData.user.id.toString()
      authData.first_name = authData.user.first_name
      authData.last_name = authData.user.last_name || ""
      authData.username = authData.user.username || ""
      authData.photo_url = authData.user.photo_url || ""
    }

    return authData
  } catch (error) {
    console.error("Error parsing Telegram auth data:", error)
    return null
  }
}
